import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET single order
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
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return errorResponse('Invalid order ID');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            createdBy: {
              include: {
                shops: {
                  select: {
                    id: true,
                    name: true,
                    addresses: true,
                    userId: true,
                  },
                },
              },
            },
            // productDetail: true, // Removed as it might not exist or cause issues if not defined in schema
          },
        },
        serviceEvents: {
          include: {
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
        },
      },
    });

    if (!order) {
      return notFoundResponse('Order not found');
    }

    const shop = order.product.createdBy.shops[0];
    if ((!shop || shop.userId !== currentUser.id) && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    // Transform response to include shop details at top level if needed by frontend
    const responseData = {
      ...order,
      shop: shop
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get order error:', error);
    return serverErrorResponse(error.message || 'Failed to get order');
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
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return errorResponse('Invalid order ID');
    }

    const body = await request.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            createdBy: {
              include: {
                shops: true,
              },
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return notFoundResponse('Order not found');
    }

    const shop = existingOrder.product.createdBy.shops[0];
    if ((!shop || shop.userId !== currentUser.id) && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: body,
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            company: true,
            type: true,
          },
        },
      },
    });

    return successResponse(updatedOrder, 'Order updated successfully');
  } catch (error: any) {
    console.error('Update order error:', error);
    return serverErrorResponse(error.message || 'Failed to update order');
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
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return errorResponse('Invalid order ID');
    }

    const body = await request.json();
    const { customerName, customerEmail, customerPhone } = body;

    if (!customerName) {
      return errorResponse('Customer name is required');
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            createdBy: {
              include: {
                shops: true,
              },
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return notFoundResponse('Order not found');
    }

    const shop = existingOrder.product.createdBy.shops[0];
    if ((!shop || shop.userId !== currentUser.id) && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        customerName,
        customerEmail,
        customerPhone,
      },
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            company: true,
            type: true,
          },
        },
      },
    });

    return successResponse(updatedOrder, 'Order updated successfully');
  } catch (error: any) {
    console.error('Update order error:', error);
    return serverErrorResponse(error.message || 'Failed to update order');
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
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return errorResponse('Invalid order ID');
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            createdBy: {
              include: {
                shops: true,
              },
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return notFoundResponse('Order not found');
    }

    const shop = existingOrder.product.createdBy.shops[0];
    if ((!shop || shop.userId !== currentUser.id) && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to delete this resource');
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return successResponse(null, 'Order deleted successfully');
  } catch (error: any) {
    console.error('Delete order error:', error);
    return serverErrorResponse(error.message || 'Failed to delete order');
  }
}
