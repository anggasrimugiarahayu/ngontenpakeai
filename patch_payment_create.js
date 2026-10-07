const fs = require('fs');
const path = './src/app/actions/payment.ts';
let content = fs.readFileSync(path, 'utf8');

// Update interface
content = content.replace(
  /customerPhone: string\n\}\)/,
  'customerPhone: string,\n  addonIds?: string[]\n})'
);

// Add Add-ons calculation right before fee calculation
const feeRegex = /if \(\!data\.paymentMethodKey \|\| \!PAYMENT_METHODS\[data\.paymentMethodKey\]\) \{/;
const addonCalc = `
  let itemDetails: any[] = [{
    id: data.productId || data.type,
    price: baseAmount,
    quantity: 1,
    name: orderName.substring(0, 50)
  }];

  if (data.addonIds && data.addonIds.length > 0) {
    const addons = await prisma.digitalProduct.findMany({
      where: { id: { in: data.addonIds } }
    });
    
    addons.forEach(addon => {
      baseAmount += (addon.price || 0);
      itemDetails.push({
        id: addon.id,
        price: addon.price || 0,
        quantity: 1,
        name: \`Add-on: \${addon.title}\`.substring(0, 50)
      });
    });
  }

  if (!data.paymentMethodKey || !PAYMENT_METHODS[data.paymentMethodKey]) {
`;
content = content.replace(feeRegex, addonCalc);

// Pass items to Midtrans and update DB
const orderCreateRegex = /const order = await prisma\.order\.create\(\{[\s\S]*?\}\);/;
const orderCreateReplace = `const order = await prisma.order.create({
    data: {
      userId,
      orderType: data.type,
      digitalProductId: data.productId,
      addonIds: data.addonIds || [],
      amount: grossAmount,
      status: "PENDING",
      paymentMethod: data.paymentMethodKey
    }
  });`;
content = content.replace(orderCreateRegex, orderCreateReplace);

const snapRegex = /item_details: \[\n\s+\{\n\s+id: order\.id,\n\s+price: grossAmount,\n\s+quantity: 1,\n\s+name: orderName\.substring\(0, 50\)\n\s+\}\n\s+\],/;
const snapReplace = `item_details: [
        ...itemDetails,
        ...(adminFee > 0 ? [{
          id: 'admin_fee',
          price: adminFee,
          quantity: 1,
          name: 'Convenience Fee'
        }] : [])
      ],`;
content = content.replace(snapRegex, snapReplace);

fs.writeFileSync(path, content);
console.log("Patched payment.ts for addons!");
