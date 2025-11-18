'use server';

/**
 * Agent Panel - Task/Service Event Management Actions
 * Agents view and manage their assigned service tasks
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all assigned tasks (service events)
export async function getMyTasks(filters?: {
  type?: 'WARRANTY' | 'AMC' | 'REPAIR';
}) {
  try {
    let url = `${API_BASE_URL}/api/service-events`;
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);

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

// GET single task details
export async function getTaskById(id: number) {
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

// PATCH - Update task (add remarks, parts used, etc.)
export async function updateTask(id: number, updates: Partial<{
  remarks: string;
  description: string;
  parts: string;
  feedback: string;
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

// Add remarks to a task
export async function addRemarks(taskId: number, remarks: string) {
  return updateTask(taskId, { remarks });
}

// Add parts used in service
export async function addPartsUsed(taskId: number, parts: string) {
  return updateTask(taskId, { parts });
}

// Add service description
export async function addDescription(taskId: number, description: string) {
  return updateTask(taskId, { description });
}

// Update task details (JSON field for additional info)
export async function updateTaskDetails(taskId: number, details: string) {
  return updateTask(taskId, { details });
}

// Complete task with feedback
export async function completeTask(taskId: number, feedback: string, parts?: string) {
  const updates: any = { feedback };
  if (parts) updates.parts = parts;

  return updateTask(taskId, updates);
}
