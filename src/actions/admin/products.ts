'use server';

import { prisma } from '@/lib/prisma';

/**
 * Admin Panel - Product Actions
 * Full CRUD operations for products
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all products (admin sees all products from all shops)
// Using Prisma directly to avoid API call issues in server actions
export async function getAdminProducts(filters?: { shopId?: number }) {
  try {
    const where: any = {};
    
    if (filters?.shopId) {
      where.createdBy = {
        shops: {
          some: {
            id: filters.shopId
          }
        }
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
            shops: {
              select: {
                id: true,
                name: true,
                shopName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const serializedProducts = products.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : 0,
      discount: product.discount ? Number(product.discount) : null,
    }));

    return { success: true, data: serializedProducts };
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return { success: false, error: error.message };
  }
}

// Keep existing actions for compatibility if needed, or replace them
// For now, I'm adding getAdminProducts as a reliable alternative

export async function getAllProducts(filters?: { shopId?: number }) {
  try {
    let url = `${API_BASE_URL}/api/products`;

    if (filters?.shopId) {
      url += `?shopId=${filters.shopId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// GET single product by ID
export async function getProductById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// POST - Create new product
export async function createProduct(productData: {
  name: string;
  company: string;
  type: string;
  color?: string;
  offer?: string;
  warrantyPeriod?: number;
  shopId?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PATCH - Partial update product
export async function updateProduct(id: number, updates: Partial<{
  name: string;
  company: string;
  type: string;
  color: string;
  offer: string;
  warrantyPeriod: number;
}>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PUT - Full update product
export async function replaceProduct(id: number, productData: {
  name: string;
  company: string;
  type: string;
  color?: string;
  offer?: string;
  warrantyPeriod?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE product
export async function deleteProduct(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============ Helper Functions ============

// Get products by shop
export async function getProductsByShop(shopId: number) {
  return getAllProducts({ shopId });
}
