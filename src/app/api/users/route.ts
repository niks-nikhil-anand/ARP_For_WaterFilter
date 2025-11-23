import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole, UserStatus } from '../../../generated/prisma';

// GET all users (with optional role filter)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Only ADMIN and SUPERADMIN can get all users
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    // Get role filter from query parameters
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');

    // Build query with optional role filter
    const whereClause: any = {};
    if (roleFilter) {
      // Validate role is a valid UserRole
      const validRoles = Object.values(UserRole);
      if (validRoles.includes(roleFilter as UserRole)) {
        whereClause.role = roleFilter as UserRole;
      }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        agents: {
          include: {
            shop: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(users);
  } catch (error: any) {
    console.error('Get users error:', error);
    return serverErrorResponse(error.message || 'Failed to get users');
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Only ADMIN and SUPERADMIN can create users
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to create users');
    }

    const body = await request.json();
    const { name, email, password, mobile, role, status } = body;

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
        status: status || UserStatus.ACTIVE,
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

    return successResponse(user, 'User created successfully', 201);
  } catch (error: any) {
    console.error('Create user error:', error);
    return serverErrorResponse(error.message || 'Failed to create user');
  }
}
