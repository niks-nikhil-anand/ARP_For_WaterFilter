import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const publicView = searchParams.get('public') === 'true';
    const agentId = searchParams.get('agentId');

    // Public endpoint for homepage - no authentication required
    if (publicView) {
      console.log('🔍 Fetching public products with status ACTIVE...')

      const products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE', // Only show active products to public
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // Limit public view to 50 products
      });

      console.log(`✅ Found ${products.length} active products`)
      console.log('📦 Products:', JSON.stringify(products, null, 2))

      return successResponse(products);
    }

    // For authenticated routes, check user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // For authenticated users, admins can see all products
    // Other users can only see their own created products
    let products;

    if (currentUser.role === UserRole.SUPERADMIN || currentUser.role === UserRole.ADMIN) {
      // SUPERADMIN/ADMIN can see all products
      products = await prisma.product.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Regular users see only products they created
      products = await prisma.product.findMany({
        where: {
          createdById: currentUser.id,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(products);
  } catch (error: any) {
    console.error('Get products error:', error);
    return serverErrorResponse(error.message || 'Failed to get products');
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    // Check if user has admin or superadmin role
    if (currentUser.role !== UserRole.SUPERADMIN && currentUser.role !== UserRole.ADMIN) {
      return forbiddenResponse('Only admins can create products');
    }

    const body = await request.json();
    const {
      uniqueId,
      productName,
      description,
      company,
      type,
      color,
      price,
      images,
      featuredImageUrl,
      offer,
      discount,
      discountType,
      warrantyPeriod,
      status
    } = body;

    // Validation
    if (!uniqueId || !company || !type) {
      return errorResponse('uniqueId, company, and type are required');
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        uniqueId,
        productName,
        description,
        company,
        type,
        color,
        price,
        images: images || [],
        featuredImageUrl,
        offer,
        discount,
        discountType,
        warrantyPeriod,
        status: status || 'PENDING',
        createdBy: {
          connect: { id: currentUser.id },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return successResponse(product, 'Product created successfully', 201);
  } catch (error: any) {
    console.error('Create product error:', error);
    return serverErrorResponse(error.message || 'Failed to create product');
  }
}
