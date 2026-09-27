const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const blueprint = await prisma.masterBlueprint.findFirst({
    where: { userId: { not: null } },
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(blueprint?.aiResult || {}, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
