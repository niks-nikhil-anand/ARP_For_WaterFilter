'use client';

import React from 'react';
import { Calendar, Mail, Phone, MapPin, Package, Store, User, Hash } from 'lucide-react';

interface OrderReceiptProps {
  order: {
    id: number;
    productId: number;
    productName: string;

    shopName: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    orderStatus: string;
    createdAt: Date;
    updatedAt: Date;
    invoiceNumber: string;
  };
  // Additional details that would come from your database
  productDetails?: {
    company?: string;
    type?: string;
    price?: number;
    warrantyPeriod?: string;
  };
  shopDetails?: {
    address?: string;
    phone?: string;
    email?: string;
  };
}

const OrderReceipt = React.forwardRef<HTMLDivElement, OrderReceiptProps>(
  ({ order, productDetails, shopDetails }, ref) => {
    const currentDate = new Date();

    // Calculate prices (you can replace these with actual values from your database)
    const basePrice = productDetails?.price || 15999;
    const taxRate = 0.18; // 18% GST
    const subtotal = basePrice;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return (
      <div
        ref={ref}
        data-receipt="true"
        className="bg-white p-8 w-full max-w-4xl mx-auto"
        style={{ fontFamily: 'Arial, sans-serif', minWidth: '800px' }}
      >
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🏢 Samarth Enterprise
              </h1>
              <p className="text-sm text-gray-600">WaterFilter Management System</p>
              <p className="text-sm text-gray-600 mt-1">
                GST No: 29AABCU9603R1ZX
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ORDER RECEIPT</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center justify-end gap-1">
                  <Hash className="h-3 w-3" />
                  Order ID: #{order.id}
                </p>
                <p className="flex items-center justify-end gap-1">
                  <Hash className="h-3 w-3" />
                  Invoice: <span className="font-mono font-semibold">{order.invoiceNumber}</span>
                </p>
                <p className="flex items-center justify-end gap-1">
                  <Calendar className="h-3 w-3" />
                  Date: {order.createdAt.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shop and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* From (Shop) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Store className="h-4 w-4" />
              FROM
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-semibold text-base">{order.shopName}</p>
              {shopDetails?.address && (
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{shopDetails.address}</span>
                </p>
              )}
              {shopDetails?.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{shopDetails.phone}</span>
                </p>
              )}
              {shopDetails?.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{shopDetails.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* To (Customer) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              TO
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-semibold text-base">{order.customerName}</p>
              {order.customerEmail && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{order.customerEmail}</span>
                </p>
              )}
              {order.customerPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{order.customerPhone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border-2 border-gray-300">
            <span className="text-sm font-semibold text-gray-700">
              Status: {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Product Details Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left py-3 px-4 text-sm font-semibold">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Product Details</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Qty</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Unit Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-sm">1</td>
                <td className="py-4 px-4">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{order.productName}</p>
                      {productDetails?.company && (
                        <p className="text-xs text-gray-600 mt-1">
                          Brand: {productDetails.company}
                        </p>
                      )}
                      {productDetails?.type && (
                        <p className="text-xs text-gray-600">Type: {productDetails.type}</p>
                      )}
                      {productDetails?.warrantyPeriod && (
                        <p className="text-xs text-gray-600">
                          Warranty: {productDetails.warrantyPeriod}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-right">1</td>
                <td className="py-4 px-4 text-sm text-right">
                  ₹{basePrice.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-4 text-sm font-semibold text-right">
                  ₹{basePrice.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-semibold">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t-2 border-gray-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Timeline</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                • Order Placed:{' '}
                {order.createdAt.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>
                • Last Updated:{' '}
                {order.updatedAt.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>All products come with manufacturer warranty</li>
              <li>Free installation included within service area</li>
              <li>Payment terms: As per agreed terms</li>
              <li>For queries, please contact the shop directly</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-800 text-center">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Thank you for your order!
          </p>
          <p className="text-xs text-gray-600">
            This is a computer-generated receipt and does not require a signature.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            For support, please contact: support@samarthenterprise.com | +91 98765 43210
          </p>
        </div>

        {/* Watermark */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Generated on:{' '}
            {currentDate.toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    );
  }
);

OrderReceipt.displayName = 'OrderReceipt';

export default OrderReceipt;
