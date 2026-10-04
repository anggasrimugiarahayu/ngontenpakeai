const fs = require('fs');
const file = 'src/components/layout/Footer.tsx';
let code = fs.readFileSync(file, 'utf8');

// replace py-8 with py-8 mt-12 mb-6
const target = `className="w-full py-8 flex flex-col items-center justify-center mt-auto"`;
const replacement = `className="w-full pt-16 pb-12 flex flex-col items-center justify-center mt-auto"`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);
console.log("Patched footer spacing");
