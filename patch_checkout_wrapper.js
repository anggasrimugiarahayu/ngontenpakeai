const fs = require('fs');
const path = './src/app/checkout/CheckoutWrapperClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /existingPendingOrder=\{data\.existingPendingOrder\}\n        \/>/,
  'existingPendingOrder={data.existingPendingOrder}\n          availableAddons={data.availableAddons}\n        />'
);

fs.writeFileSync(path, content);
console.log("Patched CheckoutWrapperClient.tsx");
