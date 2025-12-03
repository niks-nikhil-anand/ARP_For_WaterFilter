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
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
  CheckCircle2,
  Wrench,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
} from 'lucide-react'
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  getAllTickets,
  updateTicket,
  deleteTicket,
} from '@/actions/common/tickets'
import { ResolveTicketDialog } from '@/components/tickets/ResolveTicketDialog'
import { AddTicketDialog } from '@/components/tickets/AddTicketDialog'
import { getActiveAgents } from '@/actions/common/agents'
import { TicketStatus, TicketPriority } from '@/generated/prisma'
import { toast } from 'sonner'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { SkeletonTable } from '@/components/common/SkeletonTable'

interface TicketType {
  id: number
  user: {
    name: string
    email: string
    mobile: string | null
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
    }[]
  }
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
  timeSpent?: number | any | null
  amountCollected?: number | any | null
  partsReplaced?: string | null
  workDescription?: string | null
  source?: string | null
  serviceEvent?: {
    actionDate?: Date | string | null
  } | null
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
  const [date, setDate] = useState<DateRange | undefined>()
  const [filterType, setFilterType] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'UPCOMING' | 'BACKLOG' | 'CUSTOM'>('ALL')
  const [sortField, setSortField] = useState<keyof TicketType | 'user.name' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [totalPages, setTotalPages] = useState(1)

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, priorityFilter, date, filterType])

  const loadAgents = async () => {
    const result = await getActiveAgents()
    if (result.success && result.data) {
      setAgents(result.data)
    }
  }

  const loadTickets = async () => {
    setLoading(true)
    try {
      const filters: {
        page: number
        limit: number
        status?: TicketStatus
        priority?: TicketPriority
        startDate?: Date
        endDate?: Date
        isBacklog?: boolean
      } = {
        page: currentPage,
        limit: itemsPerPage
      }

      if (statusFilter !== 'ALL') filters.status = statusFilter as TicketStatus
      if (priorityFilter !== 'ALL') filters.priority = priorityFilter as TicketPriority

      // Handle Date Filters
      if (filterType === 'CUSTOM' && date?.from) {
        filters.startDate = date.from
        filters.endDate = date.to || date.from
      } else if (filterType === 'TODAY') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        filters.startDate = today
        filters.endDate = tomorrow
      } else if (filterType === 'YESTERDAY') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        filters.startDate = yesterday
        filters.endDate = today
      } else if (filterType === 'UPCOMING') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        filters.startDate = tomorrow
      } else if (filterType === 'BACKLOG') {
        filters.isBacklog = true
      }

      const result = await getAllTickets(filters)
      if (result.success && result.data) {
        setTickets(result.data)
        if (result.meta) {
          setTotalPages(result.meta.totalPages)
        }
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtering and sorting logic (Client side for search and date for now, as backend search is limited)
  const filteredAndSortedTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const matchesSearch =
        ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.user.mobile && ticket.user.mobile.includes(searchTerm)) ||
        ticket.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.productType?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: string | number | null | undefined = a[sortField as keyof TicketType] as string | number | null | undefined
        let bValue: string | number | null | undefined = b[sortField as keyof TicketType] as string | number | null | undefined

        if (sortField === 'user.name') {
          aValue = a.user.name
          bValue = b.user.name
        }

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
    return filtered
  }, [tickets, searchTerm, sortField, sortOrder])

  // Stats calculation (This should ideally be a separate API call for accuracy with pagination)
  // For now, we'll just show stats for loaded tickets or remove them if misleading
  // Keeping it simple for now

  // Sort handler
  const handleSort = (field: keyof TicketType | 'user.name') => {
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
        const updates: {
          status: TicketStatus
          priority: TicketPriority
          internalNotes: string
          resolutionNotes: string
          assignToUserId: number | null
        } = {
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
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'An error occurred while updating the ticket')
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleResolve = (ticket: TicketType) => {
    setSelectedTicket(ticket)
    setResolveDialogOpen(true)
  }

  const handleResolveComplete = (ticketId: number, resolveData: { resolutionNotes: string }) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: TicketStatus.RESOLVED, resolutionNotes: resolveData.resolutionNotes }
        : ticket
    ))
  }

  const getSortIcon = (field: keyof TicketType | 'user.name') => {
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
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Ticket
            </Button>
          </div>

          {/* Date Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <Tabs defaultValue="ALL" value={filterType} onValueChange={(v) => setFilterType(v as 'ALL' | 'TODAY' | 'YESTERDAY' | 'UPCOMING' | 'BACKLOG' | 'CUSTOM')} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="TODAY">Today</TabsTrigger>
                <TabsTrigger value="YESTERDAY">Yesterday</TabsTrigger>
                <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
                <TabsTrigger value="BACKLOG">Backlog</TabsTrigger>
                <TabsTrigger value="CUSTOM">Custom</TabsTrigger>
              </TabsList>
            </Tabs>

            {filterType === 'CUSTOM' && (
              <div className="grid gap-2 animate-in fade-in slide-in-from-left-5 duration-300">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
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
                    onClick={() => handleSort('user.name')}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('user.name')}
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
                  <TableHead>Action Date</TableHead>
                  <TableHead>Assigned Agent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8} className="p-0">
                        <SkeletonTable columns={8} rows={1} className="border-0" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Ticket className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">No tickets found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">#{ticket.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{ticket.user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {ticket.user.email}
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
                          <span className="text-sm">{formatDate(ticket.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {ticket.serviceEvent?.actionDate
                              ? formatDate(ticket.serviceEvent.actionDate)
                              : <span className="text-muted-foreground italic">Not set</span>}
                          </span>
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
                          {ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResolve(ticket)}
                              title="Resolve ticket"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
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
          <div className="mt-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <AddTicketDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onTicketCreated={loadTickets}
        />

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
                    <p className="text-lg font-semibold">{selectedTicket.user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="text-sm">{selectedTicket.user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Phone</span>
                    </div>
                    <p className="text-sm">{selectedTicket.user.mobile || 'N/A'}</p>
                  </div>
                  {selectedTicket.user.address && selectedTicket.user.address.length > 0 && (
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Address</span>
                      </div>
                      <p className="text-sm">
                        {`${selectedTicket.user.address[0].street}, ${selectedTicket.user.address[0].city}`}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Service Type</span>
                    </div>
                    <p className="text-sm font-medium">{selectedTicket.serviceType}</p>
                  </div>
                  {selectedTicket.productType && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Product Type</span>
                      </div>
                      <p className="text-sm">{selectedTicket.productType}</p>
                    </div>
                  )}
                  {selectedTicket.description && (
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Description</span>
                      </div>
                      <p className="text-sm">{selectedTicket.description}</p>
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
                  {selectedTicket.assignedToAgent && (
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Assigned To</span>
                      </div>
                      <p className="text-sm">{selectedTicket.assignedToAgent.user.name}</p>
                    </div>
                  )}
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

                  {/* Resolution Details Section */}
                  {(selectedTicket.status === TicketStatus.RESOLVED || selectedTicket.status === TicketStatus.CLOSED) && (
                    <>
                      <div className="col-span-2 mt-4 mb-2">
                        <h4 className="font-semibold text-lg border-b pb-2">Resolution Details</h4>
                      </div>

                      {selectedTicket.timeSpent !== null && selectedTicket.timeSpent !== undefined && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Time Spent</span>
                          </div>
                          <p className="text-sm">{selectedTicket.timeSpent.toString()} hours</p>
                        </div>
                      )}

                      {selectedTicket.amountCollected !== null && selectedTicket.amountCollected !== undefined && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-bold">₹</span>
                            <span className="font-medium">Amount Collected</span>
                          </div>
                          <p className="text-sm">₹{selectedTicket.amountCollected.toString()}</p>
                        </div>
                      )}

                      {selectedTicket.partsReplaced && (
                        <div className="col-span-2 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wrench className="h-4 w-4" />
                            <span className="font-medium">Parts Replaced</span>
                          </div>
                          <p className="text-sm">{selectedTicket.partsReplaced}</p>
                        </div>
                      )}

                      {selectedTicket.workDescription && (
                        <div className="col-span-2 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Work Description</span>
                          </div>
                          <p className="text-sm">{selectedTicket.workDescription}</p>
                        </div>
                      )}
                    </>
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
              <DialogDescription>Update ticket details and status</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value: TicketStatus) =>
                      setEditForm({ ...editForm, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                  <Label>Priority</Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={(value: TicketPriority) =>
                      setEditForm({ ...editForm, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
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
                <Label>Assign Agent</Label>
                <Select
                  value={editForm.assignToUserId}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, assignToUserId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.userId} value={agent.userId.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea
                  placeholder="Add internal notes..."
                  value={editForm.internalNotes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, internalNotes: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Resolution Notes</Label>
                <Textarea
                  placeholder="Add resolution notes..."
                  value={editForm.resolutionNotes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, resolutionNotes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the ticket.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Resolve Dialog */}
        <ResolveTicketDialog
          open={resolveDialogOpen}
          onOpenChange={setResolveDialogOpen}
          ticket={selectedTicket}
          onResolve={handleResolveComplete}
        />
      </div>
    </div >
  )
}

export default TicketManagementPage
