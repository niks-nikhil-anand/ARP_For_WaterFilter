'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Product = {
  id: number
  name: string
  productName: string | null
  company: string
  type: string
  price: number | null
}

type BookingModalProps = {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export default function BookingModal({ isOpen, onClose, product }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    additionalWarranty: 'none',
    amc: 'none',
    paymentOption: 'pay_later',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    if (formData.alternatePhone && !phoneRegex.test(formData.alternatePhone)) {
      toast.error('Please enter a valid 10-digit alternate phone number')
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...formData,
      //     productId: product?.id,
      //   }),
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success('Booking request submitted successfully!', {
        description: 'Our executive will call you shortly to confirm your order.',
      })

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        alternatePhone: '',
        address: '',
        additionalWarranty: 'none',
        amc: 'none',
        paymentOption: 'pay_later',
      })

      onClose()
    } catch (error) {
      toast.error('Failed to submit booking request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Book Your Water Purifier</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="font-medium text-gray-900 dark:text-white block">
              {product.productName || product.name}
            </span>
            <span className="text-sm block">
              {product.company} • {product.type}
              {product.price && ` • ₹${product.price.toLocaleString('en-IN')}`}
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-400 block mt-2">
              Our executive will call you to confirm your order and schedule installation.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Alternate Phone */}
          <div className="space-y-2">
            <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
            <Input
              id="alternatePhone"
              name="alternatePhone"
              type="tel"
              value={formData.alternatePhone}
              onChange={handleInputChange}
              placeholder="10-digit alternate number (optional)"
              maxLength={10}
              disabled={isSubmitting}
            />
          </div>

          {/* Additional Warranty */}
          <div className="space-y-2">
            <Label htmlFor="additionalWarranty">Additional Warranty</Label>
            <Select
              value={formData.additionalWarranty}
              onValueChange={(value) => handleSelectChange('additionalWarranty', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="additionalWarranty">
                <SelectValue placeholder="Select additional warranty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Additional Warranty</SelectItem>
                <SelectItem value="1year">1 Year Extended Warranty</SelectItem>
                <SelectItem value="2year">2 Years Extended Warranty</SelectItem>
                <SelectItem value="3year">3 Years Extended Warranty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AMC (Annual Maintenance Contract) */}
          <div className="space-y-2">
            <Label htmlFor="amc">AMC (Annual Maintenance Contract)</Label>
            <Select
              value={formData.amc}
              onValueChange={(value) => handleSelectChange('amc', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="amc">
                <SelectValue placeholder="Select AMC plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No AMC</SelectItem>
                <SelectItem value="1year">1 Year AMC</SelectItem>
                <SelectItem value="2year">2 Years AMC</SelectItem>
                <SelectItem value="3year">3 Years AMC</SelectItem>
                <SelectItem value="5year">5 Years AMC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Option */}
          <div className="space-y-2">
            <Label>Payment Option</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentOption"
                  value="pay_later"
                  checked={formData.paymentOption === 'pay_later'}
                  onChange={(e) => handleSelectChange('paymentOption', e.target.value)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pay Later (Cash on Delivery)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentOption"
                  value="pay_now"
                  checked={formData.paymentOption === 'pay_now'}
                  onChange={(e) => handleSelectChange('paymentOption', e.target.value)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pay Now (Online Payment)
                </span>
              </label>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Complete Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your complete address including street, city, state, and PIN code"
              rows={3}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : formData.paymentOption === 'pay_now' ? (
                'Pay Now'
              ) : (
                'Submit Booking'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
