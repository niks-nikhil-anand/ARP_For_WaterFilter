'use server'

import prisma from '@/lib/prisma'
import { UserStatus } from '@/generated/prisma'

export async function getActiveCustomers() {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: 'USER',
        status: UserStatus.ACTIVE
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        // We might want to store address in a separate table or JSON field in the future,
        // but for now we'll just fetch the user details.
        // If there are address relations, we can include them here.
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return { success: true, data: customers }
  } catch (error) {
    console.error('Failed to fetch active customers:', error)
    return { success: false, error: 'Failed to fetch active customers' }
  }
}

export async function createCustomerUser(data: {
  name: string
  email: string
  mobile: string
  password?: string
  address?: string
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { mobile: data.mobile }
        ]
      }
    })

    if (existingUser) {
      return { success: false, error: 'User with this email or mobile already exists' }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password || '123456', // Default password if not provided
        role: 'USER',
        status: UserStatus.ACTIVE,
        // If we had an address field on User, we'd save it here.
        // For now, the address is passed to the ticket, but the user creation
        // doesn't persist it on the User model unless we have a field or relation.
        // Assuming for this task we just create the User identity.
      }
    })

    return { success: true, data: user, message: 'Customer created successfully' }
  } catch (error) {
    console.error('Failed to create customer:', error)
    return { success: false, error: 'Failed to create customer' }
  }
}
