import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const bios = await prisma.bioBuilder.findMany()
  console.log(bios.map(b => b.avatarUrl))
}
main().finally(() => prisma.$disconnect())
