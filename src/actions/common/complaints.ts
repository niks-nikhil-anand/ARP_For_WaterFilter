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
        productType: data.productType,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        preferredTime: data.preferredTime,
        additionalInfo: data.additionalInfo,
      }
    })

    revalidatePath('/admin/complaints') // Assuming there will be an admin page for complaints
    return { success: true, data: complaint, message: 'Complaint submitted successfully' }

  } catch (error) {
    console.error('Failed to create complaint:', error)
    return { success: false, error: 'Failed to submit complaint' }
  }
}
