'use server'

import { prisma } from '@/lib/prisma'
import { ServiceEventType } from '@/generated/prisma'

export async function getServiceEvents() {
  try {
    const events = await prisma.serviceEvent.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              }
            }
          }
        },
        amcContract: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, data: events }
  } catch (error: any) {
    console.error('Get service events error:', error)
    return { success: false, error: error.message }
  }
}

export async function createServiceEvent(data: {
  type: 'REPAIR' | 'AMC' | 'WARRANTY'
  productId: number
  customerId?: number
  orderId?: number
  description?: string
  remarks?: string
  parts?: string
  agentId?: number
  amcContractId?: number
  startDate?: Date
  endDate?: Date
  pricePaid?: number
}) {
  try {
    const event = await prisma.serviceEvent.create({
      data: {
        type: data.type as ServiceEventType,
        productId: data.productId,
        customerId: data.customerId,
        orderId: data.orderId,
        description: data.description,
        remarks: data.remarks,
        parts: data.parts,
        agentId: data.agentId,
        amcContractId: data.amcContractId,
        startDate: data.startDate,
        endDate: data.endDate,
        pricePaid: data.pricePaid,
      },
      include: {
        product: {
          select: {
            name: true,
          }
        },
        customer: {
          select: {
            name: true,
          }
        }
      }
    })

    return { success: true, data: event }
  } catch (error: any) {
    console.error('Create service event error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateServiceEvent(id: number, data: {
  description?: string
  remarks?: string
  parts?: string
  feedback?: string
  agentId?: number
}) {
  try {
    const event = await prisma.serviceEvent.update({
      where: { id },
      data: {
        description: data.description,
        remarks: data.remarks,
        parts: data.parts,
        feedback: data.feedback,
        agentId: data.agentId,
      }
    })

    return { success: true, data: event }
  } catch (error: any) {
    console.error('Update service event error:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteServiceEvent(id: number) {
  try {
    await prisma.serviceEvent.delete({
      where: { id }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Delete service event error:', error)
    return { success: false, error: error.message }
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { success: true, data: products }
  } catch (error: any) {
    console.error('Get products error:', error)
    return { success: false, error: error.message }
  }
}

export async function getCustomers() {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { success: true, data: customers }
  } catch (error: any) {
    console.error('Get customers error:', error)
    return { success: false, error: error.message }
  }
}

export async function getAgents() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: {
            name: true,
          }
        }
      }
    })

    return { success: true, data: agents }
  } catch (error: any) {
    console.error('Get agents error:', error)
    return { success: false, error: error.message }
  }
}

export async function getAMCContracts() {
  try {
    const contracts = await prisma.aMCContract.findMany({
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
        status: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { success: true, data: contracts }
  } catch (error: any) {
    console.error('Get AMC contracts error:', error)
    return { success: false, error: error.message }
  }
}
