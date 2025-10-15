'use client'

import React, { useState, useMemo } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Package,
  Tag,
  IndianRupee,
  Palette,
  Building2,
  ShoppingBag,
  Calendar,
  ShieldCheck,
  Percent,
} from 'lucide-react'

// Demo data based on your Prisma Product model
const demoProducts = [
  {
    id: 1,
    name: 'Kent Grand Plus RO + UV + UF + TDS Controller Water Purifier',
    company: 'Kent',
    type: 'RO + UV + UF Water Purifier',
    color: 'White & Blue',
    price: 18999,
    discountedPrice: 15999,
    discountPercent: 15.8,
    offer: 'Free Installation & 1-Year Service AMC',
    warrantyPeriod: '1 Year',
    shopId: 1,
    createdAt: new Date('2024-07-10'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 2,
    name: 'Aquaguard Aura RO + UV + UF + Active Copper Water Purifier',
    company: 'Eureka Forbes',
    type: 'RO + UV + UF Water Purifier',
    color: 'Black & Copper',
    price: 17999,
    discountedPrice: 14999,
    discountPercent: 16.7,
    offer: 'Festival Offer: ₹3000 Off + Free Filter Set',
    warrantyPeriod: '1 Year',
    shopId: 1,
    createdAt: new Date('2024-06-18'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 3,
    name: 'Livpure Glo Star RO + UV + Mineralizer Water Purifier',
    company: 'Livpure',
    type: 'RO + UV Water Purifier',
    color: 'White',
    price: 14999,
    discountedPrice: 12499,
    discountPercent: 16.6,
    offer: 'Free Installation & 1 Free Filter Replacement',
    warrantyPeriod: '1 Year',
    shopId: 2,
    createdAt: new Date('2024-05-25'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 4,
    name: 'AO Smith Z9 Green RO Hot & Cold Water Purifier',
    company: 'AO Smith',
    type: 'RO Water Purifier with Hot & Cold',
    color: 'Black',
    price: 28999,
    discountedPrice: 25999,
    discountPercent: 10.3,
    offer: '₹3000 Cashback on Credit Card EMI',
    warrantyPeriod: '2 Years',
    shopId: 2,
    createdAt: new Date('2024-04-30'),
    updatedAt: new Date('2024-09-30'),
  },
  {
    id: 5,
    name: 'Blue Star Aristo RO + UV + UF Water Purifier',
    company: 'Blue Star',
    type: 'RO + UV + UF Water Purifier',
    color: 'Black & Silver',
    price: 13990,
    discountedPrice: 11990,
    discountPercent: 14.3,
    offer: 'Festival Deal: Free Pre-filter Kit',
    warrantyPeriod: '1 Year',
    shopId: 1,
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-10-11'),
  },
  {
    id: 6,
    name: 'HUL Pureit Copper+ RO Water Purifier',
    company: 'Pureit (HUL)',
    type: 'RO + UV + Copper Enriched Water Purifier',
    color: 'Black & Copper',
    price: 23999,
    discountedPrice: 19999,
    discountPercent: 16.6,
    offer: 'Free Copper Cartridge Worth ₹1500',
    warrantyPeriod: '1 Year',
    shopId: 3,
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date('2024-10-09'),
  },
  {
    id: 7,
    name: 'Aquaguard Marvel RO + UV + Active Copper Water Purifier',
    company: 'Eureka Forbes',
    type: 'RO + UV Water Purifier',
    color: 'Black',
    price: 16999,
    discountedPrice: 13999,
    discountPercent: 17.6,
    offer: 'Zero Cost EMI for 6 Months',
    warrantyPeriod: '1 Year',
    shopId: 3,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-10-08'),
  },
  {
    id: 8,
    name: 'Kent Supreme Alkaline RO + UV + UF + TDS Controller Water Purifier',
    company: 'Kent',
    type: 'Alkaline RO + UV + UF Water Purifier',
    color: 'White',
    price: 21999,
    discountedPrice: 18499,
    discountPercent: 15.9,
    offer: 'Free Filter Replacement Worth ₹2000',
    warrantyPeriod: '1 Year',
    shopId: 2,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 9,
    name: 'AO Smith X2 UV + UF Water Purifier',
    company: 'AO Smith',
    type: 'UV + UF Water Purifier (Non-RO)',
    color: 'White & Green',
    price: 12990,
    discountedPrice: 10990,
    discountPercent: 15.4,
    offer: 'Free Installation + Free Pre-filter',
    warrantyPeriod: '1 Year',
    shopId: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-10-07'),
  },
  {
    id: 10,
    name: 'Blue Star Eleanor RO + UV + UF + Taste Enhancer Water Purifier',
    company: 'Blue Star',
    type: 'RO + UV + UF Water Purifier',
    color: 'Black & Silver',
    price: 18999,
    discountedPrice: 15999,
    discountPercent: 15.8,
    offer: 'Free Installation Kit + Pre-filter',
    warrantyPeriod: '1 Year',
    shopId: 3,
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2024-10-13'),
  },
  {
    id: 11,
    name: 'Havells Max RO + UV + Mineralizer Water Purifier',
    company: 'Havells',
    type: 'RO + UV Water Purifier',
    color: 'White & Blue',
    price: 16999,
    discountedPrice: 14499,
    discountPercent: 14.7,
    offer: 'Free Installation & 1 Filter Replacement',
    warrantyPeriod: '1 Year',
    shopId: 2,
    createdAt: new Date('2023-11-18'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 12,
    name: 'Aquasure Amaze RO + UV + MTDS Water Purifier',
    company: 'Eureka Forbes',
    type: 'RO + UV + MTDS Water Purifier',
    color: 'Black & Red',
    price: 13999,
    discountedPrice: 11999,
    discountPercent: 14.3,
    offer: 'Buy Now & Get Free Pre-filter',
    warrantyPeriod: '1 Year',
    shopId: 1,
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-10-11'),
  },
  {
    id: 13,
    name: 'Faber Galaxy Plus RO + UV + UF + MAT Water Purifier',
    company: 'Faber',
    type: 'RO + UV + UF Water Purifier',
    color: 'Black',
    price: 16999,
    discountedPrice: 13999,
    discountPercent: 17.6,
    offer: 'Free Installation & Pre-filter Kit',
    warrantyPeriod: '1 Year',
    shopId: 3,
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 14,
    name: 'Livpure Pep Pro Plus RO + UV + UF + Taste Enhancer Water Purifier',
    company: 'Livpure',
    type: 'RO + UV + UF Water Purifier',
    color: 'White & Black',
    price: 15999,
    discountedPrice: 13499,
    discountPercent: 15.6,
    offer: 'Free Installation & 6 Months AMC',
    warrantyPeriod: '1 Year',
    shopId: 2,
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2024-10-09'),
  },
]

type Product = typeof demoProducts[0]

const ProductManagementPage = () => {
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [companyFilter, setCompanyFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [priceRange, setPriceRange] = useState('ALL')
  const [sortField, setSortField] = useState<keyof Product | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    company: '',
    type: '',
    color: '',
    price: '',
    discountedPrice: '',
    discountPercent: '',
    offer: '',
    warrantyPeriod: '',
  })

  // Get unique values for filters
  const uniqueCompanies = Array.from(new Set(demoProducts.map((p) => p.company))).sort()
  const uniqueTypes = Array.from(new Set(demoProducts.map((p) => p.type))).sort()

  // Filtering and sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesCompany = companyFilter === 'ALL' || product.company === companyFilter
      const matchesType = typeFilter === 'ALL' || product.type === typeFilter

      let matchesPriceRange = true
      if (priceRange !== 'ALL') {
        const price = product.discountedPrice || product.price
        switch (priceRange) {
          case 'UNDER_25K':
            matchesPriceRange = price < 25000
            break
          case '25K_50K':
            matchesPriceRange = price >= 25000 && price < 50000
            break
          case '50K_100K':
            matchesPriceRange = price >= 50000 && price < 100000
            break
          case 'ABOVE_100K':
            matchesPriceRange = price >= 100000
            break
        }
      }

      return matchesSearch && matchesCompany && matchesType && matchesPriceRange
    })

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [products, searchTerm, companyFilter, typeFilter, priceRange, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex)

  // Sort handler
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // CRUD handlers
  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setViewDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setEditForm({
      name: product.name,
      company: product.company,
      type: product.type,
      color: product.color || '',
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || '',
      discountPercent: product.discountPercent?.toString() || '',
      offer: product.offer || '',
      warrantyPeriod: product.warrantyPeriod || '',
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter((p) => p.id !== selectedProduct.id))
      setDeleteDialogOpen(false)
      setSelectedProduct(null)
    }
  }

  const saveEdit = () => {
  if (selectedProduct) {
    const price = parseFloat(editForm.price)
    const discountedPrice = editForm.discountedPrice
      ? parseFloat(editForm.discountedPrice)
      : price
    const discountPercent =
      discountedPrice && price
        ? parseFloat((((price - discountedPrice) / price) * 100).toFixed(1))
        : 0

    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              name: editForm.name,
              company: editForm.company,
              type: editForm.type,
              color: editForm.color || "",
              price,
              discountedPrice,
              discountPercent,
              offer: editForm.offer || "",
              warrantyPeriod: editForm.warrantyPeriod || "",
              updatedAt: new Date(),
            }
          : p
      )
    )
    setEditDialogOpen(false)
    setSelectedProduct(null)
  }
}


  const getSortIcon = (field: keyof Product) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    )
  }

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getDiscountBadge = (discountPercent: number | null) => {
    if (!discountPercent) return null
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        {discountPercent}% OFF
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    // Generate color based on type string for consistent coloring
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    ]
    
    // Simple hash function to get consistent color for each type
    const hash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colorClass = colors[hash % colors.length]
    
    return (
      <Badge className={colorClass}>
        {type}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your product inventory, pricing, and details
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, company, type, or color..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={companyFilter}
            onValueChange={(value) => {
              setCompanyFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Companies</SelectItem>
              {uniqueCompanies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Select
            value={priceRange}
            onValueChange={(value) => {
              setPriceRange(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Prices</SelectItem>
              <SelectItem value="UNDER_25K">Under ₹25,000</SelectItem>
              <SelectItem value="25K_50K">₹25,000 - ₹50,000</SelectItem>
              <SelectItem value="50K_100K">₹50,000 - ₹1,00,000</SelectItem>
              <SelectItem value="ABOVE_100K">Above ₹1,00,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    {getSortIcon('id')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Product
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center">
                    Company
                    {getSortIcon('company')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {getSortIcon('type')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Color</TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end">
                    Price
                    {getSortIcon('price')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      {product.offer && (
                        <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {product.offer.substring(0, 30)}
                          {product.offer.length > 30 && '...'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{product.company}</TableCell>
                    <TableCell>{getTypeBadge(product.type)}</TableCell>
                    <TableCell className="text-right">
                      {product.color ? (
                        <div className="flex items-center justify-end gap-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{product.color}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        {product.discountedPrice ? (
                          <>
                            <span className="font-semibold text-green-600">
                              {formatPrice(product.discountedPrice)}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {getDiscountBadge(product.discountPercent)}
                    </TableCell>
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{' '}
            {Math.min(endIndex, filteredAndSortedProducts.length)} of{' '}
            {filteredAndSortedProducts.length} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Complete information about the product</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Product ID</span>
                  </div>
                  <p className="text-sm">{selectedProduct.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="font-medium">Shop ID</span>
                  </div>
                  <p className="text-sm">{selectedProduct.shopId}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Product Name</span>
                  </div>
                  <p className="text-lg font-semibold">{selectedProduct.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Company</span>
                  </div>
                  <p className="text-sm font-medium">{selectedProduct.company}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">Type</span>
                  </div>
                  <div>{getTypeBadge(selectedProduct.type)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    <span className="font-medium">Color</span>
                  </div>
                  <p className="text-sm">{selectedProduct.color || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-medium">Warranty</span>
                  </div>
                  <p className="text-sm">
                    {selectedProduct.warrantyPeriod || 'No warranty'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-medium">Original Price</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-medium">Discounted Price</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">
                    {selectedProduct.discountedPrice
                      ? formatPrice(selectedProduct.discountedPrice)
                      : 'No discount'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Percent className="h-4 w-4" />
                    <span className="font-medium">Discount</span>
                  </div>
                  <div>
                    {selectedProduct.discountPercent ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-green-600">
                          {selectedProduct.discountPercent}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          (Save{' '}
                          {formatPrice(
                            selectedProduct.price -
                              (selectedProduct.discountedPrice || selectedProduct.price)
                          )}
                          )
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No discount</span>
                    )}
                  </div>
                </div>
                {selectedProduct.offer && (
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span className="font-medium">Special Offer</span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        {selectedProduct.offer}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created At</span>
                  </div>
                  <p className="text-sm">
                    {selectedProduct.createdAt.toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm">
                    {selectedProduct.updatedAt.toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Make changes to product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editForm.company}
                    onChange={(e) =>
                      setEditForm({ ...editForm, company: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Input
                    id="edit-type"
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <Input
                    id="edit-color"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-warranty">Warranty Period</Label>
                  <Input
                    id="edit-warranty"
                    value={editForm.warrantyPeriod}
                    onChange={(e) =>
                      setEditForm({ ...editForm, warrantyPeriod: e.target.value })
                    }
                    placeholder="e.g., 1 Year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Original Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-discounted-price">Discounted Price (₹)</Label>
                  <Input
                    id="edit-discounted-price"
                    type="number"
                    value={editForm.discountedPrice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, discountedPrice: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-offer">Special Offer</Label>
                  <Textarea
                    id="edit-offer"
                    value={editForm.offer}
                    onChange={(e) => setEditForm({ ...editForm, offer: e.target.value })}
                    placeholder="Optional - e.g., Bank Offer, Free Gift, etc."
                    rows={3}
                  />
                </div>
              </div>
              {editForm.price && editForm.discountedPrice && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm font-medium mb-2">Calculated Discount:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(
                      ((parseFloat(editForm.price) -
                        parseFloat(editForm.discountedPrice)) /
                        parseFloat(editForm.price)) *
                      100
                    ).toFixed(1)}
                    % OFF
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Save{' '}
                    {formatPrice(
                      parseFloat(editForm.price) - parseFloat(editForm.discountedPrice)
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product{' '}
              <span className="font-semibold">{selectedProduct?.name}</span> and remove it
              from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProductManagementPage
