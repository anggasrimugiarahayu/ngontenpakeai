const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/successfulOrders = await prisma\.order\.aggregate\(\{[\s\S]*?\}\);/m, 
`try {
      successfulOrders = await prisma.order.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'SUCCESS' }
      });
    } catch(e) { console.error("Prisma error successfulOrders:", e); }`);

code = code.replace(/topProducts = await prisma\.order\.groupBy\(\{[\s\S]*?\}\);/m, 
`try {
      topProducts = await prisma.order.groupBy({
        by: ['digitalProductId'],
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'SUCCESS' },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      });
    } catch(e) { console.error("Prisma error topProducts:", e); }`);

code = code.replace(/fullOrders = await prisma\.order\.findMany\(\{[\s\S]*?\}\);/m, 
`try {
      fullOrders = await prisma.order.findMany({
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { title: true, coverUrl: true, isProOnly: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch(e) { console.error("Prisma error fullOrders:", e); }`);

fs.writeFileSync(file, code);
