import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { generateToken } from '@/lib/auth';
import { errorResponse, serverErrorResponse } from '@/lib/api-response';
import { UserRole, UserStatus } from '@/generated/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, mobile, role } = body;

    // Validation
    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobile,
        role: role || UserRole.USER,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with user data and token
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user,
          token,
        },
        message: 'User registered successfully',
      },
      { status: 201 }
    );

    // Set cookie using NextResponse API
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return serverErrorResponse(error.message || 'Failed to create user');
  }
}
