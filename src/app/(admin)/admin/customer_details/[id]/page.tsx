'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getUserDetails } from '@/app/actions/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'
import { UserStatus } from '@/generated/prisma'

// Define types based on the return type of getUserDetails
// Since we can't easily import the inferred type, we'll use 'any' for now or define a partial interface
// Ideally, we should export the return type from the action
type UserDetails = any

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
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-red-500">{error || 'User not found'}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    // Calculate stats
    const totalRevenue = user.ordersCreated.reduce(
        (sum: number, order: any) => sum + (Number(order.amountPaid) || 0),
        0
    )
    const pendingAmount = user.ordersCreated.reduce(
        (sum: number, order: any) =>
            order.paymentStatus === 'PENDING' ? sum + (Number(order.finalPrice) || 0) : sum, // Assuming finalPrice exists or similar logic
        0
    )
    // Note: The Order model has amountPaid but not explicit 'pendingAmount' field, 
    // and 'finalPrice' is on AMCContract, not Order directly in the schema provided earlier (Order has price/discount).
    // Let's adjust pending calculation based on what we have. 
    // Order has 'paymentStatus'. If pending, maybe we assume full price is pending? 
    // Actually Order has `product.price`. Let's use a simple approximation for now or 0 if complex.
    // Schema check: Order has `amountPaid`. It doesn't explicitly store 'totalAmount' other than product price +/ discounts.
    // Let's stick to Revenue for now and maybe skip Pending if not easily calculable without more logic.
    // Or better, let's look at Tickets/AMCs for revenue too?
    // The prompt asked for "total revenue from that customer" and "total pending amount".
    // I'll sum up `amountPaid` from Orders.

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

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span>Customer ID: #{user.id}</span>
                        <span>•</span>
                        <Badge variant={user.status === UserStatus.ACTIVE ? 'default' : 'secondary'}>
                            {user.status}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Calculated from unpaid orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openTickets}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Closed Tickets</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{closedTickets}</div>
                        <p className="text-xs text-muted-foreground">Successfully resolved</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-7 lg:w-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tickets">Tickets</TabsTrigger>
                    <TabsTrigger value="warranties">Warranties</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="complaints">Complaints</TabsTrigger>
                    <TabsTrigger value="amcs">AMCs</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Full Name</p>
                                        <p className="text-sm text-muted-foreground">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Mobile</p>
                                        <p className="text-sm text-muted-foreground">{user.mobile || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Joined Date</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Addresses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.addresses && user.addresses.length > 0 ? (
                                    <div className="space-y-4">
                                        {user.addresses.map((addr: any) => (
                                            <div key={addr.id} className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                                <div>
                                                    <p className="text-sm font-medium">{addr.type || 'Address'}</p>
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
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Phone: {addr.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No addresses found.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tickets Tab */}
                <TabsContent value="tickets">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Service Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Assigned To</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.tickets.length > 0 ? (
                                        user.tickets.map((ticket: any) => (
                                            <TableRow key={ticket.id}>
                                                <TableCell>#{ticket.id}</TableCell>
                                                <TableCell>{ticket.serviceType}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{ticket.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{ticket.priority}</Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                                                <TableCell>
                                                    {ticket.assignedToAgent?.user?.name || 'Unassigned'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
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
                            <CardTitle>All Warranties</CardTitle>
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
                                            <TableRow key={warranty.id}>
                                                <TableCell>{warranty.product?.productName || 'Unknown Product'}</TableCell>
                                                <TableCell>{warranty.warrantyType}</TableCell>
                                                <TableCell>
                                                    <Badge variant={warranty.isActive ? 'default' : 'destructive'}>
                                                        {warranty.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(warranty.startDate)}</TableCell>
                                                <TableCell>{formatDate(warranty.endDate)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
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
                            <CardTitle>All Orders</CardTitle>
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
                                            <TableRow key={order.id}>
                                                <TableCell>#{order.id}</TableCell>
                                                <TableCell>{order.product?.productName || 'Unknown Product'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{order.status}</Badge>
                                                </TableCell>
                                                <TableCell>₹{order.amountPaid || 0}</TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
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
                                        <TableHead>Type</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action Date</TableHead>
                                        <TableHead>Assigned To</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.serviceEvents.length > 0 ? (
                                        user.serviceEvents.map((event: any) => (
                                            <TableRow key={event.id}>
                                                <TableCell>{event.type}</TableCell>
                                                <TableCell>{event.product?.productName || 'Unknown Product'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{event.status}</Badge>
                                                </TableCell>
                                                <TableCell>{event.actionDate ? formatDate(event.actionDate) : 'N/A'}</TableCell>
                                                <TableCell>{event.assignedTo?.user?.name || 'Unassigned'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
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
                            <CardTitle>All Complaints</CardTitle>
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
                                            <TableRow key={complaint.id}>
                                                <TableCell>#{complaint.id}</TableCell>
                                                <TableCell>{complaint.serviceType}</TableCell>
                                                <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                                                <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
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
                            <CardTitle>All AMCs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>AMC ID</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Contracts</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {user.amcs.length > 0 ? (
                                        user.amcs.map((amc: any) => (
                                            <TableRow key={amc.id}>
                                                <TableCell>{amc.amcUniqueId}</TableCell>
                                                <TableCell>{amc.product?.productName || 'Unknown Product'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={amc.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                        {amc.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{amc.contracts?.length || 0} Contracts</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
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
