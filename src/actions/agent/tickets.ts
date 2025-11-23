'use server'

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TicketStatus, TicketPriority } from '@/generated/prisma'

export async function getAgentTickets() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'AGENT') {
      return { success: false, error: 'Not authorized as agent' }
    }

    // Get agent record
    const agent = await prisma.agent.findUnique({
      where: { userId: decoded.id }
    })

    if (!agent) {
      return { success: false, error: 'Agent record not found' }
    }

    // Fetch tickets assigned to this agent
    const tickets = await prisma.ticket.findMany({
      where: {
        agentId: agent.id
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerAddress: true,
        serviceType: true,
        productType: true,
        description: true,
        status: true,
        priority: true,
        preferredDate: true,
        preferredTime: true,
        createdAt: true,
        updatedAt: true,
        internalNotes: true,
        resolutionNotes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate analytics
    const pendingCount = tickets.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.IN_PROGRESS).length
    const resolvedCount = tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length
    const totalCount = tickets.length

    return {
      success: true,
      data: {
        tickets: tickets.map(ticket => ({
          id: `TKT-${ticket.id}`,
          customerName: ticket.customerName,
          phone: ticket.customerPhone || 'N/A',
          email: ticket.customerEmail || 'N/A',
          address: ticket.customerAddress || 'N/A',
          issueType: ticket.serviceType,
          productType: ticket.productType || '',
          reason: ticket.description,
          priority: ticket.priority,
          dateCreated: new Date(ticket.createdAt).toLocaleDateString('en-IN'),
          timeCreated: new Date(ticket.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED ? 'Resolved' : 'Pending',
          internalNotes: ticket.internalNotes,
          resolutionNotes: ticket.resolutionNotes
        })),
        analytics: {
          pending: pendingCount,
          resolved: resolvedCount,
          total: totalCount
        }
      }
    }
  } catch (error: any) {
    console.error('Get agent tickets error:', error)
    return { success: false, error: error.message }
  }
}
