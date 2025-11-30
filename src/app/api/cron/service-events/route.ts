import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Find service events that are:
    // 1. Type AMC
    // 2. Status PENDING
    // 3. Start date is within the next 7 days (or already passed)
    // 4. Do not have a linked ticket yet
    const dueEvents = await prisma.serviceEvent.findMany({
      where: {
        type: 'AMC',
        status: 'PENDING',
        startDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        ticket: {
          is: null
        }
      },
      include: {
        customer: {
          include: {
            addresses: true
          }
        },
        product: true,
        amcContract: {
          include: {
            agent: true
          }
        }
      }
    })

    const createdTickets = []

    for (const event of dueEvents) {
      if (!event.customer) continue

      // Create a ticket for this event
      const ticket = await prisma.ticket.create({
        data: {
          customerName: event.customer.name,
          customerEmail: event.customer.email,
          customerPhone: event.customer.mobile || '',
          customerAddress: event.customer.addresses[0]?.locality || '',
          serviceType: 'AMC Service',
          productType: event.product.type,
          description: event.description || 'Scheduled AMC Service',
          preferredDate: event.startDate,
          status: 'OPEN',
          priority: 'MEDIUM',
          // Assign to the agent from the AMC contract if available
          agentId: event.amcContract?.agentId,
          shopId: event.amcContract?.shopId,
          serviceEvent: {
            connect: { id: event.id }
          }
        }
      })

      // Update event status to SCHEDULED
      await prisma.serviceEvent.update({
        where: { id: event.id },
        data: { status: 'SCHEDULED' }
      })

      createdTickets.push(ticket.id)
    }

    return NextResponse.json({
      success: true,
      processed: dueEvents.length,
      createdTickets
    })
  } catch (error: any) {
    console.error('Check due services error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
