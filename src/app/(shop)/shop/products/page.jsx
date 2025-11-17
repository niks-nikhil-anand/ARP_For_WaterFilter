'use client'

import { useState } from 'react'
import ShopSidebar from '@/components/shop/ShopSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { products as initialProducts } from '@/lib/models/shopData'
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

const ProductsPage = () => {
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    const matchesStatus = statusFilter === 'All' || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = ['All', ...new Set(products.map(p => p.category))]

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Low Stock':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Out of Stock':
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
                Manage your inventory and product catalog
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Stock</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {products.filter(p => p.status === 'In Stock').length}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {products.filter(p => p.status === 'Low Stock').length}
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
                      ₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <Label htmlFor="search" className="dark:text-white flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4" />
                    Search Products
                  </Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name, SKU, or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <Label className="dark:text-white flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4" />
                    Category
                  </Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <Label className="dark:text-white flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4" />
                    Stock Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">SKU</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Stock</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{product.category}</td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-mono text-sm">{product.sku}</td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          ₹{product.price.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-semibold ${
                            product.stock > product.minStock ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                          }`}>
                            {product.stock}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400"> / {product.minStock}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className={getStockStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
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
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="dark:bg-gray-900 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add New Product</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Enter the details for the new product
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="dark:text-white">Product Name</Label>
              <Input className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <Label className="dark:text-white">Category</Label>
              <Select>
                <SelectTrigger className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="ro">RO Systems</SelectItem>
                  <SelectItem value="uv">UV Systems</SelectItem>
                  <SelectItem value="spare">Spare Parts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="dark:text-white">Brand</Label>
              <Input className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <Label className="dark:text-white">SKU</Label>
              <Input className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <Label className="dark:text-white">Price (₹)</Label>
              <Input type="number" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <Label className="dark:text-white">Cost Price (₹)</Label>
              <Input type="number" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <Label className="dark:text-white">Stock Quantity</Label>
              <Input type="number" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <Label className="dark:text-white">Minimum Stock</Label>
              <Input type="number" className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductsPage
