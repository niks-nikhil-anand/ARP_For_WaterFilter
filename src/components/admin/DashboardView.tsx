'use client';

import React from 'react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import {
    Store, Package, ShoppingCart, Wrench, ShieldCheck, TrendingUp, DollarSign,
    Clock, CheckCircle, AlertCircle, Users, FileText, Calendar
} from 'lucide-react';

interface DashboardViewProps {
    stats: {
        totalRevenue: number;
        totalSaleRevenue: number;
        totalAMCRevenue: number;
        totalPendingAmount: number;
        totalOrders: number;
        totalShops: number;
        totalProducts: number;
        totalAgents: number;
        totalComplaints: number;
        totalServiceEvents: number;
        pendingTickets: number;
        activeWarranties: number;
    };
    graphData: { name: string; revenue: number; orders: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardView: React.FC<DashboardViewProps> = ({ stats, graphData }) => {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="h-[90vh] max-h-[92vh] overflow-y-auto">
            <div className="container mx-auto py-10 px-4 pb-20">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-2">
                            Welcome back! Here&apos;s an overview of your business
                        </p>
                    </div>

                    {/* Financial Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Combined Sales & AMC
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalSaleRevenue)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    From Orders
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">AMC Revenue</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalAMCRevenue)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    From Contracts
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalPendingAmount)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Due from AMCs
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Operational Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalAgents}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalComplaints}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Service Events</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalServiceEvents}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
                                <Store className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalShops}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingTickets}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Warranties</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.activeWarranties}</div>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Charts Section */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Revenue & Orders Trend */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Revenue & Orders Trend</CardTitle>
                                <CardDescription>Monthly revenue and order statistics (Last 6 Months)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={graphData}>
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
                                        <XAxis dataKey="name" className="text-xs" />
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
