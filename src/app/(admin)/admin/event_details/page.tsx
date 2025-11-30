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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Calendar, Search, Filter, CheckCircle, Ticket, User, Wrench } from 'lucide-react'
import { getServiceEvents, createTicketForEvent, updateServiceEvent } from '@/actions/admin/serviceEvents'

export default function EventDetailsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'today' | 'yesterday' | 'upcoming' | 'all'>('today')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  
  // Resolve Dialog State
  const [resolveOpen, setResolveOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [resolveRemarks, setResolveRemarks] = useState('')
  const [resolving, setResolving] = useState(false)

  const fetchEvents = async () => {
    setLoading(true)
    const result = await getServiceEvents(filter, selectedMonth, selectedStatus)
    if (result.success) {
      setEvents(result.data || [])
    } else {
      toast.error('Failed to fetch events')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [filter, selectedMonth, selectedStatus])

  const handleCreateTicket = async (eventId: number) => {
    const toastId = toast.loading('Creating ticket...')
    const result = await createTicketForEvent(eventId)
    if (result.success) {
      toast.success('Ticket created successfully', { id: toastId })
      fetchEvents() // Refresh to show ticket status
    } else {
      toast.error(result.error || 'Failed to create ticket', { id: toastId })
    }
  }

  const handleResolveClick = (event: any) => {
    setSelectedEvent(event)
    setResolveRemarks(event.remarks || '')
    setResolveOpen(true)
  }

  const handleConfirmResolve = async () => {
    if (!selectedEvent) return

    setResolving(true)
    const result = await updateServiceEvent(selectedEvent.id, {
      status: 'COMPLETED',
      remarks: resolveRemarks
    })
    setResolving(false)

    if (result.success) {
      toast.success('Event resolved successfully')
      setResolveOpen(false)
      fetchEvents()
    } else {
      toast.error(result.error || 'Failed to resolve event')
    }
  }

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
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
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
                <SelectTrigger className="w-[140px]">
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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[750px] overflow-y-auto relative">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Action Date</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
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
                        <div className="flex flex-col">
                          <span className="font-medium">{event.customer?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{event.product?.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
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
                          {!event.ticket && event.status !== 'CANCELLED' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8"
                              onClick={() => handleCreateTicket(event.id)}
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
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Service Event</DialogTitle>
            <DialogDescription>
              Mark this event as completed. You can add final remarks below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Details</Label>
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                <p><strong>Customer:</strong> {selectedEvent?.customer?.name}</p>
                <p><strong>Product:</strong> {selectedEvent?.product?.productName}</p>
                <p><strong>Date:</strong> {selectedEvent?.actionDate && new Date(selectedEvent.actionDate).toLocaleDateString()}</p>
              </div>
            </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)} disabled={resolving}>
              Cancel
            </Button>
            <Button onClick={handleConfirmResolve} disabled={resolving} className="bg-green-600 hover:bg-green-700">
              {resolving ? 'Resolving...' : 'Confirm Resolution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
