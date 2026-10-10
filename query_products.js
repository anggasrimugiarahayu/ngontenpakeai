const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.digitalProduct.findMany({
    select: { id: true, title: true }
  });
  console.log(products);
}

main().catch(console.error).finally(() => prisma.$disconnect());
