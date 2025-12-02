'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Search, Check, X, User, Package, Wrench, Mail, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createAMCContract } from '@/actions/admin/serviceEvents'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AddAMCContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: { id: number; productName: string | null }[]
  customers: { id: number; name: string; email: string | null }[]
  agents: { id: number; user: { name: string } }[]
  onSuccess: () => void
}

export const AddAMCContractDialog = ({
  open,
  onOpenChange,
  products,
  customers,
  agents,
  onSuccess
}: AddAMCContractDialogProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [processingStep, setProcessingStep] = useState(0)

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
    firstServiceDate: '',
    serviceDates: [] as string[]
  })

  // Filtered lists for searchable selects
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      (product.productName || '').toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 50)
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
      firstServiceDate: '',
      serviceDates: []
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

      setAddForm(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0],
        // Default first service date to start date if not set
        firstServiceDate: prev.firstServiceDate || prev.startDate
      }))
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

  // Auto-generate service dates when start date, duration, or noOfServices changes
  useEffect(() => {
    if (addForm.startDate && addForm.endDate && addForm.noOfServices) {
      const startDate = new Date(addForm.startDate)
      const endDate = new Date(addForm.endDate)
      const count = parseInt(addForm.noOfServices)
      const firstService = addForm.firstServiceDate ? new Date(addForm.firstServiceDate) : startDate

      if (count > 0) {
        const totalDurationMs = endDate.getTime() - startDate.getTime()
        const intervalMs = totalDurationMs / count
        const dates: string[] = []

        for (let i = 0; i < count; i++) {
          // If i=0 (first service), use firstServiceDate. 
          // Otherwise calculate based on interval from first service? 
          // Or interval from start date? 
          // Usually intervals are spaced out.
          // Let's assume first service is the first one, and others follow by interval.

          let serviceDate: Date
          if (i === 0) {
            serviceDate = firstService
          } else {
            serviceDate = new Date(firstService.getTime() + intervalMs * i)
          }

          // Ensure we don't go past end date? Or just let it be.
          dates.push(serviceDate.toISOString().split('T')[0])
        }
        setAddForm(prev => ({ ...prev, serviceDates: dates }))
      }
    }
  }, [addForm.startDate, addForm.endDate, addForm.noOfServices, addForm.firstServiceDate])

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
    setProcessingStep(1) // Validation

    // Simulate a brief delay for visual effect
    await new Promise(resolve => setTimeout(resolve, 600))
    setProcessingStep(2) // AMC Record

    await new Promise(resolve => setTimeout(resolve, 800))
    setProcessingStep(3) // Contract

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
      serviceDates: addForm.serviceDates.map(d => new Date(d))
    })

    setProcessingStep(4) // Scheduling
    await new Promise(resolve => setTimeout(resolve, 600))

    setIsCreating(false)
    setProcessingStep(0)

    if (result.success) {
      toast.success('AMC Contract created successfully')
      onOpenChange(false)
      resetForm()
      onSuccess()
    } else {
      toast.error(result.error || 'Failed to create AMC contract')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) {
          resetForm()
        }
      }}
    >
      <DialogContent className="max-w-[65vw] w-[65vw] max-h-[95vh] overflow-y-auto sm:max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create AMC Contract</DialogTitle>
          <DialogDescription>
            Create a new Annual Maintenance Contract for a customer.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 mt-4">
          <div className="flex items-center w-full max-w-3xl relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-background ${formStep >= 1 ? 'border-primary text-primary font-bold' : 'border-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${formStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-background ${formStep >= 2 ? 'border-primary text-primary font-bold' : 'border-muted text-muted-foreground'}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${formStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-background ${formStep >= 3 ? 'border-primary text-primary font-bold' : 'border-muted text-muted-foreground'}`}>
              3
            </div>
          </div>
          <div className="absolute w-full max-w-3xl flex justify-between mt-14 text-sm font-medium">
            <span className={formStep >= 1 ? 'text-primary' : 'text-muted-foreground'}>Selection</span>
            <span className={formStep >= 2 ? 'text-primary' : 'text-muted-foreground'}>Financials</span>
            <span className={formStep >= 3 ? 'text-primary' : 'text-muted-foreground'}>Schedule</span>
          </div>
        </div>

        <div className="py-4">
          {/* Step 1: Selection */}
          {formStep === 1 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Card */}
                <Card className={`shadow-sm h-full transition-colors ${addForm.customerId
                    ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10'
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                  }`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${addForm.customerId
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                        <User className="h-5 w-5" />
                      </div>
                      Customer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Customer Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="customer" className="text-base font-semibold">Customer</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Search for an existing customer by name or email.
                      </p>
                      <div className="flex gap-2 w-full">
                        <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={customerOpen}
                              className={`flex-1 justify-between h-12 text-base bg-background min-w-0 ${!addForm.customerId && 'border-blue-300 dark:border-blue-700 ring-1 ring-blue-100 dark:ring-blue-900'
                                }`}
                              disabled={isCreating}
                            >
                              {addForm.customerId ? (
                                <div className="flex items-center gap-2 text-left overflow-hidden">
                                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="truncate">
                                    {customers.find((c) => c.id.toString() === addForm.customerId)?.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Select customer...</span>
                              )}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[500px] p-0" align="start">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Search customers..."
                                value={customerSearch}
                                onValueChange={setCustomerSearch}
                              />
                              <CommandList>
                                <CommandEmpty>No customer found.</CommandEmpty>
                                <CommandGroup heading="Customers">
                                  {filteredCustomers.map((customer) => (
                                    <CommandItem
                                      key={customer.id}
                                      value={`customer-${customer.id}`}
                                      onSelect={() => {
                                        setAddForm(prev => ({ ...prev, customerId: customer.id.toString() }))
                                        setCustomerOpen(false)
                                      }}
                                      className="cursor-pointer py-3 data-[selected='true']:bg-blue-100 data-[selected='true']:text-black data-[selected='true']:font-bold dark:data-[selected='true']:bg-blue-900/20 dark:data-[selected='true']:text-white"
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 shrink-0 ${addForm.customerId === customer.id.toString() ? 'opacity-100 text-green-600' : 'opacity-0'
                                          }`}
                                      />
                                      <div className="flex flex-col">
                                        <span className="font-medium">{customer.name}</span>
                                        {customer.email && (
                                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" /> {customer.email}
                                          </span>
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
                            variant="ghost"
                            size="icon"
                            onClick={() => setAddForm({ ...addForm, customerId: '' })}
                            disabled={isCreating}
                            className="shrink-0 h-12 w-12 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Technician Card */}
                <Card className={`shadow-sm h-full transition-colors ${addForm.agentId
                    ? 'border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-900/10'
                    : 'border-purple-100 dark:border-purple-900'
                  }`}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      Technician Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="agent" className="text-base font-semibold">Assign Technician</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Optionally assign a technician to manage this contract.
                      </p>
                      <div className="flex gap-2 w-full">
                        <Popover open={agentOpen} onOpenChange={setAgentOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={agentOpen}
                              className="flex-1 justify-between h-12 text-base bg-background min-w-0"
                              disabled={isCreating}
                            >
                              {addForm.agentId ? (
                                <div className="flex items-center gap-2 text-left overflow-hidden">
                                  <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="truncate">
                                    {agents.find((a) => a.id.toString() === addForm.agentId)?.user.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Select technician...</span>
                              )}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Search technicians..."
                                value={agentSearch}
                                onValueChange={setAgentSearch}
                              />
                              <CommandList>
                                <CommandEmpty>No technician found.</CommandEmpty>
                                <CommandGroup heading="Technicians">
                                  {filteredAgents.map((agent) => (
                                    <CommandItem
                                      key={agent.id}
                                      value={`agent-${agent.id}`}
                                      onSelect={() => {
                                        setAddForm(prev => ({ ...prev, agentId: agent.id.toString() }))
                                        setAgentOpen(false)
                                      }}
                                      className="cursor-pointer py-3 data-[selected='true']:bg-blue-50 data-[selected='true']:text-black data-[selected='true']:font-bold dark:data-[selected='true']:bg-blue-900/20 dark:data-[selected='true']:text-white"
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${addForm.agentId === agent.id.toString() ? 'opacity-100 text-purple-600' : 'opacity-0'
                                          }`}
                                      />
                                      <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{agent.user.name}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {addForm.agentId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAddForm({ ...addForm, agentId: '' })}
                            disabled={isCreating}
                            className="shrink-0 h-12 w-12 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Card - Full Width */}
              <Card className={`shadow-sm w-full transition-colors ${addForm.productId
                  ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10'
                  : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                }`}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${addForm.productId
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                      <Package className="h-5 w-5" />
                    </div>
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Product Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="product" className="text-base font-semibold">Product</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select the product to be covered under this contract.
                    </p>
                    <div className="flex gap-2 w-full">
                      <Popover open={productOpen} onOpenChange={setProductOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={productOpen}
                            className={`flex-1 justify-between h-12 text-base bg-background min-w-0 ${!addForm.productId && 'border-blue-300 dark:border-blue-700 ring-1 ring-blue-100 dark:ring-blue-900'
                              }`}
                            disabled={isCreating}
                          >
                            {addForm.productId ? (
                              <div className="flex items-center gap-2 text-left overflow-hidden">
                                <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">
                                  {products.find((p) => p.id.toString() === addForm.productId)?.productName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Select product...</span>
                            )}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Search products..."
                              value={productSearch}
                              onValueChange={setProductSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No product found.</CommandEmpty>
                              <CommandGroup heading="Products">
                                {filteredProducts.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={`product-${product.id}`}
                                    onSelect={() => {
                                      setAddForm(prev => ({ ...prev, productId: product.id.toString() }))
                                      setProductOpen(false)
                                    }}
                                    className="cursor-pointer py-3 data-[selected='true']:bg-blue-50 data-[selected='true']:text-black data-[selected='true']:font-bold dark:data-[selected='true']:bg-blue-900/20 dark:data-[selected='true']:text-white"
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${addForm.productId === product.id.toString() ? 'opacity-100 text-blue-600' : 'opacity-0'
                                        }`}
                                    />
                                    <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{product.productName || `Product #${product.id}`}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {addForm.productId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAddForm({ ...addForm, productId: '' })}
                          disabled={isCreating}
                          className="shrink-0 h-12 w-12 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Financials */}
          {formStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financials Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price (₹) *</Label>
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
                  <div className="grid grid-cols-2 gap-2">
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
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Type</Label>
                      <Select
                        value={addForm.discountType}
                        onValueChange={(value: 'PERCENTAGE' | 'FLAT_RATE') => setAddForm({ ...addForm, discountType: value })}
                        disabled={isCreating || !addForm.discount}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">%</SelectItem>
                          <SelectItem value="FLAT_RATE">₹</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="finalPrice" className="text-base font-semibold">Final Price (₹)</Label>
                    <Input
                      id="finalPrice"
                      type="number"
                      value={addForm.finalPrice}
                      disabled
                      className="h-12 bg-muted font-bold text-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Remarks Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentPaid">Amount Paid (₹) *</Label>
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
                    <Label htmlFor="paymentDue">Amount Due (₹)</Label>
                    <Input
                      id="paymentDue"
                      type="number"
                      value={addForm.paymentDue}
                      disabled
                      className={`h-11 bg-muted font-semibold ${parseFloat(addForm.paymentDue) > 0 ? 'text-red-600' : 'text-green-600'}`}
                    />
                  </div>
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
                        <SelectValue placeholder="Select method" />
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
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={addForm.remarks}
                      onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                      placeholder="Additional notes..."
                      disabled={isCreating}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Schedule */}
          {formStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contract Terms */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Contract Duration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-11",
                            !addForm.startDate && "text-muted-foreground"
                          )}
                          disabled={isCreating}
                        >
                          {addForm.startDate ? (
                            format(new Date(addForm.startDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={addForm.startDate ? new Date(addForm.startDate) : undefined}
                          onSelect={(date) => setAddForm({ ...addForm, startDate: date ? date.toISOString().split('T')[0] : '' })}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          formatters={{
                            formatWeekdayName: (date) => format(date, "EEEEE"),
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="firstServiceDate">First Service Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-11",
                            !addForm.firstServiceDate && "text-muted-foreground"
                          )}
                          disabled={isCreating}
                        >
                          {addForm.firstServiceDate ? (
                            format(new Date(addForm.firstServiceDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={addForm.firstServiceDate ? new Date(addForm.firstServiceDate) : undefined}
                          onSelect={(date) => setAddForm({ ...addForm, firstServiceDate: date ? date.toISOString().split('T')[0] : '' })}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          formatters={{
                            formatWeekdayName: (date) => format(date, "EEEEE"),
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Auto)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={addForm.endDate}
                      disabled
                      className="h-11 bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noOfServices">No. of Services *</Label>
                    <Input
                      id="noOfServices"
                      type="number"
                      value={addForm.noOfServices}
                      onChange={(e) => setAddForm({ ...addForm, noOfServices: e.target.value })}
                      disabled={isCreating}
                      className="h-11"
                      min="1"
                      max="12"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Service Schedule */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Service Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addForm.serviceDates.map((date, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`service-${index}`} className="text-xs text-muted-foreground">
                              Service {index + 1}
                            </Label>
                            <Input
                              id={`service-${index}`}
                              type="date"
                              value={date}
                              onChange={(e) => {
                                const newDates = [...addForm.serviceDates]
                                newDates[index] = e.target.value
                                setAddForm({ ...addForm, serviceDates: newDates })
                              }}
                              disabled={isCreating}
                              className="h-9 mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {addForm.serviceDates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Enter start date and number of services to generate schedule.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center mt-6 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (formStep > 1) setFormStep(formStep - 1)
              else onOpenChange(false)
            }}
            disabled={isCreating}
          >
            {formStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex gap-2">
            {formStep < 3 ? (
              <Button onClick={() => setFormStep(formStep + 1)}>
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleAddAMC}
                disabled={isCreating}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
              >
                {isCreating ? 'Creating...' : 'Create Contract'}
              </Button>
            )}
          </div>
        </DialogFooter>

        {/* Processing Overlay */}
        {isCreating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <Card className="w-[400px] shadow-2xl border-primary/20 animate-in fade-in zoom-in duration-300">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-primary">Creating AMC Contract</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="space-y-4">
                  {/* Step 1: Validation */}
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-500 ${processingStep > 1 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600 animate-pulse'
                      }`}>
                      {processingStep > 1 ? <Check className="h-5 w-5" /> : <Search className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors ${processingStep > 1 ? 'text-green-700' : 'text-foreground'}`}>
                        Validating Data
                      </p>
                      <p className="text-xs text-muted-foreground">Checking customer & product details...</p>
                    </div>
                  </div>

                  {/* Step 2: AMC Record */}
                  <div className={`flex items-center gap-3 transition-opacity duration-500 ${processingStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-500 ${processingStep > 2 ? 'bg-green-100 text-green-600' : (processingStep === 2 ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-muted text-muted-foreground')
                      }`}>
                      {processingStep > 2 ? <Check className="h-5 w-5" /> : <Package className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors ${processingStep > 2 ? 'text-green-700' : 'text-foreground'}`}>
                        AMC Records
                      </p>
                      <p className="text-xs text-muted-foreground">Verifying existing AMC status...</p>
                    </div>
                  </div>

                  {/* Step 3: Contract Creation */}
                  <div className={`flex items-center gap-3 transition-opacity duration-500 ${processingStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-500 ${processingStep > 3 ? 'bg-green-100 text-green-600' : (processingStep === 3 ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-muted text-muted-foreground')
                      }`}>
                      {processingStep > 3 ? <Check className="h-5 w-5" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors ${processingStep > 3 ? 'text-green-700' : 'text-foreground'}`}>
                        Generating Contract
                      </p>
                      <p className="text-xs text-muted-foreground">Creating contract & order records...</p>
                    </div>
                  </div>

                  {/* Step 4: Service Events */}
                  <div className={`flex items-center gap-3 transition-opacity duration-500 ${processingStep >= 4 ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-500 ${processingStep > 4 ? 'bg-green-100 text-green-600' : (processingStep === 4 ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-muted text-muted-foreground')
                      }`}>
                      {processingStep > 4 ? <Check className="h-5 w-5" /> : <Calendar className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors ${processingStep > 4 ? 'text-green-700' : 'text-foreground'}`}>
                        Scheduling Services
                      </p>
                      <p className="text-xs text-muted-foreground">Creating {addForm.noOfServices} service events...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
