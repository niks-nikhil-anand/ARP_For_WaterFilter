'use client'

import { useState, useEffect } from 'react'
import ShopSidebar from '@/components/shop/ShopSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getAllProducts, createProduct, deleteProduct } from '@/actions/shop/products'
import { toast } from 'sonner'
import {
  Package,
  Search,
  Filter,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    uniqueId: '',
    productName: '',
    description: '',
    company: '',
    type: '',
    color: '',
    price: '',
    featuredImageUrl: '',
    offer: '',
    discount: '',
    discountType: 'PERCENTAGE',
    warrantyPeriod: '',
  })

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const result = await getAllProducts()
      if (result.success) {
        setProducts(result.data || [])
      } else {
        toast.error(result.error || 'Failed to fetch products')
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.uniqueId || !formData.company || !formData.type) {
      toast.error('Unique ID, Company, and Type are required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const productData = {
        uniqueId: formData.uniqueId,
        productName: formData.productName || null,
        description: formData.description || null,
        company: formData.company,
        type: formData.type,
        color: formData.color || null,
        price: formData.price ? parseFloat(formData.price) : null,
        featuredImageUrl: formData.featuredImageUrl || null,
        offer: formData.offer || null,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        discountType: formData.discountType || null,
        warrantyPeriod: formData.warrantyPeriod || null,
      }

      const result = await createProduct(productData)

      if (result.success) {
        toast.success(result.message || 'Product created successfully')

        // Reset form
        setFormData({
          uniqueId: '',
          productName: '',
          description: '',
          company: '',
          type: '',
          color: '',
          price: '',
          featuredImageUrl: '',
          offer: '',
          discount: '',
          discountType: 'PERCENTAGE',
          warrantyPeriod: '',
        })

        setIsAddDialogOpen(false)
        fetchProducts() // Refresh the product list
      } else {
        toast.error(result.error || 'Failed to create product')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const result = await deleteProduct(productId)

      if (result.success) {
        toast.success(result.message || 'Product deleted successfully')
        fetchProducts() // Refresh the product list
      } else {
        toast.error(result.error || 'Failed to delete product')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.type?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || product.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'INACTIVE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <ShopSidebar />

      <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Products Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your product catalog
              </p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                  </div>
                  <Package className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {products.filter(p => p.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {products.filter(p => p.status === 'PENDING').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ₹{products.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <Label htmlFor="search" className="dark:text-white flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4" />
                    Search Products
                  </Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name, ID, company, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <Label className="dark:text-white flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4" />
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Product Inventory ({filteredProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No products found. Click "Add Product" to create your first product.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Unique ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {product.productName || 'Unnamed Product'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{product.color || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-mono text-sm">{product.uniqueId}</td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{product.company}</td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{product.type}</td>
                          <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
                            {product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="dark:bg-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add New Product</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Enter the details for the new product. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="dark:text-white">Unique ID *</Label>
              <Input
                name="uniqueId"
                value={formData.uniqueId}
                onChange={handleInputChange}
                placeholder="e.g., WF-001"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <Label className="dark:text-white">Product Name</Label>
              <Input
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="e.g., Premium RO Water Purifier"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <Label className="dark:text-white">Description</Label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label className="dark:text-white">Company *</Label>
              <Input
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g., Kent, Aquaguard"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label className="dark:text-white">Type *</Label>
              <Input
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="e.g., RO, UV, UF"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label className="dark:text-white">Color</Label>
              <Input
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g., White, Black"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label className="dark:text-white">Price (₹)</Label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 15000"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <Label className="dark:text-white">Featured Image URL</Label>
              <Input
                name="featuredImageUrl"
                value={formData.featuredImageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label className="dark:text-white">Offer</Label>
              <Input
                name="offer"
                value={formData.offer}
                onChange={handleInputChange}
                placeholder="e.g., Summer Sale"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label className="dark:text-white">Discount</Label>
              <Input
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="e.g., 10"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <Label className="dark:text-white">Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => handleSelectChange('discountType', value)}
              >
                <SelectTrigger className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-white">Warranty Period</Label>
              <Input
                name="warrantyPeriod"
                value={formData.warrantyPeriod}
                onChange={handleInputChange}
                placeholder="e.g., 1 year"
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductsPage
