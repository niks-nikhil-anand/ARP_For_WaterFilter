'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Calendar, Search, Filter, CheckCircle, Ticket, User, Wrench, Plus, FileText, Phone, Mail, MapPin, Eye } from 'lucide-react'
import { getServiceEvents, createTicketForEvent, updateServiceEvent, getAgents, getAllAMCs, createAMCContract } from '@/actions/admin/serviceEvents'
import { getAdminProducts } from '@/actions/admin/products'
import { getUsersByRole } from '@/actions/admin/users'
import { AddAMCContractDialog } from '@/components/admin/amc/AddAMCContractDialog'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { SkeletonTable } from '@/components/common/SkeletonTable'

export default function AMCRepairsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [amcs, setAmcs] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addAMCOpen, setAddAMCOpen] = useState(false)

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // Ticket Dialog State
  const [ticketOpen, setTicketOpen] = useState(false)
  const [creatingTicket, setCreatingTicket] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')

  // View Dialog State
  const [viewOpen, setViewOpen] = useState(false)

  // Resolve Dialog State
  const [resolveOpen, setResolveOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [resolveRemarks, setResolveRemarks] = useState('')
  const [resolving, setResolving] = useState(false)

  const [resolveStatus, setResolveStatus] = useState<string>('COMPLETED')
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [scheduledRemarks, setScheduledRemarks] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const [eventsResult, amcsResult, agentsResult, productsResult, customersResult] = await Promise.all([
      getServiceEvents('all'), // Keep this for history tab
      getAllAMCs(search, statusFilter, sortBy, sortOrder, currentPage, itemsPerPage, paymentStatusFilter),
      getAgents(),
      getAdminProducts(),
      getUsersByRole('USER')
    ])

    if (eventsResult.success) {
      setEvents(eventsResult.data || [])
    } else {
      toast.error('Failed to fetch events')
    }

    if (amcsResult.success) {
      setAmcs(amcsResult.data || [])
      setTotalItems(amcsResult.meta?.total || 0)
    } else {
      toast.error('Failed to fetch AMCs')
    }

    if (agentsResult.success) {
      setAgents(agentsResult.data || [])
    }

    if (productsResult.success) {
      setProducts(productsResult.data || [])
    }

    if (customersResult.success) {
      setCustomers(customersResult.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, search, statusFilter, paymentStatusFilter, sortBy, sortOrder])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleTicketClick = (event: any) => {
    setSelectedEvent(event)
    setSelectedAgentId(event.assignedTo?.id?.toString() || '')
    setTicketOpen(true)
  }

  const handleConfirmCreateTicket = async () => {
    if (!selectedEvent) return

    setCreatingTicket(true)
    const result = await createTicketForEvent(selectedEvent.id, selectedAgentId ? parseInt(selectedAgentId) : undefined)
    setCreatingTicket(false)

    if (result.success) {
      toast.success('Ticket created successfully')
      setTicketOpen(false)
      fetchData()
    } else {
      toast.error(result.error || 'Failed to create ticket')
    }
  }

  const handleViewClick = (event: any) => {
    setSelectedEvent(event)
    setViewOpen(true)
  }

  const handleResolveClick = (event: any) => {
    setSelectedEvent(event)
    setResolveStatus(event.status === 'COMPLETED' ? 'COMPLETED' : event.status)
    setResolveRemarks(event.remarks || '')
    setScheduledRemarks(event.scheduledRemarks || '')
    setScheduledDate(event.actionDate ? new Date(event.actionDate).toISOString().split('T')[0] : '')
    setResolveOpen(true)
  }

  const handleConfirmResolve = async () => {
    if (!selectedEvent) return

    setResolving(true)
    const updateData: any = {
      status: resolveStatus,
    }

    if (resolveStatus === 'COMPLETED') {
      updateData.remarks = resolveRemarks
    } else if (resolveStatus === 'SCHEDULED') {
      updateData.actionDate = scheduledDate ? new Date(scheduledDate) : undefined
      updateData.scheduledRemarks = scheduledRemarks
    } else {
      updateData.remarks = resolveRemarks
    }

    const result = await updateServiceEvent(selectedEvent.id, updateData)
    setResolving(false)

    if (result.success) {
      toast.success('Event updated successfully')
      setResolveOpen(false)
      fetchData()
    } else {
      toast.error(result.error || 'Failed to update event')
    }
  }

  const handleAMCAdded = () => {
    fetchData()
  }

  // Helper to render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AMC Details</h1>
          <p className="text-muted-foreground">Manage Annual Maintenance Contracts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setAddAMCOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add AMC
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentStatusFilter} onValueChange={(val) => { setPaymentStatusFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Payments</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[750px] overflow-y-auto relative">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('amcUniqueId')}>
                    ID {renderSortIcon('amcUniqueId')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('customer')}>
                    Customer {renderSortIcon('customer')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('product')}>
                    Product {renderSortIcon('product')}
                  </TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                    Status {renderSortIcon('status')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={10} className="p-0">
                        <SkeletonTable columns={10} rows={1} className="border-0" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : amcs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  amcs.map((item) => {
                    const latestContract = item.contracts && item.contracts.length > 0 ? item.contracts[0] : null
                    return (
                      <TableRow key={`${item.id}`}>
                        <TableCell className="font-medium">#{item.amcUniqueId || item.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.customer?.name || item.user?.name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">{item.customer?.email || item.user?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{item.product?.productName}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {latestContract ? new Date(latestContract.startDate).toLocaleDateString() : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {latestContract ? new Date(latestContract.endDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {latestContract ? (
                            <Badge variant={latestContract.paymentStatus === 'COMPLETED' ? 'default' : 'destructive'}>
                              {latestContract.paymentStatus}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {latestContract ? `₹${latestContract.paymentPaid}` : '-'}
                        </TableCell>
                        <TableCell>
                          {latestContract ? (
                            <span className={latestContract.paymentDue > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              ₹{latestContract.paymentDue}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)} variant="secondary">
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewClick({ ...item, dataType: 'AMC' })}
                              title="View Contract"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      <AddAMCContractDialog
        open={addAMCOpen}
        onOpenChange={setAddAMCOpen}
        onSuccess={handleAMCAdded}
        products={products.map(p => ({ id: p.id, productName: p.productName }))}
        customers={customers.map(c => ({ id: c.id, name: c.name, email: c.email }))}
        agents={agents}
      />

      {/* Create Ticket Dialog */}
      <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Review details before creating a ticket for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Customer</Label>
                <p className="font-medium">{selectedEvent?.customer?.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Mobile</Label>
                <p className="font-medium">{selectedEvent?.customer?.mobile || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{selectedEvent?.customer?.email || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">
                  {[
                    selectedEvent?.customer?.addresses?.[0]?.locality,
                    selectedEvent?.customer?.addresses?.[0]?.city,
                    selectedEvent?.customer?.addresses?.[0]?.state,
                    selectedEvent?.customer?.addresses?.[0]?.pincode
                  ].filter(Boolean).join(', ') || 'No address found'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Service Type</Label>
                <p className="font-medium">{selectedEvent?.type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Product Type</Label>
                <p className="font-medium">{selectedEvent?.product?.type || 'N/A'}</p>
              </div>

              <div className="col-span-2">
                <Label className="text-muted-foreground mb-1 block">Assigned Agent</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label className="text-muted-foreground">Description</Label>
                <p className="font-medium text-muted-foreground text-xs bg-muted p-2 rounded mt-1">
                  {selectedEvent?.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketOpen(false)} disabled={creatingTicket}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreateTicket} disabled={creatingTicket}>
              {creatingTicket ? 'Creating...' : 'Confirm Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Event</DialogTitle>
            <DialogDescription>
              Update the status and details of this service event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Details</Label>
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                <p><strong>Customer:</strong> {selectedEvent?.customer?.name}</p>
                <p><strong>Product:</strong> {selectedEvent?.product?.productName}</p>
                <p><strong>Current Status:</strong> {selectedEvent?.status}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={resolveStatus} onValueChange={setResolveStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resolveStatus === 'COMPLETED' && (
              <div className="space-y-2">
                <Label htmlFor="remarks">Completion Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Enter details about the service completion..."
                  value={resolveRemarks}
                  onChange={(e) => setResolveRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {resolveStatus === 'SCHEDULED' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledRemarks">Scheduling Remarks</Label>
                  <Textarea
                    id="scheduledRemarks"
                    placeholder="Enter scheduling details..."
                    value={scheduledRemarks}
                    onChange={(e) => setScheduledRemarks(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {(resolveStatus === 'PENDING' || resolveStatus === 'CANCELLED') && (
              <div className="space-y-2">
                <Label htmlFor="generalRemarks">Remarks</Label>
                <Textarea
                  id="generalRemarks"
                  placeholder="Enter remarks..."
                  value={resolveRemarks}
                  onChange={(e) => setResolveRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)} disabled={resolving}>
              Cancel
            </Button>
            <Button onClick={handleConfirmResolve} disabled={resolving} className="bg-green-600 hover:bg-green-700">
              {resolving ? 'Updating...' : 'Confirm Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="!max-w-[70vw] !h-[70vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-muted/5">
            <div className="flex items-center justify-between mr-8">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  #{selectedEvent?.amcUniqueId || selectedEvent?.id}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  View complete details for this AMC/Service Event.
                </p>
              </div>
              <Badge
                variant={selectedEvent?.status === 'ACTIVE' || selectedEvent?.status === 'COMPLETED' ? 'default' : 'secondary'}
                className="text-base px-4 py-1"
              >
                {selectedEvent?.status}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-2 border-b shrink-0 bg-muted/5">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contract" disabled={!selectedEvent?.amcContract && selectedEvent?.dataType !== 'AMC'}>
                  Contract
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 m-0 bg-muted/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Customer Profile */}
                <Card className="h-full shadow-sm">
                  <CardHeader className="pb-3 border-b bg-muted/10">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Customer Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {(selectedEvent?.customer?.name || selectedEvent?.user?.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-base">{selectedEvent?.customer?.name || selectedEvent?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">Customer ID: #{selectedEvent?.customer?.id || selectedEvent?.user?.id}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="break-all">{selectedEvent?.customer?.email || selectedEvent?.user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{selectedEvent?.customer?.mobile || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{[
                          selectedEvent?.customer?.addresses?.[0]?.locality,
                          selectedEvent?.customer?.addresses?.[0]?.city,
                          selectedEvent?.customer?.addresses?.[0]?.state,
                          selectedEvent?.customer?.addresses?.[0]?.pincode
                        ].filter(Boolean).join(', ') || 'No address found'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Column 2: Service & Product Info */}
                <Card className="h-full shadow-sm">
                  <CardHeader className="pb-3 border-b bg-muted/10">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" /> Service & Product
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Type</Label>
                        <p className="font-medium">{selectedEvent?.type || 'AMC Contract'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Product</Label>
                        <p className="font-medium">{selectedEvent?.product?.productName}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Scheduled</Label>
                        <p className="font-medium">
                          {selectedEvent?.actionDate ? new Date(selectedEvent.actionDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Agent</Label>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="font-normal">
                            {selectedEvent?.assignedTo?.user?.name || 'Unassigned'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Column 3: Status & Remarks */}
                <Card className="h-full shadow-sm">
                  <CardHeader className="pb-3 border-b bg-muted/10">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" /> Status & Remarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                      <div className="bg-muted/50 p-3 rounded-md text-sm min-h-[60px]">
                        {selectedEvent?.description || 'No description provided.'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Remarks</Label>
                      <div className="bg-muted/50 p-3 rounded-md text-sm min-h-[60px]">
                        {selectedEvent?.remarks || 'No remarks provided.'}
                      </div>
                    </div>

                    {selectedEvent?.ticket && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between p-3 border rounded-md bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Ticket #{selectedEvent.ticket.id}</span>
                          </div>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            {selectedEvent.ticket.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: CONTRACT */}
            <TabsContent value="contract" className="flex-1 overflow-y-auto p-6 m-0 bg-muted/5">
              {(selectedEvent?.amcContract || selectedEvent?.dataType === 'AMC') ? (
                <div className="space-y-6">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Total Price',
                        value: `₹${selectedEvent?.amcContract?.price || selectedEvent?.contracts?.[0]?.finalPrice || 0}`,
                        icon: Ticket,
                        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      },
                      {
                        label: 'Amount Paid',
                        value: `₹${selectedEvent?.amcContract?.paymentPaid || selectedEvent?.contracts?.[0]?.paymentPaid || 0}`,
                        icon: CheckCircle,
                        color: 'text-green-600 bg-green-50 dark:bg-green-900/20'
                      },
                      {
                        label: 'Amount Due',
                        value: `₹${selectedEvent?.amcContract?.paymentDue || selectedEvent?.contracts?.[0]?.paymentDue || 0}`,
                        icon: FileText,
                        color: (selectedEvent?.amcContract?.paymentDue || selectedEvent?.contracts?.[0]?.paymentDue) > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-600 bg-gray-50'
                      },
                      {
                        label: 'Duration',
                        value: selectedEvent?.amcContract?.duration || selectedEvent?.contracts?.[0]?.duration || 'N/A',
                        icon: Calendar,
                        color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                      },
                    ].map((stat, i) => (
                      <Card key={i} className="border-none shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">{stat.label}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Detailed Contract Info */}
                  <Card>
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Contract Details</CardTitle>
                        <Badge variant="outline" className="text-sm">
                          Invoice: {selectedEvent?.amcContract?.invoiceNumber || selectedEvent?.contracts?.[0]?.invoiceNumber}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                              <Label className="text-muted-foreground text-xs">Start Date</Label>
                              <p className="font-medium">
                                {new Date(selectedEvent?.amcContract?.startDate || selectedEvent?.contracts?.[0]?.startDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground text-xs">End Date</Label>
                              <p className="font-medium">
                                {new Date(selectedEvent?.amcContract?.endDate || selectedEvent?.contracts?.[0]?.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">Payment Method</Label>
                            <p className="font-medium">
                              {selectedEvent?.amcContract?.paymentMethod || selectedEvent?.contracts?.[0]?.paymentMethod || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-muted-foreground text-xs">Payment Status</Label>
                            <div className="mt-1">
                              <Badge variant={(selectedEvent?.amcContract?.paymentStatus || selectedEvent?.contracts?.[0]?.paymentStatus) === 'COMPLETED' ? 'default' : 'destructive'}>
                                {selectedEvent?.amcContract?.paymentStatus || selectedEvent?.contracts?.[0]?.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">Payment Notes</Label>
                            <p className="bg-muted p-2 rounded text-sm mt-1">
                              {selectedEvent?.amcContract?.paymentNotes || 'No payment notes.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p>No AMC Contract linked to this event.</p>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: HISTORY */}
            <TabsContent value="history" className="flex-1 overflow-y-auto p-6 m-0 bg-muted/5">
              <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events
                        .filter(e =>
                          (selectedEvent?.customer?.id && e.customer?.id === selectedEvent.customer.id) ||
                          (selectedEvent?.user?.id && e.customer?.id === selectedEvent.user.id)
                        )
                        .sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime())
                        .map((historyEvent) => (
                          <TableRow key={historyEvent.id} className="hover:bg-muted/5">
                            <TableCell className="font-medium">{new Date(historyEvent.actionDate || historyEvent.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{historyEvent.type}</Badge>
                            </TableCell>
                            <TableCell>{historyEvent.product?.productName}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(historyEvent.status)} variant="secondary">
                                {historyEvent.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {historyEvent.ticket ? (
                                <Badge variant="outline" className="text-xs">
                                  #{historyEvent.ticket.id} {historyEvent.ticket.status}
                                </Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => setSelectedEvent(historyEvent)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {events.filter(e =>
                        (selectedEvent?.customer?.id && e.customer?.id === selectedEvent.customer.id) ||
                        (selectedEvent?.user?.id && e.customer?.id === selectedEvent.user.id)
                      ).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                              No history found for this customer.
                            </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-6 pt-4 border-t shrink-0 bg-background">
            <Button onClick={() => setViewOpen(false)} size="lg" className="w-full md:w-auto">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
