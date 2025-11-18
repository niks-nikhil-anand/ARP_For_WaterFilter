import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET single product detail by ID
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
    const productDetailId = parseInt(id);

    if (isNaN(productDetailId)) {
      return errorResponse('Invalid product detail ID');
    }

    const productDetail = await prisma.productDetail.findUnique({
      where: { id: productDetailId },
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
        amcContract: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    if (!productDetail) {
      return notFoundResponse('Product detail not found');
    }

    // Check permission
    if (
      productDetail.product.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(productDetail);
  } catch (error: any) {
    console.error('Get product detail error:', error);
    return serverErrorResponse(error.message || 'Failed to get product detail');
  }
}

// PATCH - Partial update product detail
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
    const productDetailId = parseInt(id);

    if (isNaN(productDetailId)) {
      return errorResponse('Invalid product detail ID');
    }

    const body = await request.json();
    const { uniqueCode } = body;

    // Check if product detail exists
    const existingDetail = await prisma.productDetail.findUnique({
      where: { id: productDetailId },
      include: {
        product: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!existingDetail) {
      return notFoundResponse('Product detail not found');
    }

    // Check permission
    if (
      existingDetail.product.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // If unique code is being changed, check if it's already taken
    if (uniqueCode && uniqueCode !== existingDetail.uniqueCode) {
      const uniqueCodeTaken = await prisma.productDetail.findUnique({
        where: { uniqueCode },
      });

      if (uniqueCodeTaken) {
        return errorResponse('Unique code is already taken', 409);
      }
    }

    // Update product detail
    const updatedDetail = await prisma.productDetail.update({
      where: { id: productDetailId },
      data: body,
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
        amcContract: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    return successResponse(updatedDetail, 'Product detail updated successfully');
  } catch (error: any) {
    console.error('Update product detail error:', error);
    return serverErrorResponse(error.message || 'Failed to update product detail');
  }
}

// PUT - Full update product detail
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
    const productDetailId = parseInt(id);

    if (isNaN(productDetailId)) {
      return errorResponse('Invalid product detail ID');
    }

    const body = await request.json();
    const {
      uniqueCode,
      basePrice,
      discountedPrice,
      discountValue,
      discountType,
      amcContractId,
    } = body;

    // Validation
    if (!uniqueCode || !basePrice) {
      return errorResponse('Unique code and base price are required');
    }

    // Check if product detail exists
    const existingDetail = await prisma.productDetail.findUnique({
      where: { id: productDetailId },
      include: {
        product: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!existingDetail) {
      return notFoundResponse('Product detail not found');
    }

    // Check permission
    if (
      existingDetail.product.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // If unique code is being changed, check if it's already taken
    if (uniqueCode !== existingDetail.uniqueCode) {
      const uniqueCodeTaken = await prisma.productDetail.findUnique({
        where: { uniqueCode },
      });

      if (uniqueCodeTaken) {
        return errorResponse('Unique code is already taken', 409);
      }
    }

    // Update product detail
    const updatedDetail = await prisma.productDetail.update({
      where: { id: productDetailId },
      data: {
        uniqueCode,
        basePrice,
        discountedPrice,
        discountValue,
        discountType,
        amcContractId,
      },
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
        amcContract: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    return successResponse(updatedDetail, 'Product detail updated successfully');
  } catch (error: any) {
    console.error('Update product detail error:', error);
    return serverErrorResponse(error.message || 'Failed to update product detail');
  }
}

// DELETE product detail
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
    const productDetailId = parseInt(id);

    if (isNaN(productDetailId)) {
      return errorResponse('Invalid product detail ID');
    }

    // Check if product detail exists
    const existingDetail = await prisma.productDetail.findUnique({
      where: { id: productDetailId },
      include: {
        product: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!existingDetail) {
      return notFoundResponse('Product detail not found');
    }

    // Check permission
    if (
      existingDetail.product.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to delete this resource');
    }

    // Delete product detail
    await prisma.productDetail.delete({
      where: { id: productDetailId },
    });

    return successResponse(null, 'Product detail deleted successfully');
  } catch (error: any) {
    console.error('Delete product detail error:', error);
    return serverErrorResponse(error.message || 'Failed to delete product detail');
  }
}
