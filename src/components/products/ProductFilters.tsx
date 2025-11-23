'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Droplet, Shield, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Product = {
  id: number
  uniqueId: string
  name: string
  productName: string | null
  description: string | null
  company: string
  type: string
  color: string | null
  price: number | null
  discount: number | null
  discountType: string | null
  warrantyPeriod: string | null
  offer: string | null
  featuredImageUrl: string | null
  createdAt: Date
}

type ProductFiltersProps = {
  products: Product[]
}

export default function ProductFilters({ products }: ProductFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const calculateDiscountedPrice = (price: number | null, discount: number | null, discountType: string | null) => {
    if (!price || !discount) return price
    if (discountType === 'PERCENTAGE') {
      return price - (price * discount / 100)
    }
    return price - discount
  }

  // Filter products
  let filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || product.type?.toLowerCase().includes(filterType.toLowerCase())

    return matchesSearch && matchesType
  })

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0)
      case 'price-high':
        return (b.price || 0) - (a.price || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-800 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products by name, company, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Filters and Sort - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ro">RO Systems</SelectItem>
                <SelectItem value="uv">UV Systems</SelectItem>
                <SelectItem value="uf">UF Systems</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between sm:col-span-2 lg:col-span-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </span>
            {(searchTerm || filterType !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                }}
                className="text-blue-600 dark:text-blue-400"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const discountedPrice = calculateDiscountedPrice(product.price, product.discount, product.discountType)
            
            return (
              <Card
                key={product.id}
                className="border-2 dark:bg-gray-900 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-400 transition-all hover:shadow-xl group overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {product.featuredImageUrl ? (
                    <img
                      src={product.featuredImageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 flex items-center justify-center">
                      <Droplet className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  
                  {/* Badges Overlay */}
                  {product.offer && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white shadow-lg">
                        {product.offer}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="p-4">
                  <CardTitle className="text-lg dark:text-white mb-1 line-clamp-2">
                    {product.productName || product.name}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-medium">{product.company}</span>
                      <span>•</span>
                      <span>{product.type}</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  {/* Features */}
                  <div className="space-y-1.5 mb-3">
                    {product.warrantyPeriod && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{product.warrantyPeriod} months warranty</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{product.color}</span>
                      </div>
                    )}
                    {product.price && (
                      <div className="flex items-center space-x-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <span>₹{discountedPrice?.toLocaleString('en-IN')}</span>
                        {product.discount && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                            {product.discountType === 'PERCENTAGE' ? `${product.discount}% OFF` : `₹${product.discount} OFF`}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link href={`/contact`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm py-2">
                      Book Now
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Droplet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Products Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setFilterType('all')
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
