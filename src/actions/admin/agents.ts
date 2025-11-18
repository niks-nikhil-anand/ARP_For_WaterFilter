'use server';

/**
 * Admin Panel - Agent Management Actions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all agents
export async function getAllAgents() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
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

// GET single agent
export async function getAgentById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
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

// POST - Create agent
export async function createAgent(agentData: {
  userId: number;
  shopId?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(agentData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PATCH - Update agent
export async function updateAgent(id: number, updates: Partial<{
  shopId: number;
}>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
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

// PUT - Replace agent
export async function replaceAgent(id: number, agentData: {
  shopId?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(agentData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE agent
export async function deleteAgent(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
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

// Reassign agent to different shop
export async function reassignAgent(agentId: number, newShopId: number) {
  return updateAgent(agentId, { shopId: newShopId });
}
