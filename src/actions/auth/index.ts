'use server';

/**
 * Authentication Actions
 * Used by all panels for login, signup, logout
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Signup
export async function signup(userData: {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role?: 'USER' | 'AGENT' | 'ADMIN' | 'SUPERADMIN';
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Login
export async function login(credentials: {
  email: string;
  password: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, data: data.data, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Logout
export async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, message: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
