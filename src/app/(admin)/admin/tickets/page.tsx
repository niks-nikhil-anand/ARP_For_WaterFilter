'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Ticket,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
} from 'lucide-react'
import {
  getAllTickets,
  updateTicket,
  deleteTicket,
} from '@/actions/common/tickets'
import { getActiveAgents } from '@/actions/common/agents'
import { TicketStatus, TicketPriority } from '@/generated/prisma'
import { toast } from 'sonner'

interface TicketType {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress?: string | null
  serviceType: string
  productType?: string | null
  description?: string | null
  preferredDate?: Date | string | null
  preferredTime?: string | null
  status: TicketStatus
  priority: TicketPriority
  agentId?: number | null
  assignedToAgent?: {
    id: number
    userId: number
    user: {
      name: string
      email: string
    }
  } | null
  shopId?: number | null
  internalNotes?: string | null
  resolutionNotes?: string | null
  source?: string | null
  createdAt: Date
  updatedAt: Date
}
const TicketManagementPage = () => {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [sortField, setSortField] = useState<keyof TicketType | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [editForm, setEditForm] = useState<{
    status: TicketStatus
    priority: TicketPriority
    internalNotes: string
    resolutionNotes: string
    assignToUserId: string
  }>({
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    internalNotes: '',
    resolutionNotes: '',
    assignToUserId: 'unassigned',
  })

  // Load tickets
  useEffect(() => {
    loadTickets()
    loadAgents()
  }, [])

  const loadAgents = async () => {
    const result = await getActiveAgents()
    if (result.success && result.data) {
      setAgents(result.data)
    }
  }

  const loadTickets = async () => {
    setLoading(true)
    try {
      const result = await getAllTickets()
      if (result.success && result.data) {
        setTickets(result.data)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtering and sorting logic
  const filteredAndSortedTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const matchesSearch =
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.productType?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTickets = filteredAndSortedTickets.slice(startIndex, endIndex)

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: tickets.filter((t) => t.status === TicketStatus.RESOLVED).length,
      closed: tickets.filter((t) => t.status === TicketStatus.CLOSED).length,
    }
  }, [tickets])

  // Sort handler
  const handleSort = (field: keyof TicketType) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // CRUD handlers
  const handleView = (ticket: TicketType) => {
    setSelectedTicket(ticket)
    setViewDialogOpen(true)
  }

  const handleEdit = (ticket: TicketType) => {
    setSelectedTicket(ticket)
    setEditForm({
      status: ticket.status,
      priority: ticket.priority,
      internalNotes: ticket.internalNotes || '',
      resolutionNotes: ticket.resolutionNotes || '',
      assignToUserId: ticket.assignedToAgent?.userId ? ticket.assignedToAgent.userId.toString() : 'unassigned',
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (ticket: TicketType) => {
    setSelectedTicket(ticket)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedTicket) {
      const result = await deleteTicket(selectedTicket.id)
      if (result.success) {
        setTickets(tickets.filter((t) => t.id !== selectedTicket.id))
        setDeleteDialogOpen(false)
        setSelectedTicket(null)
      }
    }
  }

  const saveEdit = async () => {
    if (selectedTicket) {
      setIsSaving(true)
      try {
        const updates: any = {
          status: editForm.status,
          priority: editForm.priority,
          internalNotes: editForm.internalNotes,
          resolutionNotes: editForm.resolutionNotes,
          assignToUserId: editForm.assignToUserId === 'unassigned' ? null : parseInt(editForm.assignToUserId),
        }

        const result = await updateTicket(selectedTicket.id, updates)
        if (result.success) {
          toast.success('Ticket updated successfully')
          await loadTickets()
          setEditDialogOpen(false)
          setSelectedTicket(null)
        } else {
          toast.error(result.error || 'Failed to update ticket')
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred while updating the ticket')
      } finally {
        setIsSaving(false)
      }
    }
  }

  const getSortIcon = (field: keyof TicketType) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    )
  }

  const getStatusBadge = (status: TicketStatus) => {
    const variants: Record<TicketStatus, { className: string; icon: React.ReactNode }> = {
      [TicketStatus.OPEN]: {
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      [TicketStatus.IN_PROGRESS]: {
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        icon: <PlayCircle className="h-3 w-3 mr-1" />,
      },
      [TicketStatus.RESOLVED]: {
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      [TicketStatus.CLOSED]: {
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      [TicketStatus.CANCELLED]: {
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    }

    const variant = variants[status]
    return (
      <Badge className={variant.className}>
        <span className="flex items-center">
          {variant.icon}
          {status}
        </span>
      </Badge>
    )
  }

  const getPriorityBadge = (priority: TicketPriority) => {
    const variants: Record<TicketPriority, string> = {
      [TicketPriority.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      [TicketPriority.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      [TicketPriority.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return <Badge className={variants[priority]}>{priority}</Badge>
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="h-[90vh] flex items-center justify-center">
        <div className="text-center">
          <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[90vh] max-h-[92vh] overflow-y-auto">
      <div className="container mx-auto py-10 px-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage service booking tickets and customer requests
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Ticket className="h-4 w-4" />
                <span className="text-sm font-medium">Total Tickets</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="border rounded-lg p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Open</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats.open}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
                <PlayCircle className="h-4 w-4" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats.inProgress}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Resolved</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats.resolved}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-gray-200 bg-gray-50 dark:bg-gray-950/20">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-400 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Closed</span>
              </div>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-400">
                {stats.closed}
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, service, or product..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.values(TicketStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) => {
                setPriorityFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                {Object.values(TicketPriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      Ticket ID
                      {getSortIcon('id')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('customerName')}
                    </div>
                  </TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-center"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-center"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center justify-center">
                      Priority
                      {getSortIcon('priority')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created Date
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead>Assigned Agent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Ticket className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">No tickets found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{ticket.customerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {ticket.customerEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{ticket.serviceType}</div>
                          {ticket.productType && (
                            <div className="text-xs text-muted-foreground">
                              {ticket.productType}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(ticket.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPriorityBadge(ticket.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(ticket.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedToAgent ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{ticket.assignedToAgent.user.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(ticket)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(ticket)}
                            title="Edit ticket"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ticket)}
                            title="Delete ticket"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedTickets.length)} of{' '}
              {filteredAndSortedTickets.length} tickets
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
              <DialogDescription>Complete information about the ticket</DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ticket className="h-4 w-4" />
                      <span className="font-medium">Ticket ID</span>
                    </div>
                    <p className="text-lg font-semibold">#{selectedTicket.id}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Source</span>
                    </div>
                    <p className="text-sm">{selectedTicket.source || 'WEBSITE'}</p>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Customer Name</span>
                    </div>
                    <p className="text-lg font-semibold">{selectedTicket.customerName}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="text-sm">{selectedTicket.customerEmail}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Phone</span>
                    </div>
                    <p className="text-sm">{selectedTicket.customerPhone}</p>
                  </div>
                  {selectedTicket.customerAddress && (
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Address</span>
                      </div>
                      <p className="text-sm">{selectedTicket.customerAddress}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Service Type</span>
                    </div>
                    <p className="text-sm font-medium">{selectedTicket.serviceType}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Product Type</span>
                    </div>
                    <p className="text-sm">{selectedTicket.productType || 'Not specified'}</p>
                  </div>
                  {selectedTicket.description && (
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Description</span>
                      </div>
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>
                  )}
                  {selectedTicket.preferredDate && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Preferred Date</span>
                      </div>
                      <p className="text-sm">{formatDate(selectedTicket.preferredDate)}</p>
                    </div>
                  )}
                  {selectedTicket.preferredTime && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Preferred Time</span>
                      </div>
                      <p className="text-sm">{selectedTicket.preferredTime}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Status</span>
                    </div>
                    <div>{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Priority</span>
                    </div>
                    <div>{getPriorityBadge(selectedTicket.priority)}</div>
                  </div>
                  {selectedTicket.internalNotes && (
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Internal Notes</span>
                      </div>
                      <p className="text-sm">{selectedTicket.internalNotes}</p>
                    </div>
                  )}
                  {selectedTicket.resolutionNotes && (
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Resolution Notes</span>
                      </div>
                      <p className="text-sm">{selectedTicket.resolutionNotes}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Created Date</span>
                    </div>
                    <p className="text-sm">{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Last Updated</span>
                    </div>
                    <p className="text-sm">{formatDate(selectedTicket.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Ticket</DialogTitle>
              <DialogDescription>Update ticket status and notes</DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, status: value as TicketStatus })
                      }
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TicketStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editForm.priority}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, priority: value as TicketPriority })
                      }
                    >
                      <SelectTrigger id="edit-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TicketPriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-agent">Assign Agent</Label>
                    <Select
                      value={editForm.assignToUserId}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, assignToUserId: value })
                      }
                    >
                      <SelectTrigger id="edit-agent">
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.userId} value={agent.userId.toString()}>
                            {agent.name} ({agent.role === 'ADMIN' ? 'Shop Owner' : 'Agent'}{agent.shopName ? ` - ${agent.shopName}` : ''})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editForm.priority}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, priority: value as TicketPriority })
                      }
                    >
                      <SelectTrigger id="edit-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TicketPriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-internal-notes">Internal Notes</Label>
                  <Textarea
                    id="edit-internal-notes"
                    value={editForm.internalNotes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, internalNotes: e.target.value })
                    }
                    placeholder="Add internal notes for team members..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-resolution-notes">Resolution Notes</Label>
                  <Textarea
                    id="edit-resolution-notes"
                    value={editForm.resolutionNotes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, resolutionNotes: e.target.value })
                    }
                    placeholder="Add resolution notes when closing ticket..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete ticket{' '}
                <span className="font-semibold">#{selectedTicket?.id}</span> for customer{' '}
                <span className="font-semibold">{selectedTicket?.customerName}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Ticket
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default TicketManagementPage
