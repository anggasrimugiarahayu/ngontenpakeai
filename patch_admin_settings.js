const fs = require('fs');
const file = 'src/app/pengaturan/AdminSettingsContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Modal container max height and scroll
code = code.replace(
  /w-full max-w-lg shadow-2xl/g,
  'w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl'
);
// Reduce padding of the modal
code = code.replace(/p-6 rounded-3xl/g, 'p-5 rounded-2xl');

// 2. Form gap
code = code.replace(/className="flex flex-col gap-4"/g, 'className="flex flex-col gap-3"');

// 3. Grid gap and padding for uploads
code = code.replace(/grid grid-cols-3 gap-4/g, 'grid grid-cols-3 gap-2');
code = code.replace(/space-y-1 bg-gray-50 dark:bg-white\/5 p-3 rounded-xl/g, 'space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg');

// 4. Input padding reduction
code = code.replace(/px-4 py-3/g, 'px-3 py-2');

// 5. Checkbox container reduction
code = code.replace(/className="flex items-start gap-3 p-4 border border-orange-500\/30 bg-orange-500\/5 rounded-xl cursor-pointer"/g, 'className="flex items-start gap-3 p-3 border border-orange-500/30 bg-orange-500/5 rounded-lg cursor-pointer"');
code = code.replace(/className="flex items-start gap-3 p-4 border border-blue-500\/30 bg-blue-500\/5 rounded-xl cursor-pointer"/g, 'className="flex items-start gap-3 p-3 border border-blue-500/30 bg-blue-500/5 rounded-lg cursor-pointer"');

// 6. Reduce top margin of submit buttons inside forms
code = code.replace(/mt-4/g, 'mt-2'); // there are several mt-4 in these modals, we'll replace them globally if safe, but safer to replace specifically
code = code.replace(/className="w-full bg-rn-accent hover:bg-orange-600 text-white py-3/g, 'className="w-full bg-rn-accent hover:bg-orange-600 text-white py-2.5 mt-2');

// 7. Reduce Header margin
code = code.replace(/mb-6/g, 'mb-4');

fs.writeFileSync(file, code);
console.log("AdminSettingsContent compact styles applied.");
