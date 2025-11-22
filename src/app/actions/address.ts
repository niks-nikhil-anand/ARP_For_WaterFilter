'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createAddress(data: {
  type?: string
  pincode?: string
  landmark?: string
  apartmentNo?: string
  state?: string
  country?: string
  locality?: string
  phone?: string
  altPhone?: string
  userId: number
  shopId?: number
}) {
  try {
    const address = await prisma.address.create({
      data: {
        type: data.type,
        pincode: data.pincode,
        landmark: data.landmark,
        apartmentNo: data.apartmentNo,
        state: data.state,
        country: data.country,
        locality: data.locality,
        phone: data.phone,
        altPhone: data.altPhone,
        user: {
          connect: { id: data.userId }
        },
        ...(data.shopId && {
          shop: {
            connect: { id: data.shopId }
          }
        })
      }
    })
    revalidatePath('/admin/shop_details')
    return { success: true, data: address }
  } catch (error) {
    console.error('Failed to create address:', error)
    return { success: false, error: 'Failed to create address' }
  }
}

export async function updateAddress(
  id: number,
  data: {
    type?: string
    pincode?: string
    landmark?: string
    apartmentNo?: string
    state?: string
    country?: string
    locality?: string
    phone?: string
    altPhone?: string
  }
) {
  try {
    const address = await prisma.address.update({
      where: { id },
      data
    })
    revalidatePath('/admin/shop_details')
    return { success: true, data: address }
  } catch (error) {
    console.error('Failed to update address:', error)
    return { success: false, error: 'Failed to update address' }
  }
}

export async function deleteAddress(id: number) {
  try {
    await prisma.address.delete({
      where: { id }
    })
    revalidatePath('/admin/shop_details')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete address:', error)
    return { success: false, error: 'Failed to delete address' }
  }
}
