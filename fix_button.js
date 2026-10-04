const fs = require('fs');
let file = 'src/app/ruang-belajar/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<button className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-colors">',
  '<button className="whitespace-nowrap shrink-0 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-colors">'
);

fs.writeFileSync(file, code);
