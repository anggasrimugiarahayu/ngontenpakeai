import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const models = await prisma.aiModel.findMany()
  console.log(JSON.stringify(models.map(m => m.modelId)))
}
main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
