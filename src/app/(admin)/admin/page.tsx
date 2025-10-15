'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Store,
  Package,
  ShoppingCart,
  Wrench,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Sample data for charts
const monthlyOrdersData = [
  { month: 'Jan', orders: 45, revenue: 125000 },
  { month: 'Feb', orders: 52, revenue: 145000 },
  { month: 'Mar', orders: 48, revenue: 135000 },
  { month: 'Apr', orders: 61, revenue: 172000 },
  { month: 'May', orders: 55, revenue: 158000 },
  { month: 'Jun', orders: 67, revenue: 189000 },
  { month: 'Jul', orders: 72, revenue: 205000 },
  { month: 'Aug', orders: 68, revenue: 195000 },
  { month: 'Sep', orders: 75, revenue: 215000 },
  { month: 'Oct', orders: 82, revenue: 235000 },
]

const productCategoryData = [
  { name: 'RO + UV + UF', value: 35, count: 5 },
  { name: 'RO + UV', value: 28, count: 4 },
  { name: 'UV + UF', value: 15, count: 2 },
  { name: 'RO Only', value: 12, count: 2 },
  { name: 'Others', value: 10, count: 1 },
]

const repairStatusData = [
  { status: 'Pending', count: 4 },
  { status: 'In Progress', count: 3 },
  { status: 'Completed', count: 5 },
]

const warrantyStatusData = [
  { month: 'Jan', active: 8, expiring: 2, expired: 1 },
  { month: 'Feb', active: 9, expiring: 1, expired: 1 },
  { month: 'Mar', active: 10, expiring: 2, expired: 0 },
  { month: 'Apr', active: 11, expiring: 1, expired: 2 },
  { month: 'May', active: 10, expiring: 3, expired: 1 },
  { month: 'Jun', active: 12, expiring: 2, expired: 1 },
]

const shopPerformanceData = [
  { shop: 'Indiranagar', orders: 127, revenue: 356000 },
  { shop: 'Koramangala', orders: 198, revenue: 524000 },
  { shop: 'Whitefield', orders: 156, revenue: 412000 },
  { shop: 'Jayanagar', orders: 89, revenue: 245000 },
  { shop: 'BTM Layout', orders: 134, revenue: 367000 },
]

const recentActivities = [
  {
    id: 1,
    type: 'order',
    message: 'New order placed for Kent Grand Plus RO',
    customer: 'Arjun Mehta',
    time: '5 minutes ago',
    icon: ShoppingCart,
    color: 'text-green-600',
  },
  {
    id: 2,
    type: 'repair',
    message: 'Repair request completed',
    customer: 'Priya Nair',
    time: '15 minutes ago',
    icon: Wrench,
    color: 'text-blue-600',
  },
  {
    id: 3,
    type: 'warranty',
    message: 'Warranty expiring soon',
    customer: 'Rajesh Kumar',
    time: '1 hour ago',
    icon: ShieldCheck,
    color: 'text-yellow-600',
  },
  {
    id: 4,
    type: 'product',
    message: 'New product added to inventory',
    customer: 'System',
    time: '2 hours ago',
    icon: Package,
    color: 'text-purple-600',
  },
  {
    id: 5,
    type: 'order',
    message: 'Order shipped to customer',
    customer: 'Sneha Sharma',
    time: '3 hours ago',
    icon: ShoppingCart,
    color: 'text-green-600',
  },
]

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('monthly')

  // Calculate statistics
  const stats = {
    totalShops: 12,
    totalProducts: 189,
    totalOrders: 635,
    pendingRepairs: 7,
    activeWarranties: 12,
    totalRevenue: 1874000,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of your business
          </p>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(stats.totalRevenue / 100000).toFixed(1)}L
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">+{stats.revenueGrowth}%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600">+{stats.ordersGrowth}%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Shops Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShops}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalProducts} products in inventory
              </p>
            </CardContent>
          </Card>

          {/* Pending Repairs Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Repairs</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRepairs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeWarranties} active warranties
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">82</div>
              <p className="text-xs text-muted-foreground mt-2">
                Oct 2025 • ₹2.35L revenue
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Warranties Expiring</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-2">
                Within next 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">In Progress Repairs</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg. completion: 2.5 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Orders Trend */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue & Orders Trend</CardTitle>
              <CardDescription>Monthly revenue and order statistics for 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyOrdersData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue (₹)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Shop Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Shop Performance</CardTitle>
              <CardDescription>Orders and revenue by shop location</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shopPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="shop" type="category" width={100} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="orders" fill="#3b82f6" name="Orders" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Distribution of products by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Warranty Status Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Warranty Status Trend</CardTitle>
              <CardDescription>Active, expiring, and expired warranties</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={warrantyStatusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Active"
                  />
                  <Line
                    type="monotone"
                    dataKey="expiring"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Expiring Soon"
                  />
                  <Line
                    type="monotone"
                    dataKey="expired"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Expired"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Repair Status */}
          <Card>
            <CardHeader>
              <CardTitle>Repair Requests Status</CardTitle>
              <CardDescription>Current status of repair tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repairStatusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Requests">
                    {repairStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.status === 'Pending'
                            ? '#f59e0b'
                            : entry.status === 'In Progress'
                            ? '#3b82f6'
                            : '#10b981'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates and activities across all shops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.message}</p>
                      <p className="text-sm text-muted-foreground">{activity.customer}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best selling products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Kent Grand Plus RO', sales: 23, revenue: 367700 },
                  { name: 'Aquaguard Aura', sales: 19, revenue: 284810 },
                  { name: 'AO Smith Z9 Green', sales: 15, revenue: 389985 },
                  { name: 'Blue Star Aristo', sales: 14, revenue: 167860 },
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      ₹{(product.revenue / 1000).toFixed(1)}K
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Urgent Actions Required</CardTitle>
              <CardDescription>Items that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">2 warranties expiring this week</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact customers for renewal
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">4 pending repair requests</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Assign technicians immediately
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">5 products low in stock</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reorder inventory soon
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">12 orders delivered today</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Request customer feedback
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
