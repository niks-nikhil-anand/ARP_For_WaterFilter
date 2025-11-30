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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Calendar, Search, Filter, CheckCircle, Ticket, User, Wrench, Plus, FileText, Phone, Mail, MapPin } from 'lucide-react'
import { getServiceEvents, createTicketForEvent, updateServiceEvent, getAgents, getAllAMCs, createAMCContract } from '@/actions/admin/serviceEvents'
import { getAllProducts } from '@/actions/admin/products'
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
  const [filter, setFilter] = useState<'all' | 'amc' | 'repair'>('all')
  const [search, setSearch] = useState('')
  const [addAMCOpen, setAddAMCOpen] = useState(false)

  // Pagination State (Client-side)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

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
      getServiceEvents('all'), // Fetch all for client-side filtering/pagination
      getAllAMCs(),
      getAgents(),
      getAllProducts(),
      getUsersByRole('USER')
    ])

    if (eventsResult.success) {
      setEvents(eventsResult.data || [])
    } else {
      toast.error('Failed to fetch events')
    }

    if (amcsResult.success) {
      setAmcs(amcsResult.data || [])
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
  }, [])

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

  // Merge and Filter Data
  const mergedData = [
    ...events.map(e => ({ ...e, dataType: 'EVENT' })),
    ...amcs.map(a => ({ ...a, dataType: 'AMC', actionDate: a.createdAt, status: 'ACTIVE' })) // Normalize AMC data
  ].sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime())

  const filteredData = mergedData.filter(item => {
    const matchesSearch =
      (item.customer?.name || item.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.product?.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      item.id.toString().includes(search)

    if (filter === 'all') return matchesSearch
    if (filter === 'amc') return matchesSearch && (item.type === 'AMC' || item.dataType === 'AMC')
    if (filter === 'repair') return matchesSearch && item.type !== 'AMC' && item.dataType === 'EVENT'
    return matchesSearch
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
          <h1 className="text-3xl font-bold tracking-tight">AMC & Repairs</h1>
          <p className="text-muted-foreground">Manage Annual Maintenance Contracts and repair requests.</p>
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
            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <Tabs value={filter} onValueChange={(v: any) => { setFilter(v); setCurrentPage(1); }} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="amc">AMC</TabsTrigger>
                  <TabsTrigger value="repair">Repairs</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[750px] overflow-y-auto relative">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="p-0">
                        <SkeletonTable columns={7} rows={1} className="border-0" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={`${item.dataType}-${item.id}`}>
                      <TableCell className="font-medium">#{item.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={item.type === 'AMC' || item.dataType === 'AMC' ? 'border-blue-500 text-blue-500' : 'border-orange-500 text-orange-500'}>
                          {item.dataType === 'AMC' ? 'AMC Contract' : item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.customer?.name || item.user?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{item.customer?.email || item.user?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(item.actionDate || item.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.product?.productName}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)} variant="secondary">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {item.dataType === 'EVENT' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewClick(item)}
                                title="View Details"
                              >
                                <span className="sr-only">View</span>
                                <FileText className="h-4 w-4" />
                              </Button>
                              {!item.ticket && item.status !== 'CANCELLED' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => handleTicketClick(item)}
                                  title="Create Ticket"
                                >
                                  <Ticket className="h-4 w-4 mr-1" />
                                  Ticket
                                </Button>
                              )}
                              {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                                <Button
                                  size="sm"
                                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleResolveClick(item)}
                                  title="Resolve Event"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Resolve
                                </Button>
                              )}
                            </>
                          )}
                          {item.dataType === 'AMC' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              // Add view logic for AMC contract if needed
                              title="View Contract"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details #{selectedEvent?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" /> Customer Details
                </h4>
                <div className="text-sm space-y-1 text-muted-foreground border p-3 rounded-md">
                  <p><span className="font-medium text-foreground">Name:</span> {selectedEvent?.customer?.name}</p>
                  <p><span className="font-medium text-foreground">Email:</span> {selectedEvent?.customer?.email}</p>
                  <p><span className="font-medium text-foreground">Mobile:</span> {selectedEvent?.customer?.mobile || 'N/A'}</p>
                  <p><span className="font-medium text-foreground">Address:</span> {[
                    selectedEvent?.customer?.addresses?.[0]?.locality,
                    selectedEvent?.customer?.addresses?.[0]?.city,
                    selectedEvent?.customer?.addresses?.[0]?.state,
                    selectedEvent?.customer?.addresses?.[0]?.pincode
                  ].filter(Boolean).join(', ') || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Service Info
                </h4>
                <div className="text-sm space-y-1 text-muted-foreground border p-3 rounded-md">
                  <p><span className="font-medium text-foreground">Type:</span> {selectedEvent?.type}</p>
                  <p><span className="font-medium text-foreground">Product:</span> {selectedEvent?.product?.productName}</p>
                  <p><span className="font-medium text-foreground">Status:</span> <Badge variant="outline">{selectedEvent?.status}</Badge></p>
                  <p><span className="font-medium text-foreground">Scheduled:</span> {selectedEvent?.actionDate && new Date(selectedEvent.actionDate).toLocaleDateString()}</p>
                  <p><span className="font-medium text-foreground">Agent:</span> {selectedEvent?.assignedTo?.user?.name || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Ticket className="h-4 w-4" /> Ticket & Remarks
                </h4>
                <div className="text-sm space-y-3 text-muted-foreground border p-3 rounded-md h-full">
                  <div>
                    <span className="font-medium text-foreground block mb-1">Description:</span>
                    <p className="bg-muted p-2 rounded text-xs">{selectedEvent?.description || 'No description'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground block mb-1">Remarks:</span>
                    <p className="bg-muted p-2 rounded text-xs">{selectedEvent?.remarks || 'No remarks'}</p>
                  </div>
                  {selectedEvent?.ticket && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="font-medium text-foreground mb-1">Linked Ticket:</p>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Ticket #{selectedEvent.ticket.id} - {selectedEvent.ticket.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
