const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change promo text
content = content.replace(
  /"Beli eceran untuk hak milik seumur hidup, ATAU Anda bisa klaim secara GRATIS jika Anda berlangganan paket PRO!"/g,
  '"Beli satuan untuk hak milik seumur hidup, ATAU Anda bisa klaim secara GRATIS semua ebook PRO jika Anda berlangganan paket PRO!"'
);

// 2. Change Jumlah Halaman to Halaman
content = content.replace(
  /<span className="text-gray-500 font-medium col-span-1">Jumlah Halaman<\/span>/g,
  '<span className="text-gray-500 font-medium col-span-1">Halaman</span>'
);

fs.writeFileSync(path, content);
console.log("Patched ReadEbookClient");
