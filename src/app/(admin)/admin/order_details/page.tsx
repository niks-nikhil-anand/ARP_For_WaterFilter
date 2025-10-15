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
  ShoppingCart,
  Package,
  Store,
  User,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react'

// Demo data based on Prisma Order model
const demoOrders = [
  {
    id: 1,
    productId: 1,
    productName: 'Kent Grand Plus RO + UV + UF + TDS Controller Water Purifier',
    shopId: 1,
    shopName: 'AquaPure Solutions - Indiranagar',
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun.mehta@email.com',
    customerPhone: '+91 98765 43210',
    orderStatus: 'Delivered',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    id: 2,
    productId: 2,
    productName: 'Aquaguard Aura RO + UV + UF + Active Copper Water Purifier',
    shopId: 1,
    shopName: 'AquaPure Solutions - Indiranagar',
    customerName: 'Priya Nair',
    customerEmail: 'priya.nair@email.com',
    customerPhone: '+91 98765 43211',
    orderStatus: 'Processing',
    createdAt: new Date('2024-10-03'),
    updatedAt: new Date('2024-10-03'),
  },
  {
    id: 3,
    productId: 3,
    productName: 'Livpure Glo Star RO + UV + Mineralizer Water Purifier',
    shopId: 2,
    shopName: 'WaterTech Hub - Koramangala',
    customerName: 'Rajesh Kumar',
    customerEmail: 'rajesh.k@email.com',
    customerPhone: '+91 98765 43212',
    orderStatus: 'Delivered',
    createdAt: new Date('2024-09-28'),
    updatedAt: new Date('2024-10-02'),
  },
  {
    id: 4,
    productId: 4,
    productName: 'AO Smith Z9 Green RO Hot & Cold Water Purifier',
    shopId: 2,
    shopName: 'WaterTech Hub - Koramangala',
    customerName: 'Sneha Sharma',
    customerEmail: 'sneha.sharma@email.com',
    customerPhone: '+91 98765 43213',
    orderStatus: 'Shipped',
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-10-08'),
  },
  {
    id: 5,
    productId: 5,
    productName: 'Blue Star Aristo RO + UV + UF Water Purifier',
    shopId: 1,
    shopName: 'AquaPure Solutions - Indiranagar',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@email.com',
    customerPhone: '+91 98765 43214',
    orderStatus: 'Cancelled',
    createdAt: new Date('2024-09-25'),
    updatedAt: new Date('2024-09-26'),
  },
  {
    id: 6,
    productId: 6,
    productName: 'HUL Pureit Copper+ RO Water Purifier',
    shopId: 3,
    shopName: 'Premium Water Systems - Whitefield',
    customerName: 'Anjali Reddy',
    customerEmail: 'anjali.reddy@email.com',
    customerPhone: '+91 98765 43215',
    orderStatus: 'Delivered',
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-09-25'),
  },
  {
    id: 7,
    productId: 7,
    productName: 'Aquaguard Marvel RO + UV + Active Copper Water Purifier',
    shopId: 3,
    shopName: 'Premium Water Systems - Whitefield',
    customerName: 'Karthik Rao',
    customerEmail: 'karthik.rao@email.com',
    customerPhone: '+91 98765 43216',
    orderStatus: 'Processing',
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 8,
    productId: 8,
    productName: 'Kent Supreme Alkaline RO + UV + UF + TDS Controller Water Purifier',
    shopId: 2,
    shopName: 'WaterTech Hub - Koramangala',
    customerName: 'Deepa Menon',
    customerEmail: 'deepa.menon@email.com',
    customerPhone: '+91 98765 43217',
    orderStatus: 'Shipped',
    createdAt: new Date('2024-10-07'),
    updatedAt: new Date('2024-10-09'),
  },
  {
    id: 9,
    productId: 9,
    productName: 'AO Smith X2 UV + UF Water Purifier',
    shopId: 1,
    shopName: 'AquaPure Solutions - Indiranagar',
    customerName: 'Amit Patel',
    customerEmail: 'amit.patel@email.com',
    customerPhone: '+91 98765 43218',
    orderStatus: 'Delivered',
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-09-20'),
  },
  {
    id: 10,
    productId: 10,
    productName: 'Blue Star Eleanor RO + UV + UF + Taste Enhancer Water Purifier',
    shopId: 3,
    shopName: 'Premium Water Systems - Whitefield',
    customerName: 'Sunita Iyer',
    customerEmail: 'sunita.iyer@email.com',
    customerPhone: '+91 98765 43219',
    orderStatus: 'Processing',
    createdAt: new Date('2024-10-12'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 11,
    productId: 11,
    productName: 'Havells Max RO + UV + Mineralizer Water Purifier',
    shopId: 2,
    shopName: 'WaterTech Hub - Koramangala',
    customerName: 'Rahul Krishnan',
    customerEmail: 'rahul.k@email.com',
    customerPhone: '+91 98765 43220',
    orderStatus: 'Delivered',
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-15'),
  },
  {
    id: 12,
    productId: 12,
    productName: 'Aquasure Amaze RO + UV + MTDS Water Purifier',
    shopId: 1,
    shopName: 'AquaPure Solutions - Indiranagar',
    customerName: 'Meera Nair',
    customerEmail: 'meera.nair@email.com',
    customerPhone: '+91 98765 43221',
    orderStatus: 'Shipped',
    createdAt: new Date('2024-10-11'),
    updatedAt: new Date('2024-10-13'),
  },
  {
    id: 13,
    productId: 13,
    productName: 'Faber Galaxy Plus RO + UV + UF + MAT Water Purifier',
    shopId: 3,
    shopName: 'Premium Water Systems - Whitefield',
    customerName: 'Sanjay Gupta',
    customerEmail: 'sanjay.gupta@email.com',
    customerPhone: '+91 98765 43222',
    orderStatus: 'Processing',
    createdAt: new Date('2024-10-14'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 14,
    productId: 14,
    productName: 'Livpure Pep Pro Plus RO + UV + UF + Taste Enhancer Water Purifier',
    shopId: 2,
    shopName: 'WaterTech Hub - Koramangala',
    customerName: 'Lakshmi Prasad',
    customerEmail: 'lakshmi.prasad@email.com',
    customerPhone: '+91 98765 43223',
    orderStatus: 'Delivered',
    createdAt: new Date('2024-09-05'),
    updatedAt: new Date('2024-09-10'),
  },
  {
    id: 15,
    productId: 1,
    productName: 'Kent Grand Plus RO + UV + UF + TDS Controller Water Purifier',
    shopId: 1,
    shopName: 'AquaPure Solutions - Indiranagar',
    customerName: 'Ramesh Babu',
    customerEmail: 'ramesh.babu@email.com',
    customerPhone: '+91 98765 43224',
    orderStatus: 'Cancelled',
    createdAt: new Date('2024-10-08'),
    updatedAt: new Date('2024-10-09'),
  },
]

type Order = typeof demoOrders[0]

const OrderManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>(demoOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [shopFilter, setShopFilter] = useState('ALL')
  const [sortField, setSortField] = useState<keyof Order | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Form states
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderStatus: '',
  })

  const [addForm, setAddForm] = useState({
    productName: '',
    shopName: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderStatus: 'Processing',
  })

  // Get unique values for filters
  const uniqueShops = Array.from(new Set(demoOrders.map((o) => o.shopName))).sort()
  const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled']

  // Filtering and sorting logic
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shopName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter
      const matchesShop = shopFilter === 'ALL' || order.shopName === shopFilter

      return matchesSearch && matchesStatus && matchesShop
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
  }, [orders, searchTerm, statusFilter, shopFilter, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredAndSortedOrders.slice(startIndex, endIndex)

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: orders.length,
      processing: orders.filter((o) => o.orderStatus === 'Processing').length,
      shipped: orders.filter((o) => o.orderStatus === 'Shipped').length,
      delivered: orders.filter((o) => o.orderStatus === 'Delivered').length,
      cancelled: orders.filter((o) => o.orderStatus === 'Cancelled').length,
    }
  }, [orders])

  // Sort handler
  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // CRUD handlers
  const handleView = (order: Order) => {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  const handleEdit = (order: Order) => {
    setSelectedOrder(order)
    setEditForm({
      customerName: order.customerName,
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      orderStatus: order.orderStatus,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (order: Order) => {
    setSelectedOrder(order)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedOrder) {
      setOrders(orders.filter((o) => o.id !== selectedOrder.id))
      setDeleteDialogOpen(false)
      setSelectedOrder(null)
    }
  }

  const saveEdit = () => {
    if (selectedOrder) {
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                customerName: editForm.customerName,
                customerEmail: editForm.customerEmail || null,
                customerPhone: editForm.customerPhone || null,
                orderStatus: editForm.orderStatus,
                updatedAt: new Date(),
              }
            : o
        )
      )
      setEditDialogOpen(false)
      setSelectedOrder(null)
    }
  }

  const handleAddOrder = () => {
    const newOrder: Order = {
      id: Math.max(...orders.map((o) => o.id)) + 1,
      productId: Math.floor(Math.random() * 14) + 1,
      productName: addForm.productName,
      shopId: Math.floor(Math.random() * 3) + 1,
      shopName: addForm.shopName,
      customerName: addForm.customerName,
      customerEmail: addForm.customerEmail || null,
      customerPhone: addForm.customerPhone || null,
      orderStatus: addForm.orderStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setOrders([newOrder, ...orders])
    setAddDialogOpen(false)
    setAddForm({
      productName: '',
      shopName: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      orderStatus: 'Processing',
    })
  }

  const getSortIcon = (field: keyof Order) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage customer orders across all shops
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Order
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="border rounded-lg p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">Processing</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {stats.processing}
            </p>
          </div>
          <div className="border rounded-lg p-4 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-2">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Shipped</span>
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {stats.shipped}
            </p>
          </div>
          <div className="border rounded-lg p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Delivered</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats.delivered}
            </p>
          </div>
          <div className="border rounded-lg p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">Cancelled</span>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {stats.cancelled}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, product, or shop..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {orderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={shopFilter}
            onValueChange={(value) => {
              setShopFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Shops</SelectItem>
              {uniqueShops.map((shop) => (
                <SelectItem key={shop} value={shop}>
                  {shop}
                </SelectItem>
              ))}
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
                    Order ID
                    {getSortIcon('id')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center">
                    Customer
                    {getSortIcon('customerName')}
                  </div>
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead
                  className="cursor-pointer select-none text-center"
                  onClick={() => handleSort('orderStatus')}
                >
                  <div className="flex items-center justify-center">
                    Status
                    {getSortIcon('orderStatus')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Order Date
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No orders found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.customerEmail || 'No email'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-xs">
                        <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-2">{order.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.shopName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.orderStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {order.createdAt.toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(order)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(order)}
                          title="Edit order"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(order)}
                          title="Delete order"
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedOrders.length)} of{' '}
            {filteredAndSortedOrders.length} orders
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

      {/* Add Order Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
            <DialogDescription>Create a new order for a customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-product">Product Name *</Label>
              <Input
                id="add-product"
                value={addForm.productName}
                onChange={(e) => setAddForm({ ...addForm, productName: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-shop">Shop Name *</Label>
              <Input
                id="add-shop"
                value={addForm.shopName}
                onChange={(e) => setAddForm({ ...addForm, shopName: e.target.value })}
                placeholder="Enter shop name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-customer-name">Customer Name *</Label>
              <Input
                id="add-customer-name"
                value={addForm.customerName}
                onChange={(e) => setAddForm({ ...addForm, customerName: e.target.value })}
                placeholder="Customer's full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-customer-email">Customer Email</Label>
                <Input
                  id="add-customer-email"
                  type="email"
                  value={addForm.customerEmail}
                  onChange={(e) =>
                    setAddForm({ ...addForm, customerEmail: e.target.value })
                  }
                  placeholder="customer@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-customer-phone">Customer Phone</Label>
                <Input
                  id="add-customer-phone"
                  value={addForm.customerPhone}
                  onChange={(e) =>
                    setAddForm({ ...addForm, customerPhone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-status">Order Status *</Label>
              <Select
                value={addForm.orderStatus}
                onValueChange={(value) => setAddForm({ ...addForm, orderStatus: value })}
              >
                <SelectTrigger id="add-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddOrder}
              disabled={
                !addForm.productName || !addForm.shopName || !addForm.customerName
              }
            >
              Add Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete information about the order</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-medium">Order ID</span>
                  </div>
                  <p className="text-lg font-semibold">#{selectedOrder.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Product ID</span>
                  </div>
                  <p className="text-sm">{selectedOrder.productId}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Product Name</span>
                  </div>
                  <p className="text-sm font-medium">{selectedOrder.productName}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4" />
                    <span className="font-medium">Shop</span>
                  </div>
                  <p className="text-sm">
                    {selectedOrder.shopName} (ID: {selectedOrder.shopId})
                  </p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Customer Name</span>
                  </div>
                  <p className="text-lg font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Customer Email</span>
                  </div>
                  <p className="text-sm">
                    {selectedOrder.customerEmail || 'Not provided'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Customer Phone</span>
                  </div>
                  <p className="text-sm">
                    {selectedOrder.customerPhone || 'Not provided'}
                  </p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-medium">Order Status</span>
                  </div>
                  <div>{getStatusBadge(selectedOrder.orderStatus)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Order Date</span>
                  </div>
                  <p className="text-sm">
                    {selectedOrder.createdAt.toLocaleDateString('en-IN', {
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
                    {selectedOrder.updatedAt.toLocaleDateString('en-IN', {
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update order and customer information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customer-name">Customer Name</Label>
                <Input
                  id="edit-customer-name"
                  value={editForm.customerName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, customerName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customer-email">Customer Email</Label>
                  <Input
                    id="edit-customer-email"
                    type="email"
                    value={editForm.customerEmail}
                    onChange={(e) =>
                      setEditForm({ ...editForm, customerEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customer-phone">Customer Phone</Label>
                  <Input
                    id="edit-customer-phone"
                    value={editForm.customerPhone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, customerPhone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Order Status</Label>
                <Select
                  value={editForm.orderStatus}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, orderStatus: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              This action cannot be undone. This will permanently delete order{' '}
              <span className="font-semibold">#{selectedOrder?.id}</span> for customer{' '}
              <span className="font-semibold">{selectedOrder?.customerName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default OrderManagementPage
