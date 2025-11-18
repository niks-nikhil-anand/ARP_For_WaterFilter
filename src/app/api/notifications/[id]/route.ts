import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole, NotificationPriority } from '@prisma/client';

// GET single notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return errorResponse('Invalid notification ID');
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    // Users can only access their own notifications
    if (notification.recipientId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(notification);
  } catch (error: any) {
    console.error('Get notification error:', error);
    return serverErrorResponse(error.message || 'Failed to get notification');
  }
}

// PATCH - Partial update (mainly for marking as read)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return errorResponse('Invalid notification ID');
    }

    const body = await request.json();

    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return notFoundResponse('Notification not found');
    }

    if (existingNotification.recipientId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: body,
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(updatedNotification, 'Notification updated successfully');
  } catch (error: any) {
    console.error('Update notification error:', error);
    return serverErrorResponse(error.message || 'Failed to update notification');
  }
}

// PUT - Full update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return errorResponse('Invalid notification ID');
    }

    const body = await request.json();
    const { title, message, category, priority, isRead, link, metadata } = body;

    if (!title || !message || !category) {
      return errorResponse('Title, message, and category are required');
    }

    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return notFoundResponse('Notification not found');
    }

    // Only ADMIN/SUPERADMIN can fully update notifications
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to fully update notifications');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        title,
        message,
        category,
        priority: priority || NotificationPriority.MEDIUM,
        isRead: isRead !== undefined ? isRead : existingNotification.isRead,
        link,
        metadata,
      },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(updatedNotification, 'Notification updated successfully');
  } catch (error: any) {
    console.error('Update notification error:', error);
    return serverErrorResponse(error.message || 'Failed to update notification');
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return errorResponse('Invalid notification ID');
    }

    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      return notFoundResponse('Notification not found');
    }

    // Users can delete their own notifications
    if (existingNotification.recipientId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to delete this resource');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return successResponse(null, 'Notification deleted successfully');
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return serverErrorResponse(error.message || 'Failed to delete notification');
  }
}
