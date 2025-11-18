'use server';

/**
 * Agent Panel - Product Actions
 * Agents can view products from their assigned shop
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all products for agent's shop
export async function getMyShopProducts() {
  try {
    // API will automatically filter by agent's shop based on current user
    const response = await fetch(`${API_BASE_URL}/api/products`, {
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

// GET products by agent ID (for admins viewing agent's products)
export async function getProductsByAgentId(agentId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products?agentId=${agentId}`, {
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

// Note: Agents typically don't create/update/delete products
// These operations are handled by shop owners and admins
// If needed, add them here with appropriate permissions
