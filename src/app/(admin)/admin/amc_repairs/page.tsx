'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Wrench, Eye, Package, FileText } from 'lucide-react'
import {
  getServiceEvents,
  getProducts,
  getCustomers,
  getAgents,
  getAllAMCs
} from '@/actions/admin/serviceEvents'
import { AddAMCContractDialog } from '@/components/admin/amc/AddAMCContractDialog'

type ServiceEvent = {
  id: number
  type: 'REPAIR' | 'AMC' | 'WARRANTY' | 'AMC_CONTRACT'
  product: {
    id: number
    productName: string | null
  }
  customer?: {
    id: number
    name: string
    email: string | null
  } | null
  assignedTo?: {
    id: number
    user: {
      name: string
    }
  } | null
  amcContract?: {
    id: number
    name: string
    duration: string
    price: number
    status: string
  } | null
  description?: string | null
  remarks?: string | null
  parts?: string | null
  feedback?: string | null
  pricePaid?: number | null
  startDate?: Date | null
  endDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

const AMCRepairsPage = () => {
  const [events, setEvents] = useState<ServiceEvent[]>([])
  const [products, setProducts] = useState<{id: number, productName: string | null}[]>([])
  const [customers, setCustomers] = useState<{id: number, name: string, email: string | null}[]>([])
  const [agents, setAgents] = useState<{id: number, user: {name: string}}[]>([])
  const [loading, setLoading] = useState(true)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ServiceEvent | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [eventsRes, amcsRes, productsRes, customersRes, agentsRes] = await Promise.all([
      getServiceEvents(),
      getAllAMCs(),
      getProducts(),
      getCustomers(),
      getAgents()
    ])

    let allEvents: ServiceEvent[] = []

    if (eventsRes.success && eventsRes.data) {
      allEvents = [...eventsRes.data] as ServiceEvent[]
    }

    if (amcsRes.success && amcsRes.data) {
      const mappedAMCs = amcsRes.data.map((amc: any) => ({
        id: amc.id,
        type: 'AMC_CONTRACT' as const,
        product: {
          id: amc.product.id,
          productName: amc.product.productName
        },
        customer: {
          id: amc.order.id, // Using order ID as proxy since we don't have direct customer ID here easily without more queries
          name: amc.order.customerName,
          email: amc.order.customerEmail
        },
        assignedTo: null,
        amcContract: null,
        description: `AMC Contract (${amc.durationMonths} months)`,
        remarks: null,
        parts: null,
        feedback: null,
        pricePaid: amc.amountPaid,
        startDate: amc.startDate,
        endDate: amc.endDate,
        createdAt: amc.createdAt,
        updatedAt: amc.updatedAt
      }))
      allEvents = [...allEvents, ...mappedAMCs]
    }

    // Sort by createdAt desc
    allEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setEvents(allEvents)
    if (productsRes.success && productsRes.data) setProducts(productsRes.data)
    if (customersRes.success && customersRes.data) setCustomers(customersRes.data)
    if (agentsRes.success && agentsRes.data) setAgents(agentsRes.data)

    setLoading(false)
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      REPAIR: 'bg-orange-100 text-orange-800',
      AMC: 'bg-blue-100 text-blue-800',
      WARRANTY: 'bg-green-100 text-green-800',
      AMC_CONTRACT: 'bg-purple-100 text-purple-800',
    }
    return <Badge className={variants[type] || 'bg-gray-100'}>{type.replace('_', ' ')}</Badge>
  }

  const amcEvents = events.filter(e => e.type === 'AMC' || e.type === 'AMC_CONTRACT')

  return (
    <div className="h-[90vh] max-h-[92vh] overflow-y-auto">
      <div className="container mx-auto py-10 px-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AMC Management</h1>
              <p className="text-muted-foreground mt-2">
                Track and manage AMC contracts and visits
              </p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add AMC Contract
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Total AMC Records</span>
              </div>
              <p className="text-2xl font-bold">{amcEvents.length}</p>
            </div>
            <div className="border rounded-lg p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">AMC Visits</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {amcEvents.filter(e => e.type === 'AMC').length}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-2">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">AMC Contracts</span>
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {amcEvents.filter(e => e.type === 'AMC_CONTRACT').length}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Wrench className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">No records found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  amcEvents.map((event) => (
                    <TableRow key={`${event.type}-${event.id}`}>
                      <TableCell className="font-medium">#{event.id}</TableCell>
                      <TableCell>{getTypeBadge(event.type)}</TableCell>
                      <TableCell>{event.product.productName || 'Unknown Product'}</TableCell>
                      <TableCell>{event.customer?.name || 'N/A'}</TableCell>
                      <TableCell>{event.assignedTo?.user.name || 'N/A'}</TableCell>
                      <TableCell className="max-w-xs truncate">{event.description || 'N/A'}</TableCell>
                      <TableCell>{formatDate(event.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event)
                            setViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add AMC Contract Dialog */}
      <AddAMCContractDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        products={products}
        customers={customers}
        agents={agents}
        onSuccess={loadData}
      />

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p>{getTypeBadge(selectedEvent.type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Product</Label>
                  <p>{selectedEvent.product.productName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p>{selectedEvent.customer?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Technician</Label>
                  <p>{selectedEvent.assignedTo?.user.name || 'Unassigned'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{formatDate(selectedEvent.createdAt)}</p>
                </div>
                {selectedEvent.pricePaid && (
                  <div>
                    <Label className="text-muted-foreground">Price Paid</Label>
                    <p>{formatCurrency(selectedEvent.pricePaid)}</p>
                  </div>
                )}
              </div>
              {selectedEvent.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.remarks && (
                <div>
                  <Label className="text-muted-foreground">Remarks</Label>
                  <p className="mt-1">{selectedEvent.remarks}</p>
                </div>
              )}
              {selectedEvent.parts && (
                <div>
                  <Label className="text-muted-foreground">Parts Used</Label>
                  <p className="mt-1">{selectedEvent.parts}</p>
                </div>
              )}
              {selectedEvent.feedback && (
                <div>
                  <Label className="text-muted-foreground">Feedback</Label>
                  <p className="mt-1">{selectedEvent.feedback}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AMCRepairsPage
