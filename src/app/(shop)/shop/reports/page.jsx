'use client'

import ShopSidebar from '@/components/shop/ShopSidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { dashboardStats } from '@/lib/models/shopData'
import { TrendingUp, Download, BarChart3, PieChart, Calendar, IndianRupee } from 'lucide-react'

const ReportsPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <ShopSidebar />
      <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sales Reports & Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive business insights</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Revenue Overview */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Today</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ₹{dashboardStats.revenue.today.toLocaleString('en-IN')}
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    12.5%
                  </Badge>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This Week</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{dashboardStats.revenue.thisWeek.toLocaleString('en-IN')}
                  </p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    20.2%
                  </Badge>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This Month</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    ₹{dashboardStats.revenue.thisMonth.toLocaleString('en-IN')}
                  </p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    11.8%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
                <CardDescription className="dark:text-gray-400">By revenue this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardStats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.unitsSold} units</p>
                      </div>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        ₹{product.revenue.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Sales by Category
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Distribution this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300">RO Systems</span>
                      <span className="font-semibold text-gray-900 dark:text-white">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Spare Parts</span>
                      <span className="font-semibold text-gray-900 dark:text-white">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300">UV Systems</span>
                      <span className="font-semibold text-gray-900 dark:text-white">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReportsPage
