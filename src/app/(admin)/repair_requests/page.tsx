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
  Wrench,
  Package,
  User,
  FileText,
  MessageSquare,
  Settings,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle,
} from 'lucide-react'

// Demo data based on Prisma Repair model
const demoRepairs = [
  {
    id: 1,
    productId: 1,
    productName: 'Kent Grand Plus RO + UV + UF + TDS Controller Water Purifier',
    remarks: 'Water flow is very slow. TDS reading showing incorrect values.',
    feedback: 'Issue resolved. Replaced membrane and recalibrated TDS controller.',
    description: 'Customer complained about reduced water flow and inconsistent TDS readings. After inspection, found membrane clogged and TDS sensor misaligned.',
    parts: 'RO Membrane (75 GPD), TDS Sensor, Pre-filter',
    user: 'Ramesh Kumar (Customer)',
    technician: 'Vijay Sharma',
    status: 'Completed',
    priority: 'Medium',
    estimatedCost: 2500,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-05'),
  },
  {
    id: 2,
    productId: 2,
    productName: 'Aquaguard Aura RO + UV + UF + Active Copper Water Purifier',
    remarks: 'UV lamp not working. Red light indicator showing.',
    feedback: null,
    description: 'UV lamp failure reported by customer. Need to replace UV bulb and check ballast.',
    parts: 'UV Lamp (11W), Ballast',
    user: 'Priya Nair (Customer)',
    technician: 'Rajesh Patel',
    status: 'In Progress',
    priority: 'High',
    estimatedCost: 1800,
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 3,
    productId: 3,
    productName: 'Livpure Glo Star RO + UV + Mineralizer Water Purifier',
    remarks: 'Strange noise coming from the pump. Water pressure fluctuating.',
    feedback: 'Pump motor replaced. System working normally now.',
    description: 'Abnormal pump noise and pressure fluctuation. Diagnosed faulty pump motor requiring replacement.',
    parts: 'Booster Pump (75 GPD), Pump Mounting Kit',
    user: 'Arjun Mehta (Customer)',
    technician: 'Suresh Babu',
    status: 'Completed',
    priority: 'High',
    estimatedCost: 3200,
    createdAt: new Date('2024-09-28'),
    updatedAt: new Date('2024-10-02'),
  },
  {
    id: 4,
    productId: 4,
    productName: 'AO Smith Z9 Green RO Hot & Cold Water Purifier',
    remarks: 'Hot water not working. Only cold water dispensing.',
    feedback: null,
    description: 'Hot water heating element failure. Customer unable to get hot water from dispenser.',
    parts: 'Heating Element, Thermostat',
    user: 'Sneha Sharma (Customer)',
    technician: 'Karthik Rao',
    status: 'Pending',
    priority: 'Medium',
    estimatedCost: 4500,
    createdAt: new Date('2024-10-12'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 5,
    productId: 5,
    productName: 'Blue Star Aristo RO + UV + UF Water Purifier',
    remarks: 'Continuous water leakage from bottom panel.',
    feedback: 'Leak fixed. Replaced damaged tubing and tightened all connections.',
    description: 'Water leakage detected from bottom panel. Found cracked tubing and loose fittings.',
    parts: 'Food Grade Tubing (2m), Push Fit Connectors (6pcs)',
    user: 'Vikram Singh (Customer)',
    technician: 'Deepak Kumar',
    status: 'Completed',
    priority: 'High',
    estimatedCost: 800,
    createdAt: new Date('2024-09-25'),
    updatedAt: new Date('2024-09-27'),
  },
  {
    id: 6,
    productId: 6,
    productName: 'HUL Pureit Copper+ RO Water Purifier',
    remarks: 'Copper cartridge needs replacement. Water not getting copper enrichment.',
    feedback: null,
    description: 'Copper cartridge exhausted after 12 months of use. Requires replacement as per maintenance schedule.',
    parts: 'Copper Cartridge (Original)',
    user: 'Anjali Reddy (Customer)',
    technician: 'Amit Patel',
    status: 'In Progress',
    priority: 'Low',
    estimatedCost: 2800,
    createdAt: new Date('2024-10-08'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 7,
    productId: 7,
    productName: 'Aquaguard Marvel RO + UV + Active Copper Water Purifier',
    remarks: 'Filter change indicator light blinking. No water output.',
    feedback: 'All filters replaced. System sanitized and tested. Working perfectly.',
    description: 'Annual filter replacement due. All pre-filters and post-filters need changing.',
    parts: 'Sediment Filter, Carbon Block Filter, Post Carbon Filter, Inline Filter',
    user: 'Lakshmi Prasad (Customer)',
    technician: 'Vijay Sharma',
    status: 'Completed',
    priority: 'Medium',
    estimatedCost: 1500,
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-10-08'),
  },
  {
    id: 8,
    productId: 8,
    productName: 'Kent Supreme Alkaline RO + UV + UF + TDS Controller Water Purifier',
    remarks: 'Alkaline cartridge exhausted. pH level showing as normal instead of alkaline.',
    feedback: null,
    description: 'Alkaline cartridge reached end of life. Customer wants to continue alkaline water benefits.',
    parts: 'Alkaline Cartridge, Mineralizer',
    user: 'Sunita Iyer (Customer)',
    technician: 'Rajesh Patel',
    status: 'Pending',
    priority: 'Low',
    estimatedCost: 1200,
    createdAt: new Date('2024-10-13'),
    updatedAt: new Date('2024-10-13'),
  },
  {
    id: 9,
    productId: 9,
    productName: 'AO Smith X2 UV + UF Water Purifier',
    remarks: 'Power supply issue. Device not turning on.',
    feedback: 'SMPS board replaced. All systems operational.',
    description: 'Complete power failure. Diagnosed faulty SMPS (Switch Mode Power Supply) board.',
    parts: 'SMPS Board (24V 2A), Fuse',
    user: 'Meera Nair (Customer)',
    technician: 'Suresh Babu',
    status: 'Completed',
    priority: 'High',
    estimatedCost: 2200,
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-09-23'),
  },
  {
    id: 10,
    productId: 10,
    productName: 'Blue Star Eleanor RO + UV + UF + Taste Enhancer Water Purifier',
    remarks: 'Taste enhancer not working. Water tastes normal.',
    feedback: null,
    description: 'Taste enhancer cartridge needs inspection and possible replacement.',
    parts: 'Taste Enhancer Cartridge',
    user: 'Rahul Krishnan (Customer)',
    technician: 'Karthik Rao',
    status: 'In Progress',
    priority: 'Low',
    estimatedCost: 900,
    createdAt: new Date('2024-10-11'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 11,
    productId: 11,
    productName: 'Havells Max RO + UV + Mineralizer Water Purifier',
    remarks: 'No power supply. Display panel not working.',
    feedback: 'Power cord damaged. Replaced with new cord. System working fine.',
    description: 'Power cord internal wire damage found. Complete cord replacement needed.',
    parts: 'Power Cord (3 Pin), Adapter',
    user: 'Sanjay Gupta (Customer)',
    technician: 'Deepak Kumar',
    status: 'Completed',
    priority: 'High',
    estimatedCost: 600,
    createdAt: new Date('2024-10-03'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 12,
    productId: 12,
    productName: 'Aquasure Amaze RO + UV + MTDS Water Purifier',
    remarks: 'MTDS controller display showing error code E3.',
    feedback: null,
    description: 'MTDS controller malfunction. Error code E3 indicates sensor communication failure.',
    parts: 'MTDS Controller Module, TDS Sensor',
    user: 'Priya Sharma (Customer)',
    technician: 'Amit Patel',
    status: 'Pending',
    priority: 'Medium',
    estimatedCost: 1900,
    createdAt: new Date('2024-10-14'),
    updatedAt: new Date('2024-10-14'),
  },
]

type Repair = typeof demoRepairs[0]

const RepairManagementPage = () => {
  const [repairs, setRepairs] = useState<Repair[]>(demoRepairs)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [sortField, setSortField] = useState<keyof Repair | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)

  // Form states
  const [editForm, setEditForm] = useState({
    remarks: '',
    feedback: '',
    description: '',
    parts: '',
    user: '',
    technician: '',
    status: '',
    priority: '',
    estimatedCost: '',
  })

  const [addForm, setAddForm] = useState({
    productName: '',
    remarks: '',
    description: '',
    parts: '',
    user: '',
    technician: '',
    status: 'Pending',
    priority: 'Medium',
    estimatedCost: '',
  })

  const repairStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled']
  const priorities = ['Low', 'Medium', 'High', 'Urgent']

  // Filtering and sorting logic
  const filteredAndSortedRepairs = useMemo(() => {
    let filtered = repairs.filter((repair) => {
      const matchesSearch =
        repair.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.technician?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || repair.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || repair.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
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
  }, [repairs, searchTerm, statusFilter, priorityFilter, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedRepairs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRepairs = filteredAndSortedRepairs.slice(startIndex, endIndex)

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: repairs.length,
      pending: repairs.filter((r) => r.status === 'Pending').length,
      inProgress: repairs.filter((r) => r.status === 'In Progress').length,
      completed: repairs.filter((r) => r.status === 'Completed').length,
      totalCost: repairs.reduce((acc, r) => acc + (r.estimatedCost || 0), 0),
    }
  }, [repairs])

  // Sort handler
  const handleSort = (field: keyof Repair) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // CRUD handlers
  const handleView = (repair: Repair) => {
    setSelectedRepair(repair)
    setViewDialogOpen(true)
  }

  const handleEdit = (repair: Repair) => {
    setSelectedRepair(repair)
    setEditForm({
      remarks: repair.remarks || '',
      feedback: repair.feedback || '',
      description: repair.description || '',
      parts: repair.parts || '',
      user: repair.user || '',
      technician: repair.technician || '',
      status: repair.status,
      priority: repair.priority,
      estimatedCost: repair.estimatedCost?.toString() || '',
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (repair: Repair) => {
    setSelectedRepair(repair)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedRepair) {
      setRepairs(repairs.filter((r) => r.id !== selectedRepair.id))
      setDeleteDialogOpen(false)
      setSelectedRepair(null)
    }
  }

  const saveEdit = () => {
    if (selectedRepair) {
      setRepairs(
        repairs.map((r) =>
          r.id === selectedRepair.id
            ? {
                ...r,
                remarks: editForm.remarks || null,
                feedback: editForm.feedback || null,
                description: editForm.description || null,
                parts: editForm.parts || null,
                user: editForm.user || null,
                technician: editForm.technician || null,
                status: editForm.status,
                priority: editForm.priority,
                estimatedCost: editForm.estimatedCost ? parseFloat(editForm.estimatedCost) : null,
                updatedAt: new Date(),
              }
            : r
        )
      )
      setEditDialogOpen(false)
      setSelectedRepair(null)
    }
  }

  const handleAddRepair = () => {
    const newRepair: Repair = {
      id: Math.max(...repairs.map((r) => r.id)) + 1,
      productId: Math.floor(Math.random() * 14) + 1,
      productName: addForm.productName,
      remarks: addForm.remarks || null,
      feedback: null,
      description: addForm.description || null,
      parts: addForm.parts || null,
      user: addForm.user || null,
      technician: addForm.technician || null,
      status: addForm.status,
      priority: addForm.priority,
      estimatedCost: addForm.estimatedCost ? parseFloat(addForm.estimatedCost) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setRepairs([newRepair, ...repairs])
    setAddDialogOpen(false)
    setAddForm({
      productName: '',
      remarks: '',
      description: '',
      parts: '',
      user: '',
      technician: '',
      status: 'Pending',
      priority: 'Medium',
      estimatedCost: '',
    })
  }

  const getSortIcon = (field: keyof Repair) => {
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
    const variants: Record<string, { className: string; icon: React.ReactNode }> = {
      Pending: {
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      'In Progress': {
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        icon: <PlayCircle className="h-3 w-3 mr-1" />,
      },
      Completed: {
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      Cancelled: {
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    }

    const variant = variants[status] || variants.Pending

    return (
      <Badge className={variant.className}>
        <span className="flex items-center">
          {variant.icon}
          {status}
        </span>
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      Medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      High: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      Urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }

    return (
      <Badge className={variants[priority] || variants.Medium}>
        {priority}
      </Badge>
    )
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
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
            <h1 className="text-3xl font-bold tracking-tight">Repair Requests Management</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage product repair requests and service tickets
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Repair Request
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wrench className="h-4 w-4" />
              <span className="text-sm font-medium">Total Requests</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div className="border rounded-lg p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
              <PlayCircle className="h-4 w-4" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {stats.inProgress}
            </p>
          </div>
          <div className="border rounded-lg p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {stats.completed}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Total Cost</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product, customer, or technician..."
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
              {repairStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={(value) => {
              setPriorityFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
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
                    Ticket ID
                    {getSortIcon('id')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('productName')}
                >
                  <div className="flex items-center">
                    Product
                    {getSortIcon('productName')}
                  </div>
                </TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead
                  className="cursor-pointer select-none text-center"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center justify-center">
                    Priority
                    {getSortIcon('priority')}
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
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRepairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Wrench className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No repair requests found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentRepairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">#{repair.id}</TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-xs">
                        <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm line-clamp-2">
                            {repair.productName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Product ID: {repair.productId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-md">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {repair.remarks || 'No remarks provided'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{repair.user || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{repair.technician || 'Not assigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getPriorityBadge(repair.priority)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(repair.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">
                        {formatCurrency(repair.estimatedCost)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(repair)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(repair)}
                          title="Edit repair"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(repair)}
                          title="Delete repair"
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedRepairs.length)}{' '}
            of {filteredAndSortedRepairs.length} repair requests
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

      {/* Add Repair Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Repair Request</DialogTitle>
            <DialogDescription>Create a new repair ticket for a product</DialogDescription>
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
              <Label htmlFor="add-remarks">Issue / Remarks *</Label>
              <Textarea
                id="add-remarks"
                value={addForm.remarks}
                onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                placeholder="Brief description of the issue..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Detailed Description</Label>
              <Textarea
                id="add-description"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                placeholder="Detailed description of the problem and diagnostic findings..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-parts">Parts Required</Label>
              <Textarea
                id="add-parts"
                value={addForm.parts}
                onChange={(e) => setAddForm({ ...addForm, parts: e.target.value })}
                placeholder="List of parts needed for repair..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-customer">Customer Name</Label>
                <Input
                  id="add-customer"
                  value={addForm.user}
                  onChange={(e) => setAddForm({ ...addForm, user: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-technician">Assigned Technician</Label>
                <Input
                  id="add-technician"
                  value={addForm.technician}
                  onChange={(e) => setAddForm({ ...addForm, technician: e.target.value })}
                  placeholder="Technician name"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-status">Status *</Label>
                <Select
                  value={addForm.status}
                  onValueChange={(value) => setAddForm({ ...addForm, status: value })}
                >
                  <SelectTrigger id="add-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {repairStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-priority">Priority *</Label>
                <Select
                  value={addForm.priority}
                  onValueChange={(value) => setAddForm({ ...addForm, priority: value })}
                >
                  <SelectTrigger id="add-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-cost">Estimated Cost (₹)</Label>
                <Input
                  id="add-cost"
                  type="number"
                  value={addForm.estimatedCost}
                  onChange={(e) =>
                    setAddForm({ ...addForm, estimatedCost: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRepair}
              disabled={!addForm.productName || !addForm.remarks}
            >
              Add Repair Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Repair Request Details</DialogTitle>
            <DialogDescription>Complete information about the repair ticket</DialogDescription>
          </DialogHeader>
          {selectedRepair && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wrench className="h-4 w-4" />
                    <span className="font-medium">Ticket ID</span>
                  </div>
                  <p className="text-lg font-semibold">#{selectedRepair.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Product ID</span>
                  </div>
                  <p className="text-sm">{selectedRepair.productId}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Product Name</span>
                  </div>
                  <p className="text-sm font-medium">{selectedRepair.productName}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Customer Remarks</span>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                    <p className="text-sm">
                      {selectedRepair.remarks || 'No remarks provided'}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Detailed Description</span>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      {selectedRepair.description || 'No detailed description provided'}
                    </p>
                  </div>
                </div>
                {selectedRepair.parts && (
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Parts Required</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                      <p className="text-sm">{selectedRepair.parts}</p>
                    </div>
                  </div>
                )}
                {selectedRepair.feedback && (
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">Technician Feedback</span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                      <p className="text-sm">{selectedRepair.feedback}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Customer</span>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedRepair.user || 'Not specified'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wrench className="h-4 w-4" />
                    <span className="font-medium">Assigned Technician</span>
                  </div>
                  <p className="text-sm font-medium">
                    {selectedRepair.technician || 'Not assigned'}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Priority Level</span>
                  </div>
                  <div>{getPriorityBadge(selectedRepair.priority)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wrench className="h-4 w-4" />
                    <span className="font-medium">Repair Status</span>
                  </div>
                  <div>{getStatusBadge(selectedRepair.status)}</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Estimated Cost</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(selectedRepair.estimatedCost)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Request Date</span>
                  </div>
                  <p className="text-sm">{formatDate(selectedRepair.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm">{formatDate(selectedRepair.updatedAt)}</p>
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Repair Request</DialogTitle>
            <DialogDescription>Update repair information and status</DialogDescription>
          </DialogHeader>
          {selectedRepair && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-remarks">Issue / Remarks</Label>
                <Textarea
                  id="edit-remarks"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Detailed Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-feedback">Technician Feedback</Label>
                <Textarea
                  id="edit-feedback"
                  value={editForm.feedback}
                  onChange={(e) => setEditForm({ ...editForm, feedback: e.target.value })}
                  placeholder="Add feedback after completing the repair..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parts">Parts Used</Label>
                <Textarea
                  id="edit-parts"
                  value={editForm.parts}
                  onChange={(e) => setEditForm({ ...editForm, parts: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customer">Customer Name</Label>
                  <Input
                    id="edit-customer"
                    value={editForm.user}
                    onChange={(e) => setEditForm({ ...editForm, user: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-technician">Assigned Technician</Label>
                  <Input
                    id="edit-technician"
                    value={editForm.technician}
                    onChange={(e) =>
                      setEditForm({ ...editForm, technician: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {repairStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, priority: value })
                    }
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cost">Estimated Cost (₹)</Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    value={editForm.estimatedCost}
                    onChange={(e) =>
                      setEditForm({ ...editForm, estimatedCost: e.target.value })
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
              This action cannot be undone. This will permanently delete repair request{' '}
              <span className="font-semibold">#{selectedRepair?.id}</span> for product{' '}
              <span className="font-semibold">{selectedRepair?.productName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RepairManagementPage
