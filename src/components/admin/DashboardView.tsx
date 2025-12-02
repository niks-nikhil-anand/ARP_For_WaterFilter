'use client';

import React, { useState, useTransition, useEffect } from 'react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import {
    Store, Package, ShoppingCart, Wrench, ShieldCheck, TrendingUp, DollarSign,
    Clock, CheckCircle, AlertCircle, Users, FileText, Calendar as CalendarIcon, Filter, PenLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardStats } from '@/actions/admin/dashboard';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface DashboardViewProps {
    stats: {
        totalRevenue: number;
        totalSaleRevenue: number;
        totalAMCRevenue: number;
        totalWarrantyRevenue: number;
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

const DashboardView: React.FC<DashboardViewProps> = ({ stats: initialStats, graphData: initialGraphData }) => {
    const [stats, setStats] = useState(initialStats);
    const [graphData, setGraphData] = useState(initialGraphData);
    const [isPending, startTransition] = useTransition();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter State
    const [filterType, setFilterType] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth()));
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

    const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleApplyFilter = () => {
        startTransition(async () => {
            let from: Date | undefined;
            let to: Date | undefined;

            if (filterType === 'monthly') {
                const date = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
                from = startOfMonth(date);
                to = endOfMonth(date);
            } else if (filterType === 'yearly') {
                const date = new Date(parseInt(selectedYear), 0, 1);
                from = startOfYear(date);
                to = endOfYear(date);
            }

            try {
                const data = await getDashboardStats(from, to);
                setStats(data.stats);
                setGraphData(data.graphData);
                setIsFilterOpen(false);
            } catch (error) {
                console.error("Failed to update dashboard stats", error);
                // Optionally show error toast
            }
        });
    };

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
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-muted-foreground mt-2">
                                Welcome back! Here&apos;s an overview of your business
                            </p>
                        </div>
                        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <PenLine className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Filter Dashboard</DialogTitle>
                                    <DialogDescription>
                                        Select a date range to filter the statistics and graphs.
                                    </DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="monthly" value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="monthly" className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Month</label>
                                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select month" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {months.map((month, index) => (
                                                            <SelectItem key={month} value={String(index)}>
                                                                {month}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Year</label>
                                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select year" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {years.map((year) => (
                                                            <SelectItem key={year} value={year}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="yearly" className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Year</label>
                                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={year}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                <DialogFooter>
                                    <Button onClick={handleApplyFilter} disabled={isPending}>
                                        {isPending ? 'Updating...' : 'Apply Filter'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                                <CardTitle className="text-sm font-medium">Warranty Revenue</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalWarrantyRevenue)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    From Extended Warranties
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
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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
                                <CardDescription>
                                    {filterType === 'monthly' && `Monthly stats for ${months[parseInt(selectedMonth)]} ${selectedYear}`}
                                    {filterType === 'yearly' && `Monthly stats for ${selectedYear}`}
                                    {!isFilterOpen && filterType === 'monthly' && !selectedMonth && "Revenue and order statistics"}
                                </CardDescription>
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
