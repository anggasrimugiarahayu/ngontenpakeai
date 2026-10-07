const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const penulisHtml = `<div className="grid grid-cols-3 gap-2">
                     <span className="text-gray-500 font-medium col-span-1">Penulis</span>
                     <span className="text-gray-900 dark:text-white font-medium col-span-2 flex gap-2"><span>:</span> {ebook.author || "Admin"}</span>
                   </div>
                   `;

content = content.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">',
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">\n                   ' + penulisHtml
);

fs.writeFileSync(path, content);
console.log("ReadEbookClient patched with Penulis");
