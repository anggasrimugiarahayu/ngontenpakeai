const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '<span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> Indonesia</span>',
  '<span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.language || "Indonesia"}</span>'
);

content = content.replace(
  '<span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> PDF / Digital</span>',
  '<span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.formatType || "PDF / Digital"}</span>'
);

fs.writeFileSync(path, content);
console.log("ReadEbookClient patched");
