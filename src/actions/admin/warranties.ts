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
            description: true,
            color: true,
            price: true,
            featuredImageUrl: true,
          }
        },
        order: {
          select: {
            customerName: true,
            customerPhone: true,
            customerEmail: true,
            customerAltPhone: true,
            apartmentNo: true,
            locality: true,
            landmark: true,
            pincode: true,
            state: true,
            country: true,
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
      warrantyAmount: w.warrantyAmount ? Number(w.warrantyAmount) : 0,
      product: {
        ...w.product,
        price: w.product.price ? Number(w.product.price) : 0
      }
    }))

    return { success: true, data: serializedWarranties }
  } catch (error: any) {
    console.error('Get all warranties error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateWarranty(warrantyId: number, data: {
  warrantyType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  warrantyAmount?: number | null;
}) {
  try {
    // Validate dates
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return { success: false, error: 'End date must be after start date' }
    }

    const warranty = await prisma.warranty.update({
      where: { id: warrantyId },
      data: {
        warrantyType: data.warrantyType,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.status === 'Active',
        warrantyAmount: data.warrantyAmount
      }
    })

    return { success: true, data: warranty }
  } catch (error: any) {
    console.error('Update warranty error:', error)
    return { success: false, error: error.message }
  }
}
