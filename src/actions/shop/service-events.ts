'use server';

/**
 * Shop Panel - Service Event Management Actions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all service events
export async function getAllServiceEvents(filters?: {
  type?: 'WARRANTY' | 'AMC' | 'REPAIR';
  productId?: number;
  customerId?: number;
}) {
  try {
    let url = `${API_BASE_URL}/api/service-events`;
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.customerId) params.append('customerId', filters.customerId.toString());

    if (params.toString()) url += `?${params.toString()}`;

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

// GET single service event
export async function getServiceEventById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/service-events/${id}`, {
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

// POST - Create service event
export async function createServiceEvent(eventData: {
  type: 'WARRANTY' | 'AMC' | 'REPAIR';
  productId: number;
  customerId?: number;
  orderId?: number;
  startDate?: string;
  endDate?: string;
  pricePaid?: number;
  amcContractId?: number;
  remarks?: string;
  description?: string;
  parts?: string;
  feedback?: string;
  agentId?: number;
  details?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/service-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PATCH - Update service event
export async function updateServiceEvent(id: number, updates: Partial<{
  type: 'WARRANTY' | 'AMC' | 'REPAIR';
  customerId: number;
  orderId: number;
  startDate: string;
  endDate: string;
  pricePaid: number;
  amcContractId: number;
  remarks: string;
  description: string;
  parts: string;
  feedback: string;
  agentId: number;
  details: string;
}>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/service-events/${id}`, {
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

// PUT - Replace service event
export async function replaceServiceEvent(id: number, eventData: {
  type: 'WARRANTY' | 'AMC' | 'REPAIR';
  productId: number;
  customerId?: number;
  orderId?: number;
  startDate?: string;
  endDate?: string;
  pricePaid?: number;
  amcContractId?: number;
  remarks?: string;
  description?: string;
  parts?: string;
  feedback?: string;
  agentId?: number;
  details?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/service-events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE service event
export async function deleteServiceEvent(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/service-events/${id}`, {
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

// Assign agent to service event
export async function assignAgent(eventId: number, agentId: number) {
  return updateServiceEvent(eventId, { agentId });
}

// Update service event feedback
export async function updateFeedback(eventId: number, feedback: string) {
  return updateServiceEvent(eventId, { feedback });
}
