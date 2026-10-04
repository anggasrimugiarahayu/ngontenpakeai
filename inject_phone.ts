import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    where: {
      product: {
        title: {
          contains: '30 Day Creator'
        }
      }
    },
    include: {
      user: true,
      product: true
    }
  });

  if (orders.length === 0) {
    console.log("No orders found for '30 Day Creator'");
    return;
  }

  console.log(`Found ${orders.length} orders.`);
  
  for (const order of orders) {
    if (order.user) {
      await prisma.user.update({
        where: { id: order.user.id },
        data: { phone: '081286254954' }
      });
      console.log(`Updated user ${order.user.name} (${order.user.email}) to have phone 081286254954`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
