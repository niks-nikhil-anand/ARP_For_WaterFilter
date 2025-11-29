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
            productName: true,
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
            invoiceNumber: true,
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

    // Serialize Decimal fields
    const serializedEvents = events.map(event => ({
      ...event,
      pricePaid: event.pricePaid ? Number(event.pricePaid) : null,
      amcContract: event.amcContract ? {
        ...event.amcContract,
        price: Number(event.amcContract.price)
      } : null
    }))

    return { success: true, data: serializedEvents }
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
            productName: true,
          }
        },
        customer: {
          select: {
            name: true,
          }
        }
      }
    })

    const serializedEvent = {
      ...event,
      pricePaid: event.pricePaid ? Number(event.pricePaid) : null
    }

    return { success: true, data: serializedEvent }
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

    const serializedEvent = {
      ...event,
      pricePaid: event.pricePaid ? Number(event.pricePaid) : null
    }

    return { success: true, data: serializedEvent }
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
        productName: true,
      },
      orderBy: {
        productName: 'asc'
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
        invoiceNumber: true,
        duration: true,
        price: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const serializedContracts = contracts.map(c => ({
      ...c,
      price: Number(c.price)
    }))

    return { success: true, data: serializedContracts }
  } catch (error: any) {
    console.error('Get AMC contracts error:', error)
    return { success: false, error: error.message }
  }
}

export async function getAllAMCs() {
  try {
    const amcs = await prisma.aMC.findMany({
      include: {
        product: {
          select: {
            id: true,
            productName: true,
            company: true,
            type: true,
          }
        },
        order: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            amountPaid: true,
          }
        },
        amcContract: {
          include: {
            agent: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const serializedAMCs = amcs.map(amc => ({
      ...amc,
      order: {
        ...amc.order,
        amountPaid: amc.order.amountPaid ? Number(amc.order.amountPaid) : null
      },
      amcContract: {
        ...amc.amcContract,
        price: Number(amc.amcContract.price),
        discount: amc.amcContract.discount ? Number(amc.amcContract.discount) : null,
        finalPrice: Number(amc.amcContract.finalPrice),
        paymentPaid: Number(amc.amcContract.paymentPaid),
        paymentDue: Number(amc.amcContract.paymentDue),
      }
    }))

    return { success: true, data: serializedAMCs }
  } catch (error: any) {
    console.error('Get all AMCs error:', error)
    return { success: false, error: error.message }
  }
}

export async function createAMCContract(data: {
  productId: number
  customerId: number
  agentId?: number
  startDate: Date
  duration: string
  price: number
  discount?: number
  discountType?: 'PERCENTAGE' | 'FLAT_RATE'
  paymentPaid: number
  paymentMethod?: 'CASH' | 'ONLINE' | 'UPI' | 'CARD' | 'NET_BANKING'
  remarks?: string
  noOfServices: number
}) {
  try {
    // Get customer details
    const customer = await prisma.user.findUnique({
      where: { id: data.customerId }
    })

    if (!customer) {
      return { success: false, error: 'Customer not found' }
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Calculate final price based on discount
    let finalPrice = data.price
    if (data.discount && data.discountType) {
      if (data.discountType === 'PERCENTAGE') {
        finalPrice = data.price - (data.price * data.discount / 100)
      } else {
        finalPrice = data.price - data.discount
      }
    }

    // Calculate payment due
    const paymentDue = finalPrice - data.paymentPaid

    // Calculate end date based on duration
    const startDate = new Date(data.startDate)
    let endDate = new Date(startDate)

    // Parse duration (e.g., "1 year", "6 months", "2 years")
    const durationMatch = data.duration.match(/(\d+)\s*(year|month|day)s?/i)
    if (durationMatch) {
      const amount = parseInt(durationMatch[1])
      const unit = durationMatch[2].toLowerCase()

      if (unit === 'year') {
        endDate.setFullYear(endDate.getFullYear() + amount)
      } else if (unit === 'month') {
        endDate.setMonth(endDate.getMonth() + amount)
      } else if (unit === 'day') {
        endDate.setDate(endDate.getDate() + amount)
      }
    }

    // Get the shop for the current admin/agent
    const shop = await prisma.shop.findFirst({
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (!shop) {
      return { success: false, error: 'No shop found' }
    }

    // Generate invoice number
    const lastContract = await prisma.aMCContract.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    const invoiceNumber = `AMC-${Date.now()}-${(lastContract?.id || 0) + 1}`

    // Create Order for the AMC
    const order = await prisma.order.create({
      data: {
        productId: data.productId,
        customerName: customer.name,
        customerEmail: customer.email || '',
        customerPhone: customer.mobile || '',
        status: 'COMPLETED', // AMC order is completed immediately
        paymentMethod: data.paymentMethod || 'CASH',
        paymentStatus: paymentDue > 0 ? 'PENDING' : 'COMPLETED',
        amountPaid: data.paymentPaid,
        amcPurchased: true,
        createdById: data.customerId
      }
    })

    // Create AMC Contract
    const contract = await prisma.aMCContract.create({
      data: {
        invoiceNumber,
        startDate,
        endDate,
        duration: data.duration,
        price: data.price,
        discount: data.discount || null,
        discountType: data.discountType || null,
        finalPrice,
        paymentPaid: data.paymentPaid,
        paymentDue,
        paymentNotes: data.remarks,
        paymentMethod: data.paymentMethod || 'CASH',
        paymentStatus: paymentDue > 0 ? 'PENDING' : 'COMPLETED',
        shopId: shop.id,
        agentId: data.agentId,
        noOfServices: data.noOfServices,
        description: data.remarks
      },
      include: {
        shop: true,
        agent: {
          include: {
            user: true
          }
        }
      }
    })

    // Generate unique AMC ID
    const amcUniqueId = `AMC-${product.id}-${customer.id}-${Date.now()}`

    // Create AMC record linking everything together
    const amc = await prisma.aMC.create({
      data: {
        amcUniqueId,
        productId: data.productId,
        orderId: order.id,
        userId: data.customerId,
        shopId: shop.id,
        amcContractId: contract.id,
        status: 'ACTIVE'
      },
      include: {
        product: true,
        user: true,
        order: true,
        amcContract: true
      }
    })

    // Serialize return data
    const serializedContract = {
      ...contract,
      price: Number(contract.price),
      discount: contract.discount ? Number(contract.discount) : null,
      finalPrice: Number(contract.finalPrice),
      paymentPaid: Number(contract.paymentPaid),
      paymentDue: Number(contract.paymentDue),
    }

    const serializedOrder = {
      ...order,
      amountPaid: order.amountPaid ? Number(order.amountPaid) : null
    }
    
    // amc has product(price), order(amountPaid), amcContract(price, etc.)
    // We need to serialize deep relations if they are returned
    const serializedAmc = {
      ...amc,
      product: {
        ...amc.product,
        price: Number(amc.product.price),
        discount: amc.product.discount ? Number(amc.product.discount) : null
      },
      order: serializedOrder,
      amcContract: serializedContract
    }

    return { success: true, data: { contract: serializedContract, amc: serializedAmc, order: serializedOrder } }
  } catch (error: any) {
    console.error('Create AMC contract error:', error)
    return { success: false, error: error.message }
  }
}
