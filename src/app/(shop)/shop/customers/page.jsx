'use client'

import { useState } from 'react'
import ShopSidebar from '@/components/shop/ShopSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { customers as initialCustomers } from '@/lib/models/shopData'
import { Users, Search, Phone, Mail, MapPin, IndianRupee, ShoppingCart, Eye } from 'lucide-react'

const CustomersPage = () => {
  const [customers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCustomerTypeColor = (type) => {
    switch (type) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Regular':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'New':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <ShopSidebar />

      <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Customer Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your customer database</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">VIP Customers</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {customers.filter(c => c.customerType === 'VIP').length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0)).toLocaleString('en-IN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 mb-6">
            <CardContent className="pt-6">
              <Label htmlFor="search" className="dark:text-white flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                Search Customers
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Customer List ({filteredCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Contact</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Orders</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Total Spent</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Joined: {customer.joinedDate}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Phone className="h-3 w-3" /> {customer.phone}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Mail className="h-3 w-3" /> {customer.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-gray-900 dark:text-white">
                          {customer.totalOrders}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          ₹{customer.totalSpent.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className={getCustomerTypeColor(customer.customerType)}>
                            {customer.customerType}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                              <Eye className="h-4 w-4" />
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

export default CustomersPage
