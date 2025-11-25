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
}

export async function createOrder(data: CreateOrderInput) {
  try {
    // Determine payment method based on payment option
    const paymentMethod = data.paymentOption === 'pay_now' ? 'ONLINE' : 'CASH'
    const paymentStatus = data.paymentOption === 'pay_now' ? 'PENDING' : 'PENDING'

    // Get product details to calculate amount
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { price: true }
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
        amountPaid: product.price || 0,
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
            price: true
          }
        }
      }
    })

    // Create address record (you can link this to order if needed)
    // For now, we'll store it separately or you can add address fields to Order model
    
    return {
      success: true,
      data: order,
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
      data: order
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

    return {
      success: true,
      data: orders,
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

export async function activateOrder(orderId: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status === 'ACTIVE') {
      return { success: false, error: 'Order is already active' }
    }

    // 1. Update Order Status and Payment Status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ACTIVE',
        paymentStatus: 'COMPLETED',
        installationCompleted: true, // Assuming activation means installation is done
        installationDate: new Date(),
      }
    })

    // 2. Create Free Warranty (if applicable)
    // Assuming product has warrantyPeriod like "12 months" or "1 year"
    let baseWarrantyMonths = 0
    if (order.product.warrantyPeriod) {
      const match = order.product.warrantyPeriod.toLowerCase().match(/(\d+)\s*(month|year)/i)
      if (match) {
        const value = parseInt(match[1])
        const unit = match[2].toLowerCase()
        baseWarrantyMonths = unit.startsWith('year') ? value * 12 : value
      }
    }

    if (baseWarrantyMonths > 0) {
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
        }
      })
    }

    // 3. Create Additional Warranty (if purchased)
    if (order.selectedAdditionalWarranty && order.selectedAdditionalWarranty !== 'none') {
      let additionalMonths = 0
      if (order.selectedAdditionalWarranty === '1year') additionalMonths = 12
      else if (order.selectedAdditionalWarranty === '2year') additionalMonths = 24
      else if (order.selectedAdditionalWarranty === '3year') additionalMonths = 36

      if (additionalMonths > 0) {
        // Starts after base warranty ends? Or concurrently? Usually extends.
        // Let's assume it starts after base warranty.
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
          }
        })
      }
    }

    // 4. Create AMC (if purchased)
    if (order.selectedAMC && order.selectedAMC !== 'none') {
      let amcMonths = 0
      if (order.selectedAMC === '1year') amcMonths = 12
      else if (order.selectedAMC === '2year') amcMonths = 24
      else if (order.selectedAMC === '3year') amcMonths = 36
      else if (order.selectedAMC === '5year') amcMonths = 60

      if (amcMonths > 0) {
        const startDate = new Date()
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + amcMonths)

        await prisma.aMC.create({
          data: {
            productId: order.productId,
            orderId: order.id,
            startDate: startDate,
            endDate: endDate,
            durationMonths: amcMonths,
            isActive: true,
            status: 'ACTIVE',
            amountPaid: 0, // Should be calculated
          }
        })
      }
    }

    return {
      success: true,
      message: 'Order activated successfully. Warranties and AMC created.'
    }

  } catch (error) {
    console.error('Error activating order:', error)
    return { success: false, error: 'Failed to activate order' }
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
