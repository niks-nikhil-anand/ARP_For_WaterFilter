'use server';

import { prisma } from '@/lib/prisma';
import { NotificationCategory, NotificationPriority } from '@/generated/prisma';
import { revalidatePath } from 'next/cache';

export async function createNotification({
  title,
  message,
  category,
  priority = 'MEDIUM',
  recipientId,
  shopId,
  link,
  metadata,
}: {
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  recipientId: number;
  shopId?: number;
  link?: string;
  metadata?: any;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        category,
        priority,
        recipientId,
        shopId,
        link,
        metadata,
      },
    });
    
    // Revalidate the notifications page
    revalidatePath('/admin/notification');
    
    return { success: true, data: notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

export async function getNotifications(userId: number, limit = 20) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    
    revalidatePath('/admin/notification');
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

export async function markAllNotificationsAsRead(userId: number) {
  try {
    await prisma.notification.updateMany({
      where: { 
        recipientId: userId,
        isRead: false
      },
      data: { isRead: true },
    });
    
    revalidatePath('/admin/notification');
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}
