'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@/generated/prisma'

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    productDetail: true
    shop: true
  }
}>

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        productDetail: true,
        shop: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: products }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function createProduct(data: {
  name: string
  company: string
  type: string
  color?: string
  offer?: string
  warrantyPeriod?: string
  price: number
  discountedPrice?: number
  discountPercent?: number
  shopId: number // We'll pass this from the UI or default it
}) {
  try {
    // Generate a unique code for the product detail
    const uniqueCode = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: data.name,
          company: data.company,
          type: data.type,
          color: data.color,
          offer: data.offer,
          warrantyPeriod: data.warrantyPeriod,
          shop: {
            connect: { id: data.shopId },
          },
        },
      })

      await tx.productDetail.create({
        data: {
          productId: newProduct.id,
          uniqueCode: uniqueCode,
          basePrice: data.price,
          discountedPrice: data.discountedPrice,
          discountValue: data.discountedPrice ? data.price - data.discountedPrice : 0,
          discountType: 'FLAT_RATE', // Defaulting to flat rate for now
        },
      })

      return newProduct
    })

    revalidatePath('/admin/product_details')
    return { success: true, data: product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(
  id: number,
  data: {
    name?: string
    company?: string
    type?: string
    color?: string
    offer?: string
    warrantyPeriod?: string
    price?: number
    discountedPrice?: number
  }
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update Product basic info
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          company: data.company,
          type: data.type,
          color: data.color,
          offer: data.offer,
          warrantyPeriod: data.warrantyPeriod,
        },
      })

      // Update ProductDetail pricing info
      if (data.price !== undefined || data.discountedPrice !== undefined) {
        const currentDetail = await tx.productDetail.findUnique({
          where: { productId: id },
        })

        if (currentDetail) {
          const newPrice = data.price ?? currentDetail.basePrice
          const newDiscountedPrice = data.discountedPrice ?? currentDetail.discountedPrice
          
          await tx.productDetail.update({
            where: { productId: id },
            data: {
              basePrice: newPrice,
              discountedPrice: newDiscountedPrice,
              discountValue: newDiscountedPrice ? newPrice - newDiscountedPrice : 0,
            },
          })
        }
      }
    })

    revalidatePath('/admin/product_details')
    return { success: true }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: number) {
  try {
    // Delete ProductDetail first (if not cascading) or just delete Product if cascading
    // Assuming we need to be explicit or rely on cascade. 
    // Prisma usually handles cascade if defined in schema, but let's check schema.
    // Schema doesn't explicitly show onDelete: Cascade for ProductDetail relation, 
    // but it's a 1:1 where ProductDetail holds the FK. 
    // We should delete ProductDetail first or use transaction.
    
    await prisma.$transaction(async (tx) => {
      await tx.productDetail.delete({
        where: { productId: id },
      })
      await tx.product.delete({
        where: { id },
      })
    })

    revalidatePath('/admin/product_details')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}
