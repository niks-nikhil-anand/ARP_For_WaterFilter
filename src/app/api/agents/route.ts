import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET all agents
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    let agents;

    // Get shop for current user if they have one
    const userShop = await prisma.shop.findUnique({
      where: { userId: currentUser.id },
    });

    if (currentUser.role === UserRole.SUPERADMIN) {
      // SUPERADMIN can see all agents
      agents = await prisma.agent.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (userShop) {
      // Shop owners see agents of their shop
      agents = await prisma.agent.findMany({
        where: {
          shopId: userShop.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Regular users with no shop can't see agents
      return forbiddenResponse('You do not have permission to access agents');
    }

    return successResponse(agents);
  } catch (error: any) {
    console.error('Get agents error:', error);
    return serverErrorResponse(error.message || 'Failed to get agents');
  }
}

// POST - Create new agent
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { userId, shopId } = body;

    // Validation
    if (!userId) {
      return errorResponse('User ID is required');
    }

    // Determine shop ID
    let agentShopId = shopId;

    if (!shopId) {
      // If no shopId provided, use current user's shop
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (!userShop) {
        return errorResponse('You must have a shop to create agents');
      }

      agentShopId = userShop.id;
    } else {
      // Verify user owns the shop or is SUPERADMIN
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
      });

      if (!shop) {
        return errorResponse('Shop not found', 404);
      }

      if (shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to create agents for this shop');
      }
    }

    // Check if user exists and is not already an agent
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if user is already an agent
    const existingAgent = await prisma.agent.findUnique({
      where: { userId },
    });

    if (existingAgent) {
      return errorResponse('User is already an agent', 409);
    }

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        userId,
        shopId: agentShopId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
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

    // Update user role to AGENT if not already
    if (user.role !== UserRole.AGENT) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.AGENT },
      });
    }

    return successResponse(agent, 'Agent created successfully', 201);
  } catch (error: any) {
    console.error('Create agent error:', error);
    return serverErrorResponse(error.message || 'Failed to create agent');
  }
}
