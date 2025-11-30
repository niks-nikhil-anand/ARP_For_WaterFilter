'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Phone,
    Mail,
    Package,
    CreditCard,
    Calendar,
    User,
    Building2,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Pencil,
    Save,
    MapPin,
    Settings,
    X
} from 'lucide-react'
import Link from 'next/link'
import { ActivateOrderButton } from '@/components/admin/orders/ActivateOrderButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateOrderDetails } from '@/actions/common/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface OrderDetailsViewProps {
    order: any
    shop: any
}

export function OrderDetailsView({ order, shop }: OrderDetailsViewProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Form State
    const [formData, setFormData] = useState({
        customerName: order.customerName || '',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        customerAltPhone: order.customerAltPhone || '',
        addressType: order.addressType || 'home',
        apartmentNo: order.apartmentNo || '',
        locality: order.locality || '',
        landmark: order.landmark || '',
        pincode: order.pincode || '',
        state: order.state || '',
        country: order.country || '',
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId || '',
        freeInstallation: order.freeInstallation,
        installationCompleted: order.installationCompleted,
        freeWarranty: order.freeWarranty,
        additionalWarranty: order.additionalWarranty,
        amcPurchased: order.amcPurchased,
        selectedAdditionalWarranty: order.selectedAdditionalWarranty || 'none',
        selectedAMC: order.selectedAMC || 'none',
    })

    const getPaymentStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'FAILED':
                return <XCircle className="h-5 w-5 text-red-600" />
            case 'PENDING':
                return <Clock className="h-5 w-5 text-yellow-600" />
            default:
                return <Clock className="h-5 w-5 text-gray-600" />
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await updateOrderDetails(order.id, formData)

            if (result.success) {
                toast.success('Order updated successfully')
                setIsEditing(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update order')
            }
        } catch (error) {
            toast.error('An error occurred while updating the order')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        // Reset form data to original order data
        setFormData({
            customerName: order.customerName || '',
            customerEmail: order.customerEmail || '',
            customerPhone: order.customerPhone || '',
            customerAltPhone: order.customerAltPhone || '',
            addressType: order.addressType || 'home',
            apartmentNo: order.apartmentNo || '',
            locality: order.locality || '',
            landmark: order.landmark || '',
            pincode: order.pincode || '',
            state: order.state || '',
            country: order.country || '',
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            transactionId: order.transactionId || '',
            freeInstallation: order.freeInstallation,
            installationCompleted: order.installationCompleted,
            freeWarranty: order.freeWarranty,
            additionalWarranty: order.additionalWarranty,
            amcPurchased: order.amcPurchased,
            selectedAdditionalWarranty: order.selectedAdditionalWarranty || 'none',
            selectedAMC: order.selectedAMC || 'none',
        })
    }

    return (
        <div className="h-[85vh] overflow-y-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/order_details">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Order #{order.id.toString().padStart(4, '0')}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {order.status !== 'ACTIVE' && (
                        <ActivateOrderButton order={order} />
                    )}
                    {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Order
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSubmit} disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {isEditing ? (
                // Edit Mode
                <div className="bg-background rounded-lg border p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="details" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Customer & Address
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Payment & Configuration
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-6 p-1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Customer Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="text-lg font-medium">Customer Details</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customerName">Name</Label>
                                                <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="customerEmail">Email</Label>
                                                <Input id="customerEmail" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="customerPhone">Phone</Label>
                                                    <Input id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="customerAltPhone">Alt Phone</Label>
                                                    <Input id="customerAltPhone" name="customerAltPhone" value={formData.customerAltPhone} onChange={handleChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="text-lg font-medium">Address Details</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="addressType">Address Type</Label>
                                                <Select value={formData.addressType} onValueChange={(val) => handleSelectChange('addressType', val)}>
                                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="home">Home</SelectItem>
                                                        <SelectItem value="office">Office</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="apartmentNo">Apartment/House No</Label>
                                                <Input id="apartmentNo" name="apartmentNo" value={formData.apartmentNo} onChange={handleChange} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="locality">Locality</Label>
                                                    <Input id="locality" name="locality" value={formData.locality} onChange={handleChange} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="landmark">Landmark</Label>
                                                    <Input id="landmark" name="landmark" value={formData.landmark} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="pincode">Pincode</Label>
                                                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">State</Label>
                                                    <Input id="state" name="state" value={formData.state} onChange={handleChange} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="country">Country</Label>
                                                    <Input id="country" name="country" value={formData.country} onChange={handleChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-6 p-1">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Payment Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="text-lg font-medium">Payment Details</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                                <Select value={formData.paymentMethod} onValueChange={(val) => handleSelectChange('paymentMethod', val)}>
                                                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ONLINE">Online</SelectItem>
                                                        <SelectItem value="CASH">Cash</SelectItem>
                                                        <SelectItem value="UPI">UPI</SelectItem>
                                                        <SelectItem value="CARD">Card</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="paymentStatus">Payment Status</Label>
                                                <Select value={formData.paymentStatus} onValueChange={(val) => handleSelectChange('paymentStatus', val)}>
                                                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                                        <SelectItem value="FAILED">Failed</SelectItem>
                                                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="transactionId">Transaction ID</Label>
                                                <Input id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Configuration */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <Settings className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="text-lg font-medium">Configuration</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                                                <h4 className="font-medium text-sm text-muted-foreground mb-2">Installation & Warranty</h4>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="freeInstallation" checked={formData.freeInstallation} onCheckedChange={(checked) => handleCheckboxChange('freeInstallation', checked as boolean)} />
                                                    <Label htmlFor="freeInstallation">Free Installation</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="installationCompleted" checked={formData.installationCompleted} onCheckedChange={(checked) => handleCheckboxChange('installationCompleted', checked as boolean)} />
                                                    <Label htmlFor="installationCompleted">Installation Completed</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="freeWarranty" checked={formData.freeWarranty} onCheckedChange={(checked) => handleCheckboxChange('freeWarranty', checked as boolean)} />
                                                    <Label htmlFor="freeWarranty">Free Warranty Included</Label>
                                                </div>
                                            </div>

                                            <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                                                <h4 className="font-medium text-sm text-muted-foreground mb-2">Add-ons</h4>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="additionalWarranty" checked={formData.additionalWarranty} onCheckedChange={(checked) => handleCheckboxChange('additionalWarranty', checked as boolean)} />
                                                    <Label htmlFor="additionalWarranty">Additional Warranty Purchased</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="amcPurchased" checked={formData.amcPurchased} onCheckedChange={(checked) => handleCheckboxChange('amcPurchased', checked as boolean)} />
                                                    <Label htmlFor="amcPurchased">AMC Purchased</Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="selectedAdditionalWarranty">Selected Warranty Plan</Label>
                                                <Select value={formData.selectedAdditionalWarranty || 'none'} onValueChange={(val) => handleSelectChange('selectedAdditionalWarranty', val)}>
                                                    <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="1year">1 Year</SelectItem>
                                                        <SelectItem value="2year">2 Years</SelectItem>
                                                        <SelectItem value="3year">3 Years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="selectedAMC">Selected AMC Plan</Label>
                                                <Select value={formData.selectedAMC || 'none'} onValueChange={(val) => handleSelectChange('selectedAMC', val)}>
                                                    <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="1year">1 Year</SelectItem>
                                                        <SelectItem value="2year">2 Years</SelectItem>
                                                        <SelectItem value="3year">3 Years</SelectItem>
                                                        <SelectItem value="5year">5 Years</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </form>
                </div>
            ) : (
                // View Mode
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Product Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {order.product?.productName || 'Unknown Product'}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {order.product?.company} • {order.product?.type}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">
                                            ₹{order.amountPaid?.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Order Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                        <Badge variant={order.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Free Installation</p>
                                        <p className="font-medium">{order.freeInstallation ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Installation Completed</p>
                                        <p className="font-medium">{order.installationCompleted ? 'Yes' : 'No'}</p>
                                    </div>
                                    {order.installationDate && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Installation Date</p>
                                            <p className="font-medium">{new Date(order.installationDate).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Free Warranty</p>
                                        <p className="font-medium">{order.freeWarranty ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Additional Warranty</p>
                                        <p className="font-medium">
                                            {order.selectedAdditionalWarranty
                                                ? `${order.selectedAdditionalWarranty} (Purchased)`
                                                : order.additionalWarranty ? 'Yes' : 'None'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AMC</p>
                                        <p className="font-medium">
                                            {order.selectedAMC
                                                ? `${order.selectedAMC} (Purchased)`
                                                : order.amcPurchased ? 'Yes' : 'None'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                                        <p className="font-medium">{order.customerName}</p>
                                    </div>
                                    {order.customerEmail && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <p className="font-medium">{order.customerEmail}</p>
                                            </div>
                                        </div>
                                    )}
                                    {order.customerPhone && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <p className="font-medium">{order.customerPhone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Customer Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address Type</p>
                                        <Badge variant="outline" className="capitalize">
                                            {order.addressType || 'Home'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Apartment/House No</p>
                                        <p className="font-medium">{order.apartmentNo || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Locality</p>
                                        <p className="font-medium">{order.locality || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Landmark</p>
                                        <p className="font-medium">{order.landmark || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pincode</p>
                                        <p className="font-medium">{order.pincode || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">State</p>
                                        <p className="font-medium">{order.state || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Country</p>
                                        <p className="font-medium">{order.country || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shop Information */}
                        {shop && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Shop Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-medium text-lg">{shop.shopName || shop.name}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Method</p>
                                    <Badge className="text-sm">
                                        {order.paymentMethod}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Status</p>
                                    <div className="flex items-center gap-2">
                                        {getPaymentStatusIcon(order.paymentStatus)}
                                        <Badge variant={order.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                                            {order.paymentStatus}
                                        </Badge>
                                    </div>
                                </div>
                                {order.transactionId && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                                        <p className="font-mono text-sm">{order.transactionId}</p>
                                    </div>
                                )}
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">Total Amount</p>
                                        <p className="text-2xl font-bold">
                                            ₹{order.amountPaid?.toLocaleString('en-IN') || '0'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Order Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="h-2 w-2 rounded-full bg-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Order Placed</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                {order.updatedAt !== order.createdAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Last Updated</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {new Date(order.updatedAt).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
