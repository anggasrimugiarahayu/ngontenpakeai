const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the end of the data fetching block to include full orders
const searchBlock = `  const lifetimeSalesIDR = successfulOrders._sum?.amount || 0;
  const lifetimeOrders = successfulOrders._count?.id || 0;`;

const replacementBlock = `  const lifetimeSalesIDR = successfulOrders._sum?.amount || 0;
  const lifetimeOrders = successfulOrders._count?.id || 0;

  let fullOrders = [];
  if (prisma.order) {
    fullOrders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { title: true, coverUrl: true, isProOnly: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }`;

code = code.replace(searchBlock, replacementBlock);

const dataObjSearch = `    totalClicks: 0,
    realProductSales
  };`;

const dataObjReplacement = `    totalClicks: 0,
    realProductSales,
    fullOrders
  };`;

code = code.replace(dataObjSearch, dataObjReplacement);

fs.writeFileSync(file, code);
