'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AgentNavbar from '@/components/agent/AgentNavbar'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  IndianRupee,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'

const AgentPage = () => {
  // Demo agent name
  const agentName = "Rajesh Kumar"

  // Extended sample ticket data with more tickets for pagination
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-001',
      customerName: 'Amit Sharma',
      phone: '+91 98765 43210',
      email: 'amit.sharma@example.com',
      address: '123, MG Road, Bangalore, Karnataka - 560001',
      issueType: 'Water Filter Repair',
      reason: 'Water flow is very slow and the water has an unusual taste. The filter might be clogged or needs replacement.',
      priority: 'High',
      dateCreated: '2025-11-15',
      timeCreated: '10:30 AM',
      status: 'Pending'
    },
    {
      id: 'TKT-002',
      customerName: 'Priya Patel',
      phone: '+91 87654 32109',
      email: 'priya.patel@example.com',
      address: '456, Residency Road, Ahmedabad, Gujarat - 380015',
      issueType: 'Regular Maintenance',
      reason: 'Annual maintenance service required. Filter was installed 11 months ago and needs routine checkup.',
      priority: 'Medium',
      dateCreated: '2025-11-16',
      timeCreated: '02:15 PM',
      status: 'Pending'
    },
    {
      id: 'TKT-003',
      customerName: 'Suresh Reddy',
      phone: '+91 76543 21098',
      email: 'suresh.reddy@example.com',
      address: '789, Jubilee Hills, Hyderabad, Telangana - 500033',
      issueType: 'Filter Replacement',
      reason: 'RO membrane needs replacement. Water TDS level is higher than normal. Last replacement was done 18 months ago.',
      priority: 'High',
      dateCreated: '2025-11-17',
      timeCreated: '09:00 AM',
      status: 'Pending'
    },
    {
      id: 'TKT-004',
      customerName: 'Neha Gupta',
      phone: '+91 98123 45678',
      email: 'neha.gupta@example.com',
      address: '22, Park Street, Kolkata, West Bengal - 700016',
      issueType: 'New Installation',
      reason: 'Need to install new RO water purifier. 6-member family.',
      priority: 'Low',
      dateCreated: '2025-11-14',
      timeCreated: '11:00 AM',
      status: 'Resolved'
    },
    {
      id: 'TKT-005',
      customerName: 'Vikram Singh',
      phone: '+91 99887 76655',
      email: 'vikram.singh@example.com',
      address: '567, Civil Lines, Delhi - 110054',
      issueType: 'Water Filter Repair',
      reason: 'Water purifier making unusual noise. Power indicator blinking.',
      priority: 'High',
      dateCreated: '2025-11-18',
      timeCreated: '08:45 AM',
      status: 'Pending'
    },
    {
      id: 'TKT-006',
      customerName: 'Anjali Mehta',
      phone: '+91 97654 32100',
      email: 'anjali.mehta@example.com',
      address: '890, Sector 21, Noida, Uttar Pradesh - 201301',
      issueType: 'Regular Maintenance',
      reason: 'Scheduled quarterly maintenance check.',
      priority: 'Low',
      dateCreated: '2025-11-13',
      timeCreated: '03:30 PM',
      status: 'Resolved'
    }
  ])

  // Filter and Sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('dateDesc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // State for resolve dialog
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [resolveData, setResolveData] = useState({
    timeSpent: '',
    amountCollected: '',
    partsReplaced: '',
    workDescription: '',
    resolutionNotes: ''
  })

  const handleResolveClick = (ticket) => {
    setSelectedTicket(ticket)
    setIsResolveDialogOpen(true)
    // Reset form
    setResolveData({
      timeSpent: '',
      amountCollected: '',
      partsReplaced: '',
      workDescription: '',
      resolutionNotes: ''
    })
  }

  const handleResolveSubmit = (e) => {
    e.preventDefault()

    // Update ticket status
    setTickets(tickets.map(ticket =>
      ticket.id === selectedTicket.id
        ? { ...ticket, status: 'Resolved', resolveData }
        : ticket
    ))

    // Close dialog
    setIsResolveDialogOpen(false)

    // Show success message
    alert(`Ticket ${selectedTicket.id} has been successfully resolved!`)

    console.log('Resolution Data:', {
      ticketId: selectedTicket.id,
      ...resolveData
    })
  }

  const handleInputChange = (e) => {
    setResolveData({
      ...resolveData,
      [e.target.name]: e.target.value
    })
  }

  // Filter, Sort, and Pagination Logic
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = [...tickets]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.issueType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dateAsc':
          return new Date(a.dateCreated) - new Date(b.dateCreated)
        case 'dateDesc':
          return new Date(b.dateCreated) - new Date(a.dateCreated)
        case 'priorityHigh':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'priorityLow':
          const priorityOrderLow = { 'High': 3, 'Medium': 2, 'Low': 1 }
          return priorityOrderLow[a.priority] - priorityOrderLow[b.priority]
        default:
          return 0
      }
    })

    return filtered
  }, [tickets, searchQuery, statusFilter, priorityFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTickets = filteredAndSortedTickets.slice(startIndex, endIndex)

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <AgentNavbar agentName={agentName} />

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Wrench className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Agent Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{agentName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Today's Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tickets</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {tickets.filter(t => t.status === 'Pending').length}
                  </p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Resolved Today</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {tickets.filter(t => t.status === 'Resolved').length}
                  </p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {tickets.length}
                  </p>
                </div>
                <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Assigned Tickets
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedTickets.length)} of {filteredAndSortedTickets.length} tickets
            </p>
          </div>

          {/* Search, Filter, and Sort Controls */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <Label htmlFor="search" className="dark:text-white flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4" />
                    Search Tickets
                  </Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name, ticket ID, or issue type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <Label htmlFor="statusFilter" className="dark:text-white flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4" />
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div>
                  <Label htmlFor="priorityFilter" className="dark:text-white flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4" />
                    Priority
                  </Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="All">All Priority</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mt-4">
                <Label htmlFor="sortBy" className="dark:text-white flex items-center gap-2 mb-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="dateDesc">Date: Newest First</SelectItem>
                    <SelectItem value="dateAsc">Date: Oldest First</SelectItem>
                    <SelectItem value="priorityHigh">Priority: High to Low</SelectItem>
                    <SelectItem value="priorityLow">Priority: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          {currentTickets.length === 0 ? (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400">No tickets found</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Try adjusting your filters or search query
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {currentTickets.map((ticket) => (
            <Card key={ticket.id} className="dark:bg-gray-900 dark:border-gray-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl dark:text-white flex items-center gap-2">
                      Ticket #{ticket.id}
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority} Priority
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2 dark:text-gray-400">
                      {ticket.issueType}
                    </CardDescription>
                  </div>
                  {ticket.status === 'Pending' && (
                    <Button
                      onClick={() => handleResolveClick(ticket)}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Resolve
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Customer Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 pl-7">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <a href={`tel:${ticket.phone}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          {ticket.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <a href={`mailto:${ticket.email}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          {ticket.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Issue Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Issue Details
                  </h3>
                  <div className="pl-7">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Problem Description</p>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {ticket.reason}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Ticket Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">{ticket.dateCreated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">{ticket.timeCreated}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

              {/* Pagination Controls */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="dark:border-gray-700 dark:text-white"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNum = index + 1
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className={currentPage === pageNum
                                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                  : "dark:border-gray-700 dark:text-white"}
                              >
                                {pageNum}
                              </Button>
                            )
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return <span key={pageNum} className="px-2 text-gray-500">...</span>
                          }
                          return null
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="dark:border-gray-700 dark:text-white"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="dark:bg-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              Resolve Ticket
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedTicket && `Ticket #${selectedTicket.id} - ${selectedTicket.customerName}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResolveSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Time Spent */}
              <div>
                <Label htmlFor="timeSpent" className="dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Spent (hours) *
                </Label>
                <Input
                  id="timeSpent"
                  name="timeSpent"
                  type="number"
                  step="0.5"
                  required
                  value={resolveData.timeSpent}
                  onChange={handleInputChange}
                  className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="e.g., 2.5"
                />
              </div>

              {/* Amount Collected */}
              <div>
                <Label htmlFor="amountCollected" className="dark:text-white flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Amount Collected (₹) *
                </Label>
                <Input
                  id="amountCollected"
                  name="amountCollected"
                  type="number"
                  required
                  value={resolveData.amountCollected}
                  onChange={handleInputChange}
                  className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="e.g., 1500"
                />
              </div>
            </div>

            {/* Parts Replaced */}
            <div>
              <Label htmlFor="partsReplaced" className="dark:text-white flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Parts Replaced/Used *
              </Label>
              <Input
                id="partsReplaced"
                name="partsReplaced"
                type="text"
                required
                value={resolveData.partsReplaced}
                onChange={handleInputChange}
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="e.g., RO Membrane, Carbon Filter"
              />
            </div>

            {/* Work Description */}
            <div>
              <Label htmlFor="workDescription" className="dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Work Description *
              </Label>
              <Textarea
                id="workDescription"
                name="workDescription"
                required
                value={resolveData.workDescription}
                onChange={handleInputChange}
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Describe the work performed..."
                rows={3}
              />
            </div>

            {/* Resolution Notes */}
            <div>
              <Label htmlFor="resolutionNotes" className="dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="resolutionNotes"
                name="resolutionNotes"
                value={resolveData.resolutionNotes}
                onChange={handleInputChange}
                className="mt-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="Any additional information or recommendations..."
                rows={2}
              />
            </div>

            <Separator />

            {/* Summary Box */}
            {selectedTicket && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Resolution Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-blue-700 dark:text-blue-300">Customer:</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">{selectedTicket.customerName}</p>
                  <p className="text-blue-700 dark:text-blue-300">Ticket ID:</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">{selectedTicket.id}</p>
                  <p className="text-blue-700 dark:text-blue-300">Date:</p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResolveDialogOpen(false)}
                className="dark:border-gray-700 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Resolution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AgentPage