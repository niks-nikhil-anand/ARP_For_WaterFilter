'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar, Clock, User, MapPin, Plus, Loader2, Check, ChevronsUpDown, X } from 'lucide-react'
import { createComplaint } from '@/actions/common/complaints'
import { getActiveCustomers, createCustomerUser } from '@/actions/common/customers'
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AddComplaintDialogProps {
    onComplaintAdded?: () => void
}

export function AddComplaintDialog({ onComplaintAdded }: AddComplaintDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Customer Selection State
    const [customers, setCustomers] = useState<{ id: number; name: string; email: string; mobile: string | null }[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)
    const [openCustomerSelect, setOpenCustomerSelect] = useState(false)
    const [showCreateCustomer, setShowCreateCustomer] = useState(false)
    const [creatingCustomer, setCreatingCustomer] = useState(false)
    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        password: ''
    })

    const [formData, setFormData] = useState({
        address: '',
        serviceType: '',
        productType: '',
        preferredDate: '',
        preferredTime: '',
        message: '',
    })

    React.useEffect(() => {
        if (open) {
            fetchCustomers()
        }
    }, [open])

    const fetchCustomers = async () => {
        const result = await getActiveCustomers()
        if (result.success) {
            setCustomers(result.data || [])
        }
    }

    const handleCustomerSelect = (customerId: number) => {
        setSelectedCustomer(customerId)
        setOpenCustomerSelect(false)
    }

    const handleCreateCustomer = async () => {
        if (!newCustomerData.name || !newCustomerData.mobile || !newCustomerData.email) {
            toast.error('Please fill in all required customer fields')
            return
        }

        setCreatingCustomer(true)
        try {
            const result = await createCustomerUser(newCustomerData)
            if (result.success && result.data) {
                toast.success('Customer created successfully')
                const newCustomer = {
                    id: result.data.id,
                    name: result.data.name,
                    email: result.data.email,
                    mobile: result.data.mobile
                }
                setCustomers(prev => [newCustomer, ...prev])
                handleCustomerSelect(result.data.id)
                setShowCreateCustomer(false)
                setNewCustomerData({ name: '', email: '', mobile: '', address: '', password: '' })
            } else {
                toast.error(result.error || 'Failed to create customer')
            }
        } catch {
            toast.error('Failed to create customer')
        } finally {
            setCreatingCustomer(false)
        }
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }


    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)


        if (!selectedCustomer) {
            toast.error('Please select a customer')
            setIsSubmitting(false)
            return
        }

        try {
            const result = await createComplaint({
                customerId: selectedCustomer,
                address: formData.address,
                serviceType: formData.serviceType,
                productType: formData.productType || undefined,
                additionalInfo: formData.message || undefined,
                preferredDate: formData.preferredDate || undefined,
                preferredTime: formData.preferredTime || undefined,
            })

            if (result.success) {
                toast.success('Success', {
                    description: 'Complaint added successfully.',
                })
                setFormData({
                    address: '',
                    serviceType: '',
                    productType: '',
                    preferredDate: '',
                    preferredTime: '',
                    message: '',
                })
                setOpen(false)
                if (onComplaintAdded) {
                    onComplaintAdded()
                }
            } else {
                toast.error('Error', {
                    description: result.error || 'Failed to add complaint.',
                })
            }
        } catch {
            toast.error('Error', {
                description: 'An unexpected error occurred.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Complaint
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Complaint</DialogTitle>
                    <DialogDescription>
                        Enter the details to raise a new complaint or service request.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                    {/* Left Column: Customer Selection */}
                    <div className="space-y-6">
                        <Card className={`shadow-sm transition-colors ${selectedCustomer
                            ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10'
                            : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                            }`}>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${selectedCustomer
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            }`}>
                                            <User className="h-5 w-5" />
                                        </div>
                                        Customer Details
                                    </div>
                                    {!showCreateCustomer && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => setShowCreateCustomer(true)}
                                        >
                                            <Plus className="mr-2 h-3 w-3" />
                                            New Customer
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!showCreateCustomer ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Select Customer</Label>
                                            <Popover open={openCustomerSelect} onOpenChange={setOpenCustomerSelect}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCustomerSelect}
                                                        className="w-full justify-between"
                                                    >
                                                        {selectedCustomer
                                                            ? customers.find((c) => c.id === selectedCustomer)?.name
                                                            : "Select customer..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search customer..." />
                                                        <CommandList>
                                                            <CommandEmpty>No customer found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {customers.map((customer) => (
                                                                    <CommandItem
                                                                        key={customer.id}
                                                                        value={customer.name + " " + customer.mobile}
                                                                        onSelect={() => handleCustomerSelect(customer.id)}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                selectedCustomer === customer.id ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span>{customer.name}</span>
                                                                            <span className="text-xs text-muted-foreground">{customer.mobile}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">New Customer Details</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setShowCreateCustomer(false)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="newCustName" className="text-xs">Name *</Label>
                                                <Input
                                                    id="newCustName"
                                                    value={newCustomerData.name}
                                                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Name"
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="newCustMobile" className="text-xs">Mobile *</Label>
                                                <div className="flex items-center">
                                                    <div className="flex items-center justify-center px-2 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-xs h-8">
                                                        +91
                                                    </div>
                                                    <Input
                                                        id="newCustMobile"
                                                        value={newCustomerData.mobile}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                            setNewCustomerData(prev => ({ ...prev, mobile: value }))
                                                        }}
                                                        placeholder="98765 43210"
                                                        className="h-8 rounded-l-none"
                                                        maxLength={10}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="newCustEmail" className="text-xs">Email *</Label>
                                                <Input
                                                    id="newCustEmail"
                                                    value={newCustomerData.email}
                                                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                                                    placeholder="Email"
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="newCustPass" className="text-xs">Password</Label>
                                                <Input
                                                    id="newCustPass"
                                                    type="password"
                                                    value={newCustomerData.password}
                                                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, password: e.target.value }))}
                                                    placeholder="Default: 123456"
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <Label htmlFor="newCustAddr" className="text-xs">Address</Label>
                                                <Input
                                                    id="newCustAddr"
                                                    value={newCustomerData.address}
                                                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                                                    placeholder="Address (Optional)"
                                                    className="h-8"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleCreateCustomer}
                                            disabled={creatingCustomer}
                                            className="w-full h-8 mt-2"
                                            size="sm"
                                        >
                                            {creatingCustomer ? (
                                                <div className="flex items-center">
                                                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                                    Creating...
                                                </div>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-3 w-3" />
                                                    Create & Auto-fill
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Complaint Details */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border-orange-100 dark:border-orange-900">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    Complaint Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="serviceType">Service Type *</Label>
                                        <Select
                                            value={formData.serviceType}
                                            onValueChange={(value) => handleSelectChange('serviceType', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="installation">New Installation</SelectItem>
                                                <SelectItem value="repair">Repair Service</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                                <SelectItem value="amc">AMC Service</SelectItem>
                                                <SelectItem value="consultation">Free Consultation</SelectItem>
                                                <SelectItem value="complaint">Complaint</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="productType">Product Type (Optional)</Label>
                                        <Input
                                            id="productType"
                                            name="productType"
                                            placeholder="e.g. RO, UV"
                                            value={formData.productType}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            name="address"
                                            placeholder="Full address"
                                            required
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="preferredDate">Preferred Date *</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="preferredDate"
                                                name="preferredDate"
                                                type="date"
                                                required
                                                value={formData.preferredDate}
                                                onChange={handleChange}
                                                className="pl-8"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="preferredTime">Preferred Time *</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Select
                                                value={formData.preferredTime}
                                                onValueChange={(value) => handleSelectChange('preferredTime', value)}
                                                required
                                            >
                                                <SelectTrigger className="pl-8">
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="morning">Morning (9-12)</SelectItem>
                                                    <SelectItem value="afternoon">Afternoon (12-3)</SelectItem>
                                                    <SelectItem value="evening">Evening (3-7)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Additional Info (Optional)</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Describe the issue..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Add Complaint'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
