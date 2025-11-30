'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UserRole, UserStatus } from '@/generated/prisma'
import { hashPassword } from '@/lib/password'

export async function createComplaint(data: {
  name: string
  email: string
  phone: string
  address: string
  serviceType: string
  productType?: string
  preferredDate?: string
  preferredTime?: string
  additionalInfo?: string
}) {
  try {
    // 1. Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    // 2. If user doesn't exist, create new user
    if (!user) {
      const hashedPassword = await hashPassword('Welcome@123') // Default password
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          mobile: data.phone,
          password: hashedPassword,
          role: UserRole.USER,
          status: UserStatus.PENDING,
        }
      })
    }

    // 3. Create Complaint
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
  date?: string
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

    if (filters?.date && filters.date !== 'ALL') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (filters.date === 'TODAY') {
        where.createdAt = { gte: today, lt: tomorrow }
      } else if (filters.date === 'YESTERDAY') {
        where.createdAt = { gte: yesterday, lt: today }
      } else if (filters.date === 'UPCOMING') {
        // Complaints don't usually have "upcoming" creation date, but maybe based on preferredDate?
        // Let's stick to createdAt for now or use preferredDate if requested.
        // User asked for "startdate end date" in previous task, but that was for AMC.
        // For complaints, "UPCOMING" might mean preferredDate >= tomorrow.
        if (where.preferredDate) {
             where.preferredDate = { gte: tomorrow }
        }
      } else if (filters.date === 'BACKLOG') {
         // Backlog logic? Maybe older than yesterday?
         where.createdAt = { lt: yesterday }
      }
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
        orderBy: { createdAt: 'desc' },
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
