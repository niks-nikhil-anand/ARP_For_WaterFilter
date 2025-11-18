import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole, NotificationCategory, NotificationPriority } from '@/generated/prisma';

// GET all notifications
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead');
    const category = searchParams.get('category') as NotificationCategory | null;

    const whereClause: any = {
      recipientId: currentUser.id,
    };

    if (isRead !== null) {
      whereClause.isRead = isRead === 'true';
    }

    if (category) {
      whereClause.category = category;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(notifications);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return serverErrorResponse(error.message || 'Failed to get notifications');
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { title, message, category, priority, link, metadata, recipientId, shopId } = body;

    if (!title || !message || !category) {
      return errorResponse('Title, message, and category are required');
    }

    // Only ADMIN/SUPERADMIN can create notifications for other users
    let notificationRecipientId = recipientId || currentUser.id;

    if (recipientId && recipientId !== currentUser.id) {
      if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to create notifications for other users');
      }
    }

    // Verify shop if provided
    if (shopId) {
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
      });

      if (!shop) {
        return errorResponse('Shop not found', 404);
      }

      if (shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to create notifications for this shop');
      }
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        category,
        priority: priority || NotificationPriority.MEDIUM,
        link,
        metadata,
        recipientId: notificationRecipientId,
        shopId,
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

    return successResponse(notification, 'Notification created successfully', 201);
  } catch (error: any) {
    console.error('Create notification error:', error);
    return serverErrorResponse(error.message || 'Failed to create notification');
  }
}
