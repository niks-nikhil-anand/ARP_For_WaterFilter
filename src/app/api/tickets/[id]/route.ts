import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@prisma/client';

// GET single ticket
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
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return errorResponse('Invalid ticket ID');
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        assignedToAgent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
              },
            },
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            userId: true,
          },
        },
      },
    });

    if (!ticket) {
      return notFoundResponse('Ticket not found');
    }

    // Permission check
    const isShopOwner = ticket.shop?.userId === currentUser.id;
    const isAssignedAgent = ticket.assignedToAgent?.userId === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPERADMIN;

    if (!isShopOwner && !isAssignedAgent && !isAdmin) {
      return forbiddenResponse('You do not have permission to access this ticket');
    }

    return successResponse(ticket);
  } catch (error: any) {
    console.error('Get ticket error:', error);
    return serverErrorResponse(error.message || 'Failed to get ticket');
  }
}

// PATCH - Partial update ticket
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
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return errorResponse('Invalid ticket ID');
    }

    const body = await request.json();

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        shop: true,
        assignedToAgent: true,
      },
    });

    if (!existingTicket) {
      return notFoundResponse('Ticket not found');
    }

    // Permission check
    const isShopOwner = existingTicket.shop?.userId === currentUser.id;
    const isAssignedAgent = existingTicket.assignedToAgent?.userId === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPERADMIN;

    if (!isShopOwner && !isAssignedAgent && !isAdmin) {
      return forbiddenResponse('You do not have permission to update this ticket');
    }

    // Agents can only update certain fields
    let updateData: any = {};

    if (isAssignedAgent && !isShopOwner && !isAdmin) {
      // Agents can only update status, internal notes, and resolution notes
      const allowedFields = ['status', 'internalNotes', 'resolutionNotes'];
      Object.keys(body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = body[key];
        }
      });
    } else {
      // Shop owners and admins can update all fields
      updateData = { ...body };
    }

    // Convert dates if provided
    if (updateData.preferredDate) {
      updateData.preferredDate = new Date(updateData.preferredDate);
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
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
    });

    return successResponse(updatedTicket, 'Ticket updated successfully');
  } catch (error: any) {
    console.error('Update ticket error:', error);
    return serverErrorResponse(error.message || 'Failed to update ticket');
  }
}

// PUT - Full update ticket
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
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return errorResponse('Invalid ticket ID');
    }

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
      status,
      priority,
      agentId,
      shopId,
      internalNotes,
      resolutionNotes,
    } = body;

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !serviceType) {
      return errorResponse('Customer name, email, phone, and service type are required');
    }

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { shop: true },
    });

    if (!existingTicket) {
      return notFoundResponse('Ticket not found');
    }

    // Permission check - only shop owners and admins can do full replace
    const isShopOwner = existingTicket.shop?.userId === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPERADMIN;

    if (!isShopOwner && !isAdmin) {
      return forbiddenResponse('You do not have permission to replace this ticket');
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        serviceType,
        productType,
        description,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime,
        status,
        priority,
        agentId,
        shopId,
        internalNotes,
        resolutionNotes,
      },
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
    });

    return successResponse(updatedTicket, 'Ticket updated successfully');
  } catch (error: any) {
    console.error('Update ticket error:', error);
    return serverErrorResponse(error.message || 'Failed to update ticket');
  }
}

// DELETE ticket
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
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return errorResponse('Invalid ticket ID');
    }

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { shop: true },
    });

    if (!existingTicket) {
      return notFoundResponse('Ticket not found');
    }

    // Permission check - only shop owners and admins can delete
    const isShopOwner = existingTicket.shop?.userId === currentUser.id;
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPERADMIN;

    if (!isShopOwner && !isAdmin) {
      return forbiddenResponse('You do not have permission to delete this ticket');
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    return successResponse(null, 'Ticket deleted successfully');
  } catch (error: any) {
    console.error('Delete ticket error:', error);
    return serverErrorResponse(error.message || 'Failed to delete ticket');
  }
}
