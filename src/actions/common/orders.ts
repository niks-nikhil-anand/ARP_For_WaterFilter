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
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        amountPaid: product.price || 0,
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
