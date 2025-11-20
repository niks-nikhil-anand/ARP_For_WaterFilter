'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma, TicketStatus, TicketPriority } from '@/generated/prisma'

export type TicketWithDetails = Prisma.TicketGetPayload<{
  include: {
    assignedToAgent: {
      include: {
        user: true
      }
    }
    shop: true
  }
}>

export async function getAllTickets(filters?: {
  status?: TicketStatus
  priority?: TicketPriority
  shopId?: number
}) {
  try {
    const where: Prisma.TicketWhereInput = {}
    
    if (filters?.status) {
      where.status = filters.status
    }
    if (filters?.priority) {
      where.priority = filters.priority
    }
    if (filters?.shopId) {
      where.shopId = filters.shopId
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        assignedToAgent: {
          include: {
            user: true
          }
        },
        shop: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return { success: true, data: tickets }
  } catch (error) {
    console.error('Failed to fetch tickets:', error)
    return { success: false, error: 'Failed to fetch tickets' }
  }
}

export async function getTicketById(id: number) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        assignedToAgent: {
          include: {
            user: true
          }
        },
        shop: true
      },
    })
    
    if (!ticket) {
      return { success: false, error: 'Ticket not found' }
    }
    
    return { success: true, data: ticket }
  } catch (error) {
    console.error('Failed to fetch ticket:', error)
    return { success: false, error: 'Failed to fetch ticket' }
  }
}

export async function createTicket(data: {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress?: string
  serviceType: string
  productType?: string
  description?: string
  preferredDate?: Date | string
  preferredTime?: string
  priority?: TicketPriority
  shopId?: number
  agentId?: number
  source?: string
}) {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        serviceType: data.serviceType,
        productType: data.productType,
        description: data.description,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        preferredTime: data.preferredTime,
        priority: data.priority || TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        source: data.source || 'WEBSITE',
        shopId: data.shopId,
        agentId: data.agentId,
      },
      include: {
        assignedToAgent: {
          include: {
            user: true
          }
        },
        shop: true
      },
    })
    
    revalidatePath('/admin/tickets')
    return { success: true, data: ticket, message: 'Ticket created successfully' }
  } catch (error) {
    console.error('Failed to create ticket:', error)
    return { success: false, error: 'Failed to create ticket' }
  }
}

export async function updateTicket(
  id: number,
  updates: Partial<{
    status: TicketStatus
    priority: TicketPriority
    agentId: number | null
    shopId: number | null
    internalNotes: string
    resolutionNotes: string
    preferredDate: Date | string
    preferredTime: string
  }>
) {
  try {
    const updateData: Prisma.TicketUpdateInput = {}
    
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.internalNotes !== undefined) updateData.internalNotes = updates.internalNotes
    if (updates.resolutionNotes !== undefined) updateData.resolutionNotes = updates.resolutionNotes
    if (updates.preferredTime !== undefined) updateData.preferredTime = updates.preferredTime
    
    if (updates.preferredDate !== undefined) {
      updateData.preferredDate = updates.preferredDate ? new Date(updates.preferredDate) : null
    }
    
    if (updates.agentId !== undefined) {
      updateData.assignedToAgent = updates.agentId 
        ? { connect: { id: updates.agentId } }
        : { disconnect: true }
    }
    
    if (updates.shopId !== undefined) {
      updateData.shop = updates.shopId 
        ? { connect: { id: updates.shopId } }
        : { disconnect: true }
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        assignedToAgent: {
          include: {
            user: true
          }
        },
        shop: true
      },
    })
    
    revalidatePath('/admin/tickets')
    return { success: true, data: ticket, message: 'Ticket updated successfully' }
  } catch (error) {
    console.error('Failed to update ticket:', error)
    return { success: false, error: 'Failed to update ticket' }
  }
}

export async function deleteTicket(id: number) {
  try {
    await prisma.ticket.delete({
      where: { id },
    })
    
    revalidatePath('/admin/tickets')
    return { success: true, message: 'Ticket deleted successfully' }
  } catch (error) {
    console.error('Failed to delete ticket:', error)
    return { success: false, error: 'Failed to delete ticket' }
  }
}

// Helper functions
export async function assignAgentToTicket(ticketId: number, agentId: number) {
  return updateTicket(ticketId, { agentId })
}

export async function updateTicketStatus(
  ticketId: number,
  status: TicketStatus
) {
  return updateTicket(ticketId, { status })
}

export async function addResolutionNotes(ticketId: number, notes: string) {
  return updateTicket(ticketId, { resolutionNotes: notes })
}

export async function closeTicket(ticketId: number, resolutionNotes: string) {
  return updateTicket(ticketId, {
    status: TicketStatus.RESOLVED,
    resolutionNotes,
  })
}
