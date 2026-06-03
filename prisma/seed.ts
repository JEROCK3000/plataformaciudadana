import { prisma } from '../src/lib/db/prisma'

async function main() {
  console.log('Seeding is not required at this time.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
