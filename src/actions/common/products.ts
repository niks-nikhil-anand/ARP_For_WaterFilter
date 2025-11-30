'use server';

/**
 * Common - Product Actions
 * Public product actions (no authentication required)
 */

import { prisma } from '@/lib/prisma';

// GET all products for public view (homepage)
export async function getPublicProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE', // Only show active products to public
        isVisibleWebsite: true, // Only show products marked for website visibility
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit public view to 50 products
    });

    return { success: true, data: products };
  } catch (error: any) {
    console.error('Error fetching public products:', error);
    return { success: false, error: error.message };
  }
}

// GET single product by ID (public)
export async function getPublicProductById(id: number) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
        status: 'ACTIVE',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    return { success: true, data: product };
  } catch (error: any) {
    console.error('Error fetching product by ID:', error);
    return { success: false, error: error.message };
  }
}
