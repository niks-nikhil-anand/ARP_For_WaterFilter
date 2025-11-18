'use server';

/**
 * Common - Product Actions
 * Public product actions (no authentication required)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all products for public view (homepage)
export async function getPublicProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products?public=true`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// GET single product by ID (public)
export async function getPublicProductById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}?public=true`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
