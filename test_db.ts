import prisma from "./src/lib/prisma";
async function test() {
  const res = await prisma.digitalProduct.findMany({ include: { category: true, vouchers: true }, orderBy: { createdAt: 'desc' } });
  console.log(res.length);
}
test();
