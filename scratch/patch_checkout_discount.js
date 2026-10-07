const fs = require('fs');
const path = './src/app/(app)/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<span className="text-gray-600 dark:text-gray-400 font-medium">Discount<\/span><span className="text-rn-accent">- Rp 0<\/span>/g,
  '<span className="text-gray-600 dark:text-gray-400 font-medium">Discount {appliedVoucher && `(${appliedVoucher.code})`}</span><span className="text-rn-accent">- Rp {formatRupiah(discountAmount)}</span>'
);

fs.writeFileSync(path, content);
console.log("Patched checkout discount row");
