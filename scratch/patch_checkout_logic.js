const fs = require('fs');
const path = './src/app/(app)/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldLogic = `    const addonsTotal = availableAddons.filter(a => selectedAddons.includes(a.id)).reduce((acc, curr) => acc + (curr.price || 0), 0);
    let finalBase = baseAmount + addonsTotal;
    
    let discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.type === "PERCENTAGE") {
        discount = Math.floor(finalBase * (appliedVoucher.value / 100));
      } else {
        discount = appliedVoucher.value;
      }
      if (discount > finalBase) discount = finalBase;
      appliedVoucher.amount = discount; // mutates state ref safely for rendering
      finalBase -= discount;
    }`;

const newLogic = `    const addonsTotal = availableAddons.filter(a => selectedAddons.includes(a.id)).reduce((acc, curr) => acc + (curr.price || 0), 0);
    
    let discount = 0;
    if (appliedVoucher) {
      // Calculate discount strictly against the main product (baseAmount)
      if (appliedVoucher.type === "PERCENTAGE") {
        discount = Math.floor(baseAmount * (appliedVoucher.value / 100));
      } else {
        discount = appliedVoucher.value;
      }
      // Cap the discount to the main product's price so it doesn't bleed into addons
      if (discount > baseAmount) discount = baseAmount;
      appliedVoucher.amount = discount; // mutates state ref safely for rendering
    }
    
    let finalBase = baseAmount + addonsTotal - discount;`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(path, content);
console.log("Patched checkout calculation logic");
