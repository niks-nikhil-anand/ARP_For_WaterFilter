'use client'

import { useState } from 'react'
import ShopSidebar from '@/components/shop/ShopSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dashboardStats, orders } from '@/lib/models/shopData'
import {
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const ShopDashboard = () => {
  const [stats] = useState(dashboardStats)

  const calculatePercentageChange = (current, previous) => {
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0
    }
  }

  const StatCard = ({ title, value, icon: Icon, change, prefix = '', suffix = '', color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
      orange: 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
      purple: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
    }

    return (
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
            {change && (
              <Badge className={change.isPositive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }>
                {change.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1 inline" /> : <ArrowDownRight className="h-3 w-3 mr-1 inline" />}
                {change.value}%
              </Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <ShopSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's what's happening with your shop today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Today's Sales"
              value={stats.todaySales}
              icon={IndianRupee}
              prefix="₹"
              color="green"
              change={calculatePercentageChange(stats.revenue.today, stats.revenue.yesterday)}
            />
            <StatCard
              title="Today's Orders"
              value={stats.todayOrders}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Active Orders"
              value={stats.activeOrders}
              icon={Clock}
              color="orange"
            />
          </div>

          {/* Monthly Overview */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="dark:text-white">Monthly Overview</CardTitle>
              <CardDescription className="dark:text-gray-400">November 2025 Performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">This Month Sales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{stats.monthSales.toLocaleString('en-IN')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {calculatePercentageChange(stats.revenue.thisMonth, stats.revenue.lastMonth).value}%
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">This Month Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.monthOrders}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Avg: ₹{Math.round(stats.monthSales / stats.monthOrders).toLocaleString('en-IN')} per order
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">This Week Sales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{stats.revenue.thisWeek.toLocaleString('en-IN')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {calculatePercentageChange(stats.revenue.thisWeek, stats.revenue.lastWeek).value}%
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">vs last week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Orders */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Recent Orders</CardTitle>
                <CardDescription className="dark:text-gray-400">Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{order.orderDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">₹{order.total.toLocaleString('en-IN')}</p>
                        <Badge className={`mt-1 ${getOrderStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Top Selling Products</CardTitle>
                <CardDescription className="dark:text-gray-400">Best performers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.unitsSold} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          ₹{product.revenue.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Inventory Alerts
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">RO Membrane 75 GPD</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stock level below minimum (8 units remaining)</p>
                  </div>
                  <Badge className="bg-orange-600 text-white">Low Stock</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">All other products are well stocked</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inventory levels are healthy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default ShopDashboard
