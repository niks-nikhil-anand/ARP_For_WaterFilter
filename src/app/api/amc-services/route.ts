import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET all AMC services
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const amcContractId = searchParams.get('amcContractId');

    let services;

    if (amcContractId) {
      const contractIdNum = parseInt(amcContractId);

      // Verify user has access to this contract
      const contract = await prisma.aMCContract.findUnique({
        where: { id: contractIdNum },
        include: { shop: true },
      });

      if (!contract) {
        return errorResponse('AMC contract not found', 404);
      }

      if (contract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
        return forbiddenResponse('You do not have permission to access these services');
      }

      services = await prisma.aMCService.findMany({
        where: { amcContractId: contractIdNum },
        include: {
          amcContract: {
            select: {
              id: true,
              name: true,
              duration: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (currentUser.role === UserRole.SUPERADMIN) {
      services = await prisma.aMCService.findMany({
        include: {
          amcContract: {
            include: {
              shop: {
                select: {
                  id: true,
                  name: true,
                },
              },
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

      services = await prisma.aMCService.findMany({
        where: {
          amcContract: {
            shopId: userShop.id,
          },
        },
        include: {
          amcContract: {
            select: {
              id: true,
              name: true,
              duration: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(services);
  } catch (error: any) {
    console.error('Get AMC services error:', error);
    return serverErrorResponse(error.message || 'Failed to get AMC services');
  }
}

// POST - Create new AMC service
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { name, description, amcContractId } = body;

    if (!name || !amcContractId) {
      return errorResponse('Name and AMC contract ID are required');
    }

    // Verify contract exists and user has permission
    const contract = await prisma.aMCContract.findUnique({
      where: { id: amcContractId },
      include: { shop: true },
    });

    if (!contract) {
      return errorResponse('AMC contract not found', 404);
    }

    if (contract.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to create services for this contract');
    }

    const service = await prisma.aMCService.create({
      data: {
        name,
        description,
        amcContractId,
      },
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

    return successResponse(service, 'AMC service created successfully', 201);
  } catch (error: any) {
    console.error('Create AMC service error:', error);
    return serverErrorResponse(error.message || 'Failed to create AMC service');
  }
}
