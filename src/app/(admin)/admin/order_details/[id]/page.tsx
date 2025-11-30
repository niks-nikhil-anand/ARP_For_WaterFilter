import React from 'react'
import { getOrderById } from '@/actions/common/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Mail,
  Package,
  CreditCard,
  Calendar,
  User,
  Building2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditOrderDialog } from '@/components/admin/orders/EditOrderDialog'
import { activateOrder } from '@/actions/common/orders'
import { toast } from 'sonner'
import { ActivateOrderButton } from '@/components/admin/orders/ActivateOrderButton'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = parseInt(params.id)
  const result = await getOrderById(orderId)

  if (!result.success || !result.data) {
    notFound()
  }

  const order = result.data
  const shop = order.product?.createdBy?.shops?.[0]

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }
  // ... existing code

  return (
    <div className="h-[85vh] overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/order_details">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order #{order.id.toString().padStart(4, '0')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {order.status !== 'ACTIVE' && (
            <ActivateOrderButton order={order} />
          )}
          <EditOrderDialog order={order} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {order.product?.productName || 'Unknown Product'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.product?.company} • {order.product?.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ₹{order.amountPaid?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Order Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <Badge variant={order.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Free Installation</p>
                  <p className="font-medium">{order.freeInstallation ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Installation Completed</p>
                  <p className="font-medium">{order.installationCompleted ? 'Yes' : 'No'}</p>
                </div>
                {order.installationDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Installation Date</p>
                    <p className="font-medium">{new Date(order.installationDate).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Free Warranty</p>
                  <p className="font-medium">{order.freeWarranty ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Additional Warranty</p>
                  <p className="font-medium">
                    {order.selectedAdditionalWarranty
                      ? `${order.selectedAdditionalWarranty} (Purchased)`
                      : order.additionalWarranty ? 'Yes' : 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AMC</p>
                  <p className="font-medium">
                    {order.selectedAMC
                      ? `${order.selectedAMC} (Purchased)`
                      : order.amcPurchased ? 'Yes' : 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                {order.customerEmail && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{order.customerEmail}</p>
                    </div>
                  </div>
                )}
                {order.customerPhone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Customer Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address Type</p>
                  <Badge variant="outline" className="capitalize">
                    {order.addressType || 'Home'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Apartment/House No</p>
                  <p className="font-medium">{order.apartmentNo || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Locality</p>
                  <p className="font-medium">{order.locality || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Landmark</p>
                  <p className="font-medium">{order.landmark || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pincode</p>
                  <p className="font-medium">{order.pincode || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">State</p>
                  <p className="font-medium">{order.state || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Country</p>
                  <p className="font-medium">{order.country || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shop Information */}
          {shop && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Shop Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-lg">{shop.shopName || shop.name}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Method</p>
                <Badge className="text-sm">
                  {order.paymentMethod}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Payment Status</p>
                <div className="flex items-center gap-2">
                  {getPaymentStatusIcon(order.paymentStatus)}
                  <Badge variant={order.paymentStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
              {order.transactionId && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm">{order.transactionId}</p>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Total Amount</p>
                  <p className="text-2xl font-bold">
                    ₹{order.amountPaid?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Order Placed</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              {order.updatedAt !== order.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Last Updated</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(order.updatedAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
