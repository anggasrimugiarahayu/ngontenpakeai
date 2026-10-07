const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/RuangBelajarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove border-t
content = content.replace(
  /className="mt-auto pt-2\.5 flex items-center justify-between border-t border-gray-100 dark:border-white\/5"/,
  'className="mt-auto pt-2 flex items-center justify-between"'
);

// 2. Increase Strikethrough size
content = content.replace(
  /<span className="text-\[11px\] sm:text-\[12px\] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1">/,
  '<span className="text-xs sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1">'
);

// 3. Update PRO text
content = content.replace(
  /<span className="text-\[9px\] sm:text-\[10px\] text-rn-accent font-bold mt-1\.5">\(Atau Klaim Rp 0 dgn PRO\)<\/span>/,
  '<span className="text-[9px] sm:text-[10px] text-rn-accent font-bold mt-1.5 whitespace-nowrap">(Rp 0 khusus PRO)</span>'
);

fs.writeFileSync(path, content);
console.log("Patched final changes");
