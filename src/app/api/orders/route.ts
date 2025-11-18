import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const productId = searchParams.get('productId');

    let orders;
    const whereClause: any = {};

    if (productId) whereClause.productId = parseInt(productId);

    if (shopId) {
      whereClause.shopId = parseInt(shopId);
      orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              company: true,
              type: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          serviceEvents: {
            select: {
              id: true,
              type: true,
              startDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (currentUser.role === UserRole.SUPERADMIN) {
      orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              company: true,
              type: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          serviceEvents: {
            select: {
              id: true,
              type: true,
              startDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (!userShop) {
        return forbiddenResponse('You do not have a shop');
      }

      whereClause.shopId = userShop.id;
      orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              company: true,
              type: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          serviceEvents: {
            select: {
              id: true,
              type: true,
              startDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    return serverErrorResponse(error.message || 'Failed to get orders');
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { productId, shopId, customerName, customerEmail, customerPhone } = body;

    if (!productId || !customerName) {
      return errorResponse('Product ID and customer name are required');
    }

    let orderShopId = shopId;

    if (!shopId) {
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (!userShop) {
        return errorResponse('You must have a shop to create orders');
      }

      orderShopId = userShop.id;
    } else {
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
      });

      if (!shop) {
        return errorResponse('Shop not found', 404);
      }

      if (shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to create orders for this shop');
      }
    }

    // Verify product exists and belongs to the shop
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (product.shopId !== orderShopId) {
      return errorResponse('Product does not belong to this shop', 400);
    }

    const order = await prisma.order.create({
      data: {
        productId,
        shopId: orderShopId,
        customerName,
        customerEmail,
        customerPhone,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            company: true,
            type: true,
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

    return successResponse(order, 'Order created successfully', 201);
  } catch (error: any) {
    console.error('Create order error:', error);
    return serverErrorResponse(error.message || 'Failed to create order');
  }
}
