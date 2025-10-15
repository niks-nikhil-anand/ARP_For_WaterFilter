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
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  User,
  Mail,
  Phone,
  Calendar,
  Crown,
  Settings,
} from 'lucide-react'

// Enum from Prisma
enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
  AGENT = 'AGENT',
}

enum UserStatus {
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

// Permission structure
interface Permission {
  module: string
  read: boolean
  create: boolean
  update: boolean
  delete: boolean
}

interface RolePermissions {
  role: UserRole
  permissions: Permission[]
}

// Demo users data
const demoUsers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    password: 'hashed_password',
    mobile: '+91 98765 43210',
    role: UserRole.SUPERADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    password: 'hashed_password',
    mobile: '+91 98765 43211',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    password: 'hashed_password',
    mobile: '+91 98765 43212',
    role: UserRole.AGENT,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2024-10-13'),
  },
  {
    id: 4,
    name: 'Sunita Reddy',
    email: 'sunita.reddy@email.com',
    password: 'hashed_password',
    mobile: '+91 98765 43213',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-07-05'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 5,
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    password: 'hashed_password',
    mobile: '+91 98765 43214',
    role: UserRole.ADMIN,
    status: UserStatus.PENDING,
    createdAt: new Date('2023-08-18'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 6,
    name: 'Anjali Verma',
    email: 'anjali.verma@email.com',
    password: 'hashed_password',
    mobile: '+91 98765 43215',
    role: UserRole.USER,
    status: UserStatus.BLOCKED,
    createdAt: new Date('2023-09-25'),
    updatedAt: new Date('2024-10-11'),
  },
  {
    id: 7,
    name: 'Karthik Rao',
    email: 'karthik.rao@email.com',
    password: 'hashed_password',
    mobile: '+91 98765 43216',
    role: UserRole.AGENT,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-11-12'),
    updatedAt: new Date('2024-10-09'),
  },
  {
    id: 8,
    name: 'Deepa Menon',
    email: 'deepa.menon@email.com',
    password: 'hashed_password',
    mobile: '+91 98765 43217',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-10-12'),
  },
]

// Default permissions for each role
const defaultRolePermissions: RolePermissions[] = [
  {
    role: UserRole.SUPERADMIN,
    permissions: [
      { module: 'Users', read: true, create: true, update: true, delete: true },
      { module: 'Shops', read: true, create: true, update: true, delete: true },
      { module: 'Products', read: true, create: true, update: true, delete: true },
      { module: 'Orders', read: true, create: true, update: true, delete: true },
      { module: 'Repairs', read: true, create: true, update: true, delete: true },
      { module: 'Warranties', read: true, create: true, update: true, delete: true },
      { module: 'Agencies', read: true, create: true, update: true, delete: true },
      { module: 'Settings', read: true, create: true, update: true, delete: true },
    ],
  },
  {
    role: UserRole.ADMIN,
    permissions: [
      { module: 'Users', read: true, create: true, update: true, delete: false },
      { module: 'Shops', read: true, create: true, update: true, delete: false },
      { module: 'Products', read: true, create: true, update: true, delete: true },
      { module: 'Orders', read: true, create: true, update: true, delete: false },
      { module: 'Repairs', read: true, create: true, update: true, delete: false },
      { module: 'Warranties', read: true, create: true, update: true, delete: false },
      { module: 'Agencies', read: true, create: false, update: false, delete: false },
      { module: 'Settings', read: true, create: false, update: true, delete: false },
    ],
  },
  {
    role: UserRole.AGENT,
    permissions: [
      { module: 'Users', read: true, create: false, update: false, delete: false },
      { module: 'Shops', read: true, create: false, update: false, delete: false },
      { module: 'Products', read: true, create: false, update: false, delete: false },
      { module: 'Orders', read: true, create: true, update: true, delete: false },
      { module: 'Repairs', read: true, create: true, update: true, delete: false },
      { module: 'Warranties', read: true, create: false, update: false, delete: false },
      { module: 'Agencies', read: true, create: false, update: false, delete: false },
      { module: 'Settings', read: true, create: false, update: false, delete: false },
    ],
  },
  {
    role: UserRole.USER,
    permissions: [
      { module: 'Users', read: false, create: false, update: false, delete: false },
      { module: 'Shops', read: true, create: false, update: false, delete: false },
      { module: 'Products', read: true, create: false, update: false, delete: false },
      { module: 'Orders', read: true, create: true, update: false, delete: false },
      { module: 'Repairs', read: true, create: true, update: false, delete: false },
      { module: 'Warranties', read: true, create: false, update: false, delete: false },
      { module: 'Agencies', read: false, create: false, update: false, delete: false },
      { module: 'Settings', read: true, create: false, update: true, delete: false },
    ],
  },
]

type User = typeof demoUsers[0]

const RoleManagementPage = () => {
  const [users, setUsers] = useState<User[]>(demoUsers)
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>(defaultRolePermissions)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortField, setSortField] = useState<keyof User | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  })

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    mobile: '',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
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

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id))
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const saveEdit = () => {
  if (selectedUser) {
    setUsers(
      users.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: editForm.name,
              email: editForm.email,
              mobile: editForm.mobile || "",
              role: editForm.role,
              status: editForm.status,
              updatedAt: new Date(),
            }
          : u
      )
    )
    setEditDialogOpen(false)
    setSelectedUser(null)
  }
}

const handleAddUser = () => {
  const newUser: User = {
    id: Math.max(...users.map((u) => u.id)) + 1,
    name: addForm.name,
    email: addForm.email,
    password: "hashed_password",
    mobile: addForm.mobile || "",
    role: addForm.role,
    status: addForm.status,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  setUsers([newUser, ...users])
  setAddUserDialogOpen(false)
  setAddForm({
    name: "",
    email: "",
    mobile: "",
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  })
}

  const handleViewPermissions = (role: UserRole) => {
    setSelectedRole(role)
    setPermissionsDialogOpen(true)
  }

  const handlePermissionChange = (module: string, action: keyof Permission) => {
    if (!selectedRole) return

    setRolePermissions(
      rolePermissions.map((rp) =>
        rp.role === selectedRole
          ? {
              ...rp,
              permissions: rp.permissions.map((p) =>
                p.module === module ? { ...p, [action]: !p[action] } : p
              ),
            }
          : rp
      )
    )
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
        icon: <User className="h-3 w-3 mr-1" />,
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
    <div className="container mx-auto py-10 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage user roles, permissions, and access control
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddUserDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Total Users</span>
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

        {/* Role Distribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.values(UserRole).map((role) => {
            const count = stats[role.toLowerCase() as keyof typeof stats] as number
            return (
              <Card key={role} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewPermissions(role)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{role}</CardTitle>
                    {getRoleBadge(role)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{count}</span>
                    <span className="text-sm text-muted-foreground">users</span>
                  </div>
                  <Button variant="link" className="p-0 h-auto mt-2" size="sm">
                    View Permissions →
                  </Button>
                </CardContent>
              </Card>
            )
          })}
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
                        <User className="h-4 w-4 text-muted-foreground" />
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with role and status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email Address *</Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="user@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-mobile">Mobile Number</Label>
              <Input
                id="add-mobile"
                value={addForm.mobile}
                onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-role">Role *</Label>
                <Select
                  value={addForm.role}
                  onValueChange={(value) => setAddForm({ ...addForm, role: value as UserRole })}
                >
                  <SelectTrigger id="add-role">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!addForm.name || !addForm.email}
            >
              Add User
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
                    <User className="h-4 w-4" />
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
                    <User className="h-4 w-4" />
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

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Permissions</DialogTitle>
            <DialogDescription>
              Manage permissions for {selectedRole} role
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">{selectedRole}</p>
                    <p className="text-sm text-muted-foreground">
                      {rolePermissions.find((rp) => rp.role === selectedRole)?.permissions.length || 0} modules
                    </p>
                  </div>
                </div>
                {getRoleBadge(selectedRole)}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground px-4">
                  <div>Module</div>
                  <div className="text-center">Read</div>
                  <div className="text-center">Create</div>
                  <div className="text-center">Update</div>
                  <div className="text-center">Delete</div>
                </div>

                {rolePermissions
                  .find((rp) => rp.role === selectedRole)
                  ?.permissions.map((permission) => (
                    <div
                      key={permission.module}
                      className="grid grid-cols-5 gap-2 items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">{permission.module}</div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permission.read}
                          onCheckedChange={() => handlePermissionChange(permission.module, 'read')}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permission.create}
                          onCheckedChange={() => handlePermissionChange(permission.module, 'create')}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permission.update}
                          onCheckedChange={() => handlePermissionChange(permission.module, 'update')}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permission.delete}
                          onCheckedChange={() => handlePermissionChange(permission.module, 'delete')}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setPermissionsDialogOpen(false)}>
              Save Permissions
            </Button>
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
  )
}

export default RoleManagementPage
