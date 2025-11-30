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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

import { getAgents, createAgent, updateAgent, deleteAgent } from '@/app/actions/agent'
import { getShops } from '@/app/actions/shop'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

type AgentData = {
  id: number
  userId: number
  shopId: number | null
  areaCover: string | null
  user: {
    id: number
    name: string
    email: string
    mobile: string | null
    role: string
    status: string
    addresses: Array<{
      id: number
      locality: string
      pincode: string
      state: string | null
      landmark: string | null
      apartmentNo: string | null
    }>
  }
  shop: {
    id: number
    name: string
  } | null
  createdAt: Date
  updatedAt: Date
}

type Shop = {
  id: number
  name: string
}

const AgentUsersPage = () => {
  const [agents, setAgents] = useState<AgentData[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [shopsLoading, setShopsLoading] = useState(true)
  const [addLoading, setAddLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    status: '',
    password: '',
    confirmPassword: '',
    shopId: '',
    areaCover: '',
    locality: '',
    pincode: '',
    state: '',
    landmark: '',
    apartmentNo: '',
  })

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    mobile: '+91 ',
    password: '',
    confirmPassword: '',
    shopId: '',
    areaCover: '',
    locality: '',
    pincode: '',
    state: '',
    landmark: '',
    apartmentNo: '',
  })

  useEffect(() => {
    loadAgents()
    loadShops()
  }, [])

  const loadShops = async () => {
    setShopsLoading(true)
    try {
      const result = await getShops()
      if (result.success && result.data) {
        setShops(result.data)
      } else {
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

  const loadAgents = async () => {
    setLoading(true)
    const result = await getAgents()
    if (result.success && result.data) {
      setAgents(result.data as unknown as AgentData[])
    } else {
      console.error('Failed to load agents')
      toast.error('Failed to load agents')
    }
    setLoading(false)
  }

  // Enforce phone input: always show '+91 ' prefix, accept only digits after it, max 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const prefix = '+91 '
    const raw = e.target.value || ''
    // Extract digits only
    let digits = raw.replace(/\D/g, '')
    // If user pasted full international like '919876543210' or '+919876543210', strip leading country code
    if (digits.startsWith('91')) {
      // remove only a single leading '91' if present
      digits = digits.replace(/^91/, '')
    }
    // Limit to 10 digits
    digits = digits.slice(0, 10)

    if (isEdit) {
      setEditForm({
        ...editForm,
        mobile: prefix + digits
      })
    } else {
      setAddForm({
        ...addForm,
        mobile: prefix + digits
      })
    }
  }

  // Enforce pincode input: digits only, max 6 digits
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const raw = e.target.value || ''
    const digits = raw.replace(/\D/g, '').slice(0, 6)

    if (isEdit) {
      setEditForm({
        ...editForm,
        pincode: digits
      })
    } else {
      setAddForm({
        ...addForm,
        pincode: digits
      })
    }
  }

  const handleDeleteAgent = async (agent: AgentData) => {
    const confirmed = confirm(`Delete agent ${agent.user.name || agent.user.email}?`)
    if (!confirmed) return

    const result = await deleteAgent(agent.id)
    if (result.success) {
      loadAgents()
      toast.success('Agent deleted successfully')
    } else {
      toast.error('Failed to delete agent')
    }
  }

  const handleEdit = (agent: AgentData) => {
    setSelectedAgent(agent)
    const address = agent.user.addresses && agent.user.addresses.length > 0 ? agent.user.addresses[0] : null

    setEditForm({
      name: agent.user.name || '',
      email: agent.user.email || '',
      mobile: agent.user.mobile || '',
      status: agent.user.status || 'ACTIVE',
      password: '',
      confirmPassword: '',
      shopId: agent.shopId ? agent.shopId.toString() : 'none',
      areaCover: agent.areaCover || '',
      locality: address?.locality || '',
      pincode: address?.pincode || '',
      state: address?.state || '',
      landmark: address?.landmark || '',
      apartmentNo: address?.apartmentNo || '',
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedAgent) return

    // Validate required fields
    if (!editForm.name || !editForm.mobile) {
      toast.error('Name and mobile number are required')
      return
    }

    const phoneDigits = editForm.mobile.replace(/\D/g, '').replace(/^91/, '')
    if (phoneDigits.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    if (!editForm.locality || !editForm.pincode || !editForm.state) {
      toast.error('Address details (locality, pincode, state) are required')
      return
    }

    if (editForm.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode')
      return
    }

    if (!editForm.areaCover) {
      toast.error('Area cover is required')
      return
    }

    const shopId = editForm.shopId && editForm.shopId !== 'none' ? parseInt(editForm.shopId) : undefined

    const formattedMobile = editForm.mobile.startsWith('+91') ? editForm.mobile : `+91 ${phoneDigits}`

    // Validate password if provided
    if (editForm.password) {
      if (editForm.password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        return
      }
      if (editForm.password !== editForm.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
    }

    const result = await updateAgent(selectedAgent.id, {
      name: editForm.name,
      mobile: formattedMobile,
      status: editForm.status as any,
      password: editForm.password || undefined,
      shopId: shopId,
      areaCover: editForm.areaCover,
      address: {
        locality: editForm.locality,
        pincode: editForm.pincode,
        state: editForm.state,
        landmark: editForm.landmark,
        apartmentNo: editForm.apartmentNo,
      }
    })

    if (result.success) {
      loadAgents()
      setEditDialogOpen(false)
      setSelectedAgent(null)
      toast.success('Agent updated successfully')
    } else {
      toast.error(result.error || 'Failed to update agent')
    }
  }

  const handleAddAgent = async () => {
    try {
      setAddLoading(true)

      // Validate required fields
      if (!addForm.name || !addForm.mobile) {
        toast.error('Name and mobile number are required')
        setAddLoading(false)
        return
      }

      // Validate phone number length
      const phoneDigits = addForm.mobile.replace(/\D/g, '').replace(/^91/, '')
      if (phoneDigits.length !== 10) {
        toast.error('Please enter a valid 10-digit mobile number')
        setAddLoading(false)
        return
      }

      // Validate password
      if (!addForm.password || addForm.password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        setAddLoading(false)
        return
      }

      if (addForm.password !== addForm.confirmPassword) {
        toast.error('Passwords do not match')
        setAddLoading(false)
        return
      }

      if (!addForm.locality || !addForm.pincode || !addForm.state) {
        toast.error('Address details (locality, pincode, state) are required')
        setAddLoading(false)
        return
      }

      if (addForm.pincode.length !== 6) {
        toast.error('Please enter a valid 6-digit pincode')
        setAddLoading(false)
        return
      }

      if (!addForm.areaCover) {
        toast.error('Area cover is required')
        setAddLoading(false)
        return
      }

      const shopId = addForm.shopId && addForm.shopId !== 'none' ? parseInt(addForm.shopId) : null

      if (!shopId) {
        toast.error('Please select a shop')
        setAddLoading(false)
        return
      }

      // Format mobile number to remove space: +91 12345 -> +9112345
      const formattedMobile = `+91${phoneDigits}`

      const result = await createAgent({
        name: addForm.name,
        email: addForm.email || undefined,
        mobile: formattedMobile,
        password: addForm.password,
        shopId: shopId,
        areaCover: addForm.areaCover || undefined,
        address: {
          locality: addForm.locality,
          pincode: addForm.pincode,
          state: addForm.state,
          landmark: addForm.landmark || undefined,
          apartmentNo: addForm.apartmentNo || undefined,
          phone: formattedMobile,
        },
      })

      if (result.success) {
        await loadAgents()
        setAddDialogOpen(false)
        setAddForm({
          name: '',
          email: '',
          mobile: '+91 ',
          password: '',
          confirmPassword: '',
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
  const filteredAgents = agents.filter((agent) =>
    agent.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.user.mobile?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-2xl font-bold">
                {agents.filter((a) => a.user.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <UserX className="h-4 w-4" />
                <span className="text-sm font-medium">Blocked</span>
              </div>
              <p className="text-2xl font-bold">
                {agents.filter((a) => a.user.status === 'BLOCKED').length}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Detail</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Area Cover</TableHead>
                  <TableHead>Address Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No agents found matching your search' : 'No agents found'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => {
                    const address = agent.user.addresses[0]
                    return (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold">{agent.user.name}</span>
                            <span className="text-xs text-muted-foreground">ID: #{agent.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-muted-foreground">Ph:</span>
                              {agent.user.mobile || '-'}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-muted-foreground">Email:</span>
                              {agent.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {agent.shop ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{agent.shop.name}</span>
                              <span className="text-xs text-muted-foreground">ID: #{agent.shop.id}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {agent.areaCover ? (
                            <Badge variant="outline">{agent.areaCover}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {address ? (
                            <div className="flex flex-col gap-0.5 text-sm max-w-[250px]">
                              <span>{address.locality}</span>
                              <span className="text-muted-foreground">
                                {address.landmark ? `${address.landmark}, ` : ''}
                                {address.state} - {address.pincode}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">No address</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(agent.user.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(agent)}
                              title="Edit agent"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAgent(agent)}
                              title="Delete agent"
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

      {/* Add Agent Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              Create a new agent account and assign to a shop
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Personal Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Basic information about the agent</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="add-mobile">Mobile Number *</Label>
                  <Input
                    id="add-mobile"
                    value={addForm.mobile}
                    onChange={(e) => handlePhoneChange(e, false)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-2 col-span-2">
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
                  <Label htmlFor="add-password">Password *</Label>
                  <Input
                    id="add-password"
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-confirm-password">Confirm Password *</Label>
                  <Input
                    id="add-confirm-password"
                    type="password"
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shop Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle>Shop Assignment</CardTitle>
                <CardDescription>Assign the agent to a shop and area</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="add-area-cover">Area Cover *</Label>
                  <Input
                    id="add-area-cover"
                    value={addForm.areaCover}
                    onChange={(e) => setAddForm({ ...addForm, areaCover: e.target.value })}
                    placeholder="e.g., North Zone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Address Details</CardTitle>
                <CardDescription>Residential address of the agent</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-locality">Locality *</Label>
                  <Input
                    id="add-locality"
                    value={addForm.locality}
                    onChange={(e) => setAddForm({ ...addForm, locality: e.target.value })}
                    placeholder="Enter locality"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-pincode">Pincode *</Label>
                  <Input
                    id="add-pincode"
                    value={addForm.pincode}
                    onChange={(e) => handlePincodeChange(e, false)}
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
                <div className="space-y-2">
                  <Label htmlFor="add-landmark">Landmark</Label>
                  <Input
                    id="add-landmark"
                    value={addForm.landmark}
                    onChange={(e) => setAddForm({ ...addForm, landmark: e.target.value })}
                    placeholder="Enter landmark"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="add-apartment">Apartment No.</Label>
                  <Input
                    id="add-apartment"
                    value={addForm.apartmentNo}
                    onChange={(e) => setAddForm({ ...addForm, apartmentNo: e.target.value })}
                    placeholder="Enter apartment no."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAgent}
              disabled={addLoading || !addForm.name || !addForm.mobile || !addForm.locality || !addForm.pincode || !addForm.state || !addForm.shopId || addForm.shopId === 'none' || !addForm.areaCover}
            >
              {addLoading ? 'Creating...' : 'Add Agent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information and assignment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Personal Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Basic information about the agent</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter agent name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mobile">Mobile Number *</Label>
                  <Input
                    id="edit-mobile"
                    value={editForm.mobile}
                    onChange={(e) => handlePhoneChange(e, true)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">New Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-confirm-password">Confirm New Password</Label>
                  <Input
                    id="edit-confirm-password"
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Enter email (optional)"
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
              </CardContent>
            </Card>

            {/* Shop Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle>Shop Assignment</CardTitle>
                <CardDescription>Assign the agent to a shop and area</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-shop">Assign to Shop *</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="edit-area-cover">Area Cover *</Label>
                  <Input
                    id="edit-area-cover"
                    value={editForm.areaCover}
                    onChange={(e) => setEditForm({ ...editForm, areaCover: e.target.value })}
                    placeholder="e.g., North Zone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Address Details</CardTitle>
                <CardDescription>Residential address of the agent</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-locality">Locality *</Label>
                  <Input
                    id="edit-locality"
                    value={editForm.locality}
                    onChange={(e) => setEditForm({ ...editForm, locality: e.target.value })}
                    placeholder="Enter locality"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pincode">Pincode *</Label>
                  <Input
                    id="edit-pincode"
                    value={editForm.pincode}
                    onChange={(e) => handlePincodeChange(e, true)}
                    placeholder="Enter pincode"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State *</Label>
                  <Input
                    id="edit-state"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-landmark">Landmark</Label>
                  <Input
                    id="edit-landmark"
                    value={editForm.landmark}
                    onChange={(e) => setEditForm({ ...editForm, landmark: e.target.value })}
                    placeholder="Enter landmark"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-apartment">Apartment No.</Label>
                  <Input
                    id="edit-apartment"
                    value={editForm.apartmentNo}
                    onChange={(e) => setEditForm({ ...editForm, apartmentNo: e.target.value })}
                    placeholder="Enter apartment no."
                  />
                </div>
              </CardContent>
            </Card>
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
