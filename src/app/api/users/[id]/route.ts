import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return errorResponse('Invalid user ID');
    }

    // Users can get their own data, ADMIN/SUPERADMIN can get any user
    if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        shops: true,
        agents: true,
      },
    });

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(user);
  } catch (error: any) {
    console.error('Get user error:', error);
    return serverErrorResponse(error.message || 'Failed to get user');
  }
}

// PATCH - Partial update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return errorResponse('Invalid user ID');
    }

    // Users can update their own data, ADMIN/SUPERADMIN can update any user
    if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const body = await request.json();
    const { name, email, password, mobile, role, status } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return notFoundResponse('User not found');
    }

    // If email is being changed, check if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return errorResponse('Email is already taken', 409);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (password) updateData.password = await hashPassword(password);

    // Only ADMIN/SUPERADMIN can update role and status
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPERADMIN) {
      if (role !== undefined) updateData.role = role;
      if (status !== undefined) updateData.status = status;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return successResponse(updatedUser, 'User updated successfully');
  } catch (error: any) {
    console.error('Update user error:', error);
    return serverErrorResponse(error.message || 'Failed to update user');
  }
}

// PUT - Full update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return errorResponse('Invalid user ID');
    }

    // Users can update their own data, ADMIN/SUPERADMIN can update any user
    if (currentUser.id !== userId && currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    const body = await request.json();
    const { name, email, password, mobile, role, status } = body;

    // Validation
    if (!name || !email) {
      return errorResponse('Name and email are required');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return notFoundResponse('User not found');
    }

    // If email is being changed, check if it's already taken
    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return errorResponse('Email is already taken', 409);
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      mobile,
    };

    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Only ADMIN/SUPERADMIN can update role and status
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPERADMIN) {
      if (role) updateData.role = role;
      if (status) updateData.status = status;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return successResponse(updatedUser, 'User updated successfully');
  } catch (error: any) {
    console.error('Update user error:', error);
    return serverErrorResponse(error.message || 'Failed to update user');
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Only ADMIN and SUPERADMIN can delete users
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPERADMIN) {
      return forbiddenResponse('You do not have permission to delete users');
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return errorResponse('Invalid user ID');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return notFoundResponse('User not found');
    }

    // Prevent deleting yourself
    if (currentUser.id === userId) {
      return errorResponse('You cannot delete your own account');
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return successResponse(null, 'User deleted successfully');
  } catch (error: any) {
    console.error('Delete user error:', error);
    return serverErrorResponse(error.message || 'Failed to delete user');
  }
}
