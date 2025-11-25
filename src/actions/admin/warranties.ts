'use server'

import { prisma } from '@/lib/prisma'

export async function getAllWarranties() {
  try {
    const warranties = await prisma.warranty.findMany({
      include: {
        product: {
          select: {
            productName: true,
            company: true,
            type: true,
          }
        },
        order: {
          select: {
            customerName: true,
            customerPhone: true,
            customerEmail: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, data: warranties }
  } catch (error: any) {
    console.error('Get all warranties error:', error)
    return { success: false, error: error.message }
  }
}
