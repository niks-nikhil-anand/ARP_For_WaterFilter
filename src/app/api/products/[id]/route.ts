import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return errorResponse('Invalid product ID');
    }

    const { searchParams } = new URL(request.url);
    const publicView = searchParams.get('public') === 'true';

    // Public endpoint for homepage - no authentication required
    if (publicView) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      });

      if (!product) {
        return notFoundResponse('Product not found');
      }

      return successResponse(product);
    }

    // For authenticated routes, check user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        orders: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      return notFoundResponse('Product not found');
    }

    // Check permission - only creator or admin can view detailed product
    if (
      product.createdById !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(product);
  } catch (error: any) {
    console.error('Get product error:', error);
    return serverErrorResponse(error.message || 'Failed to get product');
  }
}

// PATCH - Partial update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Check if user has admin or superadmin role
    if (currentUser.role !== UserRole.SUPERADMIN && currentUser.role !== UserRole.ADMIN) {
      return forbiddenResponse('Only admins can update products');
    }

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return errorResponse('Invalid product ID');
    }

    const body = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return notFoundResponse('Product not found');
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: body,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return successResponse(updatedProduct, 'Product updated successfully');
  } catch (error: any) {
    console.error('Update product error:', error);
    return serverErrorResponse(error.message || 'Failed to update product');
  }
}

// PUT - Full update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Check if user has admin or superadmin role
    if (currentUser.role !== UserRole.SUPERADMIN && currentUser.role !== UserRole.ADMIN) {
      return forbiddenResponse('Only admins can update products');
    }

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return errorResponse('Invalid product ID');
    }

    const body = await request.json();
    const {
      uniqueId,
      productName,
      description,
      company,
      type,
      color,
      price,
      images,
      featuredImageUrl,
      offer,
      discount,
      discountType,
      warrantyPeriod,
      status
    } = body;

    // Validation
    if (!company || !type) {
      return errorResponse('Company and type are required');
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return notFoundResponse('Product not found');
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        uniqueId,
        productName,
        description,
        company,
        type,
        color,
        price,
        images,
        featuredImageUrl,
        offer,
        discount,
        discountType,
        warrantyPeriod,
        status,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return successResponse(updatedProduct, 'Product updated successfully');
  } catch (error: any) {
    console.error('Update product error:', error);
    return serverErrorResponse(error.message || 'Failed to update product');
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Check if user has admin or superadmin role
    if (currentUser.role !== UserRole.SUPERADMIN && currentUser.role !== UserRole.ADMIN) {
      return forbiddenResponse('Only admins can delete products');
    }

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return errorResponse('Invalid product ID');
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return notFoundResponse('Product not found');
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId },
    });

    return successResponse(null, 'Product deleted successfully');
  } catch (error: any) {
    console.error('Delete product error:', error);
    return serverErrorResponse(error.message || 'Failed to delete product');
  }
}
