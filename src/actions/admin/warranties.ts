'use server'

import { prisma } from '@/lib/prisma'

export async function getAllWarranties() {
  try {
    const warranties = await prisma.warranty.findMany({
      include: {
        product: {
          select: {
            productName: true,
            company: true,
            type: true,
            description: true,
            color: true,
            price: true,
            featuredImageUrl: true,
          }
        },
        order: {
          select: {
            customerName: true,
            customerPhone: true,
            customerEmail: true,
            customerAltPhone: true,
            apartmentNo: true,
            locality: true,
            landmark: true,
            pincode: true,
            state: true,
            country: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const serializedWarranties = warranties.map(w => ({
      ...w,
      warrantyAmount: w.warrantyAmount ? Number(w.warrantyAmount) : 0,
      product: {
        ...w.product,
        price: w.product.price ? Number(w.product.price) : 0
      }
    }))

    return { success: true, data: serializedWarranties }
  } catch (error: any) {
    console.error('Get all warranties error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateWarranty(warrantyId: number, data: {
  warrantyType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  warrantyAmount?: number | null;
}) {
  try {
    // Validate dates
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return { success: false, error: 'End date must be after start date' }
    }

    const warranty = await prisma.warranty.update({
      where: { id: warrantyId },
      data: {
        warrantyType: data.warrantyType,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.status === 'Active',
        warrantyAmount: data.warrantyAmount
      }
    })

    return { success: true, data: warranty }
  } catch (error: any) {
    console.error('Update warranty error:', error)
    return { success: false, error: error.message }
  }
}

export async function createWarranty(data: {
  customerId: number;
  productId: number;
  warrantyType: string;
  startDate: Date;
  endDate: Date;
  status: string;
  warrantyAmount?: number | null;
}) {
  try {
    // 1. Fetch User details
    const user = await prisma.user.findUnique({
      where: { id: data.customerId },
      include: { addresses: true } // Get address if available
    });

    if (!user) {
      return { success: false, error: 'Customer not found' };
    }

    // 2. Fetch Product details
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // 3. Create a System Order
    // We need an order to link the warranty to.
    // We'll use the user's primary address if available, or defaults.
    const primaryAddress = user.addresses?.[0];

    const order = await prisma.order.create({
      data: {
        productId: data.productId,
        createdById: user.id, // Or admin ID if we had it, but user makes sense as "owner"
        customerName: user.name,
        customerPhone: user.mobile || '0000000000',
        customerEmail: user.email,
        // Address fields
        apartmentNo: primaryAddress?.apartmentNo || '',
        locality: primaryAddress?.locality || '',
        landmark: primaryAddress?.landmark || '',
        pincode: primaryAddress?.pincode || '',
        state: primaryAddress?.state || '',
        country: primaryAddress?.country || 'India',
        
        status: 'COMPLETED', // Auto-complete system orders
        paymentStatus: data.warrantyAmount ? 'COMPLETED' : 'PENDING',
        amountPaid: data.warrantyAmount || 0,
        paymentMethod: 'CASH', // Default
        
        // Flags
        additionalWarranty: data.warrantyType === 'EXTENDED' || data.warrantyType === 'PAID',
        freeWarranty: data.warrantyType === 'FREE',
      }
    });

    // 4. Create Warranty
    const warranty = await prisma.warranty.create({
      data: {
        orderId: order.id,
        productId: data.productId,
        userId: data.customerId,
        warrantyType: data.warrantyType,
        startDate: data.startDate,
        endDate: data.endDate,
        durationMonths: Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)),
        isActive: data.status === 'Active',
        additionalWarranty: data.warrantyType === 'EXTENDED' || data.warrantyType === 'PAID',
        warrantyAmount: data.warrantyAmount,
      }
    });

    return { success: true, data: warranty };

  } catch (error: any) {
    console.error('Create warranty error:', error);
    return { success: false, error: error.message };
  }
}
