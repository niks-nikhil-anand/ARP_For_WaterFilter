'use client'

import { useState } from 'react'
import ShopSidebar from '@/components/shop/ShopSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { orders } from '@/lib/models/shopData'
import { FileText, Download, Eye, Printer } from 'lucide-react'

const InvoicesPage = () => {
  const invoices = orders.map(order => ({
    ...order,
    invoiceNumber: `INV-${order.orderNumber.split('-')[2]}`,
    invoiceDate: order.orderDate
  }))

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <ShopSidebar />
      <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Invoices</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage billing and invoices</p>
          </div>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Invoice List ({invoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Invoice #</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{invoice.customerName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.customerPhone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{invoice.invoiceDate}</td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          ₹{invoice.total.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className={invoice.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }>
                            {invoice.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default InvoicesPage
