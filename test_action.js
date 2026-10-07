const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const products = await prisma.digitalProduct.findMany({ include: { category: true, vouchers: true }, orderBy: { createdAt: 'desc' } });
    console.log("Success:", products.length);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
