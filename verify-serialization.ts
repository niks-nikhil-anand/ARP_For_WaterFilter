import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

// Helper to serialize Decimal to number (copied from action)
const serializeDecimal = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  
  if (obj instanceof Date) return obj

  if (typeof obj === 'object') {
    if (typeof obj.toNumber === 'function') {
      return obj.toNumber()
    }
    if (Array.isArray(obj)) {
      return obj.map(serializeDecimal)
    }
    const newObj: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = serializeDecimal(obj[key])
      }
    }
    return newObj
  }
  return obj
}

async function main() {
  try {
    console.log('Fetching user with potential decimals...')
    // Fetch a user who has orders or tickets with decimals
    const user = await prisma.user.findFirst({
      include: {
        ordersCreated: true,
        tickets: true
      }
    })

    if (user) {
        console.log('User found:', user.name)
        const serialized = serializeDecimal(user)
        console.log('Serialized successfully.')
        
        // Check if decimals are converted
        if (serialized.ordersCreated && serialized.ordersCreated.length > 0) {
             const order = serialized.ordersCreated[0]
             if (order.amountPaid !== null && typeof order.amountPaid === 'number') {
                 console.log('Order amountPaid is number:', order.amountPaid)
             } else if (order.amountPaid !== null) {
                 console.log('Order amountPaid is NOT number:', typeof order.amountPaid)
             }
        }
    } else {
        console.log('No user found to test.')
    }

  } catch (e) {
    console.error('Test failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
