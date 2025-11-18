'use server';

/**
 * Admin Panel - Shop Management Actions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all shops
export async function getAllShops() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shops`, {
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

// GET single shop
export async function getShopById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shops/${id}`, {
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

// POST - Create shop
export async function createShop(shopData: {
  name: string;
  address?: string;
  userId?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(shopData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PATCH - Update shop
export async function updateShop(id: number, updates: Partial<{
  name: string;
  address: string;
}>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shops/${id}`, {
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

// PUT - Replace shop
export async function replaceShop(id: number, shopData: {
  name: string;
  address?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(shopData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE shop
export async function deleteShop(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shops/${id}`, {
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
