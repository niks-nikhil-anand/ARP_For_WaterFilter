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
  Users,
  UserCheck,
  UserX,
  Pencil,
  Plus,
} from 'lucide-react'

import { getUsersByRole, deleteUser, updateUser, createUser } from '@/actions/admin/users'
import { createAgent } from '@/app/actions/agent'
import { getShops } from '@/app/actions/shop'
import { toast } from 'sonner'

type AgentUser = {
  id: number
  name: string
  email: string
  mobile: string | null
  role: string
  status: string
  agents: Array<{
    id: number
    shopId: number
    shop: {
      id: number
      name: string
    }
  }>
  createdAt: Date
  updatedAt: Date
}

type Shop = {
  id: number
  name: string
}

const AgentUsersPage = () => {
  const [agentUsers, setAgentUsers] = useState<AgentUser[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [shopsLoading, setShopsLoading] = useState(true)
  const [addLoading, setAddLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AgentUser | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    status: '',
    shopId: '',
  })
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    shopId: '',
    areaCover: '',
    locality: '',
    pincode: '',
    state: '',
    landmark: '',
    apartmentNo: '',
  })

  useEffect(() => {
    loadAgentUsers()
    loadShops()
  }, [])

  const loadShops = async () => {
    setShopsLoading(true)
    try {
      const result = await getShops()
      console.log('Shops result:', result)

      if (result.success && result.data) {
        console.log('Setting shops:', result.data.length, 'shops')
        setShops(result.data)
      } else {
        console.error('Failed to load shops:', result.error)
        toast.error(result.error || 'Failed to load shops')
        setShops([])
      }
    } catch (error) {
      console.error('Failed to load shops:', error)
      toast.error('Failed to load shops')
      setShops([])
    } finally {
      setShopsLoading(false)
    }
  }

  const loadAgentUsers = async () => {
    setLoading(true)
    const result = await getUsersByRole('AGENT')
    if (result.success && result.data) {
      setAgentUsers(result.data)
    } else {
      console.error('Failed to load agent users')
      toast.error('Failed to load agent users')
    }
    setLoading(false)
  }

  const handleDeleteUser = async (user: AgentUser) => {
    const confirmed = confirm(`Delete user ${user.name || user.email}?`)
    if (!confirmed) return

    const result = await deleteUser(user.id)
    if (result.success) {
      loadAgentUsers()
      toast.success('User deleted successfully')
    } else {
      toast.error('Failed to delete user')
    }
  }

  const handleEdit = (user: AgentUser) => {
    setSelectedUser(user)
    const assignedShop = user.agents && user.agents.length > 0 ? user.agents[0].shopId.toString() : 'none'
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      status: user.status || 'ACTIVE',
      shopId: assignedShop,
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    const result = await updateUser(selectedUser.id, {
      name: editForm.name,
      email: editForm.email,
      mobile: editForm.mobile,
      status: editForm.status,
      shopId: editForm.shopId && editForm.shopId !== 'none' ? parseInt(editForm.shopId) : null,
    })

    if (result.success) {
      loadAgentUsers()
      setEditDialogOpen(false)
      setSelectedUser(null)
      toast.success('User updated successfully')
    } else {
      toast.error(result.error || 'Failed to update user')
    }
  }

  const handleAddAgent = async () => {
    try {
      setAddLoading(true)

      // Validate required fields
      if (!addForm.name || !addForm.mobile) {
        toast.error('Name and mobile number are required')
        return
      }

      if (!addForm.locality || !addForm.pincode || !addForm.state) {
        toast.error('Address details (locality, pincode, state) are required')
        return
      }

      const shopId = addForm.shopId && addForm.shopId !== 'none' ? parseInt(addForm.shopId) : null

      if (!shopId) {
        toast.error('Please select a shop')
        return
      }

      const result = await createAgent({
        name: addForm.name,
        email: addForm.email || undefined,
        mobile: addForm.mobile,
        shopId: shopId,
        areaCover: addForm.areaCover || undefined,
        address: {
          locality: addForm.locality,
          pincode: addForm.pincode,
          state: addForm.state,
          landmark: addForm.landmark || undefined,
          apartmentNo: addForm.apartmentNo || undefined,
          phone: addForm.mobile,
        },
      })

      if (result.success) {
        await loadAgentUsers()
        setAddDialogOpen(false)
        setAddForm({
          name: '',
          email: '',
          mobile: '',
          password: '',
          shopId: '',
          areaCover: '',
          locality: '',
          pincode: '',
          state: '',
          landmark: '',
          apartmentNo: '',
        })
        toast.success('Agent created successfully')
      } else {
        toast.error(result.error || 'Failed to create agent')
      }
    } catch (error) {
      console.error('Error creating agent:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setAddLoading(false)
    }
  }

  // Filter users based on search term
  const filteredUsers = agentUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'BLOCKED': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    }

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
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
              <h1 className="text-3xl font-bold tracking-tight">Agent(Technicians)</h1>
              <p className="text-muted-foreground mt-2">
                Manage users with agent role
              </p>
            </div>
            <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Agent
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Total Agents</span>
              </div>
              <p className="text-2xl font-bold">{agentUsers.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-2xl font-bold">
                {agentUsers.filter((u) => u.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <UserX className="h-4 w-4" />
                <span className="text-sm font-medium">Blocked</span>
              </div>
              <p className="text-2xl font-bold">
                {agentUsers.filter((u) => u.status === 'BLOCKED').length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or mobile..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
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
                        <Users className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No users found matching your search' : 'No agent users found'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">#{user.id}</TableCell>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.mobile || '-'}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            title="Edit user"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete user"
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

      {/* Add Agent Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new agent account and assign to a shop
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Enter agent name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="Enter email (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-mobile">Mobile Number *</Label>
              <Input
                id="add-mobile"
                value={addForm.mobile}
                onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                placeholder="Enter mobile number"
              />
            </div>

            {/* Address Fields */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3 text-sm">Address Details</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="add-locality">Locality *</Label>
                  <Input
                    id="add-locality"
                    value={addForm.locality}
                    onChange={(e) => setAddForm({ ...addForm, locality: e.target.value })}
                    placeholder="Enter locality/area"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="add-pincode">Pincode *</Label>
                    <Input
                      id="add-pincode"
                      value={addForm.pincode}
                      onChange={(e) => setAddForm({ ...addForm, pincode: e.target.value })}
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-state">State *</Label>
                    <Input
                      id="add-state"
                      value={addForm.state}
                      onChange={(e) => setAddForm({ ...addForm, state: e.target.value })}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="add-landmark">Landmark</Label>
                    <Input
                      id="add-landmark"
                      value={addForm.landmark}
                      onChange={(e) => setAddForm({ ...addForm, landmark: e.target.value })}
                      placeholder="Enter landmark (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-apartment">Apartment No.</Label>
                    <Input
                      id="add-apartment"
                      value={addForm.apartmentNo}
                      onChange={(e) => setAddForm({ ...addForm, apartmentNo: e.target.value })}
                      placeholder="Enter apartment no. (optional)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-area-cover">Area Cover</Label>
              <Input
                id="add-area-cover"
                value={addForm.areaCover}
                onChange={(e) => setAddForm({ ...addForm, areaCover: e.target.value })}
                placeholder="Enter area cover (e.g., North Zone, District 5)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-shop">Assign to Shop *</Label>
              <Select
                value={addForm.shopId}
                onValueChange={(value) => setAddForm({ ...addForm, shopId: value })}
                disabled={shopsLoading}
              >
                <SelectTrigger id="add-shop">
                  <SelectValue placeholder={shopsLoading ? "Loading shops..." : shops.length === 0 ? "No shops available" : "Select shop"} />
                </SelectTrigger>
                <SelectContent>
                  {shopsLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Loading shops...
                    </div>
                  ) : shops.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No shops available
                    </div>
                  ) : (
                    shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id.toString()}>
                        {shop.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAgent}
              disabled={addLoading || !addForm.name || !addForm.mobile || !addForm.locality || !addForm.pincode || !addForm.state || !addForm.shopId || addForm.shopId === 'none'}
            >
              {addLoading ? 'Creating...' : 'Add Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter name"
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
              <Label htmlFor="edit-mobile">Mobile</Label>
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
            <div className="space-y-2">
              <Label htmlFor="edit-shop">Assign to Shop</Label>
              <Select
                value={editForm.shopId}
                onValueChange={(value) => setEditForm({ ...editForm, shopId: value })}
                disabled={shopsLoading}
              >
                <SelectTrigger id="edit-shop">
                  <SelectValue placeholder={shopsLoading ? "Loading shops..." : "Select shop"} />
                </SelectTrigger>
                <SelectContent>
                  {shopsLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Loading shops...
                    </div>
                  ) : (
                    <>
                      <SelectItem value="none">No Shop</SelectItem>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id.toString()}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
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

export default AgentUsersPage
