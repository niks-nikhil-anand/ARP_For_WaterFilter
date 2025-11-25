import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const productId = searchParams.get('productId');

    let orders;
    const whereClause: any = {};

    if (productId) whereClause.productId = parseInt(productId);

    if (shopId) {
      whereClause.product = {
        createdBy: {
          shops: {
            some: {
              id: parseInt(shopId)
            }
          }
        }
      };
      orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              productName: true,
              company: true,
              type: true,
            },
          },

          serviceEvents: {
            select: {
              id: true,
              type: true,
              startDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (currentUser.role === UserRole.SUPERADMIN) {
      orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              productName: true,
              company: true,
              type: true,
            },
          },

          serviceEvents: {
            select: {
              id: true,
              type: true,
              startDate: true,
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

      whereClause.product = {
        createdBy: {
          shops: {
            some: {
              id: userShop.id
            }
          }
        }
      };
      orders = await prisma.order.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              productName: true,
              company: true,
              type: true,
            },
          },

          serviceEvents: {
            select: {
              id: true,
              type: true,
              startDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    return serverErrorResponse(error.message || 'Failed to get orders');
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { 
      productId, 
      customerName, 
      customerEmail, 
      customerPhone,
      // New fields
      customerAltPhone,
      addressType,
      apartmentNo,
      locality,
      landmark,
      pincode,
      state,
      country,
      selectedAdditionalWarranty,
      selectedAMC,
      paymentOption
    } = body;

    if (!productId || !customerName) {
      return errorResponse('Product ID and customer name are required');
    }

    // Verify product exists and belongs to the shop
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        createdBy: {
          include: {
            shops: true
          }
        }
      }
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const productShop = product.createdBy.shops[0];
    
    // If user is a shop owner, ensure they are creating order for their own product
    if (currentUser.role !== UserRole.SUPERADMIN) {
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (!userShop) {
        return errorResponse('You must have a shop to create orders');
      }

      if (!productShop || productShop.id !== userShop.id) {
        return errorResponse('Product does not belong to your shop', 400);
      }
    }

    // Determine payment details
    const paymentMethod = paymentOption === 'pay_now' ? 'ONLINE' : 'CASH';
    const paymentStatus = paymentOption === 'pay_now' ? 'PENDING' : 'PENDING';
    const amountPaid = product.price || 0;

    const order = await prisma.order.create({
      data: {
        productId,
        customerName,
        customerEmail,
        customerPhone,
        // Add new fields
        customerAltPhone,
        addressType,
        apartmentNo,
        locality,
        landmark,
        pincode,
        state,
        country,
        selectedAdditionalWarranty,
        selectedAMC,
        paymentMethod,
        paymentStatus,
        amountPaid,
        additionalWarranty: selectedAdditionalWarranty && selectedAdditionalWarranty !== 'none' ? true : false,
        amcPurchased: selectedAMC && selectedAMC !== 'none' ? true : false,
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

    return successResponse(order, 'Order created successfully', 201);
  } catch (error: any) {
    console.error('Create order error:', error);
    return serverErrorResponse(error.message || 'Failed to create order');
  }
}
