'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Wrench, Eye, Pencil, Trash2, Calendar, Package, FileText } from 'lucide-react'
import { toast } from 'sonner'
import {
  getServiceEvents,
  createServiceEvent,
  updateServiceEvent,
  deleteServiceEvent,
  getProducts,
  getCustomers,
  getAgents,
  getAMCContracts,
  getAllAMCs
} from '@/actions/admin/serviceEvents'

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
  const [customers, setCustomers] = useState<{id: number, name: string, email: string}[]>([])
  const [agents, setAgents] = useState<{id: number, user: {name: string}}[]>([])
  const [amcContracts, setAmcContracts] = useState<{id: number, name: string, duration: string, price: number, status: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ServiceEvent | null>(null)
  
  const [addForm, setAddForm] = useState({
    type: 'REPAIR' as 'REPAIR' | 'AMC' | 'WARRANTY',
    productId: '',
    customerId: '',
    agentId: '',
    amcContractId: '',
    description: '',
    remarks: '',
    parts: '',
    pricePaid: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [eventsRes, amcsRes, productsRes, customersRes, agentsRes, contractsRes] = await Promise.all([
      getServiceEvents(),
      getAllAMCs(),
      getProducts(),
      getCustomers(),
      getAgents(),
      getAMCContracts()
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
    if (contractsRes.success && contractsRes.data) setAmcContracts(contractsRes.data)
    
    setLoading(false)
  }

  const handleAddEvent = async () => {
    if (!addForm.productId || !addForm.type) {
      toast.error('Product and Type are required')
      return
    }

    setIsCreating(true)
    const result = await createServiceEvent({
      type: addForm.type,
      productId: parseInt(addForm.productId),
      customerId: addForm.customerId ? parseInt(addForm.customerId) : undefined,
      agentId: addForm.agentId ? parseInt(addForm.agentId) : undefined,
      amcContractId: addForm.amcContractId ? parseInt(addForm.amcContractId) : undefined,
      description: addForm.description || undefined,
      remarks: addForm.remarks || undefined,
      parts: addForm.parts || undefined,
      pricePaid: addForm.pricePaid ? parseFloat(addForm.pricePaid) : undefined,
      startDate: addForm.startDate ? new Date(addForm.startDate) : undefined,
      endDate: addForm.endDate ? new Date(addForm.endDate) : undefined,
    })
    setIsCreating(false)

    if (result.success) {
      toast.success(`${addForm.type} created successfully`)
      setAddDialogOpen(false)
      setAddForm({
        type: 'REPAIR',
        productId: '',
        customerId: '',
        agentId: '',
        amcContractId: '',
        description: '',
        remarks: '',
        parts: '',
        pricePaid: '',
        startDate: '',
        endDate: '',
      })
      loadData()
    } else {
      toast.error(result.error || 'Failed to create event')
    }
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

  const repairEvents = events.filter(e => e.type === 'REPAIR')
  const amcEvents = events.filter(e => e.type === 'AMC' || e.type === 'AMC_CONTRACT')

  return (
    <div className="h-[90vh] max-h-[92vh] overflow-y-auto">
      <div className="container mx-auto py-10 px-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AMC & Repairs Management</h1>
              <p className="text-muted-foreground mt-2">
                Track and manage AMC contracts, repairs, and warranty services
              </p>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service Event
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Wrench className="h-4 w-4" />
                <span className="text-sm font-medium">Total Records</span>
              </div>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
            <div className="border rounded-lg p-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                <Wrench className="h-4 w-4" />
                <span className="text-sm font-medium">Repairs</span>
              </div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {repairEvents.length}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">AMC Contracts</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {amcEvents.length}
              </p>
            </div>
            <div className="border rounded-lg p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Warranty</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {events.filter(e => e.type === 'WARRANTY').length}
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
                  events.map((event) => (
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

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Service Event</DialogTitle>
            <DialogDescription>
              Create a new repair, AMC, or warranty service record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={addForm.type}
                  onValueChange={(value: 'REPAIR' | 'AMC' | 'WARRANTY') =>
                    setAddForm({ ...addForm, type: value })
                  }
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPAIR">Repair</SelectItem>
                    <SelectItem value="AMC">AMC Visit</SelectItem>
                    <SelectItem value="WARRANTY">Warranty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={addForm.productId}
                  onValueChange={(value) => setAddForm({ ...addForm, productId: value })}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.productName || `Product #${product.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={addForm.customerId}
                  onValueChange={(value) => setAddForm({ ...addForm, customerId: value })}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent">Technician</Label>
                <Select
                  value={addForm.agentId}
                  onValueChange={(value) => setAddForm({ ...addForm, agentId: value })}
                  disabled={isCreating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {addForm.type === 'AMC' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amcContract">AMC Contract</Label>
                  <Select
                    value={addForm.amcContractId}
                    onValueChange={(value) => setAddForm({ ...addForm, amcContractId: value })}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AMC contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {amcContracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id.toString()}>
                          {contract.name} - {contract.duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={addForm.startDate}
                      onChange={(e) => setAddForm({ ...addForm, startDate: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={addForm.endDate}
                      onChange={(e) => setAddForm({ ...addForm, endDate: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                placeholder="Describe the issue or service..."
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={addForm.remarks}
                onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                placeholder="Additional remarks..."
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parts">Parts Used</Label>
                <Input
                  id="parts"
                  value={addForm.parts}
                  onChange={(e) => setAddForm({ ...addForm, parts: e.target.value })}
                  placeholder="List parts used..."
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePaid">Price Paid (₹)</Label>
                <Input
                  id="pricePaid"
                  type="number"
                  value={addForm.pricePaid}
                  onChange={(e) => setAddForm({ ...addForm, pricePaid: e.target.value })}
                  placeholder="0.00"
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
