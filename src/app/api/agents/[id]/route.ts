import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET single agent by ID
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
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return errorResponse('Invalid agent ID');
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            role: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        tasks: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!agent) {
      return notFoundResponse('Agent not found');
    }

    // Check permission
    const userShop = await prisma.shop.findUnique({
      where: { userId: currentUser.id },
    });

    if (
      agent.shopId !== userShop?.id &&
      agent.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(agent);
  } catch (error: any) {
    console.error('Get agent error:', error);
    return serverErrorResponse(error.message || 'Failed to get agent');
  }
}

// PATCH - Partial update agent
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
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return errorResponse('Invalid agent ID');
    }

    const body = await request.json();

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { shop: true },
    });

    if (!existingAgent) {
      return notFoundResponse('Agent not found');
    }

    // Check permission
    if (
      existingAgent.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Update agent
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: body,
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

    return successResponse(updatedAgent, 'Agent updated successfully');
  } catch (error: any) {
    console.error('Update agent error:', error);
    return serverErrorResponse(error.message || 'Failed to update agent');
  }
}

// PUT - Full update agent
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
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return errorResponse('Invalid agent ID');
    }

    const body = await request.json();
    const { shopId } = body;

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { shop: true },
    });

    if (!existingAgent) {
      return notFoundResponse('Agent not found');
    }

    // Check permission
    if (
      existingAgent.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Validate new shop if provided
    if (shopId) {
      const newShop = await prisma.shop.findUnique({
        where: { id: shopId },
      });

      if (!newShop) {
        return errorResponse('Shop not found', 404);
      }

      if (newShop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to assign to this shop');
      }
    }

    // Update agent
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        shopId: shopId || existingAgent.shopId,
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

    return successResponse(updatedAgent, 'Agent updated successfully');
  } catch (error: any) {
    console.error('Update agent error:', error);
    return serverErrorResponse(error.message || 'Failed to update agent');
  }
}

// DELETE agent
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
    const agentId = parseInt(id);

    if (isNaN(agentId)) {
      return errorResponse('Invalid agent ID');
    }

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { shop: true },
    });

    if (!existingAgent) {
      return notFoundResponse('Agent not found');
    }

    // Check permission
    if (
      existingAgent.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to delete this resource');
    }

    // Delete agent
    await prisma.agent.delete({
      where: { id: agentId },
    });

    return successResponse(null, 'Agent deleted successfully');
  } catch (error: any) {
    console.error('Delete agent error:', error);
    return serverErrorResponse(error.message || 'Failed to delete agent');
  }
}
