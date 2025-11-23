import React from 'react'
import { getAllOrders } from '@/actions/common/orders'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Phone, Mail, MapPin, Package, CreditCard, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { OrderToolbar } from '@/components/admin/orders/OrderToolbar'

export default async function OrderDetailsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
  const limit = 10
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
  const paymentStatus = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const paymentMethod = typeof searchParams.payment === 'string' ? searchParams.payment : undefined

  const result = await getAllOrders(
    { search, paymentStatus, paymentMethod },
    page,
    limit
  )

  const orders = result.success ? result.data : []
  const pagination = result.pagination

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, string> = {
      CASH: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      ONLINE: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      UPI: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      CARD: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      NET_BANKING: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    }
    return variants[method] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      FAILED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    }
    return variants[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view all customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Total Orders: {pagination?.total || 0}
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <OrderToolbar />

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            Complete list of all customer orders with details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Orders Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.id.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customerName}</span>
                          {order.customerEmail && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {order.customerEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.product?.productName || order.product?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {order.product?.company} • {order.product?.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.customerPhone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {order.customerPhone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodBadge(order.paymentMethod)}>
                          {order.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusBadge(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.amountPaid?.toLocaleString('en-IN') || '0'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/order_details/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.current} of {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={`?page=${Math.max(1, pagination.current - 1)}${
                    search ? `&search=${search}` : ''
                  }${paymentStatus ? `&status=${paymentStatus}` : ''}${
                    paymentMethod ? `&payment=${paymentMethod}` : ''
                  }`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                </Link>
                <Link
                  href={`?page=${Math.min(pagination.pages, pagination.current + 1)}${
                    search ? `&search=${search}` : ''
                  }${paymentStatus ? `&status=${paymentStatus}` : ''}${
                    paymentMethod ? `&payment=${paymentMethod}` : ''
                  }`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current === pagination.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {orders && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination?.total || orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: any) => o.paymentStatus === 'PENDING').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((o: any) => o.paymentStatus === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue (Page)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹
                {orders
                  .filter((o: any) => o.paymentStatus === 'COMPLETED')
                  .reduce((sum: number, o: any) => sum + (o.amountPaid || 0), 0)
                  .toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
