'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { generateToken, verifyToken } from '@/lib/auth';
import { UserRole, UserStatus } from '@/generated/prisma';

/**
 * Authentication Server Actions
 * All auth operations use Server Actions with direct cookie management
 */

/* ==================== SIGNUP ==================== */
export async function signup(userData: {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role?: UserRole;
}) {
  try {
    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      return {
        success: false,
        error: 'Name, email, and password are required'
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists'
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Determine role - default to USER if not provided
    const userRole = userData.role || UserRole.USER;

    // Create user and Shop in a transaction if role is ADMIN or SUPERADMIN
    const result = await prisma.$transaction(async (tx) => {
      // Create user with PENDING status (requires admin approval)
      const user = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          mobile: userData.mobile,
          role: userRole,
          status: UserStatus.PENDING,
        },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // If role is ADMIN or SUPERADMIN, create a Shop record
      if (userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN) {
        await tx.shop.create({
          data: {
            name: userData.name, // Use user's name as default shop name
            userId: user.id,
          },
        });
      }

      return user;
    });

    // Don't auto-login - user should login manually after signup
    return {
      success: true,
      data: { user: result },
      message: 'Account created successfully. Please login to continue.'
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create account'
    };
  }
}

/* ==================== LOGIN ==================== */
export async function login(credentials: {
  email: string;
  password: string;
}) {
  try {
    // Validate input
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Check account status
    if (user.status === UserStatus.BLOCKED) {
      return {
        success: false,
        error: 'Your account has been blocked. Please contact support.'
      };
    }

    if (user.status === UserStatus.PENDING) {
      return {
        success: false,
        error: 'Your account is pending approval. Please wait for admin approval before logging in.'
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Set cookie using server-side cookies API
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'Login successful'
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Failed to login'
    };
  }
}

/* ==================== LOGOUT ==================== */
export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message || 'Failed to logout'
    };
  }
}

/* ==================== GET CURRENT USER ==================== */
export async function getCurrentUser() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    // Verify and decode token
    const decoded = await verifyToken(token);

    if (!decoded) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Check if user is blocked
    if (user.status === UserStatus.BLOCKED) {
      // Clear cookie if user is blocked
      cookieStore.delete('auth-token');
      return {
        success: false,
        error: 'Your account has been blocked'
      };
    }

    return {
      success: true,
      data: user
    };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user'
    };
  }
}
