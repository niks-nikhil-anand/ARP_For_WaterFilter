import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole, ServiceEventType } from '@prisma/client';

// GET all service events
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ServiceEventType | null;
    const productId = searchParams.get('productId');
    const customerId = searchParams.get('customerId');

    let events;
    const whereClause: any = {};

    if (type) whereClause.type = type;
    if (productId) whereClause.productId = parseInt(productId);
    if (customerId) whereClause.customerId = parseInt(customerId);

    if (currentUser.role === UserRole.SUPERADMIN) {
      events = await prisma.serviceEvent.findMany({
        where: whereClause,
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
              mobile: true,
            },
          },
          order: {
            select: {
              id: true,
              customerName: true,
            },
          },
          amcContract: {
            select: {
              id: true,
              name: true,
              duration: true,
            },
          },
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (currentUser.role === UserRole.AGENT) {
      // Agents see their assigned tasks
      const agent = await prisma.agent.findUnique({
        where: { userId: currentUser.id },
      });

      if (agent) {
        whereClause.agentId = agent.id;
      }

      events = await prisma.serviceEvent.findMany({
        where: whereClause,
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
              mobile: true,
            },
          },
          order: {
            select: {
              id: true,
              customerName: true,
            },
          },
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
    } else {
      // Regular users and shop owners
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (userShop) {
        // Shop owners see events for their products
        whereClause.product = {
          shopId: userShop.id,
        };
      } else {
        // Regular users see their own events
        whereClause.customerId = currentUser.id;
      }

      events = await prisma.serviceEvent.findMany({
        where: whereClause,
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
              mobile: true,
            },
          },
          order: {
            select: {
              id: true,
              customerName: true,
            },
          },
          amcContract: {
            select: {
              id: true,
              name: true,
              duration: true,
            },
          },
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(events);
  } catch (error: any) {
    console.error('Get service events error:', error);
    return serverErrorResponse(error.message || 'Failed to get service events');
  }
}

// POST - Create new service event
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const {
      type,
      productId,
      customerId,
      orderId,
      startDate,
      endDate,
      pricePaid,
      amcContractId,
      remarks,
      description,
      parts,
      feedback,
      agentId,
      details,
    } = body;

    if (!type || !productId) {
      return errorResponse('Type and product ID are required');
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Permission check: shop owner or SUPERADMIN
    if (product.shop.userId !== currentUser.id && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to create service events for this product');
    }

    const event = await prisma.serviceEvent.create({
      data: {
        type,
        productId,
        customerId,
        orderId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        pricePaid,
        amcContractId,
        remarks,
        description,
        parts,
        feedback,
        agentId,
        details,
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

    return successResponse(event, 'Service event created successfully', 201);
  } catch (error: any) {
    console.error('Create service event error:', error);
    return serverErrorResponse(error.message || 'Failed to create service event');
  }
}
