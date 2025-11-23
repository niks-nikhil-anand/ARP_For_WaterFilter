
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Users with Role AGENT ---')
  const users = await prisma.user.findMany({
    where: { role: 'AGENT' }
  })
  console.log(users)

  console.log('\n--- Records in Agent Table ---')
  const agents = await prisma.agent.findMany({
    include: { user: true, shop: true }
  })
  console.log(agents)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
