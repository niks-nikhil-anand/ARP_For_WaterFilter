'use server';

import prisma from '@/lib/prisma';
import { TicketStatus } from '@/generated/prisma';
import { startOfDay, endOfDay, differenceInDays, format, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';

export async function getDashboardStats(from?: Date, to?: Date) {
  try {
    const today = new Date();
    // Default to last 6 months if no date provided
    const defaultFrom = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const defaultTo = endOfDay(today);

    const startDate = from ? startOfDay(from) : defaultFrom;
    const endDate = to ? endOfDay(to) : defaultTo;

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [
      totalOrderRevenueResult,
      totalAMCRevenueResult,
      totalAMCDueResult,
      totalOrders,
      totalShops,
      totalProducts,
      totalAgents,
      totalComplaints,
      totalServiceEvents,
      pendingTickets,
      activeWarranties,
      totalWarrantyRevenueResult,
      orderStats,
      amcStats,
    ] = await Promise.all([
      // Financials
      prisma.order.aggregate({
        _sum: { amountPaid: true },
        where: { 
            status: { not: 'CANCELLED' },
            ...dateFilter
        }
      }),
      prisma.aMCContract.aggregate({
        _sum: { paymentPaid: true },
        where: { 
            status: { not: 'CANCELLED' },
            ...dateFilter
        }
      }),
      prisma.aMCContract.aggregate({
        _sum: { paymentDue: true },
        where: { 
            status: { not: 'CANCELLED' },
            ...dateFilter
        }
      }),

      // Counts
      prisma.order.count({ where: dateFilter }),
      prisma.shop.count({ where: dateFilter }),
      prisma.product.count({ where: dateFilter }),
      prisma.agent.count({ where: dateFilter }),
      prisma.complaint.count({ where: dateFilter }),
      prisma.serviceEvent.count({ where: dateFilter }),
      prisma.ticket.count({
        where: { 
            status: TicketStatus.OPEN,
            ...dateFilter
        },
      }),
      prisma.warranty.count({
        where: { 
            isActive: true,
            // For active warranties, we might want to count those created in range
            // OR those active during range. Assuming "Created in range" for consistency with other stats
            ...dateFilter
        },
      }),
      prisma.warranty.aggregate({
        _sum: { warrantyAmount: true },
        where: {
            ...dateFilter
        }
      }),

      // Graph Data - Orders (Fetch all in range, aggregate in JS)
      prisma.order.groupBy({
        by: ['createdAt'],
        _sum: { amountPaid: true },
        _count: { id: true },
        where: {
          ...dateFilter,
          status: { not: 'CANCELLED' }
        },
      }),
      // Graph Data - AMC
      prisma.aMCContract.groupBy({
        by: ['createdAt'],
        _sum: { paymentPaid: true },
        where: {
          ...dateFilter,
          status: { not: 'CANCELLED' }
        },
      }),
    ]);

    const totalSaleRevenue = Number(totalOrderRevenueResult._sum.amountPaid || 0);
    const totalAMCRevenue = Number(totalAMCRevenueResult._sum.paymentPaid || 0);
    const totalWarrantyRevenue = Number(totalWarrantyRevenueResult._sum.warrantyAmount || 0);
    const totalRevenue = totalSaleRevenue + totalAMCRevenue + totalWarrantyRevenue;
    const totalPendingAmount = Number(totalAMCDueResult._sum.paymentDue || 0);

    // Process Graph Data
    const daysDiff = differenceInDays(endDate, startDate);
    const isDaily = daysDiff <= 62; // Show daily if range is approx 2 months or less

    const graphDataMap = new Map<string, { name: string; revenue: number; orders: number; date: Date }>();

    if (isDaily) {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        days.forEach(day => {
            const key = format(day, 'yyyy-MM-dd');
            const name = format(day, 'MMM dd');
            graphDataMap.set(key, { name, revenue: 0, orders: 0, date: day });
        });
    } else {
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        months.forEach(month => {
            const key = format(month, 'yyyy-MM');
            const name = format(month, 'MMM yyyy');
            graphDataMap.set(key, { name, revenue: 0, orders: 0, date: month });
        });
    }

    orderStats.forEach((stat) => {
      const d = new Date(stat.createdAt);
      let key = '';
      if (isDaily) {
          key = format(d, 'yyyy-MM-dd');
      } else {
          key = format(d, 'yyyy-MM');
      }
      
      if (graphDataMap.has(key)) {
        const entry = graphDataMap.get(key)!;
        entry.revenue += Number(stat._sum.amountPaid || 0);
        entry.orders += stat._count.id;
      }
    });

    amcStats.forEach((stat) => {
        const d = new Date(stat.createdAt);
        let key = '';
        if (isDaily) {
            key = format(d, 'yyyy-MM-dd');
        } else {
            key = format(d, 'yyyy-MM');
        }

        if (graphDataMap.has(key)) {
          const entry = graphDataMap.get(key)!;
          entry.revenue += Number(stat._sum.paymentPaid || 0);
        }
      });

    const graphData = Array.from(graphDataMap.values());

    return {
      stats: {
        totalRevenue,
        totalSaleRevenue,
        totalAMCRevenue,
        totalWarrantyRevenue,
        totalPendingAmount,
        totalOrders,
        totalShops,
        totalProducts,
        totalAgents,
        totalComplaints,
        totalServiceEvents,
        pendingTickets,
        activeWarranties,
      },
      graphData,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
}
