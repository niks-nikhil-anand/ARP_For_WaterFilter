import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse, forbiddenResponse } from '@/lib/api-response';
import { UserRole } from '@/generated/prisma';

// GET all product details
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let productDetails;

    if (productId) {
      // Get product detail for specific product
      const productIdNum = parseInt(productId);
      productDetails = await prisma.productDetail.findUnique({
        where: {
          productId: productIdNum,
        },
        include: {
          product: {
            include: {
              shop: {
                select: {
                  id: true,
                  name: true,
                  userId: true,
                },
              },
            },
          },
          amcContract: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
      });

      if (productDetails) {
        // Check permission
        if (
          productDetails.product.shop.userId !== currentUser.id &&
          currentUser.role !== UserRole.SUPERADMIN
        ) {
          return forbiddenResponse('You do not have permission to access this resource');
        }
        return successResponse(productDetails);
      } else {
        return successResponse(null);
      }
    } else if (currentUser.role === UserRole.SUPERADMIN) {
      // SUPERADMIN can see all product details
      productDetails = await prisma.productDetail.findMany({
        include: {
          product: {
            include: {
              shop: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          amcContract: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Get product details for user's shop
      const userShop = await prisma.shop.findUnique({
        where: { userId: currentUser.id },
      });

      if (!userShop) {
        return forbiddenResponse('You do not have a shop');
      }

      productDetails = await prisma.productDetail.findMany({
        where: {
          product: {
            shopId: userShop.id,
          },
        },
        include: {
          product: {
            include: {
              shop: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          amcContract: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(productDetails);
  } catch (error: any) {
    console.error('Get product details error:', error);
    return serverErrorResponse(error.message || 'Failed to get product details');
  }
}

// POST - Create new product detail
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorizedResponse('Not authenticated');
    }

    const body = await request.json();
    const {
      productId,
      uniqueCode,
      basePrice,
      discountedPrice,
      discountValue,
      discountType,
      amcContractId,
    } = body;

    // Validation
    if (!productId || !uniqueCode || !basePrice) {
      return errorResponse('Product ID, unique code, and base price are required');
    }

    // Check if product exists and user has permission
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (
      product.shop.userId !== currentUser.id &&
      currentUser.role !== UserRole.SUPERADMIN
    ) {
      return forbiddenResponse('You do not have permission to create product details for this product');
    }

    // Check if product detail already exists for this product
    const existingDetail = await prisma.productDetail.findUnique({
      where: { productId },
    });

    if (existingDetail) {
      return errorResponse('Product detail already exists for this product', 409);
    }

    // Check if unique code is already taken
    const uniqueCodeTaken = await prisma.productDetail.findUnique({
      where: { uniqueCode },
    });

    if (uniqueCodeTaken) {
      return errorResponse('Unique code is already taken', 409);
    }

    // Create product detail
    const productDetail = await prisma.productDetail.create({
      data: {
        productId,
        uniqueCode,
        basePrice,
        discountedPrice,
        discountValue,
        discountType,
        amcContractId,
      },
      include: {
        product: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        amcContract: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    return successResponse(productDetail, 'Product detail created successfully', 201);
  } catch (error: any) {
    console.error('Create product detail error:', error);
    return serverErrorResponse(error.message || 'Failed to create product detail');
  }
}
