'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@/generated/prisma'

export type Shop = Prisma.ShopGetPayload<{
  include: {
    user: {
      include: {
        addresses: true
      }
    }
  }
}>

export async function getShops() {
  try {
    const shops = await prisma.shop.findMany({
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
    return { success: true, data: shops }
  } catch (error) {
    console.error('Failed to fetch shops:', error)
    return { success: false, error: 'Failed to fetch shops' }
  }
}

export async function createShop(data: {
  name: string
  address?: string
  userId: number
}) {
  try {
    const shop = await prisma.shop.create({
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
    revalidatePath('/admin/shop_details')
    return { success: true, data: shop }
  } catch (error) {
    console.error('Failed to create shop:', error)
    return { success: false, error: 'Failed to create shop' }
  }
}

export async function updateShop(
  id: number,
  data: {
    name?: string
    address?: string
  }
) {
  try {
    const shop = await prisma.shop.update({
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
    revalidatePath('/admin/shop_details')
    return { success: true, data: shop }
  } catch (error) {
    console.error('Failed to update shop:', error)
    return { success: false, error: 'Failed to update shop' }
  }
}

export async function deleteShop(id: number) {
  try {
    await prisma.shop.delete({
      where: { id },
    })
    revalidatePath('/admin/shop_details')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete shop:', error)
    return { success: false, error: 'Failed to delete shop' }
  }
}
