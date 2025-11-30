'use server'

import { prisma } from '@/lib/prisma'

export type CreateOrderInput = {
  productId: number

  customerName: string
  customerEmail: string
  customerPhone: string
  customerAltPhone?: string
  // Address fields
  addressType: string
  apartmentNo: string
  locality: string
  landmark?: string
  pincode: string
  state: string
  country: string
  // Additional options
  additionalWarranty?: string
  amc?: string
  paymentOption: 'pay_later' | 'pay_now'
  userId?: number
  additionalDiscount?: number
}

export async function createOrder(data: CreateOrderInput) {
  try {
    // Determine payment method based on payment option
    const paymentMethod = data.paymentOption === 'pay_now' ? 'ONLINE' : 'CASH'
    const paymentStatus = data.paymentOption === 'pay_now' ? 'PENDING' : 'PENDING'

    // Get product details to calculate amount
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { 
        price: true,
        discount: true,
        discountType: true
      }
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        productId: data.productId,
        createdById: data.userId,

        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAltPhone: data.customerAltPhone,
        addressType: data.addressType,
        apartmentNo: data.apartmentNo,
        locality: data.locality,
        landmark: data.landmark,
        pincode: data.pincode,
        state: data.state,
        country: data.country,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        amountPaid: (() => {
          const price = Number(product.price) || 0
          const productDiscount = product.discountType === 'PERCENTAGE'
              ? (price * (Number(product.discount) || 0)) / 100
              : (Number(product.discount) || 0)
          const additionalDiscount = data.additionalDiscount || 0
          return Math.max(0, price - productDiscount - additionalDiscount)
        })(),
        discount: (() => {
          const price = Number(product.price) || 0
          const productDiscount = product.discountType === 'PERCENTAGE'
              ? (price * (Number(product.discount) || 0)) / 100
              : (Number(product.discount) || 0)
          const additionalDiscount = data.additionalDiscount || 0
          return productDiscount + additionalDiscount
        })(),
        selectedAdditionalWarranty: data.additionalWarranty,
        selectedAMC: data.amc,
        additionalWarranty: data.additionalWarranty && data.additionalWarranty !== 'none' ? true : false,
        amcPurchased: data.amc && data.amc !== 'none' ? true : false,
      },
      include: {
        product: {
          select: {
            productName: true,
            company: true,
            type: true,
            price: true,
            discount: true
          }
        }
      }
    })

    // Create address record (you can link this to order if needed)
    // For now, we'll store it separately or you can add address fields to Order model
    
    return {
      success: true,
      data: {
        ...order,
        amountPaid: order.amountPaid ? Number(order.amountPaid) : 0,
        discount: order.discount ? Number(order.discount) : 0,
        product: {
          ...order.product,
          price: order.product.price ? Number(order.product.price) : 0,
          discount: order.product.discount ? Number(order.product.discount) : null
        }
      },
      message: 'Order created successfully! Our executive will contact you shortly.'
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: 'Failed to create order. Please try again.'
    }
  }
}

export async function getOrderById(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            createdBy: {
              include: {
                shops: true
              }
            }
          }
        },
        serviceEvents: true
      }
    })

    if (!order) {
      return {
        success: false,
        error: 'Order not found'
      }
    }

    return {
      success: true,
      data: {
        ...order,
        amountPaid: order.amountPaid ? Number(order.amountPaid) : 0,
        discount: order.discount ? Number(order.discount) : 0,
        product: {
          ...order.product,
          price: order.product.price ? Number(order.product.price) : 0,
          discount: order.product.discount ? Number(order.product.discount) : null
        },
        serviceEvents: order.serviceEvents?.map((event: any) => ({
          ...event,
          // Add serialization for any Decimal fields in ServiceEvent if they exist in future
        })) || [],
        // If warranties are ever included
        warranties: (order as any).warranties?.map((w: any) => ({
          ...w,
          warrantyAmount: w.warrantyAmount ? Number(w.warrantyAmount) : 0
        })) || []
      }
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return {
      success: false,
      error: 'Failed to fetch order'
    }
  }
}

export async function getAllOrders(
  filters?: {
    search?: string
    paymentStatus?: string
    paymentMethod?: string
  },
  page: number = 1,
  limit: number = 10
) {
  try {
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { customerEmail: { contains: filters.search, mode: 'insensitive' } },
        { customerPhone: { contains: filters.search, mode: 'insensitive' } },
        { transactionId: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.paymentStatus && filters.paymentStatus !== 'ALL') {
      where.paymentStatus = filters.paymentStatus
    }

    if (filters?.paymentMethod && filters.paymentMethod !== 'ALL') {
      where.paymentMethod = filters.paymentMethod
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          product: {
            select: {
              productName: true,
              company: true,
              type: true,
              price: true,
              discount: true,
              createdBy: {
                include: {
                  shops: {
                    select: {
                      name: true,
                      shopName: true
                    }
                  }
                }
              }
            }
          },
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where })
    ])

    const serializedOrders = orders.map(order => ({
        ...order,
        amountPaid: order.amountPaid ? Number(order.amountPaid) : 0,
        discount: order.discount ? Number(order.discount) : 0,
        product: {
          ...order.product,
          price: order.product.price ? Number(order.product.price) : 0,
          discount: order.product.discount ? Number(order.product.discount) : null
        },
        // If warranties are ever included
        warranties: (order as any).warranties?.map((w: any) => ({
          ...w,
          warrantyAmount: w.warrantyAmount ? Number(w.warrantyAmount) : 0
        })) || []
    }))

    return {
      success: true,
      data: serializedOrders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit
      }
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return {
      success: false,
      error: 'Failed to fetch orders'
    }
  }
}

export async function updateOrderPaymentStatus(
  orderId: number,
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
  transactionId?: string
) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        transactionId
      }
    })

    return {
      success: true,
      data: order,
      message: 'Payment status updated successfully'
    }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return {
      success: false,
      error: 'Failed to update payment status'
    }
  }
}

export async function activateOrder(
  orderId: number,
  data?: {
    amountPaid: number
    discount: number
    freeWarranty: boolean
    freeInstallation: boolean
    paymentMethod?: string
    paymentStatus?: string
    warrantyDuration?: number
  }
) {
  try {
    console.log(`Activating order ${orderId}...`)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    })

    if (!order) {
      console.error(`Order ${orderId} not found`)
      return { success: false, error: 'Order not found' }
    }

    if (order.status === 'ACTIVE') {
      console.warn(`Order ${orderId} is already active`)
      return { success: false, error: 'Order is already active' }
    }

    // Helper to parse duration string
    const parseDuration = (durationStr: string | null | undefined): number => {
      if (!durationStr || durationStr === 'none') return 0
      
      const match = durationStr.toLowerCase().match(/(\d+)\s*(month|year)/i)
      if (match) {
        const value = parseInt(match[1])
        const unit = match[2].toLowerCase()
        return unit.startsWith('year') ? value * 12 : value
      }
      
      // Fallback for simple "1year", "2year" keys if they don't match regex (though regex handles them)
      if (durationStr === '1year') return 12
      if (durationStr === '2year') return 24
      if (durationStr === '3year') return 36
      if (durationStr === '5year') return 60
      
      return 0
    }

    // 1. Update Order Status and Payment Status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ACTIVE',
        paymentStatus: 'COMPLETED',
        installationCompleted: true, // Assuming activation means installation is done
        installationDate: new Date(),
        // Update with provided data if available
        ...(data && {
          amountPaid: data.amountPaid,
          discount: data.discount,
          freeWarranty: data.freeWarranty,
          freeInstallation: data.freeInstallation,
          paymentMethod: (data.paymentMethod || order.paymentMethod) as any,
          paymentStatus: (data.paymentStatus || 'COMPLETED') as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
        })
      }
    })

    // 2. Create Free Warranty (if applicable)
    // Use the provided freeWarranty flag if available, otherwise fallback to order property (which might have been updated above, but we use the input for clarity)
    const shouldCreateFreeWarranty = data ? data.freeWarranty : order.freeWarranty
    
    // Use provided duration or fallback to product default
    const baseWarrantyMonths = (data && data.warrantyDuration !== undefined) 
        ? data.warrantyDuration 
        : parseDuration(order.product.warrantyPeriod)
        
    console.log(`Base warranty months: ${baseWarrantyMonths}`)

    if (shouldCreateFreeWarranty && baseWarrantyMonths > 0) {
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + baseWarrantyMonths)

      await prisma.warranty.create({
        data: {
          productId: order.productId,
          orderId: order.id,
          warrantyType: 'FREE',
          startDate: startDate,
          endDate: endDate,
          durationMonths: baseWarrantyMonths,
          isActive: true,
          additionalWarranty: false,
          warrantyAmount: 0,
          termsAndConditions: `Standard Free Warranty - ${baseWarrantyMonths} Months`,
          userId: order.createdById, // Link to user
        }
      })
    }

    // 3. Create Additional Warranty (if purchased)
    const additionalMonths = parseDuration(order.selectedAdditionalWarranty)
    console.log(`Additional warranty months: ${additionalMonths} (Selected: ${order.selectedAdditionalWarranty})`)

    if (additionalMonths > 0) {
      // Starts after base warranty ends
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() + baseWarrantyMonths)
      
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + additionalMonths)

      await prisma.warranty.create({
        data: {
          productId: order.productId,
          orderId: order.id,
          warrantyType: 'EXTENDED',
          startDate: startDate,
          endDate: endDate,
          durationMonths: additionalMonths,
          isActive: true,
          additionalWarranty: true,
          warrantyAmount: 0, // Should be calculated based on plan price
          userId: order.createdById, // Link to user
        }
      })
    }

    // 4. Create AMC (if purchased)
    const amcMonths = parseDuration(order.selectedAMC)
    console.log(`AMC months: ${amcMonths} (Selected: ${order.selectedAMC})`)

    if (amcMonths > 0) {
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + amcMonths)

      if (!order.createdById) {
        throw new Error('Cannot create AMC: Order has no linked user')
      }

      await prisma.aMC.create({
        data: {
          amcUniqueId: `AMC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: order.createdById,
          productId: order.productId,
          status: 'ACTIVE',
        }
      })
    }

    return {
      success: true,
      message: 'Order activated successfully. Warranties and AMC created.'
    }

  } catch (error: any) {
    console.error('Error activating order:', error)
    return { success: false, error: error.message || 'Failed to activate order' }
  }
}

export async function updateOrderDetails(orderId: number, data: any) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAltPhone: data.customerAltPhone,
        addressType: data.addressType,
        apartmentNo: data.apartmentNo,
        locality: data.locality,
        landmark: data.landmark,
        pincode: data.pincode,
        state: data.state,
        country: data.country,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        transactionId: data.transactionId,
        freeInstallation: data.freeInstallation,
        installationCompleted: data.installationCompleted,
        freeWarranty: data.freeWarranty,
        additionalWarranty: data.additionalWarranty,
        amcPurchased: data.amcPurchased,
        selectedAdditionalWarranty: data.selectedAdditionalWarranty,
        selectedAMC: data.selectedAMC,
      }
    })

    return {
      success: true,
      data: order,
      message: 'Order details updated successfully'
    }
  } catch (error) {
    console.error('Error updating order details:', error)
    return {
      success: false,
      error: 'Failed to update order details'
    }
  }
}
