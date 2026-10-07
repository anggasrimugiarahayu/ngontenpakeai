const fs = require('fs');
const path = './src/app/(app)/checkout/CheckoutWrapperClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldProps = `          existingPendingOrder={data.existingPendingOrder}
          availableAddons={data.availableAddons}
        />`;

const newProps = `          existingPendingOrder={data.existingPendingOrder}
          availableAddons={data.availableAddons}
          includedAddons={data.includedAddons || []}
        />`;

content = content.replace(oldProps, newProps);
fs.writeFileSync(path, content);
console.log("Patched CheckoutWrapperClient.tsx");
