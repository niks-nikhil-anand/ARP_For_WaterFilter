import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';

// GET single address by ID
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
    const addressId = parseInt(id);

    if (isNaN(addressId)) {
      return errorResponse('Invalid address ID');
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return notFoundResponse('Address not found');
    }

    // Users can only access their own addresses
    if (address.userId !== currentUser.id) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return successResponse(address);
  } catch (error: any) {
    console.error('Get address error:', error);
    return serverErrorResponse(error.message || 'Failed to get address');
  }
}

// PATCH - Partial update address
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
    const addressId = parseInt(id);

    if (isNaN(addressId)) {
      return errorResponse('Invalid address ID');
    }

    const body = await request.json();

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      return notFoundResponse('Address not found');
    }

    if (existingAddress.userId !== currentUser.id) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: body,
    });

    return successResponse(updatedAddress, 'Address updated successfully');
  } catch (error: any) {
    console.error('Update address error:', error);
    return serverErrorResponse(error.message || 'Failed to update address');
  }
}

// PUT - Full update address
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
    const addressId = parseInt(id);

    if (isNaN(addressId)) {
      return errorResponse('Invalid address ID');
    }

    const body = await request.json();
    const { type, pincode, landmark, apartmentNo, state, country, locality, phone, altPhone } = body;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      return notFoundResponse('Address not found');
    }

    if (existingAddress.userId !== currentUser.id) {
      return forbiddenResponse('You do not have permission to update this resource');
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        type,
        pincode,
        landmark,
        apartmentNo,
        state,
        country,
        locality,
        phone,
        altPhone,
      },
    });

    return successResponse(updatedAddress, 'Address updated successfully');
  } catch (error: any) {
    console.error('Update address error:', error);
    return serverErrorResponse(error.message || 'Failed to update address');
  }
}

// DELETE address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { id } = await params;
    const addressId = parseInt(id);

    if (isNaN(addressId)) {
      return errorResponse('Invalid address ID');
    }

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress) {
      return notFoundResponse('Address not found');
    }

    if (existingAddress.userId !== currentUser.id) {
      return forbiddenResponse('You do not have permission to delete this resource');
    }

    // Delete address
    await prisma.address.delete({
      where: { id: addressId },
    });

    return successResponse(null, 'Address deleted successfully');
  } catch (error: any) {
    console.error('Delete address error:', error);
    return serverErrorResponse(error.message || 'Failed to delete address');
  }
}
