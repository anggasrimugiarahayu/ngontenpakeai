const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.ueecrwmlrixxybypjimu:refhig-suzqiq-Qiwqe4@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
    }
  }
});

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found! Create a user first.");
    return;
  }

  const products = await prisma.digitalProduct.findMany({ take: 2 });
  if (products.length === 0) {
    console.log("No digital products found! Create products first.");
    return;
  }

  const dummyOrders = [
    {
      userId: user.id,
      digitalProductId: products[0].id,
      amount: 60000000,
      status: 'SUCCESS',
      midtransId: 'trx_dummy_001_' + Date.now()
    },
    {
      userId: user.id,
      digitalProductId: products[products.length > 1 ? 1 : 0].id,
      amount: 38000000,
      status: 'PENDING',
      midtransId: 'trx_dummy_002_' + Date.now()
    },
    {
      userId: user.id,
      digitalProductId: products[0].id,
      amount: 60000000,
      status: 'FAILED',
      midtransId: 'trx_dummy_003_' + Date.now()
    },
    {
      userId: user.id,
      digitalProductId: products[products.length > 1 ? 1 : 0].id,
      amount: 38000000,
      status: 'SUCCESS',
      midtransId: 'trx_dummy_004_' + Date.now()
    }
  ];

  for (const order of dummyOrders) {
    await prisma.order.create({
      data: order
    });
  }
  console.log("Successfully seeded 4 dummy orders!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
