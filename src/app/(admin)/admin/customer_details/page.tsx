'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
  Shield,
  Users,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Crown,
  Settings,
} from 'lucide-react'
import { getUsers, createUser, updateUser, deleteUser } from '@/app/actions/user'
import { UserRole, UserStatus } from '@/generated/prisma'
import type { User } from '@/app/actions/user'

const RoleManagementPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortField, setSortField] = useState<keyof User | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const result = await getUsers()
    if (result.success && result.data) {
      // Filter to only show users with role USER (customers)
      const customerUsers = result.data.filter((user) => user.role === UserRole.USER)
      setUsers(customerUsers)
    } else {
      // toast.error('Failed to load users')
      console.error('Failed to load users')
    }
  }

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [editForm, setEditForm] = useState<{
    name: string
    email: string
    mobile: string
    role: UserRole
    status: UserStatus
  }>({
    name: '',
    email: '',
    mobile: '',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  })

  const [addForm, setAddForm] = useState<{
    name: string
    email: string
    mobile: string
    status: UserStatus
    type: string
    pincode: string
    landmark: string
    apartmentNo: string
    state: string
    country: string
    locality: string
  }>({
    name: '',
    email: '',
    mobile: '',
    status: UserStatus.ACTIVE,
    type: '',
    pincode: '',
    landmark: '',
    apartmentNo: '',
    state: '',
    country: '',
    locality: '',
  })

  // Filtering and sorting logic
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
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
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex)

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: users.length,
      superadmin: users.filter((u) => u.role === UserRole.SUPERADMIN).length,
      admin: users.filter((u) => u.role === UserRole.ADMIN).length,
      agent: users.filter((u) => u.role === UserRole.AGENT).length,
      user: users.filter((u) => u.role === UserRole.USER).length,
      active: users.filter((u) => u.status === UserStatus.ACTIVE).length,
      pending: users.filter((u) => u.status === UserStatus.PENDING).length,
      blocked: users.filter((u) => u.status === UserStatus.BLOCKED).length,
    }
  }, [users])

  // Sort handler
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // CRUD handlers
  const handleView = (user: User) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      role: user.role,
      status: user.status,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedUser) {
      const result = await deleteUser(selectedUser.id)
      if (result.success) {
        setUsers(users.filter((u) => u.id !== selectedUser.id))
        setDeleteDialogOpen(false)
        setSelectedUser(null)
        // toast.success('User deleted successfully')
      } else {
        // toast.error('Failed to delete user')
        console.error('Failed to delete user')
      }
    }
  }

  const saveEdit = async () => {
    if (selectedUser) {
      const result = await updateUser(selectedUser.id, {
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        role: editForm.role,
        status: editForm.status,
      })

      if (result.success && result.data) {
        setUsers(users.map((u) => (u.id === selectedUser.id ? result.data! : u)))
        setEditDialogOpen(false)
        setSelectedUser(null)
        // toast.success('User updated successfully')
      } else {
        // toast.error('Failed to update user')
        console.error('Failed to update user')
      }
    }
  }

  const handleAddUser = async () => {
    const result = await createUser({
      name: addForm.name,
      ...(addForm.email && { email: addForm.email }),
      mobile: addForm.mobile,
      role: UserRole.USER,
      status: addForm.status,
      address: {
        ...(addForm.type && { type: addForm.type }),
        pincode: addForm.pincode,
        ...(addForm.landmark && { landmark: addForm.landmark }),
        ...(addForm.apartmentNo && { apartmentNo: addForm.apartmentNo }),
        ...(addForm.state && { state: addForm.state }),
        ...(addForm.country && { country: addForm.country }),
        locality: addForm.locality,
        phone: addForm.mobile, // Use mobile as phone
      },
    })

    if (result.success && result.data) {
      setUsers([result.data, ...users])
      setAddUserDialogOpen(false)
      setAddForm({
        name: '',
        email: '',
        mobile: '',
        status: UserStatus.ACTIVE,
        type: '',
        pincode: '',
        landmark: '',
        apartmentNo: '',
        state: '',
        country: '',
        locality: '',
      })
      // toast.success('User added successfully')
    } else {
      // toast.error('Failed to add user')
      console.error('Failed to add user:', result.error)
    }
  }

  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    )
  }

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, { className: string; icon: React.ReactNode }> = {
      [UserRole.SUPERADMIN]: {
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        icon: <Crown className="h-3 w-3 mr-1" />,
      },
      [UserRole.ADMIN]: {
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        icon: <Shield className="h-3 w-3 mr-1" />,
      },
      [UserRole.AGENT]: {
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        icon: <Users className="h-3 w-3 mr-1" />,
      },
      [UserRole.USER]: {
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: <UserIcon className="h-3 w-3 mr-1" />,
      },
    }

    const variant = variants[role]

    return (
      <Badge className={variant.className}>
        <span className="flex items-center">
          {variant.icon}
          {role}
        </span>
      </Badge>
    )
  }

  const getStatusBadge = (status: UserStatus) => {
    const variants: Record<UserStatus, { className: string; icon: React.ReactNode }> = {
      [UserStatus.ACTIVE]: {
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      [UserStatus.PENDING]: {
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        icon: <Settings className="h-3 w-3 mr-1" />,
      },
      [UserStatus.BLOCKED]: {
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    }

    const variant = variants[status]

    return (
      <Badge className={variant.className}>
        <span className="flex items-center">
          {variant.icon}
          {status}
        </span>
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
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground mt-2">
              Manage customer accounts and information
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddUserDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Total Customers</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="border rounded-lg p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats.active}
            </p>
          </div>
          <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div className="border rounded-lg p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Blocked</span>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {stats.blocked}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {Object.values(UserStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
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
                    User
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead
                  className="cursor-pointer select-none text-center"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center justify-center">
                    Role
                    {getSortIcon('role')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-center"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Joined Date
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">#{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        {user.mobile && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{user.mobile}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(user)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                          onClick={() => handleDelete(user)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedUsers.length)} of{' '}
            {filteredAndSortedUsers.length} users
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

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Create a new customer account with address details</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Full Name *</Label>
                  <Input
                    id="add-name"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-mobile">Mobile Number *</Label>
                  <Input
                    id="add-mobile"
                    value={addForm.mobile}
                    onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-email">Email Address (Optional)</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="user@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-status">Status *</Label>
                  <Select
                    value={addForm.status}
                    onValueChange={(value) => setAddForm({ ...addForm, status: value as UserStatus })}
                  >
                    <SelectTrigger id="add-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-type">Address Type (Optional)</Label>
                  <Input
                    id="add-type"
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                    placeholder="Home, Office, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-pincode">Pincode *</Label>
                  <Input
                    id="add-pincode"
                    value={addForm.pincode}
                    onChange={(e) => setAddForm({ ...addForm, pincode: e.target.value })}
                    placeholder="Enter pincode"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="add-locality">Locality *</Label>
                  <Input
                    id="add-locality"
                    value={addForm.locality}
                    onChange={(e) => setAddForm({ ...addForm, locality: e.target.value })}
                    placeholder="Enter locality/area"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-apartment">Apartment/House No (Optional)</Label>
                  <Input
                    id="add-apartment"
                    value={addForm.apartmentNo}
                    onChange={(e) => setAddForm({ ...addForm, apartmentNo: e.target.value })}
                    placeholder="Flat/House number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-landmark">Landmark (Optional)</Label>
                  <Input
                    id="add-landmark"
                    value={addForm.landmark}
                    onChange={(e) => setAddForm({ ...addForm, landmark: e.target.value })}
                    placeholder="Nearby landmark"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-state">State (Optional)</Label>
                  <Input
                    id="add-state"
                    value={addForm.state}
                    onChange={(e) => setAddForm({ ...addForm, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-country">Country (Optional)</Label>
                  <Input
                    id="add-country"
                    value={addForm.country}
                    onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!addForm.name || !addForm.mobile || !addForm.pincode || !addForm.locality}
            >
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information about the user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-medium">User ID</span>
                  </div>
                  <p className="text-lg font-semibold">#{selectedUser.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Role</span>
                  </div>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-medium">Full Name</span>
                  </div>
                  <p className="text-lg font-semibold">{selectedUser.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Mobile</span>
                  </div>
                  <p className="text-sm">{selectedUser.mobile || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Status</span>
                  </div>
                  <div>{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Joined Date</span>
                  </div>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm">{formatDate(selectedUser.updatedAt)}</p>
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
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mobile">Mobile Number</Label>
                <Input
                  id="edit-mobile"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) => setEditForm({ ...editForm, role: value as UserRole })}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, status: value as UserStatus })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              This action cannot be undone. This will permanently delete user{' '}
              <span className="font-semibold">{selectedUser?.name}</span> and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}

export default RoleManagementPage
