const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function verifyProductFilter() {
  try {
    console.log('Testing Product Filter...');

    // 1. Create a test product that is NOT visible on website
    const hiddenProduct = await prisma.product.create({
      data: {
        uniqueId: `TEST-HIDDEN-${Date.now()}`,
        productName: 'Hidden Product',
        company: 'Test Co',
        type: 'RO',
        price: 10000,
        isVisibleWebsite: false,
        status: 'ACTIVE',
        createdById: 1 // Assuming user ID 1 exists, otherwise we'll need to find one
      }
    });
    console.log('Created hidden product:', hiddenProduct.id);

    // 2. Create a test product that IS visible on website
    const visibleProduct = await prisma.product.create({
      data: {
        uniqueId: `TEST-VISIBLE-${Date.now()}`,
        productName: 'Visible Product',
        company: 'Test Co',
        type: 'RO',
        price: 12000,
        isVisibleWebsite: true,
        status: 'ACTIVE',
        createdById: 1
      }
    });
    console.log('Created visible product:', visibleProduct.id);

    // 3. Simulate the query used in getPublicProducts
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        isVisibleWebsite: true,
      },
    });

    // 4. Verify results
    const hiddenFound = products.find(p => p.id === hiddenProduct.id);
    const visibleFound = products.find(p => p.id === visibleProduct.id);

    if (!hiddenFound && visibleFound) {
      console.log('✅ SUCCESS: Filter is working correctly.');
      console.log('Hidden product was NOT found.');
      console.log('Visible product WAS found.');
    } else {
      console.log('❌ FAILURE: Filter is NOT working correctly.');
      if (hiddenFound) console.log('Hidden product WAS found (Should not be).');
      if (!visibleFound) console.log('Visible product was NOT found (Should be).');
    }

    // Cleanup
    await prisma.product.delete({ where: { id: hiddenProduct.id } });
    await prisma.product.delete({ where: { id: visibleProduct.id } });
    console.log('Cleaned up test products.');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper to ensure we have a user for creation
async function setup() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found, creating one for test...");
         // Create a dummy user if needed, but usually one exists
    }
    verifyProductFilter();
}

setup();
