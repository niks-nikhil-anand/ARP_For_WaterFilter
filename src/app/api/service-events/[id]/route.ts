import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET single service event
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
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return errorResponse('Invalid service event ID');
    }

    const event = await prisma.serviceEvent.findUnique({
      where: { id: eventId },
      include: {
        product: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                userId: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        order: true,
        amcContract: true,
        assignedTo: {
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
      },
    });

    if (!event) {
      return notFoundResponse('Service event not found');
    }

    // Permission check
    const isShopOwner = event.product.shop.userId === currentUser.id;
    const isCustomer = event.customerId === currentUser.id;
    const isAgent = event.assignedTo?.userId === currentUser.id;
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    if (!isShopOwner && !isCustomer && !isAgent && !isSuperAdmin) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(event);
  } catch (error: any) {
    console.error('Get service event error:', error);
    return serverErrorResponse(error.message || 'Failed to get service event');
  }
}

// PATCH - Partial update
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
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return errorResponse('Invalid service event ID');
    }

    const body = await request.json();

    const existingEvent = await prisma.serviceEvent.findUnique({
      where: { id: eventId },
      include: {
        product: {
          include: { shop: true },
        },
        assignedTo: true,
      },
    });

    if (!existingEvent) {
      return notFoundResponse('Service event not found');
    }

    // Permission check
    const isShopOwner = existingEvent.product.shop.userId === currentUser.id;
    const isAgent = existingEvent.assignedTo?.userId === currentUser.id;
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    if (!isShopOwner && !isAgent && !isSuperAdmin) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Convert dates if provided
    const updateData: any = { ...body };
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);

    const updatedEvent = await prisma.serviceEvent.update({
      where: { id: eventId },
      data: updateData,
      include: {
        product: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        amcContract: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return successResponse(updatedEvent, 'Service event updated successfully');
  } catch (error: any) {
    console.error('Update service event error:', error);
    return serverErrorResponse(error.message || 'Failed to update service event');
  }
}

// PUT - Full update
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
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return errorResponse('Invalid service event ID');
    }

    const body = await request.json();
    const { type, productId } = body;

    if (!type || !productId) {
      return errorResponse('Type and product ID are required');
    }

    const existingEvent = await prisma.serviceEvent.findUnique({
      where: { id: eventId },
      include: {
        product: {
          include: { shop: true },
        },
      },
    });

    if (!existingEvent) {
      return notFoundResponse('Service event not found');
    }

    if (existingEvent.product.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Convert dates if provided
    const updateData: any = { ...body };
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);

    const updatedEvent = await prisma.serviceEvent.update({
      where: { id: eventId },
      data: updateData,
      include: {
        product: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        amcContract: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return successResponse(updatedEvent, 'Service event updated successfully');
  } catch (error: any) {
    console.error('Update service event error:', error);
    return serverErrorResponse(error.message || 'Failed to update service event');
  }
}

// DELETE
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
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return errorResponse('Invalid service event ID');
    }

    const existingEvent = await prisma.serviceEvent.findUnique({
      where: { id: eventId },
      include: {
        product: {
          include: { shop: true },
        },
      },
    });

    if (!existingEvent) {
      return notFoundResponse('Service event not found');
    }

    if (existingEvent.product.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to delete this resource');
    }

    await prisma.serviceEvent.delete({
      where: { id: eventId },
    });

    return successResponse(null, 'Service event deleted successfully');
  } catch (error: any) {
    console.error('Delete service event error:', error);
    return serverErrorResponse(error.message || 'Failed to delete service event');
  }
}
