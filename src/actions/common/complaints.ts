'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UserRole, UserStatus } from '@/generated/prisma'
import { hashPassword } from '@/lib/password'
import { createNotification } from '../admin/notifications'

export async function createComplaint(data: {
  customerId: number
  address: string
  serviceType: string
  productType?: string
  preferredDate?: string
  preferredTime?: string
  additionalInfo?: string
}) {
  try {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.customerId }
    })

    if (!user) {
        return { success: false, error: 'Customer not found' }
    }

    // 2. Create Complaint
    const complaint = await prisma.complaint.create({
      data: {
        userId: user.id,
        serviceType: data.serviceType,
        address: data.address,
        // productType: data.productType, // Removed as it's not in schema
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        preferredTime: data.preferredTime,
        description: data.additionalInfo, // Mapped to description
      }
    })

    revalidatePath('/admin/complaints') // Assuming there will be an admin page for complaints
    
    // Notify Admins
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (admin) {
      await createNotification({
        title: `New Complaint Received`,
        message: `New complaint from ${user.name} regarding ${data.serviceType}.`,
        category: 'SERVICE',
        priority: 'HIGH',
        recipientId: admin.id,
        link: `/admin/complaints`,
        metadata: { complaintId: complaint.id }
      });
    }

    return { success: true, data: complaint, message: 'Complaint submitted successfully' }

  } catch (error) {
    console.error('Failed to create complaint:', error)
    return { success: false, error: 'Failed to submit complaint' }
  }
}

export async function getAllComplaints(filters?: {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  serviceType?: string
  startDate?: string
  endDate?: string
}) {
  try {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { user: { mobile: { contains: filters.search, mode: 'insensitive' } } },
        { serviceType: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.serviceType && filters.serviceType !== 'ALL') {
      where.serviceType = { equals: filters.serviceType, mode: 'insensitive' }
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    const orderBy: any = {}
    if (filters?.sortBy) {
      if (filters.sortBy === 'user.name') {
        orderBy.user = { name: filters.sortOrder || 'asc' }
      } else {
        orderBy[filters.sortBy] = filters.sortOrder || 'desc'
      }
    } else {
      orderBy.createdAt = 'desc'
    }

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              mobile: true
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      })
    ])

    return {
      success: true,
      data: complaints,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Failed to get complaints:', error)
    return { success: false, error: error.message }
  }
}
