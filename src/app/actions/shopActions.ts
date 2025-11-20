"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Get current logged-in user information from the auth token
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      console.log("❌ No auth token found");
      return { success: false, error: "Not authenticated" };
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      console.log("❌ Token verification failed");
      return { success: false, error: "Invalid token" };
    }

    console.log("✅ Decoded token:", decoded);

    // Cast to our custom JWT payload type
    const payload = decoded as {
      id: number;
      name?: string;
      email: string;
      role: string;
    };

    // Fetch user from database to get the name (in case old token doesn't have it)
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      console.log("❌ User not found in database");
      return { success: false, error: "User not found" };
    }

    console.log("✅ Returning user data from database:", user);

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { success: false, error: "Failed to get user information" };
  }
}

/**
 * Logout user by clearing the auth token cookie
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth-token");

    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, error: "Failed to logout" };
  }
}

/**
 * Get shop dashboard statistics for the logged-in shop owner
 */
export async function getShopDashboardStats() {
  try {
    // Get current user from auth token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return { success: false, error: "Invalid token" };
    }

    const payload = decoded as { id: number; role: string };

    // Get the shop for this user
    const shop = await prisma.shop.findUnique({
      where: { userId: payload.id },
      include: {
        orders: {
          include: {
            product: true,
          },
        },
        products: true,
      },
    });

    if (!shop) {
      return { success: false, error: "Shop not found for this user" };
    }

    // Calculate statistics
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(thisWeekStart.getDate() - now.getDay());
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    // Today's orders and sales
    const todayOrders = shop.orders.filter(
      (order) => new Date(order.createdAt) >= todayStart
    );
    const todaySales = todayOrders.length;

    // Yesterday's sales for comparison
    const yesterdayOrders = shop.orders.filter(
      (order) =>
        new Date(order.createdAt) >= yesterdayStart &&
        new Date(order.createdAt) < todayStart
    );

    // This week's sales
    const thisWeekOrders = shop.orders.filter(
      (order) => new Date(order.createdAt) >= thisWeekStart
    );

    // Last week's sales
    const lastWeekOrders = shop.orders.filter(
      (order) =>
        new Date(order.createdAt) >= lastWeekStart &&
        new Date(order.createdAt) < thisWeekStart
    );

    // This month's sales
    const thisMonthOrders = shop.orders.filter(
      (order) => new Date(order.createdAt) >= thisMonthStart
    );

    // Last month's sales
    const lastMonthOrders = shop.orders.filter(
      (order) =>
        new Date(order.createdAt) >= lastMonthStart &&
        new Date(order.createdAt) < thisMonthStart
    );

    // Calculate revenue (simplified - in real app, you'd have order totals)
    const calculateRevenue = (orders: any[]) => {
      // Placeholder: assuming each order has a value
      // In real implementation, you'd sum up actual order totals
      return orders.length * 5000; // Placeholder value
    };

    // Get unique customers (simplified)
    const totalCustomers = new Set(shop.orders.map((o) => o.customerEmail)).size;

    // Active orders (not delivered)
    const activeOrders = shop.orders.length;

    // Top products (simplified)
    const productSales = new Map();
    shop.orders.forEach((order) => {
      const productId = order.productId;
      if (!productSales.has(productId)) {
        productSales.set(productId, {
          product: order.product,
          count: 0,
        });
      }
      productSales.get(productId).count++;
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item, index) => ({
        id: item.product.id,
        name: item.product.name,
        unitsSold: item.count,
        revenue: item.count * 5000, // Placeholder
      }));

    const stats = {
      todaySales: calculateRevenue(todayOrders),
      todayOrders: todayOrders.length,
      totalCustomers,
      activeOrders,
      monthSales: calculateRevenue(thisMonthOrders),
      monthOrders: thisMonthOrders.length,
      revenue: {
        today: calculateRevenue(todayOrders),
        yesterday: calculateRevenue(yesterdayOrders),
        thisWeek: calculateRevenue(thisWeekOrders),
        lastWeek: calculateRevenue(lastWeekOrders),
        thisMonth: calculateRevenue(thisMonthOrders),
        lastMonth: calculateRevenue(lastMonthOrders),
      },
      topProducts,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching shop dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

/**
 * Get recent orders for the shop
 */
export async function getShopRecentOrders(limit: number = 10) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return { success: false, error: "Invalid token" };
    }

    const payload = decoded as { id: number };

    const shop = await prisma.shop.findUnique({
      where: { userId: payload.id },
      include: {
        orders: {
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            product: true,
          },
        },
      },
    });

    if (!shop) {
      return { success: false, error: "Shop not found" };
    }

    const orders = shop.orders.map((order) => ({
      id: order.id,
      orderNumber: `ORD-${order.id.toString().padStart(6, "0")}`,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderDate: order.createdAt.toLocaleDateString("en-IN"),
      total: 5000, // Placeholder - in real app, calculate from order items
      orderStatus: "Processing", // Placeholder - add status field to Order model
      product: order.product.name,
    }));

    return { success: true, data: orders };
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return { success: false, error: "Failed to fetch recent orders" };
  }
}
