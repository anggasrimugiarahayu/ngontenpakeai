const fs = require('fs');
const path = './src/app/actions/payment.ts';
let content = fs.readFileSync(path, 'utf8');

// Update arguments
if (!content.includes('discountAmount?: number')) {
  content = content.replace(
    /addonIds\?: string\[\]\n\}\)/,
    'addonIds?: string[],\n  voucherCode?: string,\n  discountAmount?: number\n})'
  );
}

// Add discount logic
const addonLogicEnd = `    });
  }`;

const discountLogic = `    });
  }

  if (data.discountAmount && data.discountAmount > 0) {
    baseAmount -= data.discountAmount;
    itemDetails.push({
      id: "DISCOUNT",
      price: -data.discountAmount,
      quantity: 1,
      name: (\`Promo: \${data.voucherCode || 'Discount'}\`).substring(0, 50)
    });
  }`;

content = content.replace(addonLogicEnd, discountLogic);

// Add to prisma.order.create
content = content.replace(
  /addonIds: data\.addonIds \|\| \[\],/,
  'addonIds: data.addonIds || [],\n      voucherCode: data.voucherCode,\n      discountAmount: data.discountAmount || 0,'
);

fs.writeFileSync(path, content);
console.log("Patched payment.ts");
