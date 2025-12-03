import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Attempting to connect to database...')
    const users = await prisma.user.findMany({ 
      take: 1,
      include: { addresses: true }
    })
    console.log('Successfully connected.')
    console.log('Users found:', users.length)
    if (users.length > 0) {
      console.log('First user:', users[0].name)
    }
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
