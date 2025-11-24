'use client'

import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  Pencil,
  Trash2,
  Search,

  Package,
  Plus,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
} from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/app/actions/product'
import { uploadImageToCloudinary } from '@/app/actions/cloudinary'
import { generateProductId } from '@/utils/generateId'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'

type Product = {
  id: number
  uniqueId: string
  productName: string | null
  description: string | null
  company: string
  type: string
  color: string | null
  price: number | null
  images: string[]
  featuredImageUrl: string | null
  discount: number | null
  discountType: string | null
  warrantyPeriod: string | null
  status: string
  createdBy?: {
    id: number
    name: string
    email: string
    role: string
  }
  createdAt: Date
  updatedAt: Date
}

const ProductManagementPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({
    productName: '',
    description: '',
    company: '',
    type: '',
    color: '',
    price: '',
    discount: '',
    discountType: '',
    status: '',
  })
  const [addForm, setAddForm] = useState({
    productName: '',
    description: '',
    type: '',
    color: '',
    warrantyPeriod: '',
    freeInstallation: false,
    price: '',
    discountType: 'PERCENTAGE',
    discount: '',
    featuredImage: null as File | null,
    images: [] as File[],
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const result = await getProducts()
    if (result.success && result.data) {
      setProducts(result.data)
    } else {
      toast.error('Failed to load products')
    }
    setLoading(false)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setViewDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setEditForm({
      productName: product.productName || '',
      description: product.description || '',
      company: product.company || '',
      type: product.type || '',
      color: product.color || '',
      price: product.price?.toString() || '',
      discount: product.discount?.toString() || '',
      discountType: product.discountType || 'PERCENTAGE',
      status: product.status || 'PENDING',
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return

    const result = await deleteProduct(selectedProduct.id)
    if (result.success) {
      loadProducts()
      setDeleteDialogOpen(false)
      setSelectedProduct(null)
      toast.success('Product deleted successfully')
    } else {
      toast.error('Failed to delete product')
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedProduct) return

    const result = await updateProduct(selectedProduct.id, {
      productName: editForm.productName,
      description: editForm.description,
      company: editForm.company,
      type: editForm.type,
      color: editForm.color,
      price: editForm.price ? parseFloat(editForm.price) : undefined,
      discount: editForm.discount ? parseFloat(editForm.discount) : undefined,
      discountType: editForm.discountType as 'PERCENTAGE' | 'FLAT_RATE',
      status: editForm.status as 'ACTIVE' | 'BLOCKED' | 'PENDING',
    })

    if (result.success) {
      loadProducts()
      setEditDialogOpen(false)
      setSelectedProduct(null)
      toast.success('Product updated successfully')
    } else {
      toast.error(result.error || 'Failed to update product')
    }
  }



  // Add Product Handlers
  const openAddDialog = () => {
    setAddForm({
      productName: '',
      description: '',
      type: '',
      color: '',
      warrantyPeriod: '',
      freeInstallation: false,
      price: '',
      discountType: 'PERCENTAGE',
      discount: '',
      featuredImage: null,
      images: [],
    })
    setImagePreview(null)
    setImagePreviews([])
    setCurrentStep(1)
    setAddDialogOpen(true)
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAddForm({ ...addForm, featuredImage: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setAddForm({ ...addForm, images: [...addForm.images, ...files] })
      
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    const newImages = addForm.images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setAddForm({ ...addForm, images: newImages })
    setImagePreviews(newPreviews)
  }

  const calculateFinalPrice = () => {
    const price = parseFloat(addForm.price) || 0
    const discount = parseFloat(addForm.discount) || 0
    
    if (addForm.discountType === 'PERCENTAGE') {
      return price - (price * discount / 100)
    }
    return price - discount
  }

  const handleAddProduct = async () => {
    setUploading(true)
    try {
      // Helper function to convert File to base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = error => reject(error)
        })
      }

      // Upload featured image
      let featuredImageUrl = ''
      if (addForm.featuredImage) {
        const base64 = await fileToBase64(addForm.featuredImage)
        const result = await uploadImageToCloudinary(base64, 'products/featured')
        if (result.success && result.url) {
          featuredImageUrl = result.url
        }
      }

      // Upload additional images
      const imageUrls: string[] = []
      for (const image of addForm.images) {
        const base64 = await fileToBase64(image)
        const result = await uploadImageToCloudinary(base64, 'products/gallery')
        if (result.success && result.url) {
          imageUrls.push(result.url)
        }
      }

      // Generate unique ID using utility function
      const uniqueId = generateProductId()

      // Create product
      const result = await createProduct({
        uniqueId,
        productName: addForm.productName,
        description: addForm.description,
        company: 'Default Company', // You can add this to the form if needed
        type: addForm.type,
        color: addForm.color,
        price: parseFloat(addForm.price),
        discount: parseFloat(addForm.discount) || undefined,
        discountType: addForm.discountType as 'PERCENTAGE' | 'FLAT_RATE',
        warrantyPeriod: addForm.warrantyPeriod,
        featuredImageUrl,
        images: imageUrls,
        status: 'PENDING',
      })

      if (result.success) {
        loadProducts()
        setAddDialogOpen(false)
        toast.success('Product added successfully')
      } else {
        toast.error(result.error || 'Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Error uploading images or creating product')
    } finally {
      setUploading(false)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'BLOCKED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
    }
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const calculateDiscountedPrice = (price: number | null, discount: number | null, discountType: string | null) => {
    if (!price || !discount) return price
    if (discountType === 'PERCENTAGE') {
      return price - (price * discount / 100)
    }
    return price - discount
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="h-[90vh] max-h-[92vh] overflow-y-auto">
      <div className="container mx-auto py-10 px-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage your product inventory and details
              </p>
            </div>
            <Button onClick={openAddDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product ID, name, company, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <p className="text-muted-foreground">Loading...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No products found matching your search' : 'No products found'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.uniqueId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{product.productName || '-'}</div>
                        {product.createdBy && (
                          <div className="text-xs text-muted-foreground">By: {product.createdBy.name}</div>
                        )}
                      </TableCell>
                      <TableCell>{product.type}</TableCell>
                      <TableCell>{product.color || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{formatPrice(product.price)}</span>
                          {product.discount && (
                            <span className="text-sm text-green-600">
                              {formatPrice(calculateDiscountedPrice(product.price, product.discount, product.discountType))}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.discount ? (
                          <span className="text-sm text-green-600">
                            {product.discount}{product.discountType === 'PERCENTAGE' ? '%' : ' ₹'}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>{formatDate(product.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(product)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            title="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product)}
                            title="Delete product"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Complete product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Product ID</Label>
                  <p className="font-medium">{selectedProduct.uniqueId}</p>
                </div>
                {selectedProduct.createdBy && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Created By</Label>
                    <p className="font-medium">{selectedProduct.createdBy.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedProduct.createdBy.role}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Product Name</Label>
                <p className="font-medium">{selectedProduct.productName || '-'}</p>
              </div>

              {/* Featured Image */}
              {selectedProduct.featuredImageUrl && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Featured Image</Label>
                  <div className="relative w-32 h-32 border-2 rounded-md overflow-hidden">
                    <img
                      src={selectedProduct.featuredImageUrl}
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                      Featured
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Additional Images</Label>
                    <Badge variant="secondary">{selectedProduct.images.length} image{selectedProduct.images.length > 1 ? 's' : ''}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.images.map((imageUrl, index) => (
                      <div key={index} className="relative w-20 h-20 border-2 rounded-md overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.description && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedProduct.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Company</Label>
                  <p className="font-medium">{selectedProduct.company}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedProduct.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Color</Label>
                  <p className="font-medium">{selectedProduct.color || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  {getStatusBadge(selectedProduct.status)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Price</Label>
                  <p className="font-medium text-lg">{formatPrice(selectedProduct.price)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Discount</Label>
                  <p className="font-medium text-green-600">
                    {selectedProduct.discount ? `${selectedProduct.discount}${selectedProduct.discountType === 'PERCENTAGE' ? '%' : ' ₹'}` : '-'}
                  </p>
                </div>
              </div>
              {selectedProduct.discount && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Final Price</Label>
                  <p className="font-medium text-lg text-green-600">
                    {formatPrice(calculateDiscountedPrice(selectedProduct.price, selectedProduct.discount, selectedProduct.discountType))}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="font-medium">{formatDate(selectedProduct.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p className="font-medium">{formatDate(selectedProduct.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-productName">Product Name</Label>
              <Input
                id="edit-productName"
                value={editForm.productName}
                onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Enter company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Input
                  id="edit-type"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  placeholder="Enter type"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
              <Input
                id="edit-color"
                value={editForm.color}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                placeholder="Enter color"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  placeholder="Enter price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discount">Discount</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  value={editForm.discount}
                  onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                  placeholder="Enter discount"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discountType">Discount Type</Label>
                <Select
                  value={editForm.discountType}
                  onValueChange={(value) => setEditForm({ ...editForm, discountType: value })}
                >
                  <SelectTrigger id="edit-discountType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FLAT_RATE">Flat Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{selectedProduct?.productName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Product Dialog - 3 Steps */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product - Step {currentStep} of 3</DialogTitle>
            <DialogDescription>
              {currentStep === 1 && 'Enter product details'}
              {currentStep === 2 && 'Set pricing and discounts'}
              {currentStep === 3 && 'Upload product images'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Step 1: Product Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-productName">Product Name *</Label>
                  <Input
                    id="add-productName"
                    value={addForm.productName}
                    onChange={(e) => setAddForm({ ...addForm, productName: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-description">Description</Label>
                  <Textarea
                    id="add-description"
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={5}
                    className="resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-type">Type *</Label>
                    <Input
                      id="add-type"
                      value={addForm.type}
                      onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                      placeholder="e.g., RO, UV, UF"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-color">Color</Label>
                    <Input
                      id="add-color"
                      value={addForm.color}
                      onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                      placeholder="Enter color"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="add-warranty">Warranty Period</Label>
                  <Select
                    value={addForm.warrantyPeriod}
                    onValueChange={(value) => setAddForm({ ...addForm, warrantyPeriod: value })}
                  >
                    <SelectTrigger id="add-warranty">
                      <SelectValue placeholder="Select warranty period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months (1 Year)</SelectItem>
                      <SelectItem value="18">18 Months</SelectItem>
                      <SelectItem value="24">24 Months (2 Years)</SelectItem>
                      <SelectItem value="36">36 Months (3 Years)</SelectItem>
                      <SelectItem value="48">48 Months (4 Years)</SelectItem>
                      <SelectItem value="60">60 Months (5 Years)</SelectItem>
                    </SelectContent>
                  </Select>
                  {addForm.warrantyPeriod && (
                    <div className="p-4 border-2 border-primary/30 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Free Warranty</Badge>
                        <span className="font-semibold">
                          {addForm.warrantyPeriod === '6' && '6 Months'}
                          {addForm.warrantyPeriod === '12' && '1 Year'}
                          {addForm.warrantyPeriod === '18' && '18 Months'}
                          {addForm.warrantyPeriod === '24' && '2 Years'}
                          {addForm.warrantyPeriod === '36' && '3 Years'}
                          {addForm.warrantyPeriod === '48' && '4 Years'}
                          {addForm.warrantyPeriod === '60' && '5 Years'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Includes manufacturer warranty coverage
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Additional Features</Label>
                  <div
                    onClick={() => setAddForm({ ...addForm, freeInstallation: !addForm.freeInstallation })}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${addForm.freeInstallation
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="add-freeInstallation"
                        checked={addForm.freeInstallation}
                        onCheckedChange={(checked) => setAddForm({ ...addForm, freeInstallation: checked as boolean })}
                      />
                      <div>
                        <div className="font-semibold">Free Installation</div>
                        <div className="text-sm text-muted-foreground">Professional installation included</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-price">Price (₹) *</Label>
                  <Input
                    id="add-price"
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                    placeholder="Enter price"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-discountType">Discount Type</Label>
                    <Select
                      value={addForm.discountType}
                      onValueChange={(value) => setAddForm({ ...addForm, discountType: value })}
                    >
                      <SelectTrigger id="add-discountType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FLAT_RATE">Flat Rate (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-discount">Discount</Label>
                    <Input
                      id="add-discount"
                      type="number"
                      value={addForm.discount}
                      onChange={(e) => setAddForm({ ...addForm, discount: e.target.value })}
                      placeholder={addForm.discountType === 'PERCENTAGE' ? 'Enter %' : 'Enter amount'}
                    />
                  </div>
                </div>
                {addForm.price && (
                  <div className="space-y-3 p-5 border-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                    <h3 className="font-semibold text-lg">Price Summary</h3>

                    {/* Original Price */}
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-sm text-muted-foreground">Original Price:</span>
                      <span className="text-lg font-semibold">
                        ₹{parseFloat(addForm.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Discount */}
                    {addForm.discount && parseFloat(addForm.discount) > 0 && (
                      <div className="space-y-2 pb-2 border-b">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Discount:</span>
                          <span className="text-md font-medium text-red-600">
                            - ₹{(parseFloat(addForm.price) - calculateFinalPrice()).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Discount Type:</span>
                          <Badge variant="destructive" className="text-xs">
                            {addForm.discountType === 'PERCENTAGE'
                              ? `${addForm.discount}% OFF`
                              : `₹${addForm.discount} OFF`}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Final Price */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-semibold">Final Price:</span>
                      <span className="text-3xl font-bold text-green-600">
                        ₹{calculateFinalPrice().toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Savings */}
                    {addForm.discount && parseFloat(addForm.discount) > 0 && (
                      <div className="flex items-center justify-center gap-2 p-2 bg-green-100 rounded-md">
                        <Badge variant="secondary" className="bg-green-600 text-white">
                          You Save
                        </Badge>
                        <span className="font-bold text-green-700">
                          ₹{(parseFloat(addForm.price) - calculateFinalPrice()).toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-green-700">
                          ({((parseFloat(addForm.price) - calculateFinalPrice()) / parseFloat(addForm.price) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-featuredImage">Featured Image</Label>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="add-featuredImage"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload featured image
                      </span>
                    </label>
                    <Input
                      id="add-featuredImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageChange}
                      className="hidden"
                    />
                  </div>
                  {imagePreview && (
                    <div className="flex gap-2">
                      <div className="relative w-20 h-20 border-2 rounded-md overflow-hidden group">
                        <img
                          src={imagePreview}
                          alt="Featured preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setAddForm({ ...addForm, featuredImage: null })
                            setImagePreview(null)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                          Featured
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-images">Additional Images</Label>
                    {imagePreviews.length > 0 && (
                      <Badge variant="secondary">{imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="add-images"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload images
                      </span>
                    </label>
                    <Input
                      id="add-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative w-20 h-20 border-2 rounded-md overflow-hidden group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevStep}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleAddProduct} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductManagementPage
