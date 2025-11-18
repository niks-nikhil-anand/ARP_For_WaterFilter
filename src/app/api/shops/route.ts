import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET all shops
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    let shops;

    // SUPERADMIN can see all shops
    if (currentUser.role === UserRole.SUPERADMIN) {
      shops = await prisma.shop.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
              agents: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Regular users see only their own shops
      shops = await prisma.shop.findMany({
        where: {
          userId: currentUser.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
              agents: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(shops);
  } catch (error: any) {
    console.error('Get shops error:', error);
    return serverErrorResponse(error.message || 'Failed to get shops');
  }
}

// POST - Create new shop
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { name, address, userId } = body;

    // Validation
    if (!name) {
      return errorResponse('Shop name is required');
    }

    // Determine the user ID for the shop
    let shopUserId = currentUser.id;

    // SUPERADMIN can create shops for other users
    if (currentUser.role === UserRole.SUPERADMIN && userId) {
      shopUserId = userId;
    }

    // Check if user already has a shop (one shop per user)
    const existingShop = await prisma.shop.findUnique({
      where: { userId: shopUserId },
    });

    if (existingShop) {
      return errorResponse('User already has a shop', 409);
    }

    // Create shop
    const shop = await prisma.shop.create({
      data: {
        name,
        address,
        userId: shopUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return successResponse(shop, 'Shop created successfully', 201);
  } catch (error: any) {
    console.error('Create shop error:', error);
    return serverErrorResponse(error.message || 'Failed to create shop');
  }
}
