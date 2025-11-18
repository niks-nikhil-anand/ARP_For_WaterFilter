import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

// GET all addresses
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Get addresses for the current user only
    const addresses = await prisma.address.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(addresses);
  } catch (error: any) {
    console.error('Get addresses error:', error);
    return serverErrorResponse(error.message || 'Failed to get addresses');
  }
}

// POST - Create new address
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const { type, pincode, landmark, apartmentNo, state, country, locality, phone, altPhone } = body;

    // Create address
    const address = await prisma.address.create({
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
        userId: currentUser.id,
      },
    });

    return successResponse(address, 'Address created successfully', 201);
  } catch (error: any) {
    console.error('Create address error:', error);
    return serverErrorResponse(error.message || 'Failed to create address');
  }
}
