const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const halamanHtml = `<div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Jumlah Halaman</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.pageCount ? \`\${ebook.pageCount} Halaman\` : '-'}</span>
                   </div>
                   `;

// add after Penulis
content = content.replace(
  '<span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.author || "Admin"}</span>\n                   </div>',
  '<span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.author || "Admin"}</span>\n                   </div>\n                   ' + halamanHtml
);

fs.writeFileSync(path, content);
console.log("ReadEbookClient patched with Halaman");
