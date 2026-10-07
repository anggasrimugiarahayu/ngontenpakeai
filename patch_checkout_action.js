const fs = require('fs');
const path = './src/app/actions/checkout.ts';
let content = fs.readFileSync(path, 'utf8');

// I need to fetch all active ebooks except the current one.
// Let's add it to the Promise.all
const pAllRegex = /const \[user, product, pendingDbOrder\] = await Promise\.all\(\[/;
const pAllReplace = `const [user, product, pendingDbOrder, availableAddons] = await Promise.all([`;

content = content.replace(pAllRegex, pAllReplace);

const queriesRegex = /status: "PENDING"\n      \},.*\n    \}\)\.catch\(\(\) => null\)\n  \]\);/s;
const queriesReplace = `status: "PENDING"
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => null),
    
    prisma.digitalProduct.findMany({
      where: { isActive: true, id: { not: productId || undefined } },
      select: { id: true, title: true, coverUrl: true, price: true }
    }).catch(() => [])
  ]);`;

content = content.replace(queriesRegex, queriesReplace);

const returnRegex = /existingPendingOrder\n  \};\n\}/;
const returnReplace = `existingPendingOrder,\n    availableAddons\n  };\n}`;

content = content.replace(returnRegex, returnReplace);
fs.writeFileSync(path, content);
console.log("Patched checkout action for addons!");
