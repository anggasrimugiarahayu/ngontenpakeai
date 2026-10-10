import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const niches = await prisma.nicheReference.findMany()
  console.log("Niche count:", niches.length)
}
main().finally(() => prisma.$disconnect())
