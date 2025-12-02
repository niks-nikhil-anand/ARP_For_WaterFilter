'use server'

import { prisma } from '@/lib/prisma'
import { ServiceEventType } from '@/generated/prisma'

export async function getServiceEvents(
  filter?: 'today' | 'yesterday' | 'upcoming' | 'backlog' | 'all' | 'custom',
  month?: string,
  status?: string,
  page?: number,
  limit?: number,
  customStartDate?: Date,
  customEndDate?: Date,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  try {
    let dateFilter: any = {}

    // Helper to get start of day in IST (UTC+5:30)
    const getISTStartOfDay = (offsetDays = 0) => {
      const now = new Date()
      const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' } as const
      const formatter = new Intl.DateTimeFormat('en-US', options)
      const parts = formatter.formatToParts(now)
      
      const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
      const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1
      const day = parseInt(parts.find(p => p.type === 'day')?.value || '0')

      // Create UTC date for 00:00:00 of that day
      const date = new Date(Date.UTC(year, month, day + offsetDays, 0, 0, 0, 0))
      
      // Subtract 5.5 hours to get IST midnight in UTC
      date.setHours(date.getHours() - 5)
      date.setMinutes(date.getMinutes() - 30)
      
      return date
    }

    const todayStart = getISTStartOfDay(0)
    const tomorrowStart = getISTStartOfDay(1)
    const yesterdayStart = getISTStartOfDay(-1)

    // 1. Handle Date Range Filter (Tabs)
    if (filter === 'today') {
      dateFilter = {
        actionDate: {
          gte: todayStart,
          lt: tomorrowStart
        }
      }
    } else if (filter === 'yesterday') {
      dateFilter = {
        actionDate: {
          gte: yesterdayStart,
          lt: todayStart
        }
      }
    } else if (filter === 'upcoming') {
      dateFilter = {
        actionDate: {
          gte: tomorrowStart
        }
      }
    } else if (filter === 'backlog') {
      dateFilter = {
        actionDate: {
          lt: todayStart
        },
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    } else if (filter === 'custom' && customStartDate && customEndDate) {
      // Ensure we cover the full end date
      const end = new Date(customEndDate)
      end.setHours(23, 59, 59, 999)
      
      dateFilter = {
        actionDate: {
          gte: customStartDate,
          lte: end
        }
      }
    }

    // 2. Handle Month Filter (Overrides Tab Filter if present and not 'all')
    if (month && month !== 'all') {
      const year = new Date().getFullYear()
      const monthIndex = parseInt(month)
      const startDate = new Date(year, monthIndex, 1)
      const endDate = new Date(year, monthIndex + 1, 0)
      endDate.setHours(23, 59, 59, 999)

      dateFilter = {
        actionDate: {
          gte: startDate,
          lte: endDate
        }
      }
    }

    // 3. Handle Status Filter
    let statusFilter: any = {}
    if (status && status !== 'ALL') {
      statusFilter = { status: status }
    }

    const where = {
      ...dateFilter,
      ...statusFilter
    }

    // Pagination
    const pageNum = page || 1
    const take = limit || 100 // Default to 100 if not specified to avoid breaking existing calls
    const skip = (pageNum - 1) * take

    const [total, events] = await Promise.all([
      prisma.serviceEvent.count({ where }),
      prisma.serviceEvent.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              productName: true,
              type: true, // Added product type
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true, // Added mobile
              addresses: { // Added addresses
                take: 1,
                select: {
                  locality: true,
                  state: true,
                  pincode: true
                }
              },
              warranties: { // Added warranties
                select: {
                  productId: true,
                  endDate: true,
                  warrantyType: true
                }
              }
            }
          },
          assignedTo: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true
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
          },
          ticket: {
            select: {
              id: true,
              status: true
            }
          },
          order: {
            select: {
              id: true,
              warranties: {
                select: {
                  endDate: true,
                  warrantyType: true
                }
              }
            }
          }
        },
        orderBy: sortBy ? {
          [sortBy]: sortOrder || 'asc'
        } : {
          actionDate: 'asc' // Default sort
        },
        skip: page ? skip : undefined,
        take: page ? take : undefined,
      })
    ])

    // Serialize Decimal fields
    const serializedEvents = events.map(event => ({
      ...event,
      amcContract: event.amcContract ? {
        ...event.amcContract,
        price: Number(event.amcContract.price)
      } : null
    }))

    return { 
      success: true, 
      data: serializedEvents,
      meta: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    }
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
  status?: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  actionDate?: Date
  scheduledRemarks?: string
}) {
  try {
    const event = await prisma.serviceEvent.update({
      where: { id },
      data: {
        description: data.description,
        remarks: data.remarks,
        feedback: data.feedback,
        agentId: data.agentId,
        status: data.status,
        actionDate: data.actionDate,
        scheduledRemarks: data.scheduledRemarks,
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

export async function createTicketForEvent(eventId: number, agentId?: number) {
  try {
    const event = await prisma.serviceEvent.findUnique({
      where: { id: eventId },
      include: {
        customer: {
          include: {
            addresses: { take: 1 }
          }
        },
        product: true
      }
    })

    if (!event || !event.customer) {
      return { success: false, error: 'Event or customer not found' }
    }

    const ticket = await prisma.ticket.create({
      data: {
        customerName: event.customer.name,
        customerEmail: event.customer.email,
        customerPhone: event.customer.mobile || '',
        customerAddress: event.customer.addresses[0]?.locality || '',
        serviceType: event.type,
        productType: event.product.type,
        description: event.description || `${event.type} Service Request`,
        status: 'OPEN',
        priority: 'MEDIUM',
        agentId: agentId || event.agentId, // Use provided agentId or fallback to event's agent
        serviceEvent: {
          connect: { id: event.id }
        }
      }
    })

    const serializedTicket = {
      ...ticket,
      timeSpent: ticket.timeSpent ? Number(ticket.timeSpent) : null,
      amountCollected: ticket.amountCollected ? Number(ticket.amountCollected) : null,
    }

    return { success: true, data: serializedTicket }
  } catch (error: any) {
    console.error('Create ticket for event error:', error)
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

export async function getAllAMCs(
  search?: string,
  status?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  page?: number,
  limit?: number,
  paymentStatus?: string
) {
  try {
    // 1. Build Where Clause
    const where: any = {}

    if (search) {
      where.OR = [
        { amcUniqueId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { product: { productName: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.contracts = {
        some: {
          paymentStatus: paymentStatus
        }
      }
    }

    // 2. Pagination
    const pageNum = page || 1
    const take = limit || 10
    const skip = (pageNum - 1) * take

    // 3. Sorting
    let orderBy: any = { createdAt: 'desc' } // Default
    if (sortBy) {
      if (sortBy === 'customer') {
        orderBy = { user: { name: sortOrder || 'asc' } }
      } else if (sortBy === 'product') {
        orderBy = { product: { productName: sortOrder || 'asc' } }
      } else {
        orderBy = { [sortBy]: sortOrder || 'asc' }
      }
    }

    const [total, amcs] = await Promise.all([
      prisma.aMC.count({ where }),
      prisma.aMC.findMany({
        where,
        include: {
          product: {
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
                  discount: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy,
        skip,
        take
      })
    ])

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
          amountPaid: contract.order.amountPaid ? Number(contract.order.amountPaid) : null,
          discount: contract.order.discount ? Number(contract.order.discount) : 0
        }
      }))
    }))

    return { 
      success: true, 
      data: serializedAMCs,
      meta: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    }
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
  serviceDates?: Date[]
}) {
  try {
    // 1. Validate inputs (Product, Customer)
    const customer = await prisma.user.findUnique({
      where: { id: data.customerId }
    })

    if (!customer) {
      return { success: false, error: 'Customer not found' }
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Get the shop (required for relations)
    const shop = await prisma.shop.findFirst({
      orderBy: { createdAt: 'asc' }
    })

    if (!shop) {
      return { success: false, error: 'No shop found' }
    }

    // 2. Check if customer has existing AMC for this product
    let amc = await prisma.aMC.findFirst({
      where: {
        productId: data.productId,
        userId: data.customerId
      }
    })

    // If NO existing AMC, create one
    if (!amc) {
      const amcUniqueId = `AMC-${product.id}-${customer.id}-${Date.now()}`
      
      amc = await prisma.aMC.create({
        data: {
          amcUniqueId,
          productId: data.productId,
          userId: data.customerId,
          shopId: shop.id,
          status: 'ACTIVE'
        }
      })
    }

    // 3. Prepare Contract Details
    // Calculate final price
    let finalPrice = data.price
    if (data.discount && data.discountType) {
      if (data.discountType === 'PERCENTAGE') {
        finalPrice = data.price - (data.price * data.discount / 100)
      } else {
        finalPrice = data.price - data.discount
      }
    }

    const paymentDue = finalPrice - data.paymentPaid

    // Calculate end date
    const startDate = new Date(data.startDate)
    let endDate = new Date(startDate)
    const durationMatch = data.duration.match(/(\d+)\s*(year|month|day)s?/i)
    if (durationMatch) {
      const amount = parseInt(durationMatch[1])
      const unit = durationMatch[2].toLowerCase()
      if (unit === 'year') endDate.setFullYear(endDate.getFullYear() + amount)
      else if (unit === 'month') endDate.setMonth(endDate.getMonth() + amount)
      else if (unit === 'day') endDate.setDate(endDate.getDate() + amount)
    }

    // Generate invoice number
    const lastContract = await prisma.aMCContract.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    const invoiceNumber = `AMC-${Date.now()}-${(lastContract?.id || 0) + 1}`

    // Create Order (Required for AMC Contract)
    const order = await prisma.order.create({
      data: {
        productId: data.productId,
        customerName: customer.name,
        customerEmail: customer.email || '',
        customerPhone: customer.mobile || '',
        status: 'COMPLETED',
        paymentMethod: data.paymentMethod || 'CASH',
        paymentStatus: paymentDue > 0 ? 'PENDING' : 'COMPLETED',
        amountPaid: data.paymentPaid,
        amcPurchased: true,
        createdById: data.customerId // Or admin ID if available
      }
    })

    // 4. Create AMC Contract and link to AMC
    const contract = await prisma.aMCContract.create({
      data: {
        invoiceNumber,
        amcId: amc.id, // Link to the AMC
        productId: data.productId, // Added missing productId
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
        agentId: data.agentId, // Assign agent
        noOfServices: data.noOfServices,
        description: data.remarks
      },
      include: {
        shop: true,
        agent: { include: { user: true } },
        order: true
      }
    })

    // 5. Create Service Events
    const serviceEvents = []
    const datesToUse = data.serviceDates && data.serviceDates.length === data.noOfServices 
      ? data.serviceDates 
      : []

    if (datesToUse.length === 0) {
      // Fallback: Distribute evenly
      const totalDurationMs = endDate.getTime() - startDate.getTime()
      const intervalMs = totalDurationMs / data.noOfServices
      for (let i = 0; i < data.noOfServices; i++) {
        datesToUse.push(new Date(startDate.getTime() + intervalMs * (i + 1)))
      }
    }

    for (let i = 0; i < data.noOfServices; i++) {
      const serviceDate = new Date(datesToUse[i])
      
      const event = await prisma.serviceEvent.create({
        data: {
          type: 'AMC',
          productId: data.productId,
          customerId: data.customerId,
          orderId: order.id,
          amcContractId: contract.id,
          status: 'SCHEDULED', // Should be SCHEDULED for future events
          description: `AMC Service ${i + 1} of ${data.noOfServices}`,
          remarks: 'Scheduled via AMC Contract',
          agentId: data.agentId, // Assign same agent
          shopId: shop.id,
          actionDate: serviceDate,
          scheduledDates: [serviceDate],
          amcEventType: 'REGULAR_SERVICE',
        }
      })
      serviceEvents.push(event)
    }

    // Serialize and return
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
    
    const serializedAmc = {
      ...amc,
      contracts: [serializedContract]
    }

    return { success: true, data: { contract: serializedContract, amc: serializedAmc, order: serializedOrder, serviceEvents } }
  } catch (error: any) {
    console.error('Create AMC contract error:', error)
    return { success: false, error: error.message }
  }
}

export async function resolveServiceEvent(id: number, data: {
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  remarks?: string
  actionDate?: Date
  scheduledRemarks?: string
}) {
  try {
    // Validation
    if (data.status === 'SCHEDULED' && !data.actionDate) {
      return { success: false, error: 'Scheduled date is required when status is SCHEDULED' }
    }

    const updateData: any = {
      status: data.status,
      remarks: data.remarks, // General remarks or completion remarks
    }

    if (data.status === 'SCHEDULED') {
      updateData.actionDate = data.actionDate
      updateData.scheduledRemarks = data.scheduledRemarks
    }

    const event = await prisma.serviceEvent.update({
      where: { id },
      data: updateData
    })

    return { success: true, data: event }
  } catch (error: any) {
    console.error('Resolve service event error:', error)
    return { success: false, error: error.message }
  }
}
