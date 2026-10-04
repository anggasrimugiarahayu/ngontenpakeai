const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /<form action=\{async \(\) => {[\s\S]*?className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3\.5 rounded-xl font-bold transition-all shadow-lg shadow-gray-900\/20 dark:shadow-white\/20">[\s\S]*?Beli Satuan[\s\S]*?<\/button>[\s\S]*?<\/form>/g;

code = code.replace(regex, `<Link href={\`/checkout?type=EBOOK&productId=\${ebook.id}\`} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-gray-900/20 dark:shadow-white/20">
                                 <Lock className="w-5 h-5 shrink-0" />
                                 Beli Satuan
                               </Link>`);

fs.writeFileSync(file, code);
