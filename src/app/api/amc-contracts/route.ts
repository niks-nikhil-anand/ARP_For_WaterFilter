import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET all AMC contracts
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    let contracts;

    if (shopId) {
      const shopIdNum = parseInt(shopId);
      contracts = await prisma.aMCContract.findMany({
        where: { shopId: shopIdNum },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          services: true,
          _count: {
            select: {
              productDetails: true,
              serviceEvents: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (currentUser.role === UserRole.SUPERADMIN) {
      contracts = await prisma.aMCContract.findMany({
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          services: true,
          _count: {
            select: {
              productDetails: true,
              serviceEvents: true,
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

      contracts = await prisma.aMCContract.findMany({
        where: { shopId: userShop.id },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          services: true,
          _count: {
            select: {
              productDetails: true,
              serviceEvents: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(contracts);
  } catch (error: any) {
    console.error('Get AMC contracts error:', error);
    return serverErrorResponse(error.message || 'Failed to get AMC contracts');
  }
}

// POST - Create new AMC contract
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { name, duration, price, shopId } = body;

    if (!name || !duration || !price) {
      return errorResponse('Name, duration, and price are required');
    }

    let contractShopId = shopId;

    if (!shopId) {
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (!userShop) {
        return errorResponse('You must have a shop to create AMC contracts');
      }

      contractShopId = userShop.id;
    } else {
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
      });

      if (!shop) {
        return errorResponse('Shop not found', 404);
      }

      if (shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to create AMC contracts for this shop');
      }
    }

    const contract = await prisma.aMCContract.create({
      data: {
        name,
        duration,
        price,
        shopId: contractShopId,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
        services: true,
      },
    });

    return successResponse(contract, 'AMC contract created successfully', 201);
  } catch (error: any) {
    console.error('Create AMC contract error:', error);
    return serverErrorResponse(error.message || 'Failed to create AMC contract');
  }
}
