'use server';

import prisma from '@/lib/prisma';
import { TicketStatus } from '@/generated/prisma';

export async function getDashboardStats() {
  try {
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

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
      recentOrders,
      recentTickets,
      recentWarranties,
      monthlyOrderStats,
      monthlyAMCStats,
    ] = await Promise.all([
      // Financials
      prisma.order.aggregate({
        _sum: { amountPaid: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.aMCContract.aggregate({
        _sum: { paymentPaid: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.aMCContract.aggregate({
        _sum: { paymentDue: true },
        where: { status: { not: 'CANCELLED' } }
      }),

      // Counts
      prisma.order.count(),
      prisma.shop.count(),
      prisma.product.count(),
      prisma.agent.count(),
      prisma.complaint.count(),
      prisma.serviceEvent.count(),
      prisma.ticket.count({
        where: { status: TicketStatus.OPEN },
      }),
      prisma.warranty.count({
        where: { isActive: true },
      }),

      // Recent Activity
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { name: true } } },
      }),
      prisma.ticket.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warranty.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),

      // Graph Data - Orders
      prisma.order.groupBy({
        by: ['createdAt'],
        _sum: { amountPaid: true },
        _count: { id: true },
        where: {
          createdAt: { gte: sixMonthsAgo },
          status: { not: 'CANCELLED' }
        },
      }),
      // Graph Data - AMC
      prisma.aMCContract.groupBy({
        by: ['createdAt'],
        _sum: { paymentPaid: true },
        where: {
          createdAt: { gte: sixMonthsAgo },
          status: { not: 'CANCELLED' }
        },
      }),
    ]);

    const totalSaleRevenue = Number(totalOrderRevenueResult._sum.amountPaid || 0);
    const totalAMCRevenue = Number(totalAMCRevenueResult._sum.paymentPaid || 0);
    const totalRevenue = totalSaleRevenue + totalAMCRevenue;
    const totalPendingAmount = Number(totalAMCDueResult._sum.paymentDue || 0);

    // Process Graph Data
    const graphDataMap = new Map<string, { name: string; revenue: number; orders: number }>();

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const name = d.toLocaleString('default', { month: 'short' });
      graphDataMap.set(key, { name, revenue: 0, orders: 0 });
    }

    monthlyOrderStats.forEach((stat) => {
      const d = new Date(stat.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (graphDataMap.has(key)) {
        const entry = graphDataMap.get(key)!;
        entry.revenue += Number(stat._sum.amountPaid || 0);
        entry.orders += stat._count.id;
      }
    });

    monthlyAMCStats.forEach((stat) => {
        const d = new Date(stat.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (graphDataMap.has(key)) {
          const entry = graphDataMap.get(key)!;
          entry.revenue += Number(stat._sum.paymentPaid || 0);
        }
      });

    const graphData = Array.from(graphDataMap.values()).reverse();


    // Combine and format recent activities
    const activities = [
      ...recentOrders.map((order) => ({
        id: `order-${order.id}`,
        type: 'order',
        message: `New order placed for ${order.customerName}`,
        customer: order.customerName,
        time: order.createdAt,
        rawTime: order.createdAt,
      })),
      ...recentTickets.map((ticket) => ({
        id: `ticket-${ticket.id}`,
        type: 'ticket',
        message: `New ticket: ${ticket.serviceType}`,
        customer: ticket.customerName,
        time: ticket.createdAt,
        rawTime: ticket.createdAt,
      })),
      ...recentWarranties.map((warranty) => ({
        id: `warranty-${warranty.id}`,
        type: 'warranty',
        message: `Warranty active for ${warranty.durationMonths} months`,
        customer: warranty.user?.name || 'Unknown',
        time: warranty.createdAt,
        rawTime: warranty.createdAt,
      })),
    ]
      .sort((a, b) => b.rawTime.getTime() - a.rawTime.getTime())
      .slice(0, 5);

    return {
      stats: {
        totalRevenue,
        totalSaleRevenue,
        totalAMCRevenue,
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
      recentActivities: activities,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
}
