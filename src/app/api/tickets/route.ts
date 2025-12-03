import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole, TicketStatus, TicketPriority } from '@/generated/prisma';

// GET all tickets
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TicketStatus | null;
    const priority = searchParams.get('priority') as TicketPriority | null;
    const shopId = searchParams.get('shopId');

    let tickets;
    const whereClause: any = {};

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (shopId) whereClause.shopId = parseInt(shopId);

    if (!currentUser) {
      // Public endpoint - anyone can create a ticket
      // But only authenticated users can view tickets
      return unauthorizedResponse('Authentication required to view tickets');
    }

    if (currentUser.role === UserRole.SUPERADMIN || currentUser.role === UserRole.ADMIN) {
      // Admin can see all tickets
      tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
          assignedToAgent: {
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
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (currentUser.role === UserRole.AGENT) {
      // Agents see their assigned tickets
      const agent = await prisma.agent.findUnique({
        where: { userId: currentUser.id },
      });

      if (agent) {
        whereClause.agentId = agent.id;
      }

      tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Shop owners see tickets for their shop
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (userShop) {
        whereClause.shopId = userShop.id;
      } else {
        return forbiddenResponse('You do not have permission to view tickets');
      }

      tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
          assignedToAgent: {
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

    return successResponse(tickets);
  } catch (error: any) {
    console.error('Get tickets error:', error);
    return serverErrorResponse(error.message || 'Failed to get tickets');
  }
}

// POST - Create new ticket (public endpoint for "Book a Service")
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      serviceType,
      productType,
      description,
      preferredDate,
      preferredTime,
      priority,
      shopId,
    } = body;

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !serviceType) {
      return errorResponse('Customer name, email, phone, and service type are required');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return errorResponse('Invalid email format');
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.replace(/[\s-]/g, ''))) {
      return errorResponse('Invalid phone number. Please provide a 10-digit number');
    }

    // Create ticket
    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: customerEmail },
          { mobile: customerPhone }
        ]
      }
    });

    if (!user) {
      // Create new user if not exists
      user = await prisma.user.create({
        data: {
          name: customerName,
          email: customerEmail,
          mobile: customerPhone,
          role: 'USER',
          status: 'ACTIVE',
          password: 'defaultPassword123', // Or generate random
          addresses: {
            create: {
              locality: customerAddress,
              pincode: '000000', // Default
              phone: customerPhone,
            }
          }
        }
      });
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        serviceType,
        productType,
        description,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime,
        priority: priority || TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        shopId: shopId || null,
        source: 'WEBSITE',
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(ticket, 'Service request submitted successfully! We will contact you soon.', 201);
  } catch (error: any) {
    console.error('Create ticket error:', error);
    return serverErrorResponse(error.message || 'Failed to create ticket');
  }
}
