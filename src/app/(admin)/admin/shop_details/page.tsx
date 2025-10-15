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
  Store,
  MapPin,
  User,
  Calendar,
  Package,
  ShoppingCart,
} from 'lucide-react'

// Demo data based on Prisma Shop model
const demoShops = [
  {
    id: 1,
    name: 'AquaPure Solutions - Indiranagar',
    address: '128, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bangalore - 560038',
    userId: 1,
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh.kumar@email.com',
    productCount: 15,
    orderCount: 127,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 2,
    name: 'WaterTech Hub - Koramangala',
    address: '45, 5th Block, Koramangala, Bangalore - 560095',
    userId: 2,
    userName: 'Priya Sharma',
    userEmail: 'priya.sharma@email.com',
    productCount: 22,
    orderCount: 198,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 3,
    name: 'Premium Water Systems - Whitefield',
    address: 'Shop No. 12, Phoenix Marketcity, Whitefield, Bangalore - 560066',
    userId: 3,
    userName: 'Amit Patel',
    userEmail: 'amit.patel@email.com',
    productCount: 18,
    orderCount: 156,
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2024-10-13'),
  },
  {
    id: 4,
    name: 'AquaLife Store - Jayanagar',
    address: '234, 4th Block, Jayanagar, Bangalore - 560011',
    userId: 4,
    userName: 'Sunita Reddy',
    userEmail: 'sunita.reddy@email.com',
    productCount: 12,
    orderCount: 89,
    createdAt: new Date('2023-07-05'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 5,
    name: 'Kent Exclusive Showroom - MG Road',
    address: 'Trinity Circle, MG Road, Bangalore - 560001',
    userId: 5,
    userName: 'Vikram Singh',
    userEmail: 'vikram.singh@email.com',
    productCount: 25,
    orderCount: 312,
    createdAt: new Date('2023-08-18'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 6,
    name: 'Aquaguard Service Center - Malleshwaram',
    address: '67, 8th Cross, Malleshwaram, Bangalore - 560003',
    userId: 6,
    userName: 'Deepa Menon',
    userEmail: 'deepa.menon@email.com',
    productCount: 20,
    orderCount: 245,
    createdAt: new Date('2023-09-25'),
    updatedAt: new Date('2024-10-11'),
  },
  {
    id: 7,
    name: 'Blue Star Authorized Dealer - BTM Layout',
    address: '123, 2nd Stage, BTM Layout, Bangalore - 560076',
    userId: 7,
    userName: 'Karthik Rao',
    userEmail: 'karthik.rao@email.com',
    productCount: 17,
    orderCount: 134,
    createdAt: new Date('2023-11-12'),
    updatedAt: new Date('2024-10-09'),
  },
  {
    id: 8,
    name: 'Livpure Smart Water - HSR Layout',
    address: 'Sector 1, HSR Layout, Bangalore - 560102',
    userId: 8,
    userName: 'Ananya Iyer',
    userEmail: 'ananya.iyer@email.com',
    productCount: 14,
    orderCount: 98,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 9,
    name: 'AO Smith Experience Center - Sarjapur Road',
    address: 'Marathahalli Bridge, Sarjapur Road, Bangalore - 560103',
    userId: 9,
    userName: 'Ramesh Nair',
    userEmail: 'ramesh.nair@email.com',
    productCount: 28,
    orderCount: 267,
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 10,
    name: 'PureIt Water Solutions - Electronic City',
    address: 'Phase 1, Electronic City, Bangalore - 560100',
    userId: 10,
    userName: 'Meera Krishnan',
    userEmail: 'meera.krishnan@email.com',
    productCount: 19,
    orderCount: 176,
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 11,
    name: 'Water Care Solutions - Yelahanka',
    address: '89, Main Road, Yelahanka New Town, Bangalore - 560064',
    userId: 11,
    userName: 'Suresh Babu',
    userEmail: 'suresh.babu@email.com',
    productCount: 13,
    orderCount: 72,
    createdAt: new Date('2024-04-18'),
    updatedAt: new Date('2024-10-11'),
  },
  {
    id: 12,
    name: 'Crystal Water Systems - Rajajinagar',
    address: '56, 1st Block, Rajajinagar, Bangalore - 560010',
    userId: 12,
    userName: 'Lakshmi Prasad',
    userEmail: 'lakshmi.prasad@email.com',
    productCount: 16,
    orderCount: 143,
    createdAt: new Date('2024-05-30'),
    updatedAt: new Date('2024-10-13'),
  },
]

type Shop = typeof demoShops[0]

const ShopManagementPage = () => {
  const [shops, setShops] = useState<Shop[]>(demoShops)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Shop | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    userName: '',
    userEmail: '',
  })

  const [addForm, setAddForm] = useState({
    name: '',
    address: '',
    userName: '',
    userEmail: '',
  })

  // Filtering and sorting logic
  const filteredAndSortedShops = useMemo(() => {
    let filtered = shops.filter((shop) => {
      const matchesSearch =
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.userEmail.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
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
  }, [shops, searchTerm, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedShops.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentShops = filteredAndSortedShops.slice(startIndex, endIndex)

  // Sort handler
  const handleSort = (field: keyof Shop) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // CRUD handlers
  const handleView = (shop: Shop) => {
    setSelectedShop(shop)
    setViewDialogOpen(true)
  }

  const handleEdit = (shop: Shop) => {
    setSelectedShop(shop)
    setEditForm({
      name: shop.name,
      address: shop.address || '',
      userName: shop.userName,
      userEmail: shop.userEmail,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (shop: Shop) => {
    setSelectedShop(shop)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedShop) {
      setShops(shops.filter((s) => s.id !== selectedShop.id))
      setDeleteDialogOpen(false)
      setSelectedShop(null)
    }
  }

  const saveEdit = () => {
    if (selectedShop) {
      setShops(
        shops.map((s) =>
          s.id === selectedShop.id
            ? {
                ...s,
                name: editForm.name,
                address: editForm.address || null,
                userName: editForm.userName,
                userEmail: editForm.userEmail,
                updatedAt: new Date(),
              }
            : s
        )
      )
      setEditDialogOpen(false)
      setSelectedShop(null)
    }
  }

  const handleAddShop = () => {
    const newShop: Shop = {
      id: Math.max(...shops.map((s) => s.id)) + 1,
      name: addForm.name,
      address: addForm.address || null,
      userId: Math.floor(Math.random() * 1000) + 1,
      userName: addForm.userName,
      userEmail: addForm.userEmail,
      productCount: 0,
      orderCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setShops([...shops, newShop])
    setAddDialogOpen(false)
    setAddForm({
      name: '',
      address: '',
      userName: '',
      userEmail: '',
    })
  }

  const getSortIcon = (field: keyof Shop) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    )
  }

  const getStatusBadge = (productCount: number, orderCount: number) => {
    if (orderCount > 200) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          High Performance
        </Badge>
      )
    } else if (orderCount > 100) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Active
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          Growing
        </Badge>
      )
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shop Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your shops, owners, and inventory across locations
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Shop
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops by name, address, owner..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Store className="h-4 w-4" />
              <span className="text-sm font-medium">Total Shops</span>
            </div>
            <p className="text-2xl font-bold">{shops.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Total Products</span>
            </div>
            <p className="text-2xl font-bold">
              {shops.reduce((acc, shop) => acc + shop.productCount, 0)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">
              {shops.reduce((acc, shop) => acc + shop.orderCount, 0)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Active Owners</span>
            </div>
            <p className="text-2xl font-bold">{new Set(shops.map((s) => s.userId)).size}</p>
          </div>
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
                    Shop Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead>Address</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center">
                    Owner
                    {getSortIcon('userName')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentShops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Store className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No shops found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentShops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{shop.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {shop.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-xs">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {shop.address || 'No address provided'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{shop.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {shop.userEmail}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{shop.productCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{shop.orderCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(shop.productCount, shop.orderCount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(shop)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(shop)}
                          title="Edit shop"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(shop)}
                          title="Delete shop"
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedShops.length)} of{' '}
            {filteredAndSortedShops.length} shops
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

      {/* Add Shop Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Shop</DialogTitle>
            <DialogDescription>Create a new shop with owner details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Shop Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Enter shop name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address">Address</Label>
              <Textarea
                id="add-address"
                value={addForm.address}
                onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-owner-name">Owner Name *</Label>
                <Input
                  id="add-owner-name"
                  value={addForm.userName}
                  onChange={(e) => setAddForm({ ...addForm, userName: e.target.value })}
                  placeholder="Owner's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-owner-email">Owner Email *</Label>
                <Input
                  id="add-owner-email"
                  type="email"
                  value={addForm.userEmail}
                  onChange={(e) => setAddForm({ ...addForm, userEmail: e.target.value })}
                  placeholder="owner@email.com"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddShop}
              disabled={!addForm.name || !addForm.userName || !addForm.userEmail}
            >
              Add Shop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shop Details</DialogTitle>
            <DialogDescription>Complete information about the shop</DialogDescription>
          </DialogHeader>
          {selectedShop && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4" />
                    <span className="font-medium">Shop ID</span>
                  </div>
                  <p className="text-sm">{selectedShop.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">User ID</span>
                  </div>
                  <p className="text-sm">{selectedShop.userId}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4" />
                    <span className="font-medium">Shop Name</span>
                  </div>
                  <p className="text-lg font-semibold">{selectedShop.name}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Address</span>
                  </div>
                  <p className="text-sm">
                    {selectedShop.address || 'No address provided'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Owner Name</span>
                  </div>
                  <p className="text-sm font-medium">{selectedShop.userName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Owner Email</span>
                  </div>
                  <p className="text-sm">{selectedShop.userEmail}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Total Products</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedShop.productCount}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-medium">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedShop.orderCount}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4" />
                    <span className="font-medium">Performance Status</span>
                  </div>
                  <div>
                    {getStatusBadge(selectedShop.productCount, selectedShop.orderCount)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created At</span>
                  </div>
                  <p className="text-sm">
                    {selectedShop.createdAt.toLocaleDateString('en-IN', {
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
                    {selectedShop.updatedAt.toLocaleDateString('en-IN', {
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
            <DialogTitle>Edit Shop</DialogTitle>
            <DialogDescription>Make changes to shop information</DialogDescription>
          </DialogHeader>
          {selectedShop && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Shop Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-owner-name">Owner Name</Label>
                  <Input
                    id="edit-owner-name"
                    value={editForm.userName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, userName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-owner-email">Owner Email</Label>
                  <Input
                    id="edit-owner-email"
                    type="email"
                    value={editForm.userEmail}
                    onChange={(e) =>
                      setEditForm({ ...editForm, userEmail: e.target.value })
                    }
                  />
                </div>
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
              This action cannot be undone. This will permanently delete the shop{' '}
              <span className="font-semibold">{selectedShop?.name}</span> and all associated
              products and orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Shop
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ShopManagementPage
