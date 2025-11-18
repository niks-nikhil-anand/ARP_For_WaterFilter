'use server';

/**
 * Admin Panel - User Management Actions
 * All actions for managing users in the admin panel
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// GET all users
export async function getAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch users');
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// GET single user by ID
export async function getUserById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch user');
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// POST - Create new user
export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role?: string;
  status?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to create user');
    }

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PATCH - Partial update user
export async function updateUser(id: number, updates: Partial<{
  name: string;
  email: string;
  password: string;
  mobile: string;
  role: string;
  status: string;
}>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to update user');
    }

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PUT - Full update user
export async function replaceUser(id: number, userData: {
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role?: string;
  status?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to replace user');
    }

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// DELETE user
export async function deleteUser(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete user');
    }

    return { success: true, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Block/Unblock user (updates status)
export async function toggleUserStatus(id: number, status: 'ACTIVE' | 'BLOCKED' | 'PENDING') {
  return updateUser(id, { status });
}

// Change user role
export async function changeUserRole(id: number, role: 'USER' | 'AGENT' | 'ADMIN' | 'SUPERADMIN') {
  return updateUser(id, { role });
}
