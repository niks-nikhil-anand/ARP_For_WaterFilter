'use server';

/**
 * Common - Ticket Actions (Book a Service)
 * Used by all panels and public-facing forms
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// POST - Create ticket (Book a Service) - PUBLIC ENDPOINT
export async function createTicket(ticketData: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  serviceType: string;
  productType?: string;
  description?: string;
  preferredDate?: string;
  preferredTime?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  shopId?: number;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// GET all tickets (authenticated)
export async function getAllTickets(filters?: {
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  shopId?: number;
}) {
  try {
    let url = `${API_BASE_URL}/api/tickets`;
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.shopId) params.append('shopId', filters.shopId.toString());

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

// GET single ticket
export async function getTicketById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
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

// PATCH - Update ticket
export async function updateTicket(id: number, updates: Partial<{
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  agentId: number;
  shopId: number;
  internalNotes: string;
  resolutionNotes: string;
  preferredDate: string;
  preferredTime: string;
}>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
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

// PUT - Replace ticket
export async function replaceTicket(id: number, ticketData: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  serviceType: string;
  productType?: string;
  description?: string;
  preferredDate?: string;
  preferredTime?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  agentId?: number;
  shopId?: number;
  internalNotes?: string;
  resolutionNotes?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(ticketData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE ticket
export async function deleteTicket(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${id}`, {
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

// Helper: Assign agent to ticket
export async function assignAgentToTicket(ticketId: number, agentId: number) {
  return updateTicket(ticketId, { agentId });
}

// Helper: Update ticket status
export async function updateTicketStatus(
  ticketId: number,
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
) {
  return updateTicket(ticketId, { status });
}

// Helper: Add resolution notes
export async function addResolutionNotes(ticketId: number, notes: string) {
  return updateTicket(ticketId, { resolutionNotes: notes });
}

// Helper: Close ticket with resolution
export async function closeTicket(ticketId: number, resolutionNotes: string) {
  return updateTicket(ticketId, {
    status: 'RESOLVED',
    resolutionNotes,
  });
}
