const fs = require('fs');

let footerFile = 'src/components/layout/Footer.tsx';
let footerCode = fs.readFileSync(footerFile, 'utf8');
footerCode = footerCode.replace(
  'className="w-full py-2 flex flex-col items-center justify-center mt-auto"',
  'className="w-full pt-2 pb-6 flex flex-col items-center justify-center mt-auto"'
);
fs.writeFileSync(footerFile, footerCode);

console.log("Footer lifted successfully!");
