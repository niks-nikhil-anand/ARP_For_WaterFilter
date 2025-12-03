'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getUserDetails } from '@/app/actions/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ChevronLeft,
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    Ticket,
    Shield,
    ShoppingBag,
    Activity,
    AlertCircle,
    FileText,
    Loader2,
    Wrench,
    MessageSquare,
    ClipboardList,
} from 'lucide-react'
import { UserStatus } from '@/generated/prisma'

// Define types based on the return type of getUserDetails
type UserDetails = any

const CustomerDetailsSkeleton = () => {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <Skeleton className="h-10 w-full md:w-[600px]" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Skeleton className="h-4 w-4 mt-1 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-64" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

const CustomerDetailsPage = () => {
    const params = useParams()
    const router = useRouter()
    const [user, setUser] = useState<UserDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            if (!params.id) return
            setIsLoading(true)
            try {
                const result = await getUserDetails(Number(params.id))
                if (result.success && result.data) {
                    setUser(result.data)
                } else {
                    setError(result.error || 'Failed to load user details')
                }
            } catch (err) {
                setError('An unexpected error occurred')
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [params.id])

    if (isLoading) {
        return <CustomerDetailsSkeleton />
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-lg font-medium text-red-500">{error || 'User not found'}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    // Stats
    const totalRevenue = user.ordersCreated.reduce(
        (sum: number, order: any) => sum + (Number(order.amountPaid) || 0),
        0
    )

    // Calculate AMC Pending Amount
    const amcPendingAmount = user.amcs.reduce((sum: number, amc: any) => {
        const contractSum = amc.contracts?.reduce((cSum: number, contract: any) => {
            return cSum + (Number(contract.paymentDue) || 0)
        }, 0) || 0
        return sum + contractSum
    }, 0)

    // Calculate Warranty Pending Amount (based on linked order payment status)
    const warrantyPendingAmount = user.warranties.reduce((sum: number, warranty: any) => {
        if (warranty.warrantyType === 'EXTENDED' && warranty.order?.paymentStatus === 'PENDING') {
            return sum + (Number(warranty.warrantyAmount) || 0)
        }
        return sum
    }, 0)

    const openTickets = user.tickets.filter(
        (t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
    ).length
    const closedTickets = user.tickets.filter(
        (t: any) => t.status === 'RESOLVED' || t.status === 'CLOSED'
    ).length

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    // Helper for status colors
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
            PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
            BLOCKED: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
            OPEN: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
            IN_PROGRESS: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200',
            RESOLVED: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
            CLOSED: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
            CANCELLED: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100',
            COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
            PAID: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
        }
        return (
            <Badge className={`${styles[status] || 'bg-gray-100 text-gray-800'} border shadow-none`}>
                {status}
            </Badge>
        )
    }

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            LOW: 'bg-gray-100 text-gray-800 border-gray-200',
            MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
            HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
            URGENT: 'bg-red-50 text-red-700 border-red-200',
        }
        return (
            <Badge className={`${styles[priority] || 'bg-gray-100 text-gray-800'} border shadow-none`}>
                {priority}
            </Badge>
        )
    }

    return (
        <div className="container mx-auto py-6 px-2 space-y-6 max-w-[98%]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="h-10 w-10">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                        <div className="flex items-center gap-3 text-muted-foreground mt-1">
                            <span className="flex items-center gap-1 text-sm">
                                <Shield className="h-3 w-3" />
                                ID: #{user.id}
                            </span>
                            <span className="text-gray-300">|</span>
                            {getStatusBadge(user.status)}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Add actions here if needed, e.g. Edit User */}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime value</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">AMC Pending</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{amcPendingAmount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Due from contracts</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Warranty Pending</CardTitle>
                        <Shield className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{warrantyPendingAmount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Unpaid extended warranties</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
                        <Ticket className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openTickets}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Closed Tickets</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{closedTickets}</div>
                        <p className="text-xs text-muted-foreground mt-1">Successfully resolved</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full space-y-6">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg">
                    <TabsTrigger value="overview" className="gap-2 py-2">
                        <User className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="tickets" className="gap-2 py-2">
                        <Ticket className="h-4 w-4" /> Tickets
                    </TabsTrigger>
                    <TabsTrigger value="warranties" className="gap-2 py-2">
                        <Shield className="h-4 w-4" /> Warranties
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="gap-2 py-2">
                        <ShoppingBag className="h-4 w-4" /> Orders
                    </TabsTrigger>
                    <TabsTrigger value="events" className="gap-2 py-2">
                        <Wrench className="h-4 w-4" /> Events
                    </TabsTrigger>
                    <TabsTrigger value="complaints" className="gap-2 py-2">
                        <MessageSquare className="h-4 w-4" /> Complaints
                    </TabsTrigger>
                    <TabsTrigger value="amcs" className="gap-2 py-2">
                        <ClipboardList className="h-4 w-4" /> AMCs
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                                        <p className="font-medium">{user.mobile || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Joined Date</p>
                                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Addresses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.addresses && user.addresses.length > 0 ? (
                                    <div className="space-y-4">
                                        {user.addresses.map((addr: any) => (
                                            <div key={addr.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-1">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{addr.type || 'Address'}</span>
                                                        {addr.isDefault && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {addr.apartmentNo && `${addr.apartmentNo}, `}
                                                        {addr.locality}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {addr.landmark && `Near ${addr.landmark}, `}
                                                        {addr.pincode}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {addr.state}, {addr.country}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                                                        <Phone className="h-3 w-3" />
                                                        {addr.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                        <MapPin className="h-8 w-8 mb-2 opacity-50" />
                                        <p>No addresses found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tickets Tab */}
                <TabsContent value="tickets">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket ID</TableHead>
                                        <TableHead>Service Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Assigned Agent</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.tickets.length > 0 ? (
                                        user.tickets.map((ticket: any) => (
                                            <TableRow key={ticket.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">#{ticket.id}</TableCell>
                                                <TableCell>{ticket.serviceType}</TableCell>
                                                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                                                <TableCell>
                                                    {ticket.assignedToAgent?.user?.name ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                                {ticket.assignedToAgent.user.name.charAt(0)}
                                                            </div>
                                                            {ticket.assignedToAgent.user.name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Unassigned</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No tickets found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Warranties Tab */}
                <TabsContent value="warranties">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Warranties</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.warranties.length > 0 ? (
                                        user.warranties.map((warranty: any) => (
                                            <TableRow key={warranty.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{warranty.product?.productName || 'Unknown Product'}</TableCell>
                                                <TableCell>{warranty.warrantyType}</TableCell>
                                                <TableCell>
                                                    <Badge variant={warranty.isActive ? 'default' : 'destructive'} className={warranty.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 shadow-none' : ''}>
                                                        {warranty.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(warranty.startDate)}</TableCell>
                                                <TableCell>{formatDate(warranty.endDate)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No warranties found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.ordersCreated.length > 0 ? (
                                        user.ordersCreated.map((order: any) => (
                                            <TableRow key={order.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">#{order.id}</TableCell>
                                                <TableCell>{order.product?.productName || 'Unknown Product'}</TableCell>
                                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                <TableCell className="font-medium">₹{order.amountPaid || 0}</TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No orders found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event Type</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action Date</TableHead>
                                        <TableHead>Assigned To</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.serviceEvents.length > 0 ? (
                                        user.serviceEvents.map((event: any) => (
                                            <TableRow key={event.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{event.type}</TableCell>
                                                <TableCell>{event.product?.productName || 'Unknown Product'}</TableCell>
                                                <TableCell>{getStatusBadge(event.status)}</TableCell>
                                                <TableCell>{event.actionDate ? formatDate(event.actionDate) : 'N/A'}</TableCell>
                                                <TableCell>
                                                    {event.assignedTo?.user?.name || <span className="text-muted-foreground italic">Unassigned</span>}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No service events found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Complaints Tab */}
                <TabsContent value="complaints">
                    <Card>
                        <CardHeader>
                            <CardTitle>Complaints</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Service Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.complaints.length > 0 ? (
                                        user.complaints.map((complaint: any) => (
                                            <TableRow key={complaint.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">#{complaint.id}</TableCell>
                                                <TableCell>{complaint.serviceType}</TableCell>
                                                <TableCell className="max-w-md truncate text-muted-foreground">{complaint.description}</TableCell>
                                                <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No complaints found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AMCs Tab */}
                <TabsContent value="amcs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Annual Maintenance Contracts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>AMC ID</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Due Amount</TableHead>
                                        <TableHead>Services</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.amcs.length > 0 ? (
                                        user.amcs.flatMap((amc: any) =>
                                            amc.contracts && amc.contracts.length > 0
                                                ? amc.contracts.map((contract: any) => ({ ...contract, amcUniqueId: amc.amcUniqueId, productName: amc.product?.productName, amcStatus: amc.status }))
                                                : [{ ...amc, isPlaceholder: true }]
                                        ).map((item: any, index: number) => {
                                            if (item.isPlaceholder) {
                                                return (
                                                    <TableRow key={`placeholder-${item.id}`} className="hover:bg-muted/50">
                                                        <TableCell className="font-medium">{item.amcUniqueId}</TableCell>
                                                        <TableCell>{item.product?.productName || 'Unknown Product'}</TableCell>
                                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                        <TableCell colSpan={5} className="text-center text-muted-foreground italic">No contracts found</TableCell>
                                                    </TableRow>
                                                )
                                            }
                                            return (
                                                <TableRow key={item.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">{item.amcUniqueId}</TableCell>
                                                    <TableCell>{item.productName || 'Unknown Product'}</TableCell>
                                                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                    <TableCell>{formatDate(item.startDate)}</TableCell>
                                                    <TableCell>{formatDate(item.endDate)}</TableCell>
                                                    <TableCell>₹{item.finalPrice || item.price || 0}</TableCell>
                                                    <TableCell className={item.paymentDue > 0 ? "text-red-500 font-medium" : "text-green-600"}>
                                                        ₹{item.paymentDue || 0}
                                                    </TableCell>
                                                    <TableCell>{item.noOfServices} Services</TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No AMCs found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default CustomerDetailsPage
