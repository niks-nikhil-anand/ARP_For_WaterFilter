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
import { Input } from '@/components/ui/input'
import {
  Search,
  User,
  MapPin,
  Calendar as CalendarIcon,
  FileText,
  AlertCircle,
  Clock,
  Wrench,
  Settings,
  ShieldCheck,
  MessageCircle,
  AlertTriangle,
  HelpCircle,
  ArrowUpDown,
  Filter,
  X
} from 'lucide-react'
import { getAllComplaints } from '@/actions/common/complaints'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { SkeletonTable } from '@/components/common/SkeletonTable'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

interface ComplaintType {
  id: number
  userId: number
  user: {
    name: string
    email: string
    mobile: string | null | undefined
  }
  serviceType: string
  preferredDate?: Date | string | null
  preferredTime?: string | null
  address: string
  description?: string | null
  createdAt: Date | string
}

import { AddComplaintDialog } from '@/components/admin/complaints/AddComplaintDialog'

const ComplaintsManagementPage = () => {
  const [complaints, setComplaints] = useState<ComplaintType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Filter & Sort States
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterServiceType, setFilterServiceType] = useState('ALL')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    loadComplaints()
  }, [currentPage, searchTerm, sortBy, sortOrder, filterServiceType, dateRange])

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy,
        sortOrder,
        serviceType: filterServiceType === 'ALL' ? undefined : filterServiceType,
        startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
      }

      const result = await getAllComplaints(filters)
      if (result.success && result.data) {
        setComplaints(result.data)
        if (result.meta) {
          setTotalPages(result.meta.totalPages)
        }
      }
    } catch (error) {
      console.error('Error loading complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterServiceType('ALL')
    setDateRange(undefined)
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const formatDate = (date: Date | string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getServiceTypeConfig = (type: string) => {
    const normalizedType = type.toLowerCase()
    switch (normalizedType) {
      case 'installation':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
          icon: Wrench,
          label: 'Installation'
        }
      case 'repair':
        return {
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
          icon: Wrench,
          label: 'Repair'
        }
      case 'maintenance':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          icon: Settings,
          label: 'Maintenance'
        }
      case 'amc':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
          icon: ShieldCheck,
          label: 'AMC'
        }
      case 'consultation':
        return {
          color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
          icon: MessageCircle,
          label: 'Consultation'
        }
      case 'complaint':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
          icon: AlertTriangle,
          label: 'Complaint'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
          icon: HelpCircle,
          label: type
        }
    }
  }

  return (
    <div className="h-[90vh] max-h-[92vh] overflow-y-auto">
      <div className="container mx-auto py-10 px-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Complaints Management</h1>
              <p className="text-muted-foreground mt-2">
                View customer complaints and service requests
              </p>
            </div>
            <AddComplaintDialog onComplaintAdded={loadComplaints} />
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-1 gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, service..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              {/* Service Type Filter */}
              <Select
                value={filterServiceType}
                onValueChange={(val) => {
                  setFilterServiceType(val)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Services</SelectItem>
                  <SelectItem value="Installation">Installation</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="AMC">AMC</SelectItem>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[260px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range)
                      setCurrentPage(1)
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {(searchTerm || filterServiceType !== 'ALL' || dateRange) && (
              <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
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
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1">
                      ID <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('user.name')}>
                    <div className="flex items-center gap-1">
                      Customer <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('serviceType')}>
                    <div className="flex items-center gap-1">
                      Service Type <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('preferredDate')}>
                    <div className="flex items-center gap-1">
                      Preferred Date <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Preferred Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1">
                      Created Date <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8} className="p-0">
                        <SkeletonTable columns={8} rows={1} className="border-0" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">No complaints found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">#{complaint.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{complaint.user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {complaint.user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {complaint.user.mobile}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const config = getServiceTypeConfig(complaint.serviceType)
                          const Icon = config.icon
                          return (
                            <Badge variant="outline" className={`${config.color} flex items-center gap-1.5 w-fit`}>
                              <Icon className="h-3.5 w-3.5" />
                              {config.label}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate" title={complaint.address}>
                            {complaint.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(complaint.preferredDate || '')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{complaint.preferredTime || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate" title={complaint.description || ''}>
                            {complaint.description || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(complaint.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplaintsManagementPage
