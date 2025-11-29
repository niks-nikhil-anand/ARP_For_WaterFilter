'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Phone, Mail, MapPin, Send, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { commonActions } from '@/actions'

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    address: '',
    serviceType: '',
    productType: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })
  const [showThankYouCard, setShowThankYouCard] = useState(false)
  const [countdown, setCountdown] = useState(5)

  // Countdown effect for thank you card
  React.useEffect(() => {
    if (showThankYouCard && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showThankYouCard && countdown === 0) {
      setShowThankYouCard(false)
      setCountdown(5)
    }
  }, [showThankYouCard, countdown])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Enforce phone input: always show '+91 ' prefix, accept only digits after it, max 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prefix = '+91 '
    const raw = e.target.value || ''
    // Extract digits only
    let digits = raw.replace(/\D/g, '')
    // If user pasted full international like '919876543210' or '+919876543210', strip leading country code
    if (digits.startsWith('91')) {
      // remove only a single leading '91' if present
      digits = digits.replace(/^91/, '')
    }
    // Limit to 10 digits
    digits = digits.slice(0, 10)
    setFormData({
      ...formData,
      phone: prefix + digits
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })
    // Normalize and validate phone: extract digits and ensure 10-digit local number
    const allDigits = formData.phone.replace(/\D/g, '')
    // remove leading '91' if present (because our stored value contains '91' from '+91 ')
    const localDigits = allDigits.replace(/^91/, '')
    if (localDigits.length !== 10) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid 10-digit phone number.' })
      setIsSubmitting(false)
      return
    }

    try {
      // Create complaint using the server action
      const result = await commonActions.createComplaint({
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
        // Success - reset form (keep default country code)
        setFormData({
          name: '',
          email: '',
          phone: '+91 ',
          address: '',
          serviceType: '',
          productType: '',
          preferredDate: '',
          preferredTime: '',
          message: ''
        })

        // Show thank you card instead of inline message
        setShowThankYouCard(true)
        setCountdown(5)
      } else {
        // Error
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to submit complaint. Please try again.'
        })
      }
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Raise Complaint or Request Service
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Submit your complaint or service request for quick resolution
          </p>
        </div>

        {/* Thank You Card Modal Overlay */}
        {showThankYouCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full bg-white dark:bg-gray-900 border-2 border-green-500 dark:border-green-600 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Thank You!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Your complaint has been submitted successfully!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    We appreciate your interest in our services. Our team will contact you shortly to confirm your appointment and discuss the details.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>What happens next?</strong>
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1 text-left">
                      <li>• Our executive will call you within 24 hours</li>
                      <li>• We'll confirm your preferred date and time</li>
                      <li>• Our technician will arrive at your scheduled time</li>
                    </ul>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This window will close automatically in <span className="font-bold text-blue-600 dark:text-blue-400">{countdown}</span> seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-2 dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl dark:text-white">Raise a Complaint</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Fill out the form below to raise a complaint or request service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <Label htmlFor="name" className="text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number *
                      </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          placeholder="+91 XXXXX XXXXX"
                        />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Service Type */}
                    <div>
                      <Label htmlFor="serviceType" className="text-gray-900 dark:text-white">
                       Service Type *
                      </Label>
                      <Select
                        value={formData.serviceType}
                        onValueChange={(value) => handleSelectChange('serviceType', value)}
                        required
                      >
                        <SelectTrigger className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="installation">New Installation</SelectItem>
                          <SelectItem value="repair">Repair Service</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="amc">AMC Service</SelectItem>
                          <SelectItem value="consultation">Free Consultation</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Preferred Date */}
                    <div>
                      <Label htmlFor="preferredDate" className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Preferred Date *
                      </Label>
                      <Input
                        id="preferredDate"
                        name="preferredDate"
                        type="date"
                        required
                        value={formData.preferredDate}
                        onChange={handleChange}
                        className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Preferred Time */}
                    <div>
                      <Label htmlFor="preferredTime" className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Preferred Time *
                      </Label>
                      <Select
                        value={formData.preferredTime}
                        onValueChange={(value) => handleSelectChange('preferredTime', value)}
                        required
                      >
                        <SelectTrigger className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12:00 PM - 3:00 PM)</SelectItem>
                          <SelectItem value="evening">Evening (3:00 PM - 7:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Service Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Enter complete address"
                    />
                  </div>

                  {/* Product Type */}
                  <div>
                    <Label htmlFor="productType" className="text-gray-900 dark:text-white">
                      Product Type (Optional)
                    </Label>
                    <Input
                      id="productType"
                      name="productType"
                      type="text"
                      value={formData.productType}
                      onChange={handleChange}
                      className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="e.g., RO, UV, UF Water Purifier"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-gray-900 dark:text-white">
                      Additional Information or Complaint Details (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Any specific requirements or questions..."
                      rows={4}
                    />
                  </div>

                  {/* Success/Error Messages */}
                  {submitStatus.type && (
                    <div className={`p-4 rounded-lg border ${
                      submitStatus.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                    }`}>
                      <p className="font-medium">{submitStatus.message}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit Complaint or Request Service
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Why Book With Us */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl dark:text-white">Why Book With Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Quick Response</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Expert Technicians</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Skilled and certified professionals
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Flexible Scheduling</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose your convenient time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-blue-600 dark:bg-blue-700 text-white border-none">
              <CardHeader>
                <CardTitle className="text-xl">Need Help?</CardTitle>
                <CardDescription className="text-blue-100">
                  Contact us directly for urgent requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-blue-100">Call us at</p>
                    <a href="tel:+91XXXXXXXXXX" className="font-semibold hover:underline">
                      +91 XXXXX XXXXX
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-blue-100">Email us at</p>
                    <a href="mailto:info@samarthwaterpurifier.com" className="font-semibold hover:underline">
                      info@samarthwaterpurifier.com
                    </a>
                  </div>
                </div>
                <div className="pt-3 border-t border-blue-500">
                  <p className="text-sm text-blue-100">Working Hours</p>
                  <p className="font-semibold">Mon - Sat: 9:00 AM - 7:00 PM</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </section>
  )
}

export default BookingForm
