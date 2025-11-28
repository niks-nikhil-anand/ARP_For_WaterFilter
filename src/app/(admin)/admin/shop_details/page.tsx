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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trash2,
  Search,
  Store,
  Pencil,
  Eye,
  Plus,
  Loader2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'

import { getUsersByRole, deleteUser, updateUser, createUser } from '@/actions/admin/users'
import { getShops, createOrUpdateShop } from '@/app/actions/shop'
import { createAddress, updateAddress } from '@/app/actions/address'
import { toast } from 'sonner'

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
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    status: '',
    shopName: '',
    alternateMobile: '',
    gstNumber: '',
    panNumber: '',
    address: {
      apartmentNo: '',
      locality: '',
      state: '',
      country: '',
      pincode: '',
      phone: '',
    },
  })
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'ADMIN',
    shopName: '',
    alternateMobile: '',
    gstNumber: '',
    panNumber: '',
    address: {
      apartmentNo: '',
      locality: '',
      state: '',
      country: '',
      pincode: '',
      phone: '',
    },
  })
  const [addressId, setAddressId] = useState<number | null>(null)
  const [isAddingShop, setIsAddingShop] = useState(false)

  useEffect(() => {
    loadAdminUsers()
  }, [])

  const loadAdminUsers = async () => {
    setLoading(true)
    // Load both ADMIN and SUPERADMIN users
    const adminResult = await getUsersByRole('ADMIN')
    const superAdminResult = await getUsersByRole('SUPERADMIN')

    const allUsers = [
      ...(adminResult.success && adminResult.data ? adminResult.data : []),
      ...(superAdminResult.success && superAdminResult.data ? superAdminResult.data : [])
    ]

    if (allUsers.length > 0) {
      // Fetch shops for each user
      const shopsResult = await getShops()
      if (shopsResult.success && shopsResult.data) {
        const usersWithShops = allUsers.map((user: any) => ({
          ...user,
          shops: shopsResult.data.filter((shop: any) => shop.userId === user.id)
        }))
        setAdminUsers(usersWithShops)
      } else {
        setAdminUsers(allUsers)
      }
    } else {
      console.error('Failed to load shop users')
      toast.error('Failed to load shop users')
    }
    setLoading(false)
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
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      status: user.status || 'ACTIVE',
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
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    // Update user details
    const userResult = await updateUser(selectedUser.id, {
      name: editForm.name,
      email: editForm.email,
      mobile: editForm.mobile,
      status: editForm.status,
    })

    let addressResult = { success: true }
    
    // Create or update shop for this user
    const shopResult = await createOrUpdateShop(selectedUser.id, {
      name: editForm.name,
      shopName: editForm.shopName,
      alternateMobile: editForm.alternateMobile,
      gstNumber: editForm.gstNumber,
      panNumber: editForm.panNumber,
    })

    // Update or create address if shop was created/updated successfully
    if (shopResult.success && shopResult.data) {
      if (addressId) {
        // Update existing address
        addressResult = await updateAddress(addressId, editForm.address)
      } else if (editForm.address.apartmentNo || editForm.address.locality) {
        // Create new address if any field is filled
        addressResult = await createAddress({
          ...editForm.address,
          shopId: shopResult.data.id,
          userId: selectedUser.id,
        })
      }
    }

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

  const handleAddShop = async () => {
    setIsAddingShop(true)
    try {
      // Create user with ADMIN role
      const userResult = await createUser({
        name: addForm.name,
        email: addForm.email,
        mobile: addForm.mobile,
        password: addForm.password,
        role: 'ADMIN' as any,
        status: 'ACTIVE' as any,
      })

      if (!userResult.success || !userResult.data) {
        toast.error(userResult.error || 'Failed to create shop owner')
        return
      }

      const userId = userResult.data.id

      // Create shop for the new user
      const shopResult = await createOrUpdateShop(userId, {
        name: addForm.name,
        shopName: addForm.shopName,
        alternateMobile: addForm.alternateMobile,
        gstNumber: addForm.gstNumber,
        panNumber: addForm.panNumber,
      })

      // Create address if any field is filled
      let addressResult = { success: true }
      if (shopResult.success && shopResult.data &&
          (addForm.address.apartmentNo || addForm.address.locality)) {
        addressResult = await createAddress({
          ...addForm.address,
          shopId: shopResult.data.id,
          userId: userId,
        })
      }

      if (userResult.success && shopResult.success && addressResult.success) {
        loadAdminUsers()
        setAddDialogOpen(false)
        setAddForm({
          name: '',
          email: '',
          mobile: '',
          password: '',
          role: 'ADMIN',
          shopName: '',
          alternateMobile: '',
          gstNumber: '',
          panNumber: '',
          address: {
            apartmentNo: '',
            locality: '',
            state: '',
            country: '',
            pincode: '',
            phone: '',
          },
        })
        toast.success('Shop owner and shop created successfully')
      } else {
        toast.error('Failed to create shop')
      }
    } finally {
      setIsAddingShop(false)
    }
  }

  // Filter users based on search term
  const filteredUsers = adminUsers.filter((user) => {
    const shop = user.shops && user.shops[0]
    return (
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop?.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop?.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop?.panNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

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

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <p className="text-muted-foreground">Loading...</p>
                    </TableCell>
                  </TableRow>
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
          <div className="space-y-6">
            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Owner Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Owner Name *</Label>
                  <Input
                    id="add-name"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="Enter owner name"
                    required
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-mobile">Mobile Number</Label>
                  <Input
                    id="add-mobile"
                    value={addForm.mobile}
                    onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-email">Email Address *</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="owner@email.com"
                    required
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-password">Password *</Label>
                  <Input
                    id="add-password"
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Enter password"
                    required
                    disabled={isAddingShop}
                  />
                </div>
              </div>
            </div>

            {/* Shop Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Shop Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-shopName">Shop Name</Label>
                  <Input
                    id="add-shopName"
                    value={addForm.shopName}
                    onChange={(e) => setAddForm({ ...addForm, shopName: e.target.value })}
                    placeholder="Enter shop name"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-alternateMobile">Alternate Mobile</Label>
                  <Input
                    id="add-alternateMobile"
                    value={addForm.alternateMobile}
                    onChange={(e) => setAddForm({ ...addForm, alternateMobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-gstNumber">GST Number</Label>
                  <Input
                    id="add-gstNumber"
                    value={addForm.gstNumber}
                    onChange={(e) => setAddForm({ ...addForm, gstNumber: e.target.value })}
                    placeholder="Enter GST number"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-panNumber">PAN Number</Label>
                  <Input
                    id="add-panNumber"
                    value={addForm.panNumber}
                    onChange={(e) => setAddForm({ ...addForm, panNumber: e.target.value })}
                    placeholder="Enter PAN number"
                    disabled={isAddingShop}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-locality">Locality/Area</Label>
                  <Input
                    id="add-locality"
                    value={addForm.address.locality}
                    onChange={(e) => setAddForm({ ...addForm, address: { ...addForm.address, locality: e.target.value } })}
                    placeholder="Enter locality or area"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-apartmentNo">Apartment/Building No.</Label>
                  <Input
                    id="add-apartmentNo"
                    value={addForm.address.apartmentNo}
                    onChange={(e) => setAddForm({ ...addForm, address: { ...addForm.address, apartmentNo: e.target.value } })}
                    placeholder="Flat/Building number"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-pincode">Pincode</Label>
                  <Input
                    id="add-pincode"
                    value={addForm.address.pincode}
                    onChange={(e) => setAddForm({ ...addForm, address: { ...addForm.address, pincode: e.target.value } })}
                    placeholder="Enter pincode"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-state">State</Label>
                  <Input
                    id="add-state"
                    value={addForm.address.state}
                    onChange={(e) => setAddForm({ ...addForm, address: { ...addForm.address, state: e.target.value } })}
                    placeholder="Enter state"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-country">Country</Label>
                  <Input
                    id="add-country"
                    value={addForm.address.country}
                    onChange={(e) => setAddForm({ ...addForm, address: { ...addForm.address, country: e.target.value } })}
                    placeholder="Enter country"
                    disabled={isAddingShop}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input
                    id="add-phone"
                    value={addForm.address.phone}
                    onChange={(e) => setAddForm({ ...addForm, address: { ...addForm.address, phone: e.target.value } })}
                    placeholder="Enter phone number"
                    disabled={isAddingShop}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={isAddingShop}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddShop}
              disabled={!addForm.name || !addForm.email || !addForm.password || isAddingShop}
            >
              {isAddingShop ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Shop...
                </>
              ) : (
                'Add Shop'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shop Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shop Details</DialogTitle>
            <DialogDescription>
              Update shop owner and shop information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Owner Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter owner name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mobile">Mobile Number</Label>
              <Input
                id="edit-mobile"
                value={editForm.mobile}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                placeholder="Enter mobile number"
              />
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
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Shop Information</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-shopName">Shop Name</Label>
              <Input
                id="edit-shopName"
                value={editForm.shopName}
                onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                placeholder="Enter shop name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-alternateMobile">Alternate Mobile</Label>
              <Input
                id="edit-alternateMobile"
                value={editForm.alternateMobile}
                onChange={(e) => setEditForm({ ...editForm, alternateMobile: e.target.value })}
                placeholder="Enter alternate mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gstNumber">GST Number</Label>
              <Input
                id="edit-gstNumber"
                value={editForm.gstNumber}
                onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })}
                placeholder="Enter GST number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-panNumber">PAN Number</Label>
              <Input
                id="edit-panNumber"
                value={editForm.panNumber}
                onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value })}
                placeholder="Enter PAN number"
              />
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Address Information</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-apartmentNo">Apartment/Building No.</Label>
              <Input
                id="edit-apartmentNo"
                value={editForm.address.apartmentNo}
                onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, apartmentNo: e.target.value } })}
                placeholder="Enter apartment/building number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-locality">Locality/Area</Label>
              <Input
                id="edit-locality"
                value={editForm.address.locality}
                onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, locality: e.target.value } })}
                placeholder="Enter locality or area"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={editForm.address.state}
                  onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, state: e.target.value } })}
                  placeholder="Enter state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={editForm.address.country}
                  onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, country: e.target.value } })}
                  placeholder="Enter country"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-pincode">Pincode</Label>
                <Input
                  id="edit-pincode"
                  value={editForm.address.pincode}
                  onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, pincode: e.target.value } })}
                  placeholder="Enter pincode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.address.phone}
                  onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, phone: e.target.value } })}
                  placeholder="Enter phone number"
                />
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
    </div>
  )
}

export default ShopDetailsPage
