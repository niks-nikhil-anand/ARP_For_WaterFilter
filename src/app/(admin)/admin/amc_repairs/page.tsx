'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Wrench, Eye, Package, FileText, Search, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  getServiceEvents,
  getProducts,
  getCustomers,
  getAgents,
  getAllAMCs,
  createAMCContract
} from '@/actions/admin/serviceEvents'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ServiceEvent | null>(null)
  const [formStep, setFormStep] = useState(1)

  // Combobox states
  const [productOpen, setProductOpen] = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)

  // Search states
  const [productSearch, setProductSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [agentSearch, setAgentSearch] = useState('')

  const [addForm, setAddForm] = useState({
    productId: '',
    customerId: '',
    agentId: '',
    startDate: '',
    duration: '1 year',
    endDate: '',
    price: '',
    discount: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT_RATE',
    finalPrice: '',
    paymentPaid: '',
    paymentDue: '',
    paymentMethod: 'CASH' as 'CASH' | 'ONLINE' | 'UPI' | 'CARD' | 'NET_BANKING',
    remarks: '',
    noOfServices: '4',
  })

  useEffect(() => {
    loadData()
  }, [])

  // Filtered lists for searchable selects
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      (product.productName || '').toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 50) // Limit to 50 results for performance
  }, [products, productSearch])

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(customerSearch.toLowerCase())
    ).slice(0, 50)
  }, [customers, customerSearch])

  const filteredAgents = useMemo(() => {
    return agents.filter(agent =>
      agent.user.name.toLowerCase().includes(agentSearch.toLowerCase())
    ).slice(0, 50)
  }, [agents, agentSearch])

  const resetSearchStates = () => {
    setProductSearch('')
    setCustomerSearch('')
    setAgentSearch('')
  }

  const resetForm = () => {
    setAddForm({
      productId: '',
      customerId: '',
      agentId: '',
      startDate: '',
      duration: '1 year',
      endDate: '',
      price: '',
      discount: '',
      discountType: 'PERCENTAGE',
      finalPrice: '',
      paymentPaid: '',
      paymentDue: '',
      paymentMethod: 'CASH',
      remarks: '',
      noOfServices: '4',
    })
    setFormStep(1)
    resetSearchStates()
  }

  // Calculate end date based on start date and duration
  useEffect(() => {
    if (addForm.startDate && addForm.duration) {
      const startDate = new Date(addForm.startDate)
      const endDate = new Date(startDate)

      const durationMatch = addForm.duration.match(/(\d+)\s*(year|month|day)s?/i)
      if (durationMatch) {
        const amount = parseInt(durationMatch[1])
        const unit = durationMatch[2].toLowerCase()

        if (unit === 'year') {
          endDate.setFullYear(endDate.getFullYear() + amount)
        } else if (unit === 'month') {
          endDate.setMonth(endDate.getMonth() + amount)
        } else if (unit === 'day') {
          endDate.setDate(endDate.getDate() + amount)
        }
      }

      setAddForm(prev => ({ ...prev, endDate: endDate.toISOString().split('T')[0] }))
    }
  }, [addForm.startDate, addForm.duration])

  // Calculate final price based on price and discount
  useEffect(() => {
    if (addForm.price) {
      const price = parseFloat(addForm.price) || 0
      const discount = parseFloat(addForm.discount) || 0
      let finalPrice = price

      if (discount > 0) {
        if (addForm.discountType === 'PERCENTAGE') {
          finalPrice = price - (price * discount / 100)
        } else {
          finalPrice = price - discount
        }
      }

      setAddForm(prev => ({ ...prev, finalPrice: finalPrice.toFixed(2) }))
    }
  }, [addForm.price, addForm.discount, addForm.discountType])

  // Calculate payment due
  useEffect(() => {
    const finalPrice = parseFloat(addForm.finalPrice) || 0
    const paymentPaid = parseFloat(addForm.paymentPaid) || 0
    const paymentDue = finalPrice - paymentPaid

    setAddForm(prev => ({ ...prev, paymentDue: paymentDue.toFixed(2) }))
  }, [addForm.finalPrice, addForm.paymentPaid])

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

  const handleAddAMC = async () => {
    if (!addForm.productId || !addForm.customerId) {
      toast.error('Product and Customer are required')
      return
    }

    if (!addForm.startDate || !addForm.price || !addForm.paymentPaid) {
      toast.error('Start Date, Price, and Payment Paid are required')
      return
    }

    setIsCreating(true)
    const result = await createAMCContract({
      productId: parseInt(addForm.productId),
      customerId: parseInt(addForm.customerId),
      agentId: addForm.agentId ? parseInt(addForm.agentId) : undefined,
      startDate: new Date(addForm.startDate),
      duration: addForm.duration,
      price: parseFloat(addForm.price),
      discount: addForm.discount ? parseFloat(addForm.discount) : undefined,
      discountType: addForm.discount ? addForm.discountType : undefined,
      paymentPaid: parseFloat(addForm.paymentPaid),
      paymentMethod: addForm.paymentMethod,
      remarks: addForm.remarks || undefined,
      noOfServices: parseInt(addForm.noOfServices),
    })
    setIsCreating(false)

    if (result.success) {
      toast.success('AMC Contract created successfully')
      setAddDialogOpen(false)
      resetForm()
      loadData()
    } else {
      toast.error(result.error || 'Failed to create AMC contract')
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

      {/* Add AMC Contract Dialog - 2 Steps */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create AMC Contract - Step {formStep} of 2</DialogTitle>
            <DialogDescription>
              {formStep === 1 ? 'Select product, customer, and agent' : 'Enter contract details and payment information'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1: Selection */}
            {formStep === 1 && (
              <div className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Popover open={productOpen} onOpenChange={setProductOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productOpen}
                        className="w-full justify-between h-11"
                        disabled={isCreating}
                      >
                        {addForm.productId
                          ? products.find((p) => p.id.toString() === addForm.productId)?.productName || 'Select product'
                          : 'Select product'}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search products..."
                          value={productSearch}
                          onValueChange={setProductSearch}
                        />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {filteredProducts.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.productName || `Product #${product.id}`}
                                onSelect={() => {
                                  setAddForm(prev => ({ ...prev, productId: product.id.toString() }))
                                  setProductOpen(false)
                                  setProductSearch('')
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    addForm.productId === product.id.toString() ? 'opacity-100' : 'opacity-0'
                                  }`}
                                />
                                <span>{product.productName || `Product #${product.id}`}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Customer and Agent Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <div className="flex gap-2">
                      <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={customerOpen}
                            className="w-full justify-between h-11"
                            disabled={isCreating}
                          >
                            {addForm.customerId
                              ? customers.find((c) => c.id.toString() === addForm.customerId)?.name || 'Select customer'
                              : 'Select customer'}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search customers..."
                              value={customerSearch}
                              onValueChange={setCustomerSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No customer found.</CommandEmpty>
                              <CommandGroup>
                                {filteredCustomers.map((customer) => (
                                  <CommandItem
                                    key={customer.id}
                                    value={`${customer.name} ${customer.email || ''}`}
                                    onSelect={() => {
                                      setAddForm(prev => ({ ...prev, customerId: customer.id.toString() }))
                                      setCustomerOpen(false)
                                      setCustomerSearch('')
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 shrink-0 ${
                                        addForm.customerId === customer.id.toString() ? 'opacity-100' : 'opacity-0'
                                      }`}
                                    />
                                    <div className="flex flex-col">
                                      <span>{customer.name}</span>
                                      {customer.email && (
                                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {addForm.customerId && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setAddForm({ ...addForm, customerId: '' })}
                          disabled={isCreating}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent">Agent (Optional)</Label>
                    <div className="flex gap-2">
                      <Popover open={agentOpen} onOpenChange={setAgentOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={agentOpen}
                            className="w-full justify-between h-11"
                            disabled={isCreating}
                          >
                            {addForm.agentId
                              ? agents.find((a) => a.id.toString() === addForm.agentId)?.user.name || 'Select agent'
                              : 'Select agent'}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search agents..."
                              value={agentSearch}
                              onValueChange={setAgentSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No agent found.</CommandEmpty>
                              <CommandGroup>
                                {filteredAgents.map((agent) => (
                                  <CommandItem
                                    key={agent.id}
                                    value={agent.user.name}
                                    onSelect={() => {
                                      setAddForm(prev => ({ ...prev, agentId: agent.id.toString() }))
                                      setAgentOpen(false)
                                      setAgentSearch('')
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        addForm.agentId === agent.id.toString() ? 'opacity-100' : 'opacity-0'
                                      }`}
                                    />
                                    <span>{agent.user.name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {addForm.agentId && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setAddForm({ ...addForm, agentId: '' })}
                          disabled={isCreating}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contract Details */}
            {formStep === 2 && (
              <div className="space-y-6">
                {/* Date and Duration Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={addForm.startDate}
                      onChange={(e) => setAddForm({ ...addForm, startDate: e.target.value })}
                      disabled={isCreating}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Select
                      value={addForm.duration}
                      onValueChange={(value) => setAddForm({ ...addForm, duration: value })}
                      disabled={isCreating}
                    >
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6 months">6 Months</SelectItem>
                        <SelectItem value="1 year">1 Year</SelectItem>
                        <SelectItem value="2 years">2 Years</SelectItem>
                        <SelectItem value="3 years">3 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* End Date (Auto-calculated) and Number of Services */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Auto-calculated)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={addForm.endDate}
                      disabled
                      className="h-11 bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noOfServices">Number of Services *</Label>
                    <Input
                      id="noOfServices"
                      type="number"
                      value={addForm.noOfServices}
                      onChange={(e) => setAddForm({ ...addForm, noOfServices: e.target.value })}
                      disabled={isCreating}
                      className="h-11"
                      min="1"
                    />
                  </div>
                </div>

                {/* Price and Discount Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={addForm.price}
                      onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                      placeholder="0.00"
                      disabled={isCreating}
                      className="h-11"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={addForm.discount}
                      onChange={(e) => setAddForm({ ...addForm, discount: e.target.value })}
                      placeholder="0"
                      disabled={isCreating}
                      className="h-11"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Discount Type and Final Price Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select
                      value={addForm.discountType}
                      onValueChange={(value: 'PERCENTAGE' | 'FLAT_RATE') => setAddForm({ ...addForm, discountType: value })}
                      disabled={isCreating || !addForm.discount}
                    >
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FLAT_RATE">Flat Rate (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalPrice">Final Price (₹)</Label>
                    <Input
                      id="finalPrice"
                      type="number"
                      value={addForm.finalPrice}
                      disabled
                      className="h-11 bg-muted font-semibold"
                    />
                  </div>
                </div>

                {/* Payment Paid and Payment Due Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentPaid">Payment Paid (₹) *</Label>
                    <Input
                      id="paymentPaid"
                      type="number"
                      value={addForm.paymentPaid}
                      onChange={(e) => setAddForm({ ...addForm, paymentPaid: e.target.value })}
                      placeholder="0.00"
                      disabled={isCreating}
                      className="h-11"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDue">Payment Due (₹)</Label>
                    <Input
                      id="paymentDue"
                      type="number"
                      value={addForm.paymentDue}
                      disabled
                      className="h-11 bg-muted font-semibold text-red-600"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      value={addForm.paymentMethod}
                      onValueChange={(value: 'CASH' | 'ONLINE' | 'UPI' | 'CARD' | 'NET_BANKING') =>
                        setAddForm({ ...addForm, paymentMethod: value })
                      }
                      disabled={isCreating}
                    >
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={addForm.remarks}
                    onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                    placeholder="Additional notes or remarks..."
                    disabled={isCreating}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddDialogOpen(false)
                  resetForm()
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              {formStep === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setFormStep(1)}
                  disabled={isCreating}
                >
                  Back
                </Button>
              )}
              {formStep === 1 ? (
                <Button
                  onClick={() => {
                    if (!addForm.productId || !addForm.customerId) {
                      toast.error('Product and Customer are required')
                      return
                    }
                    setFormStep(2)
                  }}
                  disabled={isCreating}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleAddAMC} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create AMC Contract'}
                </Button>
              )}
            </div>
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
