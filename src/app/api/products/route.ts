import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    let products;

    if (shopId) {
      // Get products for specific shop
      const shopIdNum = parseInt(shopId);
      products = await prisma.product.findMany({
        where: {
          shopId: shopIdNum,
        },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          productDetail: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (currentUser.role === UserRole.SUPERADMIN) {
      // SUPERADMIN can see all products
      products = await prisma.product.findMany({
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          productDetail: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Get products for user's shop
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (!userShop) {
        return forbiddenResponse('You do not have a shop');
      }

      products = await prisma.product.findMany({
        where: {
          shopId: userShop.id,
        },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          productDetail: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(products);
  } catch (error: any) {
    console.error('Get products error:', error);
    return serverErrorResponse(error.message || 'Failed to get products');
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { name, company, type, color, offer, warrantyPeriod, shopId } = body;

    // Validation
    if (!name || !company || !type) {
      return errorResponse('Name, company, and type are required');
    }

    // Determine shop ID
    let productShopId = shopId;

    if (!shopId) {
      // If no shopId provided, use current user's shop
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (!userShop) {
        return errorResponse('You must have a shop to create products');
      }

      productShopId = userShop.id;
    } else {
      // Verify user owns the shop or is SUPERADMIN
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
      });

      if (!shop) {
        return errorResponse('Shop not found', 404);
      }

      if (shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to create products for this shop');
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        company,
        type,
        color,
        offer,
        warrantyPeriod,
        shopId: productShopId,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        productDetail: true,
      },
    });

    return successResponse(product, 'Product created successfully', 201);
  } catch (error: any) {
    console.error('Create product error:', error);
    return serverErrorResponse(error.message || 'Failed to create product');
  }
}
