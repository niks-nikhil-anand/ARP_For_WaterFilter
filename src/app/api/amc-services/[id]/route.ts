import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET single AMC service
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
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return errorResponse('Invalid AMC service ID');
    }

    const service = await prisma.aMCService.findUnique({
      where: { id: serviceId },
      include: {
        amcContract: {
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
      },
    });

    if (!service) {
      return notFoundResponse('AMC service not found');
    }

    if (service.amcContract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(service);
  } catch (error: any) {
    console.error('Get AMC service error:', error);
    return serverErrorResponse(error.message || 'Failed to get AMC service');
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
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return errorResponse('Invalid AMC service ID');
    }

    const body = await request.json();

    const existingService = await prisma.aMCService.findUnique({
      where: { id: serviceId },
      include: {
        amcContract: {
          include: { shop: true },
        },
      },
    });

    if (!existingService) {
      return notFoundResponse('AMC service not found');
    }

    if (existingService.amcContract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const updatedService = await prisma.aMCService.update({
      where: { id: serviceId },
      data: body,
      include: {
        amcContract: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
      },
    });

    return successResponse(updatedService, 'AMC service updated successfully');
  } catch (error: any) {
    console.error('Update AMC service error:', error);
    return serverErrorResponse(error.message || 'Failed to update AMC service');
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
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return errorResponse('Invalid AMC service ID');
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return errorResponse('Name is required');
    }

    const existingService = await prisma.aMCService.findUnique({
      where: { id: serviceId },
      include: {
        amcContract: {
          include: { shop: true },
        },
      },
    });

    if (!existingService) {
      return notFoundResponse('AMC service not found');
    }

    if (existingService.amcContract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const updatedService = await prisma.aMCService.update({
      where: { id: serviceId },
      data: { name, description },
      include: {
        amcContract: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
      },
    });

    return successResponse(updatedService, 'AMC service updated successfully');
  } catch (error: any) {
    console.error('Update AMC service error:', error);
    return serverErrorResponse(error.message || 'Failed to update AMC service');
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
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return errorResponse('Invalid AMC service ID');
    }

    const existingService = await prisma.aMCService.findUnique({
      where: { id: serviceId },
      include: {
        amcContract: {
          include: { shop: true },
        },
      },
    });

    if (!existingService) {
      return notFoundResponse('AMC service not found');
    }

    if (existingService.amcContract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to delete this resource');
    }

    await prisma.aMCService.delete({
      where: { id: serviceId },
    });

    return successResponse(null, 'AMC service deleted successfully');
  } catch (error: any) {
    console.error('Delete AMC service error:', error);
    return serverErrorResponse(error.message || 'Failed to delete AMC service');
  }
}
