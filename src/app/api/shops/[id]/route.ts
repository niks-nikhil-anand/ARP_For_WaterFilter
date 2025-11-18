import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET single shop by ID
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
    const shopId = parseInt(id);

    if (isNaN(shopId)) {
      return errorResponse('Invalid shop ID');
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        products: true,
        agents: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            amcContracts: true,
          },
        },
      },
    });

    if (!shop) {
      return notFoundResponse('Shop not found');
    }

    // Users can only access their own shop, SUPERADMIN can access all
    if (shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(shop);
  } catch (error: any) {
    console.error('Get shop error:', error);
    return serverErrorResponse(error.message || 'Failed to get shop');
  }
}

// PATCH - Partial update shop
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
    const shopId = parseInt(id);

    if (isNaN(shopId)) {
      return errorResponse('Invalid shop ID');
    }

    const body = await request.json();

    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!existingShop) {
      return notFoundResponse('Shop not found');
    }

    // Users can only update their own shop, SUPERADMIN can update all
    if (existingShop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Update shop
    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: body,
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

    return successResponse(updatedShop, 'Shop updated successfully');
  } catch (error: any) {
    console.error('Update shop error:', error);
    return serverErrorResponse(error.message || 'Failed to update shop');
  }
}

// PUT - Full update shop
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
    const shopId = parseInt(id);

    if (isNaN(shopId)) {
      return errorResponse('Invalid shop ID');
    }

    const body = await request.json();
    const { name, address } = body;

    // Validation
    if (!name) {
      return errorResponse('Shop name is required');
    }

    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!existingShop) {
      return notFoundResponse('Shop not found');
    }

    // Users can only update their own shop, SUPERADMIN can update all
    if (existingShop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Update shop
    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        name,
        address,
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

    return successResponse(updatedShop, 'Shop updated successfully');
  } catch (error: any) {
    console.error('Update shop error:', error);
    return serverErrorResponse(error.message || 'Failed to update shop');
  }
}

// DELETE shop
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
    const shopId = parseInt(id);

    if (isNaN(shopId)) {
      return errorResponse('Invalid shop ID');
    }

    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!existingShop) {
      return notFoundResponse('Shop not found');
    }

    // Only SUPERADMIN can delete shops
    if (currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to delete shops');
    }

    // Delete shop
    await prisma.shop.delete({
      where: { id: shopId },
    });

    return successResponse(null, 'Shop deleted successfully');
  } catch (error: any) {
    console.error('Delete shop error:', error);
    return serverErrorResponse(error.message || 'Failed to delete shop');
  }
}
