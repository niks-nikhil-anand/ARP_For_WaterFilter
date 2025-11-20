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
  email: string
  mobile: string
  shopId: number
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
}) {
  try {
    // 1. Create User
    // For now, we'll set a default password. In a real app, we might send an invite email.
    const hashedPassword = await hash('password123', 10)
    
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          mobile: data.mobile,
          role: UserRole.AGENT,
          status: UserStatus.ACTIVE,
          addresses: {
            create: data.address ? [{
              locality: data.address.street,
              state: data.address.state,
              pincode: data.address.zip,
              // Mapping city to locality or just storing it loosely for now as schema has specific fields
              // Schema: type, pincode, landmark, apartmentNo, state, country, locality, phone, altPhone
            }] : []
          }
        }
      })

      // 2. Create Agent linked to User and Shop
      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          shopId: data.shopId
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
    })

    revalidatePath('/admin/agent_details')
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to create agent:', error)
    return { success: false, error: 'Failed to create agent' }
  }
}

export async function updateAgent(
  id: number,
  data: {
    name?: string
    mobile?: string
    shopId?: number
    status?: UserStatus
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

      // Update Agent details (Shop link)
      if (data.shopId) {
        await tx.agent.update({
          where: { id },
          data: {
            shopId: data.shopId
          }
        })
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
