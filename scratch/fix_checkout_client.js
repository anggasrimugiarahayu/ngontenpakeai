const fs = require('fs');
const path = './src/app/(app)/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'existingPendingOrder?: { token: string, orderId: string, expiryTime: string, paymentMethodKey: string   includedAddons?: any[];',
  'existingPendingOrder?: { token: string, orderId: string, expiryTime: string, paymentMethodKey: string };'
);

content = content.replace(
  '  availableAddons?: any[];\n}',
  '  availableAddons?: any[];\n  includedAddons?: any[];\n}'
);

fs.writeFileSync(path, content);
console.log("Fixed CheckoutClient.tsx");
