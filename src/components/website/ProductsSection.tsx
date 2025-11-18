import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Droplet, Shield, Star } from 'lucide-react'
import { commonActions } from '@/actions'

const ProductsSection = async () => {
  // Fetch products from API
  let featuredProducts: any[] = []

  try {
    const result = await commonActions.getPublicProducts()
    if (result.success && result.data) {
      // Get first 3 products for featured section
      featuredProducts = result.data.slice(0, 3)
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  }

  // Fallback to sample products if API fails
  if (featuredProducts.length === 0) {
    featuredProducts = [
      {
        id: 1,
        name: 'Aquaguard Delight RO+UV+MTDS',
        company: 'Aquaguard',
        type: 'RO+UV',
        color: 'White',
        warrantyPeriod: 1,
        offer: 'Free Installation'
      },
      {
        id: 2,
        name: 'Aquaguard Enhance RO+UV+UF+TDS',
        company: 'Aquaguard',
        type: 'RO+UV+UF',
        color: 'Black',
        warrantyPeriod: 1,
        offer: 'Free Service for 6 Months'
      },
      {
        id: 3,
        name: 'Aquaguard Marvel RO+UV',
        company: 'Aquaguard',
        type: 'RO+UV',
        color: 'White',
        warrantyPeriod: 1,
        offer: 'Best Seller'
      }
    ]
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-950 px-4 py-2 rounded-full mb-4">
            <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Premium Water Purifiers
            </p>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore our range of high-quality Aquaguard water purifiers for your home
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
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
                  {product.warrantyPeriod && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Warranty: {product.warrantyPeriod} {typeof product.warrantyPeriod === 'number' ? 'Year' : ''}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>Color: {product.color}</span>
                    </div>
                  )}
                  {product.shop && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Droplet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Sold by: {product.shop.name}</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link href={`/products`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProductsSection
