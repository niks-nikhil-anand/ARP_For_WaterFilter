'use server'

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getCurrentAgentData() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'AGENT') {
      return { success: false, error: 'Not authorized as agent' }
    }

    // Get user with agent details
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        agents: {
          include: {
            shop: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        shop: user.agents[0]?.shop || null
      }
    }
  } catch (error: any) {
    console.error('Get current agent error:', error)
    return { success: false, error: error.message }
  }
}
