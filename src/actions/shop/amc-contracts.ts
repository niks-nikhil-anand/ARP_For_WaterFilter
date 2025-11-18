'use server';

/**
 * Shop Panel - AMC Contract Management Actions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all AMC contracts
export async function getAllAMCContracts(shopId?: number) {
  try {
    const url = shopId
      ? `${API_BASE_URL}/api/amc-contracts?shopId=${shopId}`
      : `${API_BASE_URL}/api/amc-contracts`;

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

// GET single AMC contract
export async function getAMCContractById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amc-contracts/${id}`, {
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

// POST - Create AMC contract
export async function createAMCContract(contractData: {
  name: string;
  duration: string;
  price: number;
  shopId?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amc-contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(contractData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PATCH - Update AMC contract
export async function updateAMCContract(id: number, updates: Partial<{
  name: string;
  duration: string;
  price: number;
}>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amc-contracts/${id}`, {
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

// PUT - Replace AMC contract
export async function replaceAMCContract(id: number, contractData: {
  name: string;
  duration: string;
  price: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amc-contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(contractData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE AMC contract
export async function deleteAMCContract(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/amc-contracts/${id}`, {
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
