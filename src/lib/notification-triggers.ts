// Notification trigger functions for various events
import {
  NotificationCategory,
  NotificationPriority,
  NotificationCreateInput,
} from "@/types/notification";

/**
 * Create notification when product is out of stock
 */
export const createOutOfStockNotification = (
  productId: number,
  productName: string,
  shopId: number,
  shopName: string
): NotificationCreateInput => {
  return {
    title: "Product Out of Stock",
    message: `${productName} is out of stock at ${shopName}`,
    category: NotificationCategory.INVENTORY,
    priority: NotificationPriority.HIGH,
    link: "/admin/product_details",
    metadata: { productId, shopId },
  };
};

/**
 * Create notification when product stock is low
 */
export const createLowStockNotification = (
  productId: number,
  productName: string,
  quantity: number,
  threshold: number = 5
): NotificationCreateInput => {
  return {
    title: "Low Stock Alert",
    message: `${productName} has only ${quantity} units left in stock (threshold: ${threshold})`,
    category: NotificationCategory.INVENTORY,
    priority: quantity <= 2 ? NotificationPriority.URGENT : NotificationPriority.MEDIUM,
    link: "/admin/product_details",
    metadata: { productId, quantity, threshold },
  };
};

/**
 * Create notification when new order is received
 */
export const createNewOrderNotification = (
  orderId: number,
  customerName: string,
  productName: string
): NotificationCreateInput => {
  return {
    title: "New Order Received",
    message: `New order #${orderId} received from ${customerName} for ${productName}`,
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.MEDIUM,
    link: "/admin/order_details",
    metadata: { orderId },
  };
};

/**
 * Create notification when order is cancelled
 */
export const createOrderCancelledNotification = (
  orderId: number,
  customerName: string,
  reason?: string
): NotificationCreateInput => {
  return {
    title: "Order Cancelled",
    message: `Order #${orderId} has been cancelled by ${customerName}${reason ? `: ${reason}` : ""}`,
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.MEDIUM,
    link: "/admin/order_details",
    metadata: { orderId, reason },
  };
};

/**
 * Create notification when repair request is submitted
 */
export const createRepairRequestNotification = (
  repairId: number,
  productName: string,
  customerName: string
): NotificationCreateInput => {
  return {
    title: "Repair Request Submitted",
    message: `New repair request for ${productName} from ${customerName}`,
    category: NotificationCategory.REPAIR,
    priority: NotificationPriority.MEDIUM,
    link: "/admin/repair_requests",
    metadata: { repairId },
  };
};

/**
 * Create notification when warranty is expiring soon
 */
export const createWarrantyExpiringNotification = (
  warrantyId: number,
  productName: string,
  daysRemaining: number
): NotificationCreateInput => {
  return {
    title: "Warranty Expiring Soon",
    message: `Warranty for ${productName} expires in ${daysRemaining} days`,
    category: NotificationCategory.WARRANTY,
    priority: daysRemaining <= 7 ? NotificationPriority.HIGH : NotificationPriority.LOW,
    link: "/admin/warranty_details",
    metadata: { warrantyId, daysRemaining },
  };
};

/**
 * Create notification when new user registers
 */
export const createNewUserNotification = (
  userId: number,
  userName: string,
  userEmail: string
): NotificationCreateInput => {
  return {
    title: "New User Registration",
    message: `New user ${userName} (${userEmail}) has registered on the platform`,
    category: NotificationCategory.USER,
    priority: NotificationPriority.LOW,
    link: "/admin/user_details",
    metadata: { userId },
  };
};

/**
 * Create notification for multiple products out of stock
 */
export const createMultipleProductsOutOfStockNotification = (
  count: number
): NotificationCreateInput => {
  return {
    title: "Critical: Multiple Products Out of Stock",
    message: `${count} products are currently out of stock across all shops`,
    category: NotificationCategory.INVENTORY,
    priority: NotificationPriority.URGENT,
    link: "/admin/product_details",
    metadata: { count },
  };
};

/**
 * Example usage function for checking product stock
 * This would typically be called when updating product quantities
 */
export const checkAndCreateStockNotifications = (
  productId: number,
  productName: string,
  currentStock: number,
  previousStock: number,
  shopId: number,
  shopName: string
): NotificationCreateInput | null => {
  // Product just went out of stock
  if (currentStock === 0 && previousStock > 0) {
    return createOutOfStockNotification(productId, productName, shopId, shopName);
  }

  // Product is low in stock (threshold: 5 units)
  if (currentStock > 0 && currentStock <= 5 && previousStock > 5) {
    return createLowStockNotification(productId, productName, currentStock, 5);
  }

  return null;
};

/**
 * Batch check for out-of-stock products
 * This would typically run as a scheduled job or on-demand check
 */
export const batchCheckOutOfStockProducts = (
  products: Array<{
    id: number;
    name: string;
    stock: number;
    shopId: number;
    shopName: string;
  }>
): NotificationCreateInput[] => {
  const notifications: NotificationCreateInput[] = [];

  products.forEach((product) => {
    if (product.stock === 0) {
      notifications.push(
        createOutOfStockNotification(product.id, product.name, product.shopId, product.shopName)
      );
    } else if (product.stock <= 5) {
      notifications.push(createLowStockNotification(product.id, product.name, product.stock));
    }
  });

  // If multiple products are out of stock, create an aggregate notification
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  if (outOfStockCount >= 3) {
    notifications.push(createMultipleProductsOutOfStockNotification(outOfStockCount));
  }

  return notifications;
};
