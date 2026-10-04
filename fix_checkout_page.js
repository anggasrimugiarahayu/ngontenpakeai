const fs = require('fs');

// Fix CheckoutClient.tsx props
let clientFile = 'src/app/checkout/CheckoutClient.tsx';
let clientCode = fs.readFileSync(clientFile, 'utf8');
clientCode = clientCode.replace(/adminFee: number;\n  grossAmount: number;\n/g, '');
clientCode = clientCode.replace(/  adminFee,\n  grossAmount,\n/g, '');
fs.writeFileSync(clientFile, clientCode);

// Fix CheckoutPage.tsx props
let pageFile = 'src/app/checkout/page.tsx';
let pageCode = fs.readFileSync(pageFile, 'utf8');
pageCode = pageCode.replace(/  const adminFee = 3000;\n  const grossAmount = baseAmount \+ adminFee;\n/g, '');
pageCode = pageCode.replace(/        adminFee=\{adminFee\}\n        grossAmount=\{grossAmount\}\n/g, '');
fs.writeFileSync(pageFile, pageCode);

console.log("Fixed props");
