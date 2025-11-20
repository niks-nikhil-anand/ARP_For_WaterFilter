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
  Building2,
  MapPin,
  Phone,
  Calendar,
  Users,
  Briefcase,
} from 'lucide-react'

import { getShops, createShop, updateShop, deleteShop } from '@/app/actions/shop'
import type { Shop } from '@/app/actions/shop'
import { useEffect } from 'react'
import { toast } from 'sonner'

// Demo data removed




const ShopManagementPage = () => {
  const [shops, setShops] = useState<Shop[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [sortField, setSortField] = useState<keyof Shop | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    loadShops()
  }, [])

  const loadShops = async () => {
    const result = await getShops()
    if (result.success && result.data) {
      setShops(result.data)
    } else {
      console.error('Failed to load shops')
    }
  }

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
  })

  const [addForm, setAddForm] = useState({
    name: '',
    type: '',
  })

  // Get unique values for filters
  // Note: Shop doesn't have a type field, so we might need to adjust this or remove type filtering
  // For now, we'll comment out type filtering logic or adapt it if we add a type field later
  // const uniqueTypes = Array.from(new Set(agencies.map((a) => a.type))).sort()
  const uniqueTypes: string[] = []

  // Filtering and sorting logic
  const filteredAndSortedShops = useMemo(() => {
    const filtered = shops.filter((shop) => {
      const matchesSearch =
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // shop.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.user.addresses.some((addr) =>
          addr.locality?.toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesType = typeFilter === 'ALL' // || shop.address === typeFilter

      return matchesSearch && matchesType
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
  }, [shops, searchTerm, typeFilter, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedShops.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentShops = filteredAndSortedShops.slice(startIndex, endIndex)

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: shops.length,
      totalAddresses: shops.reduce((acc, a) => acc + a.user.addresses.length, 0),
      servicePartners: 0, // shops.filter((a) => a.type === 'Service Partner').length,
      authorizedDealers: 0, // shops.filter((a) => a.type === 'Authorized Dealer').length,
    }
  }, [shops])

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
      type: shop.address || '', // Using address as type placeholder
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (shop: Shop) => {
    setSelectedShop(shop)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedShop) {
      const result = await deleteShop(selectedShop.id)
      if (result.success) {
        setShops(shops.filter((a) => a.id !== selectedShop.id))
        setDeleteDialogOpen(false)
        setSelectedShop(null)
        toast.success('Shop deleted successfully')
      } else {
        console.error('Failed to delete shop')
        toast.error('Failed to delete shop')
      }
    }
  }

  const saveEdit = async () => {
    if (selectedShop) {
      const result = await updateShop(selectedShop.id, {
        name: editForm.name,
        address: editForm.type // Using type field for address temporarily as per plan
      })

      if (result.success && result.data) {
        setShops(shops.map((a) => (a.id === selectedShop.id ? result.data! : a)))
        setEditDialogOpen(false)
        setSelectedShop(null)
        toast.success('Shop updated successfully')
      } else {
        console.error('Failed to update shop')
        toast.error('Failed to update shop')
      }
    }
  }

  const handleAddShop = async () => {
    // Note: userId is hardcoded for now as we don't have a user selection UI yet
    // In a real app, we would select a user to be the shop owner
    const result = await createShop({
      name: addForm.name,
      address: addForm.type, // Using type field for address temporarily
      userId: Math.floor(Math.random() * 1000) // Placeholder userId
    })

    if (result.success && result.data) {
      setShops([result.data, ...shops])
      setAddDialogOpen(false)
      setAddForm({
        name: '',
        type: '',
      })
      toast.success('Shop added successfully')
    } else {
      console.error('Failed to add shop')
      toast.error('Failed to add shop')
    }
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

  // const getTypeBadge = (type: string | null) => {
  //   if (!type) return null
  //   // ... implementation removed as Shop doesn't have type enum yet
  //   return <Badge>{type}</Badge>
  // }

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
            <h1 className="text-3xl font-bold tracking-tight">Shop Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage shops, dealers, and partners
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Shop
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Total Shops</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Total Locations</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalAddresses}</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Service Partners</span>
            </div>
            <p className="text-2xl font-bold">{stats.servicePartners}</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm font-medium">Authorized Dealers</span>
            </div>
            <p className="text-2xl font-bold">{stats.authorizedDealers}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by shop name, type, or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
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
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center">
                    Address
                    {getSortIcon('address')}
                  </div>
                </TableHead>
                <TableHead className="text-center">Locations</TableHead>
                <TableHead>Primary Address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created Date
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentShops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No shops found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentShops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">#{shop.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{shop.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{shop.address || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{shop.user.addresses.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {shop.user.addresses.length > 0 ? (
                        <div className="text-sm">
                          <div className="font-medium">{shop.user.addresses[0].locality}</div>
                          <div className="text-xs text-muted-foreground">
                            {shop.user.addresses[0].state}, {shop.user.addresses[0].pincode}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No address</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* shop.addresses is not available on Shop type directly, need to check schema or use user.addresses */}
                      {shop.user.addresses.length > 0 && shop.user.addresses[0].phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{shop.user.addresses[0].phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(shop.createdAt)}</span>
                      </div>
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedShops.length)}{' '}
            of {filteredAndSortedShops.length} shops
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
            <DialogDescription>Create a new shop or service partner</DialogDescription>
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
              <Label htmlFor="add-type">Address</Label>
              <Input
                id="add-type"
                value={addForm.type}
                onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                placeholder="Enter shop address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddShop} disabled={!addForm.name}>
              Add Shop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shop Details</DialogTitle>
            <DialogDescription>Complete information about the shop</DialogDescription>
          </DialogHeader>
          {selectedShop && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Shop ID</span>
                  </div>
                  <p className="text-lg font-semibold">#{selectedShop.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Address Count</span>
                  </div>
                  <div>{selectedShop.user.addresses.length}</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Shop Name</span>
                  </div>
                  <p className="text-lg font-semibold">{selectedShop.name}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Address</span>
                  </div>
                  <div>{selectedShop.address || 'No address provided'}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created At</span>
                  </div>
                  <p className="text-sm">{formatDate(selectedShop.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm">{formatDate(selectedShop.updatedAt)}</p>
                </div>
              </div>

              {/* Addresses Section */}
              {selectedShop.user.addresses.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Addresses</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedShop.user.addresses.map((address, index) => (
                      <div key={index} className="border rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant="outline">{address.type}</Badge>
                        </div>
                        <div className="space-y-1 text-muted-foreground">
                          <p>
                            {address.apartmentNo}, {address.locality}
                          </p>
                          <p>
                            {address.state} - {address.pincode}
                          </p>
                          {address.phone && (
                            <div className="flex items-center gap-1 mt-2">
                              <Phone className="h-3 w-3" />
                              <span>{address.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <DialogDescription>Update shop information</DialogDescription>
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
                <Label htmlFor="edit-type">Address</Label>
                <Input
                  id="edit-type"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                />
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
              addresses.
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
    </div>
  )
}

export default ShopManagementPage
