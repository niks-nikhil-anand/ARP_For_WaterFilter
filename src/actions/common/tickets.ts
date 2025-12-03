'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma, TicketStatus, TicketPriority, PaymentMethod } from '@/generated/prisma'

export type TicketWithDetails = Prisma.TicketGetPayload<{
  include: {
    assignedToAgent: {
      include: {
        user: true
      }
    }
    shop: true
    user: true
  }
}>

// Helper to serialize Decimal fields
function serializeTicket(ticket: any) {
  return {
    ...ticket,
    timeSpent: ticket.timeSpent ? Number(ticket.timeSpent) : null,
    amountCollected: ticket.amountCollected ? Number(ticket.amountCollected) : null,
  }
}

export async function getAllTickets(filters?: {
  status?: TicketStatus
  priority?: TicketPriority
  shopId?: number
  serviceType?: string
  startDate?: Date
  endDate?: Date
  isBacklog?: boolean
  page?: number
  limit?: number
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
    if (filters?.serviceType) {
      if (filters.serviceType === 'COMPLAINT') {
        where.OR = [
          { serviceType: 'COMPLAINT' },
          { serviceType: 'Issue' },
          { serviceType: 'Product Issue' },
          { description: { contains: 'complaint', mode: 'insensitive' } },
          { description: { contains: 'issue', mode: 'insensitive' } },
          { description: { contains: 'problem', mode: 'insensitive' } }
        ]
      } else {
        where.serviceType = filters.serviceType
      }
    }

    if (filters?.startDate && filters?.endDate) {
      where.serviceEvent = {
        actionDate: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      }
    } else if (filters?.startDate) {
      where.serviceEvent = {
        actionDate: {
          gte: filters.startDate
        }
      }
    }

    if (filters?.isBacklog) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      where.AND = [
        {
          serviceEvent: {
            actionDate: {
              lt: today
            }
          }
        },
        {
          status: {
            notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED]
          }
        }
      ]
    }

    // Pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 100 // Default to 100 for backward compatibility
    const skip = (page - 1) * limit

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        include: {
          assignedToAgent: {
            include: {
              user: true
            }
          },
          shop: true,
          serviceEvent: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: filters?.page ? skip : undefined,
        take: filters?.page ? limit : undefined,
      })
    ])
    
    const serializedTickets = tickets.map(serializeTicket)

    return { 
      success: true, 
      data: serializedTickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
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
        shop: true,
        user: true
      },
    })
    
    if (!ticket) {
      return { success: false, error: 'Ticket not found' }
    }
    
    return { success: true, data: serializeTicket(ticket) }
  } catch (error) {
    console.error('Failed to fetch ticket:', error)
    return { success: false, error: 'Failed to fetch ticket' }
  }
}

export async function createTicket(data: {
  customerId: number
  serviceType: string
  productType?: string
  description?: string
  preferredDate?: Date | string
  preferredTime?: string
  priority?: TicketPriority
  shopId?: number
  agentId?: number
  source?: string
  assignToUserId?: number
  paymentMethod?: PaymentMethod
}) {
  try {
    let agentId = data.agentId

    // Handle assignToUserId if provided
    if (data.assignToUserId) {
      const existingAgent = await prisma.agent.findUnique({
        where: { userId: data.assignToUserId }
      })

      if (existingAgent) {
        agentId = existingAgent.id
      } else {
        // Create new agent record
        const newAgent = await prisma.agent.create({
          data: {
            userId: data.assignToUserId,
            shopId: data.shopId || null
          }
        })
        agentId = newAgent.id
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId: data.customerId,
        serviceType: data.serviceType,
        productType: data.productType,
        description: data.description,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        preferredTime: data.preferredTime,
        priority: data.priority || TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        source: data.source || 'WEBSITE',
        shopId: data.shopId,
        agentId: agentId,
        paymentMethod: data.paymentMethod,
      },
      include: {
        assignedToAgent: {
          include: {
            user: true
          }
        },
        shop: true,
        user: true
      },
    })
    
    revalidatePath('/admin/tickets')
    return { success: true, data: serializeTicket(ticket), message: 'Ticket created successfully' }
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
    assignToUserId: number | null
    paymentMethod: PaymentMethod
  }>
) {
  try {
    const updateData: Prisma.TicketUpdateInput = {}
    
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.internalNotes !== undefined) updateData.internalNotes = updates.internalNotes
    if (updates.resolutionNotes !== undefined) updateData.resolutionNotes = updates.resolutionNotes
    if (updates.preferredTime !== undefined) updateData.preferredTime = updates.preferredTime
    if (updates.paymentMethod !== undefined) updateData.paymentMethod = updates.paymentMethod
    
    if (updates.preferredDate !== undefined) {
      updateData.preferredDate = updates.preferredDate ? new Date(updates.preferredDate) : null
    }
    
    if (updates.assignToUserId !== undefined) {
      if (updates.assignToUserId) {
        // Check if user already has an agent record
        const existingAgent = await prisma.agent.findUnique({
          where: { userId: updates.assignToUserId }
        })

        if (existingAgent) {
          updateData.assignedToAgent = { connect: { id: existingAgent.id } }
        } else {
          // Create new agent record without requiring a shop
          const newAgent = await prisma.agent.create({
            data: {
              userId: updates.assignToUserId,
              shopId: updates.shopId || null
            }
          })
          
          updateData.assignedToAgent = { connect: { id: newAgent.id } }
        }
      } else {
        updateData.assignedToAgent = { disconnect: true }
      }
    } else if (updates.agentId !== undefined) {
      // Legacy support for direct agentId assignment
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
        shop: true,
        user: true
      },
    })
    
    revalidatePath('/admin/tickets')
    return { success: true, data: serializeTicket(ticket), message: 'Ticket updated successfully' }
  } catch (error) {
    console.error('Failed to update ticket:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket'
    return { success: false, error: errorMessage }
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
