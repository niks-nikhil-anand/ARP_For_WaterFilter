import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

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
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
          productDetail: true,
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
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            userId: true,
          },
        },
        productDetail: true,
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

    // Check permission
    if (
      product.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN &&
      currentUser.role !== UserRole.ADMIN
    ) {
      // If user is an agent, check if product belongs to their shop
      if (currentUser.role === UserRole.AGENT) {
        const agent = await prisma.agent.findUnique({
          where: { userId: currentUser.id },
        });

        if (!agent || agent.shopId !== product.shopId) {
          return forbiddenResponse('You do not have permission to access this resource');
        }
      } else {
        return forbiddenResponse('You do not have permission to access this resource');
      }
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

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return errorResponse('Invalid product ID');
    }

    const body = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!existingProduct) {
      return notFoundResponse('Product not found');
    }

    // Check permission
    if (
      existingProduct.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: body,
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

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return errorResponse('Invalid product ID');
    }

    const body = await request.json();
    const { name, company, type, color, offer, warrantyPeriod } = body;

    // Validation
    if (!name || !company || !type) {
      return errorResponse('Name, company, and type are required');
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!existingProduct) {
      return notFoundResponse('Product not found');
    }

    // Check permission
    if (
      existingProduct.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        company,
        type,
        color,
        offer,
        warrantyPeriod,
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

    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return errorResponse('Invalid product ID');
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!existingProduct) {
      return notFoundResponse('Product not found');
    }

    // Check permission
    if (
      existingProduct.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to delete this resource');
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
