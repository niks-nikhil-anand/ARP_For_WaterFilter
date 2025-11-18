import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Fetch full user data
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    return successResponse(user);
  } catch (error: any) {
    console.error('Get current user error:', error);
    return serverErrorResponse(error.message || 'Failed to get user');
  }
}
