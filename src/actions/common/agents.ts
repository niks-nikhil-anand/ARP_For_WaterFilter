'use server'

import prisma from '@/lib/prisma'
import { UserStatus } from '@/generated/prisma'

export async function getActiveAgents() {
  try {
    // Fetch all users with role AGENT or ADMIN and status ACTIVE
    const agents = await prisma.user.findMany({
      where: {
        role: { in: ['AGENT', 'ADMIN'] },
        status: UserStatus.ACTIVE
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        // Include agent details if they exist
        agents: {
          include: {
            shop: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        // Include shop details if they are an admin/owner
        shops: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    // Transform the data to a more usable format
    const formattedAgents = agents.map(user => {
      let shopId = null
      let shopName = null
      let agentId = null
      const role = user.role

      if (user.role === 'ADMIN' && user.shops.length > 0) {
        shopId = user.shops[0].id
        shopName = user.shops[0].name
      } else if (user.agents.length > 0) {
        agentId = user.agents[0].id
        shopId = user.agents[0].shop?.id
        shopName = user.agents[0].shop?.name
      }

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role,
        agentId,
        shopId,
        shopName
      }
    })
    
    return { success: true, data: formattedAgents }
  } catch (error) {
    console.error('Failed to fetch active agents:', error)
    return { success: false, error: 'Failed to fetch active agents' }
  }
}
