const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function testNotifications() {
  try {
    console.log('Testing Notification Model...');

    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found. Skipping test.');
      return;
    }
    console.log('Found user:', user.email);

    // 2. Create a notification
    console.log('Creating test notification...');
    const notification = await prisma.notification.create({
      data: {
        title: 'Verification Test',
        message: 'Testing DB connection and model.',
        category: 'SYSTEM',
        priority: 'LOW',
        recipientId: user.id,
      },
    });
    console.log('Notification created:', notification.id);

    // 3. Fetch it back
    const fetched = await prisma.notification.findUnique({
      where: { id: notification.id },
    });
    
    if (fetched) {
      console.log('Verified: Notification fetched successfully.');
    } else {
      console.error('Error: Notification not found.');
    }

    // 4. Clean up
    await prisma.notification.delete({
      where: { id: notification.id },
    });
    console.log('Cleaned up test notification.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotifications();
