import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(JWT_SECRET);

  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Get auth cookie
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}

// Remove auth cookie
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

// Get current user from cookie
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  return await verifyToken(token);
}

// Middleware to verify authentication from request
export async function verifyAuth(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  return await verifyToken(token);
}
