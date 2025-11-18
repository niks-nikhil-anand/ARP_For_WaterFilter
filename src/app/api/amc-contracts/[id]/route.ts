import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET single AMC contract
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
    const contractId = parseInt(id);
    if (isNaN(contractId)) {
      return errorResponse('Invalid AMC contract ID');
    }

    const contract = await prisma.aMCContract.findUnique({
      where: { id: contractId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        services: true,
        productDetails: {
          include: {
            product: true,
          },
        },
        serviceEvents: true,
      },
    });

    if (!contract) {
      return notFoundResponse('AMC contract not found');
    }

    if (contract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(contract);
  } catch (error: any) {
    console.error('Get AMC contract error:', error);
    return serverErrorResponse(error.message || 'Failed to get AMC contract');
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
    const contractId = parseInt(id);
    if (isNaN(contractId)) {
      return errorResponse('Invalid AMC contract ID');
    }

    const body = await request.json();

    const existingContract = await prisma.aMCContract.findUnique({
      where: { id: contractId },
      include: { shop: true },
    });

    if (!existingContract) {
      return notFoundResponse('AMC contract not found');
    }

    if (existingContract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const updatedContract = await prisma.aMCContract.update({
      where: { id: contractId },
      data: body,
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

    return successResponse(updatedContract, 'AMC contract updated successfully');
  } catch (error: any) {
    console.error('Update AMC contract error:', error);
    return serverErrorResponse(error.message || 'Failed to update AMC contract');
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
    const contractId = parseInt(id);
    if (isNaN(contractId)) {
      return errorResponse('Invalid AMC contract ID');
    }

    const body = await request.json();
    const { name, duration, price } = body;

    if (!name || !duration || !price) {
      return errorResponse('Name, duration, and price are required');
    }

    const existingContract = await prisma.aMCContract.findUnique({
      where: { id: contractId },
      include: { shop: true },
    });

    if (!existingContract) {
      return notFoundResponse('AMC contract not found');
    }

    if (existingContract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const updatedContract = await prisma.aMCContract.update({
      where: { id: contractId },
      data: { name, duration, price },
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

    return successResponse(updatedContract, 'AMC contract updated successfully');
  } catch (error: any) {
    console.error('Update AMC contract error:', error);
    return serverErrorResponse(error.message || 'Failed to update AMC contract');
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
    const contractId = parseInt(id);
    if (isNaN(contractId)) {
      return errorResponse('Invalid AMC contract ID');
    }

    const existingContract = await prisma.aMCContract.findUnique({
      where: { id: contractId },
      include: { shop: true },
    });

    if (!existingContract) {
      return notFoundResponse('AMC contract not found');
    }

    if (existingContract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to delete this resource');
    }

    await prisma.aMCContract.delete({
      where: { id: contractId },
    });

    return successResponse(null, 'AMC contract deleted successfully');
  } catch (error: any) {
    console.error('Delete AMC contract error:', error);
    return serverErrorResponse(error.message || 'Failed to delete AMC contract');
  }
}
