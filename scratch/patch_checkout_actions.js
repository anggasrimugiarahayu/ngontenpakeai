const fs = require('fs');
const path = './src/app/actions/checkout.ts';
let content = fs.readFileSync(path, 'utf8');

// We need to inject logic for includedAddons
const oldLogic = `      baseAmount = pricingConfig[type].price;
      itemName = pricingConfig[type].name;
      itemDescription = pricingConfig[type].desc;
    } else {`;

const newLogic = `      baseAmount = pricingConfig[type].price;
      itemName = pricingConfig[type].name;
      itemDescription = pricingConfig[type].desc;
      bundledIds = pricingConfig[type].bundledProductIds || [];
    } else {`;

if (!content.includes('bundledIds = pricingConfig')) {
  content = content.replace(oldLogic, newLogic);
}

// We need to pass bundledIds down
const returnRegex = /  return \{\n    type,\n    productId,\n    itemName,\n    itemDescription,\n    baseAmount,\n    clientKey,\n    isProduction,\n    initialName: user\.name \|\| "",\n    initialEmail: user\.email \|\| "",\n    initialPhone: user\.phone \|\| "",\n    productImage,\n    existingPendingOrder,\n    availableAddons\n  \};/;

const newReturn = `  // Fetch bundled addons (included)
  let includedAddons: any[] = [];
  if (type.startsWith("PRO_") && bundledIds && bundledIds.length > 0) {
    includedAddons = await prisma.digitalProduct.findMany({
      where: { id: { in: bundledIds } },
      select: { id: true, title: true, coverUrl: true, price: true }
    }).catch(() => []);
  }

  return {
    type,
    productId,
    itemName,
    itemDescription,
    baseAmount,
    clientKey,
    isProduction,
    initialName: user.name || "",
    initialEmail: user.email || "",
    initialPhone: user.phone || "",
    productImage,
    existingPendingOrder,
    availableAddons,
    includedAddons
  };`;

content = content.replace(returnRegex, newReturn);
fs.writeFileSync(path, content);
console.log("Patched checkout.ts");
