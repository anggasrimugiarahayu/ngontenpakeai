const fs = require('fs');

// Fix layout.tsx
let layoutFile = 'src/app/layout.tsx';
let layoutCode = fs.readFileSync(layoutFile, 'utf8');
layoutCode = layoutCode.replace(
  'className="flex-1 flex flex-col pt-16 md:pt-20"',
  'className="flex-1 flex flex-col pt-16 md:pt-20 pb-4 md:pb-8"'
);
fs.writeFileSync(layoutFile, layoutCode);

// Fix Footer.tsx
let footerFile = 'src/components/layout/Footer.tsx';
let footerCode = fs.readFileSync(footerFile, 'utf8');
footerCode = footerCode.replace(
  'className="w-full pt-16 pb-12 flex flex-col items-center justify-center mt-auto"',
  'className="w-full py-4 md:py-6 flex flex-col items-center justify-center mt-auto"'
);
fs.writeFileSync(footerFile, footerCode);

console.log("Patched layout and footer");
