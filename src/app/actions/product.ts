'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@/generated/prisma'

export type Product = Prisma.ProductGetPayload<{
  include: {
    shop: true
  }
}>

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
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

export async function getProductById(id: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
      },
    })
    return { success: true, data: product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Failed to fetch product' }
  }
}

export async function createProduct(data: {
  uniqueId: string
  invoiceNo?: string
  name: string
  productName?: string
  description?: string
  company: string
  type: string
  color?: string
  price?: number
  images?: string[]
  featuredImageUrl?: string
  offer?: string
  discount?: number
  discountType?: 'PERCENTAGE' | 'FLAT_RATE'
  warrantyPeriod?: string
  status?: 'ACTIVE' | 'BLOCKED' | 'PENDING'
  shopId: number
}) {
  try {
    const product = await prisma.product.create({
      data: {
        uniqueId: data.uniqueId,
        invoiceNo: data.invoiceNo,
        name: data.name,
        productName: data.productName,
        description: data.description,
        company: data.company,
        type: data.type,
        color: data.color,
        price: data.price,
        images: data.images || [],
        featuredImageUrl: data.featuredImageUrl,
        offer: data.offer,
        discount: data.discount,
        discountType: data.discountType,
        warrantyPeriod: data.warrantyPeriod,
        status: data.status || 'PENDING',
        shop: {
          connect: { id: data.shopId },
        },
      },
      include: {
        shop: true,
      },
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
    uniqueId?: string
    invoiceNo?: string
    name?: string
    productName?: string
    description?: string
    company?: string
    type?: string
    color?: string
    price?: number
    images?: string[]
    featuredImageUrl?: string
    offer?: string
    discount?: number
    discountType?: 'PERCENTAGE' | 'FLAT_RATE'
    warrantyPeriod?: string
    status?: 'ACTIVE' | 'BLOCKED' | 'PENDING'
  }
) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        shop: true,
      },
    })

    revalidatePath('/admin/product_details')
    return { success: true, data: product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({
      where: { id },
    })

    revalidatePath('/admin/product_details')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

// Generate invoice PDF (placeholder - you'll need to implement actual PDF generation)
export async function generateInvoice(productId: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        shop: {
          include: {
            user: true,
            addresses: true,
          },
        },
      },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // TODO: Implement actual PDF generation
    // For now, return product data that can be used to generate invoice on client
    return { success: true, data: product }
  } catch (error) {
    console.error('Error generating invoice:', error)
    return { success: false, error: 'Failed to generate invoice' }
  }
}
