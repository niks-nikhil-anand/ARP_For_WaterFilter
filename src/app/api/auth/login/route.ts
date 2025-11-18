import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check if user is blocked
    if (user.status === 'BLOCKED') {
      return errorResponse('Your account has been blocked. Please contact support.', 403);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return errorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(
      {
        user: userWithoutPassword,
        token,
      },
      'Login successful'
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return serverErrorResponse(error.message || 'Failed to login');
  }
}
