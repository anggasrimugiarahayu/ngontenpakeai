const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const startStr = '<form action={async () => {\n                                 "use server";\n                                 const res = await createCheckoutToken({ \n                                 type: "EBOOK", \n                                 productId: ebook.id,';
const idxStart = code.indexOf('<form action={async () => {\n                                 "use server";\n                                 const res = await createCheckoutToken({ \n                                 type: "EBOOK"');

if (idxStart !== -1) {
  const endStr = '</form>';
  const idxEnd = code.indexOf(endStr, idxStart);
  if (idxEnd !== -1) {
    const block = code.substring(idxStart, idxEnd + endStr.length);
    code = code.replace(block, `<Link href={\`/checkout?type=EBOOK&productId=\${ebook.id}\`} className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg">
                                   Beli Satuan (Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'})
                               </Link>`);
    fs.writeFileSync(file, code);
    console.log("Fixed Beli Satuan block");
  }
} else {
  console.log("Could not find block");
}
