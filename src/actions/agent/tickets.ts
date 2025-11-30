'use server'

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TicketStatus, TicketPriority } from '@/generated/prisma'
import { createNotification } from '../admin/notifications'

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
          preferredDate: ticket.preferredDate ? new Date(ticket.preferredDate) : null,
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

export async function resolveTicket(data: {
  ticketId: number
  timeSpent: number
  amountCollected: number
  partsReplaced: string
  workDescription: string
  resolutionNotes?: string
}) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decoded = await verifyToken(token)
    if (!decoded || !['AGENT', 'ADMIN', 'SUPERADMIN'].includes(decoded.role)) {
      return { success: false, error: 'Not authorized' }
    }

    // Get agent record if role is AGENT
    let agent = null
    if (decoded.role === 'AGENT') {
      agent = await prisma.agent.findUnique({
        where: { userId: decoded.id }
      })

      if (!agent) {
        return { success: false, error: 'Agent record not found' }
      }
    }

    // Verify ticket ownership
    const ticket = await prisma.ticket.findUnique({
      where: { id: data.ticketId }
    })

    if (!ticket) {
      return { success: false, error: 'Ticket not found' }
    }

    // If agent, check ownership
    if (decoded.role === 'AGENT' && agent && ticket.agentId !== agent.id) {
      return { success: false, error: 'Not authorized to resolve this ticket' }
    }

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: data.ticketId },
      data: {
        status: TicketStatus.RESOLVED,
        timeSpent: data.timeSpent,
        amountCollected: data.amountCollected,
        partsReplaced: data.partsReplaced,
        workDescription: data.workDescription,
        resolutionNotes: data.resolutionNotes
      }
    })


    
    // Create Notification for Shop Admin
    if (ticket.shopId) {
      const shop = await prisma.shop.findUnique({
        where: { id: ticket.shopId },
        select: { userId: true }
      })
      
      if (shop) {
        await createNotification({
          title: `Ticket Resolved: #${ticket.id}`,
          message: `${decoded.role === 'AGENT' ? 'Agent' : 'Admin'} ${decoded.name} resolved ticket #${ticket.id} for ${ticket.customerName}.`,
          category: 'SERVICE',
          priority: 'MEDIUM',
          recipientId: shop.userId,
          shopId: ticket.shopId,
          link: `/admin/tickets?id=${ticket.id}`,
          metadata: { ticketId: ticket.id, agentId: decoded.id }
        });
      }
    }

    return { 
      success: true, 
      data: {
        id: updatedTicket.id,
        status: updatedTicket.status,
        updatedAt: updatedTicket.updatedAt
      }
    }
  } catch (error: any) {
    console.error('Resolve ticket error:', error)
    return { success: false, error: error.message }
  }
}
