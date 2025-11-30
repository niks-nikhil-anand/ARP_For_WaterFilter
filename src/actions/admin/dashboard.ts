'use server';

import prisma from '@/lib/prisma';
import { TicketStatus } from '@prisma/client';

export async function getDashboardStats() {
  try {
    const [
      totalRevenueResult,
      totalOrders,
      totalShops,
      totalProducts,
      pendingTickets,
      activeWarranties,
      recentOrders,
      recentTickets,
      recentWarranties,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: {
          amountPaid: true,
        },
      }),
      prisma.order.count(),
      prisma.shop.count(),
      prisma.product.count(),
      prisma.ticket.count({
        where: {
          status: TicketStatus.OPEN,
        },
      }),
      prisma.warranty.count({
        where: {
          isActive: true,
        },
      }),
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
    ]);

    const totalRevenue = totalRevenueResult._sum.amountPaid
      ? Number(totalRevenueResult._sum.amountPaid)
      : 0;

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
      totalRevenue,
      totalOrders,
      totalShops,
      totalProducts,
      pendingTickets,
      activeWarranties,
      recentActivities: activities,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
}
