import React from 'react'
import Navbar from '@/components/website/Navbar'
import Footer from '@/components/website/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Droplet, Shield, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { commonActions } from '@/actions'

const ProductsPage = async () => {
  // Fetch products from API
  let products: any[] = []

  try {
    console.log('📦 Products Page: Fetching products from API...')
    const result = await commonActions.getPublicProducts()
    console.log('📡 API Response:', result)
    
    if (result.success && result.data) {
      console.log(`✅ Received ${result.data.length} products from API`)
      products = result.data
    } else {
      console.log('❌ API call failed or no data:', result)
    }
  } catch (error) {
    console.error('💥 Error fetching products:', error)
  }

  const calculateDiscountedPrice = (price: number | null, discount: number | null, discountType: string | null) => {
    if (!price || !discount) return price
    if (discountType === 'PERCENTAGE') {
      return price - (price * discount / 100)
    }
    return price - discount
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
                Browse our complete range of water purifiers
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                All Products ({products.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose the perfect water purifier for your needs
              </p>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
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
                  No Products Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back soon for our latest water purifiers!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ProductsPage
