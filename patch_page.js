const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `user: { select: { name: true, email: true } }`;
const replacement = `user: { select: { name: true, email: true, phone: true } }`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);
console.log("Patched page.tsx to select phone");
