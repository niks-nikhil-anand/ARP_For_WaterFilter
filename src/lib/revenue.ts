// Revenue calculation utilities

export interface RevenueData {
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

/**
 * Calculate revenue statistics from orders
 */
export const calculateRevenue = (
  orders: Array<{
    id: number;
    createdAt: Date;
    price?: number;
  }>,
  productPrice: number = 15999 // Default price per order
): RevenueData => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // Calculate current period revenues
  const dailyOrders = orders.filter(o => o.createdAt >= today);
  const weeklyOrders = orders.filter(o => o.createdAt >= weekAgo);
  const monthlyOrders = orders.filter(o => o.createdAt >= monthAgo);

  const dailyRevenue = dailyOrders.reduce((sum, o) => sum + (o.price || productPrice), 0);
  const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + (o.price || productPrice), 0);
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (o.price || productPrice), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.price || productPrice), 0);

  // Calculate previous period revenues for growth
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoWeeksAgo = new Date(weekAgo);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
  const twoMonthsAgo = new Date(monthAgo);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

  const prevDailyOrders = orders.filter(o =>
    o.createdAt >= yesterday && o.createdAt < today
  );
  const prevWeeklyOrders = orders.filter(o =>
    o.createdAt >= twoWeeksAgo && o.createdAt < weekAgo
  );
  const prevMonthlyOrders = orders.filter(o =>
    o.createdAt >= twoMonthsAgo && o.createdAt < monthAgo
  );

  const prevDailyRevenue = prevDailyOrders.reduce((sum, o) => sum + (o.price || productPrice), 0);
  const prevWeeklyRevenue = prevWeeklyOrders.reduce((sum, o) => sum + (o.price || productPrice), 0);
  const prevMonthlyRevenue = prevMonthlyOrders.reduce((sum, o) => sum + (o.price || productPrice), 0);

  // Calculate growth percentages
  const dailyGrowth = prevDailyRevenue > 0
    ? ((dailyRevenue - prevDailyRevenue) / prevDailyRevenue) * 100
    : dailyRevenue > 0 ? 100 : 0;

  const weeklyGrowth = prevWeeklyRevenue > 0
    ? ((weeklyRevenue - prevWeeklyRevenue) / prevWeeklyRevenue) * 100
    : weeklyRevenue > 0 ? 100 : 0;

  const monthlyGrowth = prevMonthlyRevenue > 0
    ? ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100
    : monthlyRevenue > 0 ? 100 : 0;

  return {
    totalRevenue,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    dailyGrowth,
    weeklyGrowth,
    monthlyGrowth,
  };
};

/**
 * Format revenue for display
 */
export const formatRevenue = (amount: number): string => {
  if (amount >= 10000000) { // 1 Crore
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) { // 1 Lakh
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) { // 1 Thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

/**
 * Get revenue trend data for charts
 */
export const getRevenueTrend = (
  orders: Array<{
    createdAt: Date;
    price?: number;
  }>,
  days: number = 30,
  productPrice: number = 15999
): Array<{ date: string; revenue: number; orders: number }> => {
  const trend: Array<{ date: string; revenue: number; orders: number }> = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const dayOrders = orders.filter(o =>
      o.createdAt >= startOfDay && o.createdAt < endOfDay
    );

    const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.price || productPrice), 0);

    trend.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: dayRevenue,
      orders: dayOrders.length,
    });
  }

  return trend;
};
