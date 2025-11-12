// Notification types and interfaces

export enum NotificationCategory {
  ORDER = "ORDER",
  PRODUCT = "PRODUCT",
  INVENTORY = "INVENTORY",
  USER = "USER",
  REPAIR = "REPAIR",
  WARRANTY = "WARRANTY",
  SYSTEM = "SYSTEM",
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  link?: string; // Optional link to redirect
  metadata?: Record<string, unknown>; // Additional data
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCreateInput {
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilters {
  category?: NotificationCategory;
  isRead?: boolean;
  priority?: NotificationPriority;
  searchTerm?: string;
}
