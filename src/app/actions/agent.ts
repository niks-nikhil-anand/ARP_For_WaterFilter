'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma, UserRole, UserStatus } from '@/generated/prisma'
import { hash } from 'bcryptjs'

export type AgentWithDetails = Prisma.AgentGetPayload<{
  include: {
    user: {
      include: {
        addresses: true
      }
    }
    shop: true
  }
}>

export async function getAgents() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        user: {
          include: {
            addresses: true
          }
        },
        shop: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: agents }
  } catch (error) {
    console.error('Failed to fetch agents:', error)
    return { success: false, error: 'Failed to fetch agents' }
  }
}

export async function createAgent(data: {
  name: string
  email?: string
  mobile: string
  shopId: number
  areaCover?: string
  address?: {
    locality: string
    pincode: string
    state: string
    landmark?: string
    apartmentNo?: string
    phone: string
  }
}) {
  try {
    // Validate required fields
    if (!data.name || !data.mobile) {
      return { success: false, error: 'Name and mobile number are required' }
    }

    if (!data.shopId) {
      return { success: false, error: 'Shop assignment is required' }
    }

    // Validate address if provided
    if (data.address && (!data.address.locality || !data.address.pincode || !data.address.state)) {
      return { success: false, error: 'Address requires locality, pincode, and state' }
    }

    // Verify shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: data.shopId }
    })

    if (!shop) {
      return { success: false, error: 'Selected shop not found' }
    }

    // 1. Create User
    // For now, we'll set a default password. In a real app, we might send an invite email.
    const hashedPassword = await hash('password123', 10)

    // Generate unique email if not provided
    const userEmail = data.email || `agent_${Date.now()}@temp.local`

    // Check if email already exists before starting transaction
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (existingUser) {
      return { success: false, error: 'Email already exists' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: userEmail,
          password: hashedPassword,
          mobile: data.mobile,
          role: UserRole.AGENT,
          status: UserStatus.ACTIVE,
          addresses: {
            create: data.address ? [{
              locality: data.address.locality,
              state: data.address.state,
              pincode: data.address.pincode,
              landmark: data.address.landmark,
              apartmentNo: data.address.apartmentNo,
              phone: data.address.phone,
            }] : []
          }
        }
      })

      // 2. Create Agent linked to User and Shop
      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          shopId: data.shopId,
          areaCover: data.areaCover,
        },
        include: {
          user: {
            include: {
              addresses: true
            }
          },
          shop: true
        }
      })

      return agent
    }, {
      maxWait: 10000, // 10 seconds max wait time
      timeout: 15000, // 15 seconds transaction timeout
    })

    revalidatePath('/admin/agent_details')
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to create agent:', error)

    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint') || error.message.includes('unique_email')) {
        return { success: false, error: 'User with this email already exists' }
      }
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to create agent. Please try again.' }
  }
}

export async function updateAgent(
  id: number,
  data: {
    name?: string
    mobile?: string
    shopId?: number
    status?: UserStatus
    areaCover?: string
    address?: {
      locality: string
      pincode: string
      state: string
      landmark?: string
      apartmentNo?: string
    }
  }
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const agent = await tx.agent.findUnique({
        where: { id },
        include: { user: true }
      })

      if (!agent) {
        throw new Error('Agent not found')
      }

      // Update User details
      if (data.name || data.mobile || data.status) {
        await tx.user.update({
          where: { id: agent.userId },
          data: {
            name: data.name,
            mobile: data.mobile,
            status: data.status
          }
        })
      }

      // Update Agent details (Shop link & Area Cover)
      if (data.shopId || data.areaCover !== undefined) {
        await tx.agent.update({
          where: { id },
          data: {
            shopId: data.shopId,
            areaCover: data.areaCover
          }
        })
      }

      // Update Address details
      if (data.address) {
        // Check if address exists
        const existingAddress = await tx.address.findFirst({
          where: { userId: agent.userId }
        })

        if (existingAddress) {
          await tx.address.update({
            where: { id: existingAddress.id },
            data: {
              locality: data.address.locality,
              pincode: data.address.pincode,
              state: data.address.state,
              landmark: data.address.landmark,
              apartmentNo: data.address.apartmentNo
            }
          })
        } else {
          // Create new address if not exists
          await tx.address.create({
            data: {
              userId: agent.userId,
              locality: data.address.locality,
              pincode: data.address.pincode,
              state: data.address.state,
              landmark: data.address.landmark,
              apartmentNo: data.address.apartmentNo,
              phone: data.mobile || agent.user.mobile || '' // Use updated mobile or existing
            }
          })
        }
      }

      return await tx.agent.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              addresses: true
            }
          },
          shop: true
        }
      })
    })

    revalidatePath('/admin/agent_details')
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to update agent:', error)
    return { success: false, error: 'Failed to update agent' }
  }
}

export async function deleteAgent(id: number) {
  try {
    // We might want to soft delete or just delete the Agent record and keep the User, 
    // or delete both. For now, let's delete the Agent record. 
    // If we want to delete the User too, we need to do it in a transaction.
    
    await prisma.$transaction(async (tx) => {
      const agent = await tx.agent.findUnique({ where: { id } })
      if (!agent) return

      await tx.agent.delete({ where: { id } })
      // Optional: Delete the user as well if they are only an agent
      await tx.user.delete({ where: { id: agent.userId } })
    })

    revalidatePath('/admin/agent_details')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete agent:', error)
    return { success: false, error: 'Failed to delete agent' }
  }
}
