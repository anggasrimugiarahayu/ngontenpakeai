const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const data = JSON.parse(fs.readFileSync('migration_data.json', 'utf8'));

async function main() {
  let newUsers = 0;
  let updatedUsers = 0;
  let newOrders = 0;
  let failed = 0;

  for (const record of data) {
    const { email, name, phone } = record;
    if (!email) continue;

    try {
      // Find case-insensitive
      let user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: name || undefined,
            phone: phone ? String(phone) : undefined,
            role: "PRO",
          }
        });
        newUsers++;
      } else {
        const updateData = {};
        if (user.role !== "PRO" && user.role !== "ADMIN") updateData.role = "PRO";
        if (!user.name && name) updateData.name = name;
        if (!user.phone && phone) updateData.phone = String(phone);
        
        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData
          });
        }
        updatedUsers++;
      }

      const existingOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          status: "SUCCESS",
          orderType: "PRO_BOOK"
        }
      });

      if (!existingOrder) {
        await prisma.order.create({
          data: {
            userId: user.id,
            orderType: "PRO_BOOK",
            amount: 0,
            status: "SUCCESS",
            paymentMethod: "LYNKID_MIGRATION",
          }
        });
        newOrders++;
      }
    } catch (err) {
      console.log(`Failed for email ${email}:`, err.message);
      failed++;
    }
  }

  console.log(`Migration Complete!`);
  console.log(`- New Users Created: ${newUsers}`);
  console.log(`- Existing Users Updated: ${updatedUsers}`);
  console.log(`- PRO_BOOK Orders Granted: ${newOrders}`);
  console.log(`- Failed: ${failed}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
