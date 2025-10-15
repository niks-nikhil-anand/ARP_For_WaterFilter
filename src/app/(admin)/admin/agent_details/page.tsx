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

// Demo data based on Prisma Agency model
const demoAgencies = [
  {
    id: 1,
    name: 'AquaTech Services Bangalore',
    type: 'Installation & Service',
    addressCount: 3,
    addresses: [
      {
        id: 1,
        type: 'Head Office',
        locality: 'Indiranagar',
        state: 'Karnataka',
        country: 'India',
        pincode: '560038',
        phone: '+91 98765 43210',
        altPhone: '+91 98765 43211',
      },
      {
        id: 2,
        type: 'Branch Office',
        locality: 'Koramangala',
        state: 'Karnataka',
        country: 'India',
        pincode: '560095',
        phone: '+91 98765 43212',
      },
      {
        id: 3,
        type: 'Service Center',
        locality: 'Whitefield',
        state: 'Karnataka',
        country: 'India',
        pincode: '560066',
        phone: '+91 98765 43213',
      },
    ],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 2,
    name: 'PureWater Solutions India',
    type: 'Authorized Dealer',
    addressCount: 2,
    addresses: [
      {
        id: 4,
        type: 'Main Office',
        locality: 'HSR Layout',
        state: 'Karnataka',
        country: 'India',
        pincode: '560102',
        phone: '+91 98765 43214',
        altPhone: '+91 98765 43215',
      },
      {
        id: 5,
        type: 'Warehouse',
        locality: 'Electronic City',
        state: 'Karnataka',
        country: 'India',
        pincode: '560100',
        phone: '+91 98765 43216',
      },
    ],
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 3,
    name: 'Kent RO Service Network',
    type: 'Service Partner',
    addressCount: 4,
    addresses: [
      {
        id: 6,
        type: 'Regional Office',
        locality: 'MG Road',
        state: 'Karnataka',
        country: 'India',
        pincode: '560001',
        phone: '+91 98765 43217',
      },
      {
        id: 7,
        type: 'Service Center',
        locality: 'BTM Layout',
        state: 'Karnataka',
        country: 'India',
        pincode: '560076',
        phone: '+91 98765 43218',
      },
      {
        id: 8,
        type: 'Service Center',
        locality: 'Jayanagar',
        state: 'Karnataka',
        country: 'India',
        pincode: '560011',
        phone: '+91 98765 43219',
      },
      {
        id: 9,
        type: 'Parts Warehouse',
        locality: 'Peenya',
        state: 'Karnataka',
        country: 'India',
        pincode: '560058',
        phone: '+91 98765 43220',
      },
    ],
    createdAt: new Date('2023-05-10'),
    updatedAt: new Date('2024-10-13'),
  },
  {
    id: 4,
    name: 'Aquaguard Service Center',
    type: 'Service Partner',
    addressCount: 2,
    addresses: [
      {
        id: 10,
        type: 'Head Office',
        locality: 'Malleshwaram',
        state: 'Karnataka',
        country: 'India',
        pincode: '560003',
        phone: '+91 98765 43221',
      },
      {
        id: 11,
        type: 'Service Center',
        locality: 'Rajajinagar',
        state: 'Karnataka',
        country: 'India',
        pincode: '560010',
        phone: '+91 98765 43222',
      },
    ],
    createdAt: new Date('2023-07-05'),
    updatedAt: new Date('2024-10-10'),
  },
  {
    id: 5,
    name: 'Blue Star Authorized Service',
    type: 'Authorized Service Center',
    addressCount: 3,
    addresses: [
      {
        id: 12,
        type: 'Main Office',
        locality: 'Sarjapur Road',
        state: 'Karnataka',
        country: 'India',
        pincode: '560103',
        phone: '+91 98765 43223',
        altPhone: '+91 98765 43224',
      },
      {
        id: 13,
        type: 'Service Center',
        locality: 'Marathahalli',
        state: 'Karnataka',
        country: 'India',
        pincode: '560037',
        phone: '+91 98765 43225',
      },
      {
        id: 14,
        type: 'Branch Office',
        locality: 'Bellandur',
        state: 'Karnataka',
        country: 'India',
        pincode: '560103',
        phone: '+91 98765 43226',
      },
    ],
    createdAt: new Date('2023-08-18'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 6,
    name: 'Livpure Smart Service Hub',
    type: 'Installation & Service',
    addressCount: 1,
    addresses: [
      {
        id: 15,
        type: 'Office',
        locality: 'Yelahanka',
        state: 'Karnataka',
        country: 'India',
        pincode: '560064',
        phone: '+91 98765 43227',
      },
    ],
    createdAt: new Date('2023-09-25'),
    updatedAt: new Date('2024-10-11'),
  },
  {
    id: 7,
    name: 'AO Smith Service Excellence',
    type: 'Authorized Dealer',
    addressCount: 2,
    addresses: [
      {
        id: 16,
        type: 'Showroom',
        locality: 'JP Nagar',
        state: 'Karnataka',
        country: 'India',
        pincode: '560078',
        phone: '+91 98765 43228',
      },
      {
        id: 17,
        type: 'Service Center',
        locality: 'Banashankari',
        state: 'Karnataka',
        country: 'India',
        pincode: '560070',
        phone: '+91 98765 43229',
      },
    ],
    createdAt: new Date('2023-11-12'),
    updatedAt: new Date('2024-10-09'),
  },
  {
    id: 8,
    name: 'HUL Pureit Service Network',
    type: 'Service Partner',
    addressCount: 3,
    addresses: [
      {
        id: 18,
        type: 'Regional Hub',
        locality: 'Hebbal',
        state: 'Karnataka',
        country: 'India',
        pincode: '560024',
        phone: '+91 98765 43230',
        altPhone: '+91 98765 43231',
      },
      {
        id: 19,
        type: 'Service Point',
        locality: 'RT Nagar',
        state: 'Karnataka',
        country: 'India',
        pincode: '560032',
        phone: '+91 98765 43232',
      },
      {
        id: 20,
        type: 'Parts Center',
        locality: 'Yeshwanthpur',
        state: 'Karnataka',
        country: 'India',
        pincode: '560022',
        phone: '+91 98765 43233',
      },
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-10-12'),
  },
  {
    id: 9,
    name: 'Havells Water Care Services',
    type: 'Authorized Service Center',
    addressCount: 2,
    addresses: [
      {
        id: 21,
        type: 'Head Office',
        locality: 'Kalyan Nagar',
        state: 'Karnataka',
        country: 'India',
        pincode: '560043',
        phone: '+91 98765 43234',
      },
      {
        id: 22,
        type: 'Service Center',
        locality: 'Banaswadi',
        state: 'Karnataka',
        country: 'India',
        pincode: '560043',
        phone: '+91 98765 43235',
      },
    ],
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-10-14'),
  },
  {
    id: 10,
    name: 'Faber Service Pro',
    type: 'Installation & Service',
    addressCount: 1,
    addresses: [
      {
        id: 23,
        type: 'Office',
        locality: 'Kengeri',
        state: 'Karnataka',
        country: 'India',
        pincode: '560060',
        phone: '+91 98765 43236',
      },
    ],
    createdAt: new Date('2024-03-22'),
    updatedAt: new Date('2024-10-10'),
  },
]

type Agency = typeof demoAgencies[0]

const AgencyManagementPage = () => {
  const [agencies, setAgencies] = useState<Agency[]>(demoAgencies)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [sortField, setSortField] = useState<keyof Agency | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)

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
  const uniqueTypes = Array.from(new Set(demoAgencies.map((a) => a.type))).sort()

  // Filtering and sorting logic
  const filteredAndSortedAgencies = useMemo(() => {
    const filtered = agencies.filter((agency) => {
      const matchesSearch =
        agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.addresses.some((addr) =>
          addr.locality?.toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesType = typeFilter === 'ALL' || agency.type === typeFilter

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
  }, [agencies, searchTerm, typeFilter, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedAgencies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAgencies = filteredAndSortedAgencies.slice(startIndex, endIndex)

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: agencies.length,
      totalAddresses: agencies.reduce((acc, a) => acc + a.addressCount, 0),
      servicePartners: agencies.filter((a) => a.type === 'Service Partner').length,
      authorizedDealers: agencies.filter((a) => a.type === 'Authorized Dealer').length,
    }
  }, [agencies])

  // Sort handler
  const handleSort = (field: keyof Agency) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // CRUD handlers
  const handleView = (agency: Agency) => {
    setSelectedAgency(agency)
    setViewDialogOpen(true)
  }

  const handleEdit = (agency: Agency) => {
    setSelectedAgency(agency)
    setEditForm({
      name: agency.name,
      type: agency.type || '',
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (agency: Agency) => {
    setSelectedAgency(agency)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedAgency) {
      setAgencies(agencies.filter((a) => a.id !== selectedAgency.id))
      setDeleteDialogOpen(false)
      setSelectedAgency(null)
    }
  }

  const saveEdit = () => {
  if (selectedAgency) {
    setAgencies(
      agencies.map((a) =>
        a.id === selectedAgency.id
          ? {
              ...a,
              name: editForm.name,
              type: editForm.type || "",
              updatedAt: new Date(),
            }
          : a
      )
    )
    setEditDialogOpen(false)
    setSelectedAgency(null)
  }
}

const handleAddAgency = () => {
  const newAgency: Agency = {
    id: Math.max(...agencies.map((a) => a.id)) + 1,
    name: addForm.name,
    type: addForm.type || "", // 👈 changed null → ""
    addressCount: 0,
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  setAgencies([...agencies, newAgency])
}


  const getSortIcon = (field: keyof Agency) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    )
  }

  const getTypeBadge = (type: string | null) => {
    if (!type) return null

    const variants: Record<string, string> = {
      'Service Partner': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Authorized Dealer': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Installation & Service':
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Authorized Service Center':
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    }

    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}>
        {type}
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
            <h1 className="text-3xl font-bold tracking-tight">Agency Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage service agencies, dealers, and installation partners
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Agency
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Total Agencies</span>
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
              placeholder="Search by agency name, type, or location..."
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
                    Agency Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {getSortIcon('type')}
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
              {currentAgencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No agencies found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentAgencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">#{agency.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{agency.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(agency.type)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{agency.addressCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {agency.addresses.length > 0 ? (
                        <div className="text-sm">
                          <div className="font-medium">{agency.addresses[0].locality}</div>
                          <div className="text-xs text-muted-foreground">
                            {agency.addresses[0].state}, {agency.addresses[0].pincode}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No address</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agency.addresses.length > 0 && agency.addresses[0].phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{agency.addresses[0].phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(agency.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(agency)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(agency)}
                          title="Edit agency"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(agency)}
                          title="Delete agency"
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedAgencies.length)}{' '}
            of {filteredAndSortedAgencies.length} agencies
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

      {/* Add Agency Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Agency</DialogTitle>
            <DialogDescription>Create a new agency or service partner</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Agency Name *</Label>
              <Input
                id="add-name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Enter agency name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-type">Agency Type</Label>
              <Select
                value={addForm.type}
                onValueChange={(value) => setAddForm({ ...addForm, type: value })}
              >
                <SelectTrigger id="add-type">
                  <SelectValue placeholder="Select agency type" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
            <Button onClick={handleAddAgency} disabled={!addForm.name}>
              Add Agency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agency Details</DialogTitle>
            <DialogDescription>Complete information about the agency</DialogDescription>
          </DialogHeader>
          {selectedAgency && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Agency ID</span>
                  </div>
                  <p className="text-lg font-semibold">#{selectedAgency.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Total Locations</span>
                  </div>
                  <p className="text-lg font-semibold">{selectedAgency.addressCount}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Agency Name</span>
                  </div>
                  <p className="text-lg font-semibold">{selectedAgency.name}</p>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">Agency Type</span>
                  </div>
                  <div>{getTypeBadge(selectedAgency.type)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Created At</span>
                  </div>
                  <p className="text-sm">{formatDate(selectedAgency.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm">{formatDate(selectedAgency.updatedAt)}</p>
                </div>
              </div>

              {/* Addresses Section */}
              {selectedAgency.addresses.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Addresses</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedAgency.addresses.map((address, index) => (
                      <div
                        key={address.id}
                        className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{address.type || 'Office'}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Address #{index + 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Locality:</span>
                            <p className="font-medium">{address.locality || '-'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pincode:</span>
                            <p className="font-medium">{address.pincode || '-'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">State:</span>
                            <p className="font-medium">{address.state || '-'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Country:</span>
                            <p className="font-medium">{address.country || '-'}</p>
                          </div>
                          {address.phone && (
                            <div>
                              <span className="text-muted-foreground">Phone:</span>
                              <p className="font-medium">{address.phone}</p>
                            </div>
                          )}
                          {address.altPhone && (
                            <div>
                              <span className="text-muted-foreground">Alt Phone:</span>
                              <p className="font-medium">{address.altPhone}</p>
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
            <DialogTitle>Edit Agency</DialogTitle>
            <DialogDescription>Update agency information</DialogDescription>
          </DialogHeader>
          {selectedAgency && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Agency Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Agency Type</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
              This action cannot be undone. This will permanently delete the agency{' '}
              <span className="font-semibold">{selectedAgency?.name}</span> and all associated
              addresses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Agency
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AgencyManagementPage
