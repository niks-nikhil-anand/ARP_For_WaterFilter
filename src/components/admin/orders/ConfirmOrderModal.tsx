'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { activateOrder } from '@/actions/common/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ConfirmOrderModalProps {
    order: any
    trigger: React.ReactNode
}

export function ConfirmOrderModal({ order, trigger }: ConfirmOrderModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        freeWarranty: order.freeWarranty || false,
        freeInstallation: order.freeInstallation || false,
        paymentMethod: order.paymentMethod || 'CASH',
        paymentStatus: 'COMPLETED',
        amountPaid: order.amountPaid || 0,
        warrantyDuration: (() => {
            const durationStr = order.product?.warrantyPeriod
            if (!durationStr || durationStr === 'none') return 3
            const match = durationStr.toLowerCase().match(/(\d+)\s*(month|year)/i)
            if (match) {
                const value = parseInt(match[1])
                const unit = match[2].toLowerCase()
                return unit.startsWith('year') ? value * 12 : value
            }
            return 3
        })(),
    })

    const handleInputChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const result = await activateOrder(order.id, {
                amountPaid: Number(formData.amountPaid),
                discount: Number(order.discount) || 0, // Preserve existing discount
                freeWarranty: formData.freeWarranty,
                freeInstallation: formData.freeInstallation,
                warrantyDuration: Number(formData.warrantyDuration),
                // These are passed but need to be handled in server action if not already
                // The current server action signature might need update or we pass them in data object
            })

            // Note: activateOrder signature in orders.ts currently accepts:
            // orderId, data?: { amountPaid, discount, freeWarranty, freeInstallation }
            // It does NOT currently accept paymentMethod/Status in the data object.
            // We need to update orders.ts to handle these.

            if (result.success) {
                toast.success('Order confirmed and activated successfully')
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to confirm order')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Order</DialogTitle>
                    <DialogDescription>
                        Review and update order details before activation.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="freeWarranty">Free Warranty</Label>
                        <Switch
                            id="freeWarranty"
                            checked={formData.freeWarranty}
                            onCheckedChange={(checked) => handleInputChange('freeWarranty', checked)}
                        />
                    </div>
                    {formData.freeWarranty && (
                        <div className="grid gap-2">
                            <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                            <Select
                                value={formData.warrantyDuration.toString()}
                                onValueChange={(value) => handleInputChange('warrantyDuration', Number(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3 Months</SelectItem>
                                    <SelectItem value="6">6 Months</SelectItem>
                                    <SelectItem value="9">9 Months</SelectItem>
                                    <SelectItem value="12">1 Year</SelectItem>
                                    <SelectItem value="18">1.5 Years</SelectItem>
                                    <SelectItem value="24">2 Years</SelectItem>
                                    <SelectItem value="30">2.5 Years</SelectItem>
                                    <SelectItem value="36">3 Years</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="freeInstallation">Free Installation</Label>
                        <Switch
                            id="freeInstallation"
                            checked={formData.freeInstallation}
                            onCheckedChange={(checked) => handleInputChange('freeInstallation', checked)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select
                            value={formData.paymentMethod}
                            onValueChange={(value) => handleInputChange('paymentMethod', value)}
                        >
                            <SelectTrigger>
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
                    <div className="grid gap-2">
                        <Label htmlFor="paymentStatus">Payment Status</Label>
                        <Select
                            value={formData.paymentStatus}
                            onValueChange={(value) => handleInputChange('paymentStatus', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amountPaid">Amount Paid (₹)</Label>
                        <Input
                            id="amountPaid"
                            type="number"
                            value={formData.amountPaid}
                            onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Activate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
