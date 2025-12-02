'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { Calendar as CalendarIcon, Search, Filter, CheckCircle, Ticket, User, Wrench } from 'lucide-react'
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getServiceEvents, createTicketForEvent, getAgents, resolveServiceEvent } from '@/actions/admin/serviceEvents'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { SkeletonTable } from '@/components/common/SkeletonTable'
import { EditEventDialog } from '@/components/admin/EditEventDialog'

export default function EventDetailsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'today' | 'yesterday' | 'upcoming' | 'backlog' | 'all' | 'custom'>('today')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [date, setDate] = useState<DateRange | undefined>()
  const [sortBy, setSortBy] = useState<string>('actionDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
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

  // Edit Dialog State
  const [editOpen, setEditOpen] = useState(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const [eventsResult, agentsResult] = await Promise.all([
      getServiceEvents(
        filter,
        selectedMonth,
        selectedStatus,
        currentPage,
        itemsPerPage,
        itemsPerPage,
        date?.from,
        date?.to,
        sortBy,
        sortOrder
      ),
      getAgents()
    ])

    if (eventsResult.success) {
      setEvents(eventsResult.data || [])
      if (eventsResult.meta) {
        setTotalPages(eventsResult.meta.totalPages)
      }
    } else {
      toast.error('Failed to fetch events')
    }

    if (agentsResult.success) {
      setAgents(agentsResult.data || [])
    }

    setLoading(false)
  }, [filter, selectedMonth, selectedStatus, currentPage, itemsPerPage, date, sortBy, sortOrder])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, selectedMonth, selectedStatus, date, sortBy, sortOrder])

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
      fetchEvents()
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

  const handleEditClick = (event: any) => {
    setSelectedEvent(event)
    setEditOpen(true)
  }

  const handleConfirmResolve = async () => {
    if (!selectedEvent) return

    setResolving(true)

    const resolveData: any = {
      status: resolveStatus,
      remarks: resolveRemarks,
    }

    if (resolveStatus === 'SCHEDULED') {
      resolveData.actionDate = scheduledDate ? new Date(scheduledDate) : undefined
      resolveData.scheduledRemarks = scheduledRemarks
    }

    const result = await resolveServiceEvent(selectedEvent.id, resolveData)
    setResolving(false)

    if (result.success) {
      toast.success('Event updated successfully')
      setResolveOpen(false)
      fetchEvents()
    } else {
      toast.error(result.error || 'Failed to update event')
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  // Client-side search filtering (since backend search isn't implemented yet for all fields)
  // Note: For large datasets, search should be moved to backend
  const filteredEvents = events.filter(event =>
    event.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
    event.product?.productName?.toLowerCase().includes(search.toLowerCase()) ||
    event.id.toString().includes(search)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Events</h1>
          <p className="text-muted-foreground">Manage service schedules, tickets, and resolutions.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Add global actions here if needed */}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4">
            {/* Top Row: Primary Filters (Date Tabs & Custom Range) */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="flex flex-wrap gap-2 items-center">
                <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="backlog">Backlog</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>
                </Tabs>

                {filter === 'custom' && (
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

              {/* Search aligned to right on top row for easy access */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Bottom Row: Secondary Filters (Month & Status) */}
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground mr-2">Filters:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('actionDate')}
                  >
                    Action Date {sortBy === 'actionDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created At {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9} className="p-0">
                        <SkeletonTable columns={9} rows={1} className="border-0" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No events found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">#{event.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={event.type === 'AMC' ? 'border-blue-500 text-blue-500' : 'border-orange-500 text-orange-500'}>
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{event.product?.productName}</span>
                          {(() => {
                            const productWarranties = event.customer?.warranties?.filter((w: any) => w.productId === event.product?.id) || []
                            const hasActiveWarranty = productWarranties.some((w: any) => new Date(w.endDate) > new Date())
                            const hasExpiredWarranty = productWarranties.length > 0 && !hasActiveWarranty

                            if (hasActiveWarranty) {
                              return (
                                <Badge variant="outline" className="w-fit bg-green-50 text-green-700 border-green-200 text-[10px] px-1 py-0 h-5">
                                  Warranty Available
                                </Badge>
                              )
                            } else if (hasExpiredWarranty) {
                              return (
                                <Badge variant="outline" className="w-fit bg-red-50 text-red-700 border-red-200 text-[10px] px-1 py-0 h-5">
                                  Warranty Expired
                                </Badge>
                              )
                            } else {
                              return (
                                <Badge variant="outline" className="w-fit bg-gray-50 text-gray-500 border-gray-200 text-[10px] px-1 py-0 h-5">
                                  No Warranty
                                </Badge>
                              )
                            }
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{event.customer?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{event.customer?.mobile || 'No Mobile'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {new Date(event.actionDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {event.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3 w-3 text-muted-foreground" />
                            {event.assignedTo.user.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)} variant="secondary">
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event.ticket ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Ticket #{event.ticket.id}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewClick(event)}
                            title="View Details"
                          >
                            <span className="sr-only">View</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditClick(event)}
                            title="Edit Event"
                          >
                            <span className="sr-only">Edit</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </Button>
                          {!event.ticket && event.status !== 'CANCELLED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleTicketClick(event)}
                              title="Create Ticket"
                            >
                              <Ticket className="h-4 w-4 mr-1" />
                              Ticket
                            </Button>
                          )}
                          {event.status !== 'COMPLETED' && event.status !== 'CANCELLED' && (
                            <Button
                              size="sm"
                              className="h-8 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleResolveClick(event)}
                              title="Resolve Event"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
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

      <EditEventDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        event={selectedEvent}
        agents={agents}
        onSuccess={fetchEvents}
      />
    </div>
  )
}
