'use server'

import prisma from '@/lib/prisma'
import { UserRole, UserStatus, Prisma } from '@/generated/prisma'
import { revalidatePath } from 'next/cache'
import { hashPassword } from '@/lib/password'

export type User = Prisma.UserGetPayload<{
  include: {
    addresses: true
  }
}>

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        addresses: true,
      },
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
      include: {
        addresses: true,
      },
    })
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
      include: {
        addresses: true,
      },
    })
    revalidatePath('/admin/customer_details')
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
    revalidatePath('/admin/customer_details')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

export async function getUserDetails(id: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        tickets: {
          include: {
            assignedToAgent: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        warranties: {
          include: {
            product: true,
            order: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        ordersCreated: {
          include: {
            product: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        serviceEvents: {
          include: {
            product: true,
            assignedTo: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        complaints: {
          orderBy: { createdAt: 'desc' },
        },
        amcs: {
          include: {
            product: true,
            contracts: {
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Helper to serialize Decimal to number
    const serializeDecimal = (obj: any): any => {
      if (obj === null || obj === undefined) return obj
      
      // Handle Date objects
      if (obj instanceof Date) return obj

      if (typeof obj === 'object') {
        // Check for Decimal-like object (has toNumber method)
        if (typeof obj.toNumber === 'function') {
          return obj.toNumber()
        }
        
        if (Array.isArray(obj)) {
          return obj.map(serializeDecimal)
        }
        
        const newObj: any = {}
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = serializeDecimal(obj[key])
          }
        }
        return newObj
      }
      return obj
    }

    const serializedUser = serializeDecimal(user)

    return { success: true, data: serializedUser }
  } catch (error: any) {
    console.error('Failed to fetch user details:', error)
    return { success: false, error: `Failed to fetch user details: ${error.message}` }
  }
}
