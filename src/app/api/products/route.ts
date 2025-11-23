import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const publicView = searchParams.get('public') === 'true';
    const agentId = searchParams.get('agentId');

    // Public endpoint for homepage - no authentication required
    if (publicView) {
      console.log('🔍 Fetching public products with status ACTIVE...')
      
      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE', // Only show active products to public
        },
        include: {
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
        take: 50, // Limit public view to 50 products
      });

      console.log(`✅ Found ${products.length} active products`)
      console.log('📦 Products:', JSON.stringify(products, null, 2))

      return successResponse(products);
    }

    // For authenticated routes, check user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    let products;

    // Agent-specific products (products from agent's shop)
    if (agentId) {
      const agentIdNum = parseInt(agentId);

      // Verify user is the agent or admin
      const agent = await prisma.agent.findUnique({
        where: { id: agentIdNum },
        include: { shop: true },
      });

      if (!agent) {
        return errorResponse('Agent not found', 404);
      }

      // Check permission - agent must be current user or user must be admin
      if (agent.userId !== currentUser.id &&
          currentUser.role !== UserRole.ADMIN &&
          currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to view this agent\'s products');
      }

      products = await prisma.product.findMany({
        where: {
          shopId: agent.shopId,
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
    } else if (shopId) {
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
    } else if (currentUser.role === UserRole.SUPERADMIN || currentUser.role === UserRole.ADMIN) {
      // SUPERADMIN/ADMIN can see all products
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
    } else if (currentUser.role === UserRole.AGENT) {
      // Agents see products from their shop
      const agent = await prisma.agent.findUnique({
        where: { userId: currentUser.id },
        include: { shop: true },
      });

      if (!agent) {
        return forbiddenResponse('Agent profile not found');
      }

      products = await prisma.product.findMany({
        where: {
          shopId: agent.shopId,
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
    } else {
      // Get products for user's shop (shop owners)
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
