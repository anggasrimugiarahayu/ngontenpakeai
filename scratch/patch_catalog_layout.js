const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/RuangBelajarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove flex-wrap from the bottom container
content = content.replace(
  /<div className="mt-auto pt-2 flex flex-wrap items-end justify-between gap-y-3 gap-x-2">/g,
  '<div className="mt-auto pt-2 flex items-end justify-between gap-x-2">'
);

// 2. Shrink price fonts and add whitespace-nowrap
content = content.replace(
  /<span className="text-xs sm:text-\[13px\] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1">/g,
  '<span className="text-[11px] sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1 whitespace-nowrap">'
);
content = content.replace(
  /<span className="text-\[17px\] font-black text-gray-900 dark:text-white leading-none">/g,
  '<span className="text-[15px] sm:text-[17px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">'
);

// 3. Shrink the "Buka E-Book" button on mobile
content = content.replace(
  /<button className="whitespace-nowrap shrink-0 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-colors">/g,
  '<button className="whitespace-nowrap shrink-0 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold shadow-sm transition-colors">'
);

fs.writeFileSync(path, content);
console.log("Patched catalog layout");
