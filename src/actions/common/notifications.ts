'use server';

/**
 * Common - Notifications Actions
 * Used by all panels
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all notifications for current user
export async function getMyNotifications(filters?: {
  isRead?: boolean;
  category?: 'ORDER' | 'PRODUCT' | 'INVENTORY' | 'USER' | 'SERVICE' | 'SYSTEM';
}) {
  try {
    let url = `${API_BASE_URL}/api/notifications`;
    const params = new URLSearchParams();

    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.category) params.append('category', filters.category);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// GET single notification
export async function getNotificationById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// POST - Create notification (admin/shop only)
export async function createNotification(notificationData: {
  title: string;
  message: string;
  category: 'ORDER' | 'PRODUCT' | 'INVENTORY' | 'USER' | 'SERVICE' | 'SYSTEM';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  link?: string;
  metadata?: any;
  recipientId?: number;
  shopId?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(notificationData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PATCH - Mark notification as read
export async function markAsRead(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isRead: true }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// POST - Mark all as read
export async function markAllAsRead() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE notification
export async function deleteNotification(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
