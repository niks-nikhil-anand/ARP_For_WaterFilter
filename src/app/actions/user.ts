'use server'

import prisma from '@/lib/prisma'
import { UserRole, UserStatus, Prisma } from '@/generated/prisma'
import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/password'

export type User = Prisma.UserGetPayload<{}>

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: users }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

export async function createUser(data: {
  name: string
  email?: string
  mobile: string
  role: UserRole
  status: UserStatus
  password?: string
  address?: {
    type?: string
    pincode: string
    landmark?: string
    apartmentNo?: string
    state?: string
    country?: string
    locality: string
    phone: string
    altPhone?: string
  }
}) {
  try {
    // Generate a unique email if not provided
    const email = data.email || `customer_${Date.now()}@temp.com`

    // Hash the password before storing
    const hashedPassword = data.password
      ? await hashPassword(data.password)
      : await hashPassword('defaultPassword123') // Default password if not provided

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: email,
        mobile: data.mobile,
        role: data.role,
        status: data.status,
        password: hashedPassword,
        ...(data.address && {
          addresses: {
            create: {
              type: data.address.type,
              pincode: data.address.pincode,
              landmark: data.address.landmark,
              apartmentNo: data.address.apartmentNo,
              state: data.address.state,
              country: data.address.country,
              locality: data.address.locality,
              phone: data.address.phone,
              altPhone: data.address.altPhone,
            },
          },
        }),
      },
    })
    revalidatePath('/admin/user_details')
    revalidatePath('/admin/customer_details')
    return { success: true, data: user }
  } catch (error: any) {
    console.error('Failed to create user:', error)
    return { success: false, error: error.message || 'Failed to create user' }
  }
}

export async function updateUser(
  id: number,
  data: {
    name?: string
    email?: string
    mobile?: string
    role?: UserRole
    status?: UserStatus
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    })
    revalidatePath('/admin/user_details')
    return { success: true, data: user }
  } catch (error) {
    console.error('Failed to update user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deleteUser(id: number) {
  try {
    await prisma.user.delete({
      where: { id },
    })
    revalidatePath('/admin/user_details')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}
