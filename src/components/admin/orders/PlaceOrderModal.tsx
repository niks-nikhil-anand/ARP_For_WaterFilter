'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, User, Package, MapPin, CreditCard, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUsersByRole } from '@/actions/admin/users'
import { getAdminProducts } from '@/actions/admin/products'
import { createOrder } from '@/actions/common/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

export function PlaceOrderModal() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()

    // Data
    const [users, setUsers] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])

    // Selection State
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
    const [productSearchOpen, setProductSearchOpen] = useState(false)

    // Order Form State
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAltPhone: '',
        addressType: 'Home',
        apartmentNo: '',
        locality: '',
        landmark: '',
        pincode: '',
        state: '',
        country: 'India',
        paymentOption: 'pay_later', // Default to Pay Later (Pending)
        additionalWarranty: 'none',
        amc: 'none',
        additionalDiscount: '',
    })

    // Fetch initial data
    useEffect(() => {
        if (open) {
            fetchData()
        } else {
            // Reset state when closed
            setTimeout(() => {
                setStep(1)
                setSelectedCustomer(null)
                setSelectedProduct(null)
                setFormData({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    customerAltPhone: '',
                    addressType: 'Home',
                    apartmentNo: '',
                    locality: '',
                    landmark: '',
                    pincode: '',
                    state: '',
                    country: 'India',
                    paymentOption: 'pay_later',
                    additionalWarranty: 'none',
                    amc: 'none',
                    additionalDiscount: '',
                })
            }, 300)
        }
    }, [open])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [usersRes, productsRes] = await Promise.all([
                getUsersByRole('USER'),
                getAdminProducts()
            ])

            if (usersRes.success) {
                setUsers(usersRes.data || [])
            }
            if (productsRes.success) {
                setProducts(productsRes.data || [])
            }
        } catch (error) {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    // Handle Customer Selection
    const handleCustomerSelect = (user: any) => {
        setSelectedCustomer(user)
        setCustomerSearchOpen(false)

        // Pre-fill form data from user
        const address = user.addresses?.[0] || {}
        setFormData(prev => ({
            ...prev,
            customerName: user.name || '',
            customerEmail: user.email || '',
            customerPhone: user.mobile || address.phone || '',
            customerAltPhone: address.altPhone || '',
            addressType: address.type || 'Home',
            apartmentNo: address.apartmentNo || '',
            locality: address.locality || '',
            landmark: address.landmark || '',
            pincode: address.pincode || '',
            state: address.state || '',
            country: address.country || 'India',
        }))

        setStep(2)
    }

    // Handle Product Selection
    const handleProductSelect = (product: any) => {
        setSelectedProduct(product)
        setProductSearchOpen(false)
        setStep(3)
    }

    // Handle Form Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Submit Order
    const handleSubmit = async () => {
        if (!selectedProduct) return

        setSubmitting(true)
        try {
            const result = await createOrder({
                productId: selectedProduct.id,
                userId: selectedCustomer?.id,
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                customerAltPhone: formData.customerAltPhone,
                addressType: formData.addressType,
                apartmentNo: formData.apartmentNo,
                locality: formData.locality,
                landmark: formData.landmark,
                pincode: formData.pincode,
                state: formData.state,
                country: formData.country,
                paymentOption: formData.paymentOption as 'pay_later' | 'pay_now',
                additionalWarranty: formData.additionalWarranty,
                amc: formData.amc,
                additionalDiscount: formData.additionalDiscount ? Number(formData.additionalDiscount) : 0,
            })

            if (result.success) {
                toast.success('Order placed successfully')
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to place order')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Place Order</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Place New Order</DialogTitle>
                    <DialogDescription>
                        Create a pending order for a customer. Step {step} of 3.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className={cn("flex flex-col items-center gap-1", step >= 1 ? "text-primary" : "text-muted-foreground")}>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", step >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>1</div>
                            <span className="text-xs font-medium">Customer</span>
                        </div>
                        <div className={cn("h-[2px] flex-1 mx-2", step >= 2 ? "bg-primary" : "bg-muted")} />
                        <div className={cn("flex flex-col items-center gap-1", step >= 2 ? "text-primary" : "text-muted-foreground")}>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", step >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>2</div>
                            <span className="text-xs font-medium">Product</span>
                        </div>
                        <div className={cn("h-[2px] flex-1 mx-2", step >= 3 ? "bg-primary" : "bg-muted")} />
                        <div className={cn("flex flex-col items-center gap-1", step >= 3 ? "text-primary" : "text-muted-foreground")}>
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", step >= 3 ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>3</div>
                            <span className="text-xs font-medium">Details</span>
                        </div>
                    </div>

                    {/* Step 1: Select Customer */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label>Select Customer</Label>
                                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={customerSearchOpen}
                                            className="w-full justify-between"
                                        >
                                            {selectedCustomer ? selectedCustomer.name : "Search customer..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search by name, email, or mobile..." />
                                            <CommandList>
                                                <CommandEmpty>No customer found.</CommandEmpty>
                                                <CommandGroup>
                                                    {users.map((user) => (
                                                        <CommandItem
                                                            key={user.id}
                                                            value={`${user.name} ${user.email} ${user.mobile}`}
                                                            onSelect={() => handleCustomerSelect(user)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedCustomer?.id === user.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{user.name}</span>
                                                                <span className="text-xs text-muted-foreground">{user.mobile} • {user.email}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
                                Skip / New Customer
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Select Product */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label>Select Product</Label>
                                <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={productSearchOpen}
                                            className="w-full justify-between"
                                        >
                                            {selectedProduct ? selectedProduct.productName || selectedProduct.name : "Search product..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search product..." />
                                            <CommandList>
                                                <CommandEmpty>No product found.</CommandEmpty>
                                                <CommandGroup>
                                                    {products.map((product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            value={`${product.productName || product.name} ${product.company} ${product.type}`}
                                                            onSelect={() => handleProductSelect(product)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{product.productName || product.name}</span>
                                                                <span className="text-xs text-muted-foreground">{product.company} • {product.type} • ₹{product.price}</span>
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
                    )}

                    {/* Step 3: Order Details */}
                    {step === 3 && (
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <Card className="bg-muted/50">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{selectedProduct?.productName || selectedProduct?.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedProduct?.company} • {selectedProduct?.type}</p>
                                        </div>
                                        <Badge variant="secondary">₹{selectedProduct?.price}</Badge>
                                    </div>
                                    {selectedCustomer && (
                                        <div className="text-sm border-t pt-2 mt-2">
                                            <p className="font-medium">Customer: {selectedCustomer.name}</p>
                                            <p className="text-muted-foreground">{selectedCustomer.mobile}</p>
                                        </div>
                                    )}

                                    {/* Price Breakdown */}
                                    <div className="border-t pt-2 mt-2 space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Product Price</span>
                                            <span>₹{selectedProduct?.price}</span>
                                        </div>
                                        {Number(selectedProduct?.discount) > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Product Discount ({selectedProduct?.discountType === 'PERCENTAGE' ? `${selectedProduct?.discount}%` : `₹${selectedProduct?.discount}`})</span>
                                                <span>- ₹{
                                                    selectedProduct?.discountType === 'PERCENTAGE'
                                                        ? ((Number(selectedProduct?.price) * Number(selectedProduct?.discount)) / 100).toFixed(2)
                                                        : Number(selectedProduct?.discount).toFixed(2)
                                                }</span>
                                            </div>
                                        )}
                                        {Number(formData.additionalDiscount) > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Additional Discount</span>
                                                <span>- ₹{Number(formData.additionalDiscount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold border-t pt-1 mt-1">
                                            <span>Final Price</span>
                                            <span>₹{(() => {
                                                const price = Number(selectedProduct?.price) || 0
                                                const productDiscount = selectedProduct?.discountType === 'PERCENTAGE'
                                                    ? (price * (Number(selectedProduct?.discount) || 0)) / 100
                                                    : (Number(selectedProduct?.discount) || 0)
                                                const additionalDiscount = Number(formData.additionalDiscount) || 0
                                                const finalPrice = Math.max(0, price - productDiscount - additionalDiscount)
                                                return finalPrice.toFixed(2)
                                            })()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Name</Label>
                                    <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">Phone</Label>
                                    <Input id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerEmail">Email</Label>
                                    <Input id="customerEmail" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerAltPhone">Alt Phone</Label>
                                    <Input id="customerAltPhone" name="customerAltPhone" value={formData.customerAltPhone} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input placeholder="Apartment/House No" name="apartmentNo" value={formData.apartmentNo} onChange={handleInputChange} />
                                    <Input placeholder="Locality/Area" name="locality" value={formData.locality} onChange={handleInputChange} />
                                    <Input placeholder="Landmark" name="landmark" value={formData.landmark} onChange={handleInputChange} />
                                    <Input placeholder="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} />
                                    <Input placeholder="State" name="state" value={formData.state} onChange={handleInputChange} />
                                    <Input placeholder="Country" name="country" value={formData.country} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="additionalDiscount">Add More Discount (₹)</Label>
                                <Input
                                    id="additionalDiscount"
                                    name="additionalDiscount"
                                    type="number"
                                    min="0"
                                    placeholder="Enter amount"
                                    value={formData.additionalDiscount}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Status</Label>
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant={formData.paymentOption === 'pay_later' ? 'default' : 'outline'}
                                        onClick={() => setFormData(prev => ({ ...prev, paymentOption: 'pay_later' }))}
                                        className="flex-1"
                                    >
                                        Pending (Pay Later)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formData.paymentOption === 'pay_now' ? 'default' : 'outline'}
                                        onClick={() => setFormData(prev => ({ ...prev, paymentOption: 'pay_now' }))}
                                        className="flex-1"
                                    >
                                        Completed (Pay Now)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={submitting}>
                            Back
                        </Button>
                    ) : (
                        <div /> // Spacer
                    )}

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !selectedCustomer || step === 2 && !selectedProduct}>
                            Next
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Place Order
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
