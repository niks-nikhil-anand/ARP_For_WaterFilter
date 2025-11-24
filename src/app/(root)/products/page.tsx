import React from 'react'
import Navbar from '@/components/website/Navbar'
import Footer from '@/components/website/Footer'
import { commonActions } from '@/actions'
import ProductFilters from '@/components/products/ProductFilters'

export const dynamic = 'force-dynamic'

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
            <ProductFilters products={products} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ProductsPage
