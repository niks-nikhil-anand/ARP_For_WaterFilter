
import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to the database')
    const count = await prisma.user.count()
    console.log(`Found ${count} users`)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
