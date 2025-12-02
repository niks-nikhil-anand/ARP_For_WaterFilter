'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@/generated/prisma'
import { getCurrentUser } from '@/lib/auth'

export type Product = Prisma.ProductGetPayload<{
  include: {
    createdBy: true
  }
}>

export async function getProducts(options?: {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filterBy?: {
    status?: string
    type?: string
    company?: string
    search?: string
  }
}) {
  try {
    const { sortBy = 'createdAt', sortOrder = 'desc', filterBy } = options || {}

    const where: Prisma.ProductWhereInput = {}

    if (filterBy) {
      if (filterBy.status && filterBy.status !== 'ALL') {
        where.status = filterBy.status as 'ACTIVE' | 'BLOCKED' | 'PENDING'
      }
      if (filterBy.type && filterBy.type !== 'ALL') {
        where.type = filterBy.type
      }
      if (filterBy.company && filterBy.company !== 'ALL') {
        where.company = filterBy.company
      }
      if (filterBy.search) {
        where.OR = [
          { productName: { contains: filterBy.search, mode: 'insensitive' } },
          { uniqueId: { contains: filterBy.search, mode: 'insensitive' } },
          { company: { contains: filterBy.search, mode: 'insensitive' } },
          { type: { contains: filterBy.search, mode: 'insensitive' } },
        ]
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    // Convert Decimal fields to numbers for client components
    const serializedProducts = products.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : null,
      discount: product.discount ? Number(product.discount) : null,
    }))

    return { success: true, data: serializedProducts }
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!product) {
      return { success: true, data: null }
    }

    // Convert Decimal fields to numbers for client components
    const serializedProduct = {
      ...product,
      price: product.price ? Number(product.price) : null,
      discount: product.discount ? Number(product.discount) : null,
    }

    return { success: true, data: serializedProduct }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Failed to fetch product' }
  }
}

export async function createProduct(data: {
  uniqueId: string
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
  isVisibleWebsite?: boolean
  status?: 'ACTIVE' | 'BLOCKED' | 'PENDING'
}) {
  try {
    // Get current user
    const currentUser = await getCurrentUser()

    // Check if user is authenticated
    if (!currentUser) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    // Check if user has admin or superadmin role
    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Forbidden. Only admins can add products.' }
    }

    const product = await prisma.product.create({
      data: {
        uniqueId: data.uniqueId,
        productName: data.productName,
        description: data.description,
        company: data.company,
        type: data.type,
        color: data.color,
        price: data.price ?? 0,
        images: data.images || [],
        featuredImageUrl: data.featuredImageUrl,
        offer: data.offer,
        discount: data.discount,
        discountType: data.discountType,
        warrantyPeriod: data.warrantyPeriod,
        isVisibleWebsite: data.isVisibleWebsite ?? false,
        status: data.status || 'PENDING',
        createdBy: {
          connect: { id: currentUser.id },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Convert Decimal fields to numbers for client components
    const serializedProduct = {
      ...product,
      price: product.price ? Number(product.price) : null,
      discount: product.discount ? Number(product.discount) : null,
    }

    revalidatePath('/admin/product_details')
    return { success: true, data: serializedProduct }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(
  id: number,
  data: {
    uniqueId?: string
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
    isVisibleWebsite?: boolean
    status?: 'ACTIVE' | 'BLOCKED' | 'PENDING'
  }
) {
  try {
    // Get current user
    const currentUser = await getCurrentUser()

    // Check if user is authenticated
    if (!currentUser) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    // Check if user has admin or superadmin role
    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Forbidden. Only admins can update products.' }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Convert Decimal fields to numbers for client components
    const serializedProduct = {
      ...product,
      price: product.price ? Number(product.price) : null,
      discount: product.discount ? Number(product.discount) : null,
    }

    revalidatePath('/admin/product_details')
    return { success: true, data: serializedProduct }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: number) {
  try {
    // Get current user
    const currentUser = await getCurrentUser()

    // Check if user is authenticated
    if (!currentUser) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    // Check if user has admin or superadmin role
    if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Forbidden. Only admins can delete products.' }
    }

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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Convert Decimal fields to numbers for client components
    const serializedProduct = {
      ...product,
      price: product.price ? Number(product.price) : null,
      discount: product.discount ? Number(product.discount) : null,
    }

    // TODO: Implement actual PDF generation
    // For now, return product data that can be used to generate invoice on client
    return { success: true, data: serializedProduct }
  } catch (error) {
    console.error('Error generating invoice:', error)
    return { success: false, error: 'Failed to generate invoice' }
  }
}
