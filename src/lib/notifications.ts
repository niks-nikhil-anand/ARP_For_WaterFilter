// Notification utility functions and demo data
import { Notification, NotificationCategory, NotificationPriority } from "@/types/notification";

// Demo notifications data
export const demoNotifications: Notification[] = [
  {
    id: 1,
    title: "Product Out of Stock",
    message: "Kent Grand Plus RO Water Purifier is out of stock at AquaPure Solutions",
    category: NotificationCategory.INVENTORY,
    priority: NotificationPriority.HIGH,
    isRead: false,
    link: "/admin/product_details",
    metadata: { productId: 1, shopId: 1 },
    createdAt: new Date("2024-10-15T10:30:00"),
    updatedAt: new Date("2024-10-15T10:30:00"),
  },
  {
    id: 2,
    title: "New Order Received",
    message: "New order #12 received from Priya Nair for Aquaguard Aura RO",
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.MEDIUM,
    isRead: false,
    link: "/admin/order_details",
    metadata: { orderId: 12 },
    createdAt: new Date("2024-10-15T09:15:00"),
    updatedAt: new Date("2024-10-15T09:15:00"),
  },
  {
    id: 3,
    title: "Low Stock Alert",
    message: "Livpure Glo Star RO has only 3 units left in stock",
    category: NotificationCategory.INVENTORY,
    priority: NotificationPriority.MEDIUM,
    isRead: false,
    link: "/admin/product_details",
    metadata: { productId: 3, quantity: 3 },
    createdAt: new Date("2024-10-15T08:45:00"),
    updatedAt: new Date("2024-10-15T08:45:00"),
  },
  {
    id: 4,
    title: "Repair Request Submitted",
    message: "New repair request for AO Smith Z9 Green RO from Sneha Sharma",
    category: NotificationCategory.REPAIR,
    priority: NotificationPriority.MEDIUM,
    isRead: true,
    link: "/admin/repair_requests",
    metadata: { repairId: 4, customerId: 4 },
    createdAt: new Date("2024-10-14T16:20:00"),
    updatedAt: new Date("2024-10-14T18:30:00"),
  },
  {
    id: 5,
    title: "Warranty Expiring Soon",
    message: "Warranty for Blue Star Aristo RO expires in 7 days",
    category: NotificationCategory.WARRANTY,
    priority: NotificationPriority.LOW,
    isRead: true,
    link: "/admin/warranty_details",
    metadata: { warrantyId: 5, daysRemaining: 7 },
    createdAt: new Date("2024-10-14T14:00:00"),
    updatedAt: new Date("2024-10-14T15:00:00"),
  },
  {
    id: 6,
    title: "New User Registration",
    message: "New user Amit Patel has registered on the platform",
    category: NotificationCategory.USER,
    priority: NotificationPriority.LOW,
    isRead: true,
    link: "/admin/user_details",
    metadata: { userId: 9 },
    createdAt: new Date("2024-10-14T11:30:00"),
    updatedAt: new Date("2024-10-14T12:00:00"),
  },
  {
    id: 7,
    title: "Order Cancelled",
    message: "Order #5 has been cancelled by customer Vikram Singh",
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.MEDIUM,
    isRead: true,
    link: "/admin/order_details",
    metadata: { orderId: 5, customerId: 5 },
    createdAt: new Date("2024-10-13T10:15:00"),
    updatedAt: new Date("2024-10-13T10:30:00"),
  },
  {
    id: 8,
    title: "Critical: Multiple Products Out of Stock",
    message: "5 products are currently out of stock across all shops",
    category: NotificationCategory.INVENTORY,
    priority: NotificationPriority.URGENT,
    isRead: false,
    link: "/admin/product_details",
    metadata: { count: 5 },
    createdAt: new Date("2024-10-15T07:00:00"),
    updatedAt: new Date("2024-10-15T07:00:00"),
  },
];

// Helper functions
export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter((n) => !n.isRead).length;
};

export const getNotificationsByCategory = (
  notifications: Notification[],
  category: NotificationCategory
): Notification[] => {
  return notifications.filter((n) => n.category === category);
};

export const markAsRead = (notifications: Notification[], id: number): Notification[] => {
  return notifications.map((n) =>
    n.id === id ? { ...n, isRead: true, updatedAt: new Date() } : n
  );
};

export const markAllAsRead = (notifications: Notification[]): Notification[] => {
  return notifications.map((n) => ({ ...n, isRead: true, updatedAt: new Date() }));
};

export const getCategoryColor = (category: NotificationCategory): string => {
  const colors: Record<NotificationCategory, string> = {
    [NotificationCategory.ORDER]: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
    [NotificationCategory.PRODUCT]: "text-purple-600 bg-purple-50 dark:bg-purple-950/20",
    [NotificationCategory.INVENTORY]: "text-orange-600 bg-orange-50 dark:bg-orange-950/20",
    [NotificationCategory.USER]: "text-green-600 bg-green-50 dark:bg-green-950/20",
    [NotificationCategory.REPAIR]: "text-red-600 bg-red-50 dark:bg-red-950/20",
    [NotificationCategory.WARRANTY]: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20",
    [NotificationCategory.SYSTEM]: "text-gray-600 bg-gray-50 dark:bg-gray-950/20",
  };
  return colors[category];
};

export const getPriorityColor = (priority: NotificationPriority): string => {
  const colors: Record<NotificationPriority, string> = {
    [NotificationPriority.LOW]: "text-gray-600",
    [NotificationPriority.MEDIUM]: "text-blue-600",
    [NotificationPriority.HIGH]: "text-orange-600",
    [NotificationPriority.URGENT]: "text-red-600",
  };
  return colors[priority];
};

export const getCategoryIcon = (category: NotificationCategory): string => {
  const icons: Record<NotificationCategory, string> = {
    [NotificationCategory.ORDER]: "🛒",
    [NotificationCategory.PRODUCT]: "📦",
    [NotificationCategory.INVENTORY]: "📊",
    [NotificationCategory.USER]: "👤",
    [NotificationCategory.REPAIR]: "🔧",
    [NotificationCategory.WARRANTY]: "🛡️",
    [NotificationCategory.SYSTEM]: "⚙️",
  };
  return icons[category];
};
