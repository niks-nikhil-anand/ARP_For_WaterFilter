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

    const serializedWarranties = warranties.map(w => ({
      ...w,
      warrantyAmount: w.warrantyAmount ? Number(w.warrantyAmount) : 0
    }))

    return { success: true, data: serializedWarranties }
  } catch (error: any) {
    console.error('Get all warranties error:', error)
    return { success: false, error: error.message }
  }
}
