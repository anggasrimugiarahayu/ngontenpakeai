const fs = require('fs');

// 1. layout.tsx
let layoutFile = 'src/app/layout.tsx';
let layoutCode = fs.readFileSync(layoutFile, 'utf8');
layoutCode = layoutCode.replace(
  'className="flex-1 flex flex-col pt-16 md:pt-20 pb-4 md:pb-8"',
  'className="flex-1 flex flex-col pt-16 md:pt-20 pb-2"'
);
fs.writeFileSync(layoutFile, layoutCode);

// 2. Footer.tsx
let footerFile = 'src/components/layout/Footer.tsx';
let footerCode = fs.readFileSync(footerFile, 'utf8');
footerCode = footerCode.replace(
  'className="w-full py-4 md:py-6 flex flex-col items-center justify-center mt-auto"',
  'className="w-full py-2 flex flex-col items-center justify-center mt-auto"'
);
fs.writeFileSync(footerFile, footerCode);

// 3. ruang-ngonten/page.tsx
let ruangPageFile = 'src/app/ruang-ngonten/page.tsx';
let ruangCode = fs.readFileSync(ruangPageFile, 'utf8');
ruangCode = ruangCode.replace(
  'className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 py-8 md:py-12 animate-in fade-in duration-300"',
  'className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 py-4 md:py-6 animate-in fade-in duration-300"'
);
ruangCode = ruangCode.replace(
  'className="flex flex-col items-center justify-center text-center gap-4 mb-8 md:mb-12"',
  'className="flex flex-col items-center justify-center text-center gap-2 mb-4 md:mb-8"'
);
fs.writeFileSync(ruangPageFile, ruangCode);

console.log("Paddings patched successfully!");
