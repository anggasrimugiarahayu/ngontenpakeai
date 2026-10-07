const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove flex-wrap and gap-y-3
content = content.replace(
  /<div className="mt-auto pt-2 flex flex-wrap items-end justify-between gap-y-3 gap-x-2">/,
  `<div className="mt-auto pt-2 flex items-end justify-between gap-x-2">`
);

// 2. Shrink Edit button
content = content.replace(
  /className="flex items-center justify-center gap-1\.5 px-3 py-1\.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white\/5 dark:hover:bg-white\/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-\[10px\] sm:text-xs font-bold"/,
  `className="flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-[9px] sm:text-[10px] font-bold"`
);
content = content.replace(
  /<Edit className="w-3\.5 h-3\.5" \/>/,
  `<Edit className="w-3 h-3" />`
);

// 3. Shrink Hapus button
content = content.replace(
  /className="flex items-center justify-center gap-1\.5 px-3 py-1\.5 sm:px-4 sm:py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500\/10 dark:hover:bg-red-500\/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-\[10px\] sm:text-xs font-bold"/,
  `className="flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-[9px] sm:text-[10px] font-bold"`
);
content = content.replace(
  /<Trash2 className="w-3\.5 h-3\.5" \/>/,
  `<Trash2 className="w-3 h-3" />`
);

fs.writeFileSync(path, content);
console.log("Patched buttons");
