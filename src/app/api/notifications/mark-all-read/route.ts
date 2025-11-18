import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

// POST - Mark all notifications as read for current user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return successResponse(null, 'All notifications marked as read');
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    return serverErrorResponse(error.message || 'Failed to mark notifications as read');
  }
}
