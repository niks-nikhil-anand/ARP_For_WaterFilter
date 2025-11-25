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
import { Loader2, Info } from 'lucide-react'
import { createOrder } from '@/actions/common/orders'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type Product = {
  id: number
  name: string
  productName: string | null
  company: string
  type: string
  price: number | null
  warrantyPeriod: string | null
  shopId?: number
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
    apartmentNo: '',
    locality: '',
    landmark: '',
    pincode: '',
    state: '',
    country: '',
    addressType: 'home',
    additionalWarranty: 'none',
    amc: 'none',
    paymentOption: 'pay_later',
  })

  // Parse base warranty from product (e.g., "12 months", "1 year", "24 months")
  const getBaseWarrantyMonths = (): number => {
    if (!product?.warrantyPeriod) return 0
    const warranty = product.warrantyPeriod.toLowerCase()

    // Extract numbers from the string
    const match = warranty.match(/(\d+)\s*(month|year)/i)
    if (!match) return 0

    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()

    return unit.startsWith('year') ? value * 12 : value
  }

  const baseWarrantyMonths = getBaseWarrantyMonths()

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
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.apartmentNo || !formData.locality || !formData.pincode || !formData.state || !formData.country) {
      toast.error('Please fill in all address fields')
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

    if (!product) {
      toast.error('Product information is missing.')
      return
    }

    setIsSubmitting(true)

    try {
      // Call server action to create order
      const result = await createOrder({
        productId: product.id,
        shopId: product.shopId || 1, // Default to shop 1 if not specified
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAltPhone: formData.alternatePhone,
        addressType: formData.addressType,
        apartmentNo: formData.apartmentNo,
        locality: formData.locality,
        landmark: formData.landmark,
        pincode: formData.pincode,
        state: formData.state,
        country: formData.country,
        additionalWarranty: formData.additionalWarranty,
        amc: formData.amc,
        paymentOption: formData.paymentOption as 'pay_later' | 'pay_now',
      })

      if (result.success) {
        toast.success(result.message || 'Booking submitted successfully!')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          alternatePhone: '',
          apartmentNo: '',
          locality: '',
          landmark: '',
          pincode: '',
          state: '',
          country: '',
          addressType: 'home',
          additionalWarranty: 'none',
          amc: 'none',
          paymentOption: 'pay_later',
        })

        onClose()
      } else {
        toast.error(result.error || 'Failed to submit booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Email and Phone - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Protection & Maintenance Section Header */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2">
              Protection & Maintenance Plans (Optional)
            </h3>
          </div>

          {/* Warranty and AMC - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Additional Warranty */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="additionalWarranty">Additional Warranty</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">What is Warranty?</p>
                      <p className="text-sm">
                        Warranty covers manufacturing defects and component failures. Extended warranty
                        gives you additional coverage beyond the base warranty period for peace of mind.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
              <div className="flex items-center gap-2">
                <Label htmlFor="amc">AMC (Annual Maintenance)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">What is AMC?</p>
                      <p className="text-sm">
                        Annual Maintenance Contract provides regular servicing, filter replacements,
                        water quality checks, and priority support. Keeps your purifier running optimally
                        and extends its lifespan.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
          </div>

          {/* Informational Box about Warranty vs AMC */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Understanding the Difference
            </h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <span className="font-semibold">Warranty:</span> Covers repair/replacement of defective parts at no cost
              </div>
              <div>
                <span className="font-semibold">AMC:</span> Includes regular maintenance, filter changes, and preventive servicing
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                💡 Tip: AMC helps prevent issues while warranty fixes them if they occur
              </div>
            </div>
          </div>

          {/* Warranty and AMC Summary */}
          {(baseWarrantyMonths > 0 || formData.additionalWarranty !== 'none' || formData.amc !== 'none') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Coverage Summary
              </h4>
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                {baseWarrantyMonths > 0 && (
                  <p>
                    ✓ Base Warranty: {baseWarrantyMonths} months (Free with product)
                  </p>
                )}
                {formData.additionalWarranty !== 'none' && (
                  <p>
                    ✓ Extended Warranty: {
                      formData.additionalWarranty === '1year' ? '12 months' :
                      formData.additionalWarranty === '2year' ? '24 months' :
                      formData.additionalWarranty === '3year' ? '36 months' : ''
                    }
                  </p>
                )}
                {formData.amc !== 'none' && (
                  <p>
                    ✓ AMC Coverage: {
                      formData.amc === '1year' ? '12 months' :
                      formData.amc === '2year' ? '24 months' :
                      formData.amc === '3year' ? '36 months' :
                      formData.amc === '5year' ? '60 months' : ''
                    }
                  </p>
                )}
                {(baseWarrantyMonths > 0 || formData.additionalWarranty !== 'none' || formData.amc !== 'none') && (
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    {(() => {
                      const additionalWarrantyMonths =
                        formData.additionalWarranty === '1year' ? 12 :
                        formData.additionalWarranty === '2year' ? 24 :
                        formData.additionalWarranty === '3year' ? 36 : 0
                      const amcMonths =
                        formData.amc === '1year' ? 12 :
                        formData.amc === '2year' ? 24 :
                        formData.amc === '3year' ? 36 :
                        formData.amc === '5year' ? 60 : 0

                      const totalWarrantyMonths = baseWarrantyMonths + additionalWarrantyMonths

                      const parts = []
                      if (totalWarrantyMonths > 0) {
                        parts.push(`${totalWarrantyMonths} months warranty`)
                      }
                      if (amcMonths > 0) {
                        parts.push(`${amcMonths} months AMC`)
                      }

                      return `Total Coverage: ${parts.join(' + ')}`
                    })()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Address Section Header */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b pb-2">
              Address Details
            </h3>
          </div>

          {/* Address Type */}
          <div className="space-y-2">
            <Label htmlFor="addressType">Address Type</Label>
            <Select
              value={formData.addressType}
              onValueChange={(value) => handleSelectChange('addressType', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="addressType">
                <SelectValue placeholder="Select address type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address Fields - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Apartment/House No */}
            <div className="space-y-2">
              <Label htmlFor="apartmentNo">
                Apartment/House No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="apartmentNo"
                name="apartmentNo"
                value={formData.apartmentNo}
                onChange={handleInputChange}
                placeholder="e.g., Flat 101, Building A"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Locality */}
            <div className="space-y-2">
              <Label htmlFor="locality">
                Locality/Area <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locality"
                name="locality"
                value={formData.locality}
                onChange={handleInputChange}
                placeholder="e.g., Sector 21"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Landmark */}
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="e.g., Near City Mall"
                disabled={isSubmitting}
              />
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="pincode">
                Pincode <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pincode"
                name="pincode"
                type="text"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="6-digit pincode"
                maxLength={6}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">
                State <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="e.g., Maharashtra"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="e.g., India"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Payment Option */}
          <div className="space-y-2 pt-4">
            <Label>Payment Option</Label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
