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
  type: ServiceEventType
  productId: number
  customerId?: number
  agentId?: number
  description?: string
  remarks?: string
  shopId?: number
  actionDate?: Date
  repairEventType?: string
  startDate?: Date // Kept for scheduledDates logic
}) {
  try {
    const event = await prisma.serviceEvent.create({
      data: {
        type: data.type,
        productId: data.productId,
        customerId: data.customerId,
        agentId: data.agentId,
        description: data.description,
        remarks: data.remarks,
        // Removed deleted fields: parts, pricePaid, startDate, endDate, orderId, amcContractId
        status: data.type === 'REPAIR' ? 'PENDING' : 'SCHEDULED', // Repairs start as PENDING until confirmed/assigned
        shopId: data.shopId,
        actionDate: data.actionDate || data.startDate,
        scheduledDates: data.startDate ? [data.startDate] : [],
        repairEventType: data.repairEventType,
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

    // If it's a repair, we might want to auto-create a ticket or wait.
    // For now, let's create a Ticket if it's a REPAIR to track it in the ticketing system.
    if (data.type === 'REPAIR' && data.customerId) {
      // Fetch customer details to populate ticket
      const customer = await prisma.user.findUnique({
        where: { id: data.customerId },
        select: { name: true, email: true, mobile: true, addresses: { take: 1 } }
      })

      if (customer) {
        await prisma.ticket.create({
          data: {
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.mobile || '',
            customerAddress: customer.addresses[0]?.locality || '',
            serviceType: 'Repair',
            description: data.description || 'Repair Request',
            status: 'OPEN',
            priority: 'MEDIUM',
            serviceEvent: {
              connect: { id: event.id }
            }
          }
        })
      }
    }

    const serializedEvent = {
      ...event,
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
  feedback?: string
  agentId?: number
}) {
  try {
    const event = await prisma.serviceEvent.update({
      where: { id },
      data: {
        description: data.description,
        remarks: data.remarks,
        feedback: data.feedback,
        agentId: data.agentId,
      }
    })

    const serializedEvent = {
      ...event,
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
        products: {
          select: {
            id: true,
            productName: true,
            company: true,
            type: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        contracts: {
          include: {
            agent: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
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
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const serializedAMCs = amcs.map(amc => ({
      ...amc,
      contracts: amc.contracts.map(contract => ({
        ...contract,
        price: Number(contract.price),
        discount: contract.discount ? Number(contract.discount) : null,
        finalPrice: Number(contract.finalPrice),
        paymentPaid: Number(contract.paymentPaid),
        paymentDue: Number(contract.paymentDue),
        order: {
          ...contract.order,
          amountPaid: contract.order.amountPaid ? Number(contract.order.amountPaid) : null
        }
      }))
    }))

    return { success: true, data: serializedAMCs }
  } catch (error: any) {
    console.error('Get all AMCs error:', error)
    return { success: false, error: error.message }
  }
}

export async function createAMCContract(data: {
  productIds: number[]
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
  serviceDates?: Date[]
}) {
  try {
    // Get customer details
    const customer = await prisma.user.findUnique({
      where: { id: data.customerId }
    })

    if (!customer) {
      return { success: false, error: 'Customer not found' }
    }

    // Get product details (verify all exist)
    const products = await prisma.product.findMany({
      where: { id: { in: data.productIds } }
    })

    if (products.length !== data.productIds.length) {
      return { success: false, error: 'One or more products not found' }
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

    // Create Order for the AMC Contract
    const order = await prisma.order.create({
      data: {
        productId: data.productIds[0], // Link order to the first product as primary
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

    // Find or Create AMC
    // We try to find an existing AMC for these products and customer
    // For simplicity, we create a new AMC or find one that matches the user. 
    // Since an AMC can have multiple products, matching exactly is complex.
    // We will assume if the user has an active AMC for ANY of these products, we might want to append?
    // But the prompt implies creating a NEW contract.
    // Let's check if there is an AMC for this user that contains these products?
    // For now, let's create/find based on User and assume one main AMC per user? 
    // Or better: Check if there is an AMC for this user.
    
    // Strategy: Find an AMC for this user. If it exists, add contract. If not, create.
    // But wait, different products might have different AMCs.
    // If the user selects Product A and B, and they already have an AMC for A, do we merge?
    // Let's assume we create a new AMC entry if we don't find one that covers these products.
    // Actually, to support "One AMC has multiple contracts", we should find the AMC that covers these products.
    
    // Simplified logic: Find an AMC for this user that includes at least one of the products?
    // Or just create a new AMC wrapper for this specific contract group?
    // If we want "One AMC has multiple contracts", usually the AMC entity IS the subscription.
    // Let's try to find an AMC for this user.
    let amc = await prisma.aMC.findFirst({
      where: {
        userId: data.customerId,
        products: {
          some: {
            id: { in: data.productIds }
          }
        }
      },
      include: {
        products: true
      }
    })

    if (!amc) {
      // Generate unique AMC ID
      const amcUniqueId = `AMC-${data.productIds.join('-')}-${customer.id}-${Date.now()}`
      
      amc = await prisma.aMC.create({
        data: {
          amcUniqueId,
          products: {
            connect: data.productIds.map(id => ({ id }))
          },
          userId: data.customerId,
          shopId: shop.id,
          status: 'ACTIVE'
        },
        include: {
          products: true
        }
      })
    } else {
      // If AMC exists, ensure all selected products are connected
      // This handles the case where we add a new product to an existing AMC via a new contract?
      // Or maybe we just ensure they are linked.
      const existingProductIds = amc.products.map(p => p.id)
      const newProductIds = data.productIds.filter(id => !existingProductIds.includes(id))
      
      if (newProductIds.length > 0) {
        await prisma.aMC.update({
          where: { id: amc.id },
          data: {
            products: {
              connect: newProductIds.map(id => ({ id }))
            }
          }
        })
      }
    }

    // Create AMC Contract
    const contract = await prisma.aMCContract.create({
      data: {
        invoiceNumber,
        amcId: amc.id,
        orderId: order.id,
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
        },
        order: true
      }
    })

    // Generate Service Events for the AMC
    const serviceEvents = []
    
    // Use provided service dates or fallback to auto-calculation
    const datesToUse = data.serviceDates && data.serviceDates.length === data.noOfServices 
      ? data.serviceDates 
      : []

    if (datesToUse.length === 0) {
      // Fallback calculation if no dates provided
      const totalDurationMs = endDate.getTime() - startDate.getTime()
      const intervalMs = totalDurationMs / data.noOfServices
      for (let i = 0; i < data.noOfServices; i++) {
        datesToUse.push(new Date(startDate.getTime() + intervalMs * (i + 1)))
      }
    }

    for (let i = 0; i < data.noOfServices; i++) {
      const serviceDate = new Date(datesToUse[i])
      
      // Create Service Event
      const event = await prisma.serviceEvent.create({
        data: {
          type: 'AMC',
          productId: data.productIds[0], // Assign to first product for now, or create multiple events?
          // Ideally we should create service events for EACH product? 
          // Or one event that covers all? ServiceEvent has single productId.
          // If AMC covers multiple products, usually the service visit checks all of them.
          // So we link to the primary product (first one) and maybe mention others in description.
          customerId: data.customerId,
          orderId: order.id,
          amcContractId: contract.id,
          status: 'PENDING',
          description: `AMC Service ${i + 1} of ${data.noOfServices}`,
          remarks: 'Scheduled via AMC Contract',
          agentId: data.agentId, // Initially assign to AMC agent
          shopId: shop.id,
          actionDate: serviceDate, // Set action date same as start date for AMC
          scheduledDates: [serviceDate], // Initialize with the first scheduled date
          amcEventType: 'REGULAR_SERVICE', // Default type
        }
      })
      serviceEvents.push(event)
    }

    // Serialize return data
    const serializedContract = {
      ...contract,
      price: Number(contract.price),
      discount: contract.discount ? Number(contract.discount) : null,
      finalPrice: Number(contract.finalPrice),
      paymentPaid: Number(contract.paymentPaid),
      paymentDue: Number(contract.paymentDue),
      order: {
        ...contract.order,
        amountPaid: contract.order.amountPaid ? Number(contract.order.amountPaid) : null
      }
    }

    const serializedOrder = {
      ...order,
      amountPaid: order.amountPaid ? Number(order.amountPaid) : null
    }
    
    // We return the AMC with its contracts (or just the new one for now in the return structure)
    // But to match previous return shape somewhat, we return the amc and the new contract
    const serializedAmc = {
      ...amc,
      contracts: [serializedContract] // Return with the new contract
    }

    return { success: true, data: { contract: serializedContract, amc: serializedAmc, order: serializedOrder, serviceEvents } }
  } catch (error: any) {
    console.error('Create AMC contract error:', error)
    return { success: false, error: error.message }
  }
}
