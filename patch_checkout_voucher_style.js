const fs = require('fs');
const path = './src/app/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldVoucherStyle = 'className="w-full flex items-center justify-center gap-2 py-2 mb-4 rounded-xl border border-dashed border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 text-sm font-bold hover:border-rn-accent hover:text-rn-accent transition-colors disabled:opacity-50"';
const newVoucherStyle = 'className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl border border-dashed border-rn-accent/50 text-rn-accent text-sm font-bold hover:bg-rn-accent/5 dark:hover:bg-rn-accent/10 transition-colors disabled:opacity-50"';

content = content.replace(oldVoucherStyle, newVoucherStyle);

fs.writeFileSync(path, content);
console.log("Checkout Voucher style patched");
