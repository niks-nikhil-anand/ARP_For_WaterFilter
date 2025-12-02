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
import { Calendar, Clock, User, Phone, Mail, MapPin, Plus, Loader2 } from 'lucide-react'
import { createComplaint } from '@/actions/common/complaints'
import { toast } from "sonner"

interface AddComplaintDialogProps {
    onComplaintAdded?: () => void
}

export function AddComplaintDialog({ onComplaintAdded }: AddComplaintDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '+91 ',
        address: '',
        serviceType: '',
        productType: '',
        preferredDate: '',
        preferredTime: '',
        message: '',
    })

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const prefix = '+91 '
        const raw = e.target.value || ''
        let digits = raw.replace(/\D/g, '')
        if (digits.startsWith('91')) {
            digits = digits.replace(/^91/, '')
        }
        digits = digits.slice(0, 10)
        setFormData({
            ...formData,
            phone: prefix + digits,
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

        const allDigits = formData.phone.replace(/\D/g, '')
        const localDigits = allDigits.replace(/^91/, '')
        if (localDigits.length !== 10) {
            toast.error('Invalid Phone Number', {
                description: 'Please enter a valid 10-digit phone number.',
            })
            setIsSubmitting(false)
            return
        }

        try {
            const result = await createComplaint({
                name: formData.name,
                email: formData.email,
                phone: `+91${localDigits}`,
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
                    name: '',
                    email: '',
                    phone: '+91 ',
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
        } catch (error) {
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Complaint</DialogTitle>
                    <DialogDescription>
                        Enter the details to raise a new complaint or service request.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <div className="relative">
                                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <div className="relative">
                                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="+91 XXXXX XXXXX"
                                    required
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-8"
                            />
                        </div>
                    </div>

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

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
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
                </form>
            </DialogContent>
        </Dialog>
    )
}
