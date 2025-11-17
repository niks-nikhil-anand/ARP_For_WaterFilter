'use client'

import React, { useState } from 'react'
import Navbar from '@/components/website/Navbar'
import Footer from '@/components/website/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Droplet, Shield, Star, ShoppingCart, Filter } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ProductsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod',
    notes: ''
  })

  // Sample products data
  const products = [
    {
      id: 1,
      name: 'Aquaguard Delight RO+UV+MTDS',
      company: 'Aquaguard',
      type: 'RO+UV',
      price: 15999,
      discountedPrice: 12999,
      discountPercent: 18.75,
      color: 'White',
      warrantyPeriod: '1 Year',
      offer: 'Free Installation'
    },
    {
      id: 2,
      name: 'Aquaguard Enhance RO+UV+UF+TDS',
      company: 'Aquaguard',
      type: 'RO+UV+UF',
      price: 18999,
      discountedPrice: 15499,
      discountPercent: 18.42,
      color: 'Black',
      warrantyPeriod: '1 Year',
      offer: 'Free Service for 6 Months'
    },
    {
      id: 3,
      name: 'Aquaguard Marvel RO+UV',
      company: 'Aquaguard',
      type: 'RO+UV',
      price: 13499,
      discountedPrice: 10999,
      discountPercent: 18.52,
      color: 'White',
      warrantyPeriod: '1 Year',
      offer: 'Best Seller'
    },
    {
      id: 4,
      name: 'Aquaguard Blaze UV',
      company: 'Aquaguard',
      type: 'UV',
      price: 8999,
      discountedPrice: 7499,
      discountPercent: 16.67,
      color: 'Blue',
      warrantyPeriod: '1 Year',
      offer: null
    },
    {
      id: 5,
      name: 'Aquaguard Crystal RO+UF',
      company: 'Aquaguard',
      type: 'RO+UF',
      price: 12999,
      discountedPrice: 10499,
      discountPercent: 19.23,
      color: 'White',
      warrantyPeriod: '1 Year',
      offer: 'Limited Stock'
    },
    {
      id: 6,
      name: 'Aquaguard Superb RO+UV+UF',
      company: 'Aquaguard',
      type: 'RO+UV+UF',
      price: 16999,
      discountedPrice: 13999,
      discountPercent: 17.65,
      color: 'Black',
      warrantyPeriod: '1 Year',
      offer: 'Top Rated'
    }
  ]

  const filteredProducts = filterType === 'all'
    ? products
    : products.filter(p => p.type.includes(filterType.toUpperCase()))

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    })
  }

  const handleNextStep = () => {
    if (bookingStep === 1) {
      // Validate step 1 fields
      if (bookingData.name && bookingData.phone && bookingData.email) {
        setBookingStep(2)
      }
    }
  }

  const handlePreviousStep = () => {
    if (bookingStep === 2) {
      setBookingStep(1)
    }
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Booking submitted:', { product: selectedProduct, ...bookingData })
    alert('Booking request submitted successfully! We will contact you soon.')
    setBookingData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
      paymentMethod: 'cod',
      notes: ''
    })
    setBookingStep(1)
  }

  const handleDialogOpen = (product: any) => {
    setSelectedProduct(product)
    setBookingStep(1)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">Our Products</h1>
              <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
                Browse our complete range of Aquaguard water purifiers
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Bar */}
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  All Products ({filteredProducts.length})
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose the perfect water purifier for your needs
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[200px] dark:bg-gray-900 dark:border-gray-800">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-800">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ro">RO Systems</SelectItem>
                    <SelectItem value="uv">UV Systems</SelectItem>
                    <SelectItem value="uf">UF Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="border-2 dark:bg-gray-900 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-400 transition-all hover:shadow-xl group"
                >
                  <CardHeader>
                    {/* Product Image Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Droplet className="h-24 w-24 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.offer && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {product.offer}
                        </Badge>
                      )}
                      {product.discountPercent && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          {product.discountPercent.toFixed(0)}% OFF
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-xl dark:text-white mb-2">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium">{product.company}</span>
                        <span>•</span>
                        <span>{product.type}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Warranty: {product.warrantyPeriod}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>Color: {product.color}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ₹{product.discountedPrice?.toLocaleString()}
                        </span>
                        {product.discountedPrice && (
                          <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                        Save ₹{(product.price - (product.discountedPrice || product.price)).toLocaleString()}
                      </p>
                    </div>

                    {/* Book Now Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                          onClick={() => handleDialogOpen(product)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Book Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 p-0">
                        <div className="p-6 sm:p-8">
                          <DialogHeader className="mb-6">
                            <DialogTitle className="dark:text-white text-2xl">Book {selectedProduct?.name}</DialogTitle>
                            <DialogDescription className="dark:text-gray-400 text-base mt-2">
                              {bookingStep === 1 ? 'Step 1: Personal & Contact Information' : 'Step 2: Address & Payment Details'}
                            </DialogDescription>

                            {/* Progress Indicator */}
                            <div className="flex items-center space-x-2 mt-4">
                              <div className={`flex-1 h-2 rounded-full ${bookingStep >= 1 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                              <div className={`flex-1 h-2 rounded-full ${bookingStep >= 2 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                            </div>
                          </DialogHeader>

                          <form onSubmit={handleBooking} className="space-y-8">
                            {/* Step 1: Personal & Contact Information */}
                            {bookingStep === 1 && (
                              <div className="space-y-6">
                                <div className="space-y-5">
                                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Personal & Contact Information</h3>

                                  <div>
                                    <Label htmlFor="name" className="dark:text-white text-base mb-2 block">Full Name *</Label>
                                    <Input
                                      id="name"
                                      name="name"
                                      required
                                      value={bookingData.name}
                                      onChange={handleBookingChange}
                                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11"
                                      placeholder="Enter your full name"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="phone" className="dark:text-white text-base mb-2 block">Phone Number *</Label>
                                      <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={bookingData.phone}
                                        onChange={handleBookingChange}
                                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11"
                                        placeholder="+91 XXXXX XXXXX"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="email" className="dark:text-white text-base mb-2 block">Email Address *</Label>
                                      <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={bookingData.email}
                                        onChange={handleBookingChange}
                                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11"
                                        placeholder="your.email@example.com"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Order Summary for Step 1 */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Selected Product</h3>
                                  <div className="flex items-start space-x-4">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                      <Droplet className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900 dark:text-white">{selectedProduct?.name}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedProduct?.type}</p>
                                      <div className="flex items-baseline space-x-2 mt-3">
                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                          ₹{selectedProduct?.discountedPrice?.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                          ₹{selectedProduct?.price.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  onClick={handleNextStep}
                                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 h-12 text-base"
                                  size="lg"
                                >
                                  Continue to Address & Payment
                                </Button>
                              </div>
                            )}

                            {/* Step 2: Address & Payment */}
                            {bookingStep === 2 && (
                              <div className="space-y-6">
                                {/* Address Details */}
                                <div className="space-y-5">
                                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Delivery Address</h3>

                                  <div>
                                    <Label htmlFor="address" className="dark:text-white text-base mb-2 block">Street Address *</Label>
                                    <Textarea
                                      id="address"
                                      name="address"
                                      required
                                      value={bookingData.address}
                                      onChange={handleBookingChange}
                                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                      rows={3}
                                      placeholder="House/Flat No., Street Name, Area"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="city" className="dark:text-white text-base mb-2 block">City *</Label>
                                      <Input
                                        id="city"
                                        name="city"
                                        required
                                        value={bookingData.city}
                                        onChange={handleBookingChange}
                                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11"
                                        placeholder="Enter city"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="pincode" className="dark:text-white text-base mb-2 block">Pincode *</Label>
                                      <Input
                                        id="pincode"
                                        name="pincode"
                                        required
                                        value={bookingData.pincode}
                                        onChange={handleBookingChange}
                                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white h-11"
                                        placeholder="400606"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Payment Method</h3>
                                  <RadioGroup value={bookingData.paymentMethod} onValueChange={(value) => setBookingData({...bookingData, paymentMethod: value})}>
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-colors cursor-pointer">
                                      <RadioGroupItem value="cod" id="cod" />
                                      <Label htmlFor="cod" className="flex-1 cursor-pointer dark:text-white text-base font-medium">
                                        💵 Cash on Delivery
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-colors cursor-pointer">
                                      <RadioGroupItem value="online" id="online" />
                                      <Label htmlFor="online" className="flex-1 cursor-pointer dark:text-white text-base font-medium">
                                        💳 Online Payment (UPI/Card)
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>

                                {/* Additional Notes */}
                                <div>
                                  <Label htmlFor="notes" className="dark:text-white text-base mb-2 block">Additional Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    name="notes"
                                    value={bookingData.notes}
                                    onChange={handleBookingChange}
                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    rows={3}
                                    placeholder="Any special instructions or requirements..."
                                  />
                                </div>

                                {/* Final Order Summary */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Order Summary</h3>
                                  <div className="space-y-3 text-base">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Product:</span>
                                      <span className="text-gray-900 dark:text-white font-medium text-right">{selectedProduct?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                      <span className="text-gray-900 dark:text-white font-medium">₹{selectedProduct?.discountedPrice?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                      <span>You Save:</span>
                                      <span className="font-medium">₹{selectedProduct && (selectedProduct.price - selectedProduct.discountedPrice).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-blue-300 dark:border-blue-700 pt-3 flex justify-between text-xl font-bold">
                                      <span className="text-gray-900 dark:text-white">Total Amount:</span>
                                      <span className="text-blue-600 dark:text-blue-400">₹{selectedProduct?.discountedPrice?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                  <Button
                                    type="button"
                                    onClick={handlePreviousStep}
                                    variant="outline"
                                    className="flex-1 h-12 text-base border-2"
                                    size="lg"
                                  >
                                    Back
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 h-12 text-base"
                                    size="lg"
                                  >
                                    Confirm Booking
                                  </Button>
                                </div>
                              </div>
                            )}
                          </form>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ProductsPage
