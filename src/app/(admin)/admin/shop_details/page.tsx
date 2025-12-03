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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  Search,
  Store,
  Pencil,
  Eye,
  Plus,
  Phone,
  Mail,
  MapPin,
  ArrowUpDown,
  Filter,
  X,
  Loader2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { deleteUser, updateUser, createUser, getShopOwners } from '@/actions/admin/users'
import { getShops, createOrUpdateShop } from '@/app/actions/shop'
import { createAddress, updateAddress } from '@/app/actions/address'
import { toast } from 'sonner'
import { ShopForm, ShopFormData } from '@/components/shop/ShopForm'

type AdminUser = {
  id: number
  name: string
  email: string
  mobile: string | null
  role: string
  status: string
  shops?: any[]
  createdAt: Date
  updatedAt: Date
}

const ShopDetailsPage = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [addressId, setAddressId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    loadAdminUsers()
  }, [sortBy, sortOrder, filterStatus, searchTerm])

  const loadAdminUsers = async () => {
    setLoading(true)
    const result = await getShopOwners({
      sortBy,
      sortOrder,
      filterBy: {
        status: filterStatus,
        search: searchTerm,
      },
    })

    if (result.success && result.data) {
      setAdminUsers(result.data)
    } else {
      console.error('Failed to load shop users')
      toast.error('Failed to load shop users')
    }
    setLoading(false)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleDeleteUser = async (user: AdminUser) => {
    const confirmed = confirm(`Delete shop owner ${user.name || user.email}?`)
    if (!confirmed) return

    const result = await deleteUser(user.id)
    if (result.success) {
      loadAdminUsers()
      toast.success('Shop owner deleted successfully')
    } else {
      toast.error('Failed to delete shop owner')
    }
  }

  const handleView = (user: AdminUser) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user)
    const shop = user.shops && user.shops[0]
    const address = shop?.addresses && shop.addresses[0]
    setAddressId(address?.id || null)
    setEditDialogOpen(true)
  }

  const getInitialDataForEdit = (): Partial<ShopFormData> => {
    if (!selectedUser) return {}
    const shop = selectedUser.shops && selectedUser.shops[0]
    const address = shop?.addresses && shop.addresses[0]

    return {
      name: selectedUser.name || '',
      email: selectedUser.email || '',
      mobile: selectedUser.mobile || '',
      status: selectedUser.status || 'ACTIVE',
      shopName: shop?.shopName || '',
      alternateMobile: shop?.alternateMobile || '',
      gstNumber: shop?.gstNumber || '',
      panNumber: shop?.panNumber || '',
      address: {
        apartmentNo: address?.apartmentNo || '',
        locality: address?.locality || '',
        state: address?.state || '',
        country: address?.country || '',
        pincode: address?.pincode || '',
        phone: address?.phone || '',
      },
    }
  }

  const handleUpdateShop = async (data: ShopFormData) => {
    if (!selectedUser) return
    setIsSubmitting(true)

    // Update user details
    const userResult = await updateUser(selectedUser.id, {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      status: data.status,
    })

    let addressResult = { success: true }

    // Create or update shop for this user
    const shopResult = await createOrUpdateShop(selectedUser.id, {
      name: data.name,
      shopName: data.shopName,
      alternateMobile: data.alternateMobile,
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
    })

    // Update or create address if shop was created/updated successfully
    if (shopResult.success && shopResult.data) {
      if (addressId) {
        // Update existing address
        addressResult = await updateAddress(addressId, data.address)
      } else if (data.address.apartmentNo || data.address.locality) {
        // Create new address if any field is filled
        addressResult = await createAddress({
          ...data.address,
          shopId: shopResult.data.id,
          userId: selectedUser.id,
        })
      }
    }

    setIsSubmitting(false)

    if (userResult.success && shopResult.success && addressResult.success) {
      loadAdminUsers()
      setEditDialogOpen(false)
      setSelectedUser(null)
      setAddressId(null)
      toast.success('Shop details updated successfully')
    } else {
      toast.error('Failed to update shop details')
    }
  }

  const handleCreateShop = async (data: ShopFormData) => {
    setIsSubmitting(true)
    try {
      // Create user with ADMIN role
      const userResult = await createUser({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: 'defaultPassword123', // Default password since field was removed
        role: 'ADMIN' as any,
        status: 'ACTIVE' as any,
      })

      if (!userResult.success || !userResult.data) {
        toast.error(userResult.error || 'Failed to create shop owner')
        setIsSubmitting(false)
        return
      }

      const userId = userResult.data.id

      // Create shop for the new user
      const shopResult = await createOrUpdateShop(userId, {
        name: data.name,
        shopName: data.shopName,
        alternateMobile: data.alternateMobile,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
      })

      // Create address if any field is filled
      let addressResult = { success: true }
      if (shopResult.success && shopResult.data &&
        (data.address.apartmentNo || data.address.locality)) {
        addressResult = await createAddress({
          ...data.address,
          shopId: shopResult.data.id,
          userId: userId,
        })
      }

      if (userResult.success && shopResult.success && addressResult.success) {
        loadAdminUsers()
        setAddDialogOpen(false)
        toast.success('Shop owner and shop created successfully')
      } else {
        toast.error('Failed to create shop')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Client-side filtering is no longer needed as we do it server-side
  const filteredUsers = adminUsers

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
              <h1 className="text-3xl font-bold tracking-tight">Shop Details</h1>
              <p className="text-muted-foreground mt-2">
                Manage shop owners (Admin & Super Admin) and their shop information
              </p>
            </div>
            <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Shop
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Store className="h-4 w-4" />
                <span className="text-sm font-medium">Total Shops</span>
              </div>
              <p className="text-2xl font-bold">{adminUsers.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Store className="h-4 w-4" />
                <span className="text-sm font-medium">With Shops</span>
              </div>
              <p className="text-2xl font-bold">
                {adminUsers.filter((u) => u.shops && u.shops.length > 0).length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Store className="h-4 w-4" />
                <span className="text-sm font-medium">With GST</span>
              </div>
              <p className="text-2xl font-bold">
                {adminUsers.filter((u) => u.shops && u.shops[0]?.gstNumber).length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, shop name, GST, or PAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />

          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>

            {(filterStatus !== 'ALL' || searchTerm) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterStatus('ALL')
                  setSearchTerm('')
                }}
                className="h-8 px-2 lg:px-3"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Owner Name
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Store className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No shop owners found matching your search' : 'No shop owners found'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const shop = user.shops && user.shops[0]
                    const address = shop?.addresses && shop.addresses[0]
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">#{user.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{user.name || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            user.role === 'SUPERADMIN'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.mobile && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{user.mobile}</span>
                              </div>
                            )}
                            {user.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{user.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {address ? (
                            <div className="flex items-start gap-2 max-w-[250px]">
                              <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-muted-foreground">
                                <div className="line-clamp-2">
                                  {address.apartmentNo && `${address.apartmentNo}, `}
                                  {address.locality}
                                </div>
                                <div className="text-xs">
                                  {address.pincode}
                                  {address.state && ` - ${address.state}`}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No address</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            user.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'BLOCKED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(user)}
                              title="View shop details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(user)}
                              title="Edit shop"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user)}
                              title="Delete shop owner"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* View Shop Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Shop Owner Details</DialogTitle>
            <DialogDescription>
              View complete shop owner and shop information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="font-medium">#{selectedUser.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Owner Name</Label>
                  <p className="font-medium">{selectedUser.name || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Mobile</Label>
                  <p className="font-medium">{selectedUser.mobile || '-'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Status</Label>
                <Badge className={
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : selectedUser.status === 'BLOCKED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }>
                  {selectedUser.status}
                </Badge>
              </div>
              {selectedUser.shops && selectedUser.shops[0] && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Shop Information</h3>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Shop Name</Label>
                    <p className="font-medium">{selectedUser.shops[0].shopName || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">GST Number</Label>
                      <p className="font-medium">{selectedUser.shops[0].gstNumber || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">PAN Number</Label>
                      <p className="font-medium">{selectedUser.shops[0].panNumber || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Alternate Mobile</Label>
                    <p className="font-medium">{selectedUser.shops[0].alternateMobile || '-'}</p>
                  </div>
                </>
              )}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Address Information</h3>
              </div>
              {/* Shop Addresses */}
              {selectedUser.shops && selectedUser.shops[0]?.addresses && selectedUser.shops[0].addresses.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Shop Addresses</Label>
                  <div className="space-y-2">
                    {selectedUser.shops[0].addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-md bg-muted/50">
                        {addr.apartmentNo && (
                          <p className="text-sm font-medium">{addr.apartmentNo}</p>
                        )}
                        <p className="text-sm">
                          {addr.locality && `${addr.locality}`}
                          {addr.locality && (addr.state || addr.country) && ', '}
                          {addr.state && `${addr.state}`}
                          {addr.state && addr.country && ', '}
                          {addr.country && addr.country}
                        </p>
                        {addr.pincode && (
                          <p className="text-sm text-muted-foreground">
                            Pincode: {addr.pincode}
                          </p>
                        )}
                        {addr.phone && (
                          <p className="text-sm text-muted-foreground">
                            Phone: {addr.phone}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No shop addresses added</p>
              )}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
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

      {/* Add Shop Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Shop</DialogTitle>
            <DialogDescription>
              Create a new shop owner account and shop
            </DialogDescription>
          </DialogHeader>
          <ShopForm
            mode="add"
            onSubmit={handleCreateShop}
            isSubmitting={isSubmitting}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Shop Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shop Details</DialogTitle>
            <DialogDescription>
              Update shop owner and shop information
            </DialogDescription>
          </DialogHeader>
          <ShopForm
            mode="edit"
            initialData={getInitialDataForEdit()}
            onSubmit={handleUpdateShop}
            isSubmitting={isSubmitting}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ShopDetailsPage
