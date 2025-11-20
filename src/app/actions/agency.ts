'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@/generated/prisma'

export type Agency = Prisma.ShopGetPayload<{
  include: {
    user: {
      include: {
        addresses: true
      }
    }
  }
}>

export async function getAgencies() {
  try {
    const agencies = await prisma.shop.findMany({
      include: {
        user: {
          include: {
            addresses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: agencies }
  } catch (error) {
    console.error('Failed to fetch agencies:', error)
    return { success: false, error: 'Failed to fetch agencies' }
  }
}

export async function createAgency(data: {
  name: string
  address?: string
  userId: number
}) {
  try {
    const agency = await prisma.shop.create({
      data: {
        name: data.name,
        address: data.address,
        user: {
          connect: { id: data.userId }
        }
      },
      include: {
        user: {
          include: {
            addresses: true
          }
        }
      }
    })
    revalidatePath('/admin/agency_details')
    return { success: true, data: agency }
  } catch (error) {
    console.error('Failed to create agency:', error)
    return { success: false, error: 'Failed to create agency' }
  }
}

export async function updateAgency(
  id: number,
  data: {
    name?: string
    address?: string
  }
) {
  try {
    const agency = await prisma.shop.update({
      where: { id },
      data,
      include: {
        user: {
          include: {
            addresses: true
          }
        }
      }
    })
    revalidatePath('/admin/agency_details')
    return { success: true, data: agency }
  } catch (error) {
    console.error('Failed to update agency:', error)
    return { success: false, error: 'Failed to update agency' }
  }
}

export async function deleteAgency(id: number) {
  try {
    await prisma.shop.delete({
      where: { id },
    })
    revalidatePath('/admin/agency_details')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete agency:', error)
    return { success: false, error: 'Failed to delete agency' }
  }
}
