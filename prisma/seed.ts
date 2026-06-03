import { prisma } from '../src/lib/db/prisma'

async function main() {
  const quijos = await prisma.tenant.upsert({
    where: { slug: 'quijos' },
    update: {},
    create: {
      name: 'Cantón Quijos',
      slug: 'quijos',
    },
  })
  
  console.log({ quijos })
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
