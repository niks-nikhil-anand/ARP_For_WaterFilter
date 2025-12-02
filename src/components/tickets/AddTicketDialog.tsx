'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { TicketPriority } from '@/generated/prisma'
import { createTicket } from '@/actions/common/tickets'
import { getActiveAgents, createAgentUser } from '@/actions/common/agents'
import { getActiveCustomers, createCustomerUser } from '@/actions/common/customers'
import { toast } from 'sonner'
import { Loader2, Plus, UserPlus, X } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

interface AddTicketDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onTicketCreated: () => void
}

export function AddTicketDialog({ open, onOpenChange, onTicketCreated }: AddTicketDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        serviceType: '',
        productType: '',
        description: '',
        preferredDate: undefined as Date | undefined,
        preferredTime: '',
        priority: TicketPriority.MEDIUM,
        source: 'PHONE',
        assignToUserId: 'unassigned'
    })

    const [agents, setAgents] = useState<any[]>([])
    const [customers, setCustomers] = useState<any[]>([])

    // Agent creation states
    const [showCreateAgent, setShowCreateAgent] = useState(false)
    const [newAgentData, setNewAgentData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: ''
    })
    const [creatingAgent, setCreatingAgent] = useState(false)

    // Customer creation states
    const [showCreateCustomer, setShowCreateCustomer] = useState(false)
    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        address: ''
    })
    const [creatingCustomer, setCreatingCustomer] = useState(false)

    useEffect(() => {
        if (open) {
            loadAgents()
            loadCustomers()
        }
    }, [open])

    const loadAgents = async () => {
        const result = await getActiveAgents()
        if (result.success && result.data) {
            setAgents(result.data)
        }
    }

    const loadCustomers = async () => {
        const result = await getActiveCustomers()
        if (result.success && result.data) {
            setCustomers(result.data)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.customerName || !formData.customerPhone) {
            toast.error('Please select a customer or create a new one')
            return
        }

        setLoading(true)

        try {
            const result = await createTicket({
                ...formData,
                preferredDate: formData.preferredDate,
                assignToUserId: formData.assignToUserId === 'unassigned' ? undefined : parseInt(formData.assignToUserId)
            })

            if (result.success) {
                toast.success('Ticket created successfully')
                onTicketCreated()
                onOpenChange(false)
                // Reset form
                setFormData({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    customerAddress: '',
                    serviceType: '',
                    productType: '',
                    description: '',
                    preferredDate: undefined,
                    preferredTime: '',
                    priority: TicketPriority.MEDIUM,
                    source: 'PHONE',
                    assignToUserId: 'unassigned'
                })
                setShowCreateAgent(false)
                setNewAgentData({ name: '', email: '', mobile: '', password: '' })
                setShowCreateCustomer(false)
                setNewCustomerData({ name: '', email: '', mobile: '', password: '', address: '' })
            } else {
                toast.error(result.error || 'Failed to create ticket')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCustomer = async () => {
        if (!newCustomerData.name || !newCustomerData.email || !newCustomerData.mobile) {
            toast.error('Please fill in all required customer fields')
            return
        }

        setCreatingCustomer(true)
        try {
            const result = await createCustomerUser(newCustomerData)
            if (result.success && result.data) {
                toast.success('Customer created successfully')
                await loadCustomers()

                // Auto-fill form with new customer data
                setFormData(prev => ({
                    ...prev,
                    customerName: result.data.name,
                    customerEmail: result.data.email,
                    customerPhone: result.data.mobile || '',
                    customerAddress: newCustomerData.address || ''
                }))

                setShowCreateCustomer(false)
                setNewCustomerData({ name: '', email: '', mobile: '', password: '', address: '' })
            } else {
                toast.error(result.error || 'Failed to create customer')
            }
        } catch (error) {
            toast.error('Failed to create customer')
        } finally {
            setCreatingCustomer(false)
        }
    }

    const handleCustomerSelect = (customerId: string) => {
        if (customerId === 'new') {
            setShowCreateCustomer(true)
            return
        }

        const customer = customers.find(c => c.id.toString() === customerId)
        if (customer) {
            setFormData(prev => ({
                ...prev,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.mobile || '',
                // If we stored address on user, we'd populate it here too
            }))
        }
    }

    const handleCreateAgent = async () => {
        if (!newAgentData.name || !newAgentData.email || !newAgentData.mobile) {
            toast.error('Please fill in all required agent fields')
            return
        }

        setCreatingAgent(true)
        try {
            const result = await createAgentUser(newAgentData)
            if (result.success && result.data) {
                toast.success('Agent created successfully')
                await loadAgents()
                setFormData(prev => ({ ...prev, assignToUserId: result.data.id.toString() }))
                setShowCreateAgent(false)
                setNewAgentData({ name: '', email: '', mobile: '', password: '' })
            } else {
                toast.error(result.error || 'Failed to create agent')
            }
        } catch (error) {
            toast.error('Failed to create agent')
        } finally {
            setCreatingAgent(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription>
                        Enter the details to create a new support ticket.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: People (Customer & Agent) */}
                        <div className="space-y-6">
                            {/* Customer Selection Section */}
                            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label>Select Customer *</Label>
                                    {!showCreateCustomer && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => setShowCreateCustomer(true)}
                                        >
                                            <UserPlus className="mr-2 h-3 w-3" />
                                            New Customer
                                        </Button>
                                    )}
                                </div>

                                {!showCreateCustomer ? (
                                    <Select onValueChange={handleCustomerSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select existing customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.name} ({customer.mobile})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                                <Input
                                                    id="newCustMobile"
                                                    value={newCustomerData.mobile}
                                                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, mobile: e.target.value }))}
                                                    placeholder="Mobile"
                                                    className="h-8"
                                                />
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
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            ) : (
                                                <Plus className="mr-2 h-3 w-3" />
                                            )}
                                            Create & Auto-fill
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="assignToUserId">Assign Agent</Label>
                                    {!showCreateAgent && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => setShowCreateAgent(true)}
                                        >
                                            <UserPlus className="mr-2 h-3 w-3" />
                                            New Agent
                                        </Button>
                                    )}
                                </div>

                                {!showCreateAgent ? (
                                    <Select
                                        value={formData.assignToUserId}
                                        onValueChange={(value) => handleSelectChange('assignToUserId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select agent (Optional)" />
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
                                ) : (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">New Agent Details</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setShowCreateAgent(false)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="agentName" className="text-xs">Name *</Label>
                                                <Input
                                                    id="agentName"
                                                    value={newAgentData.name}
                                                    onChange={(e) => setNewAgentData(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Agent Name"
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="agentMobile" className="text-xs">Mobile *</Label>
                                                <Input
                                                    id="agentMobile"
                                                    value={newAgentData.mobile}
                                                    onChange={(e) => setNewAgentData(prev => ({ ...prev, mobile: e.target.value }))}
                                                    placeholder="Mobile Number"
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="agentEmail" className="text-xs">Email *</Label>
                                                <Input
                                                    id="agentEmail"
                                                    value={newAgentData.email}
                                                    onChange={(e) => setNewAgentData(prev => ({ ...prev, email: e.target.value }))}
                                                    placeholder="Email Address"
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="agentPassword" className="text-xs">Password</Label>
                                                <Input
                                                    id="agentPassword"
                                                    type="password"
                                                    value={newAgentData.password}
                                                    onChange={(e) => setNewAgentData(prev => ({ ...prev, password: e.target.value }))}
                                                    placeholder="Default: 123456"
                                                    className="h-8"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleCreateAgent}
                                            disabled={creatingAgent}
                                            className="w-full h-8 mt-2"
                                            size="sm"
                                        >
                                            {creatingAgent ? (
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                            ) : (
                                                <Plus className="mr-2 h-3 w-3" />
                                            )}
                                            Create & Select Agent
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Ticket Details */}
                        <div className="space-y-4">
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
                                            <SelectItem value="INSTALLATION">Installation</SelectItem>
                                            <SelectItem value="REPAIR">Repair</SelectItem>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                            <SelectItem value="COMPLAINT">Complaint</SelectItem>
                                            <SelectItem value="INQUIRY">Inquiry</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => handleSelectChange('priority', value)}
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="productType">Product Type</Label>
                                    <Input
                                        id="productType"
                                        name="productType"
                                        value={formData.productType}
                                        onChange={handleInputChange}
                                        placeholder="e.g. RO Water Purifier"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source">Source</Label>
                                    <Select
                                        value={formData.source}
                                        onValueChange={(value) => handleSelectChange('source', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PHONE">Phone</SelectItem>
                                            <SelectItem value="EMAIL">Email</SelectItem>
                                            <SelectItem value="WALK_IN">Walk-in</SelectItem>
                                            <SelectItem value="WEBSITE">Website</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 flex flex-col">
                                    <Label>Preferred Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !formData.preferredDate && "text-muted-foreground"
                                                )}
                                            >
                                                {formData.preferredDate ? (
                                                    format(formData.preferredDate, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.preferredDate}
                                                onSelect={(date) => setFormData(prev => ({ ...prev, preferredDate: date }))}
                                                disabled={(date) =>
                                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="preferredTime">Preferred Time</Label>
                                    <Select
                                        value={formData.preferredTime}
                                        onValueChange={(value) => handleSelectChange('preferredTime', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select time slot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MORNING">Morning (9 AM - 12 PM)</SelectItem>
                                            <SelectItem value="AFTERNOON">Afternoon (12 PM - 4 PM)</SelectItem>
                                            <SelectItem value="EVENING">Evening (4 PM - 8 PM)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerAddress">Address</Label>
                                <Textarea
                                    id="customerAddress"
                                    name="customerAddress"
                                    value={formData.customerAddress}
                                    onChange={handleInputChange}
                                    placeholder="Full address"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the issue or request..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Ticket
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
