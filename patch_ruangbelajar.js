const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/RuangBelajarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add buyerCount
content = content.replace(
  'const reviewCount = ebook.reviews?.length || 0;',
  'const reviewCount = ebook.reviews?.length || 0;\n              const buyerCount = ebook._count?.owners || 0;'
);

// 2. Add buyer count to UI
content = content.replace(
  /\(\{reviewCount > 0 \? `\$\{reviewCount\} ulasan` : "Belum ada ulasan"\}\)\n\s*<\/span>\n\s*<\/div>/,
  `({reviewCount > 0 ? \`\${reviewCount} ulasan\` : "Belum ada ulasan"})
                          </span>
                          <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                          <span className="text-gray-500 font-medium">
                            {buyerCount} pembeli
                          </span>
                        </div>`
);

// 3. Update Card Flex Layout
content = content.replace(
  '<div className="flex flex-col sm:flex-row w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-2xl overflow-hidden relative p-4 gap-4">',
  '<div className="flex flex-row items-start w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-[16px] sm:rounded-[20px] overflow-hidden relative p-3 sm:p-4 gap-3 sm:gap-4">'
);

// 4. Update Image Container
content = content.replace(
  '<div className="w-full sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm">',
  '<div className="w-[100px] sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-[10px] sm:rounded-xl shadow-sm">'
);

// 5. Update Strikethrough price
content = content.replace(
  '<span className="text-[10px] text-gray-400 dark:text-gray-500 line-through leading-none mb-0.5">',
  '<span className="text-[11px] sm:text-[12px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1">'
);

// 6. Update Klaim PRO
content = content.replace(
  '<span className="text-[8px] text-rn-accent font-bold mt-1 uppercase tracking-wider">Atau Klaim Rp 0 dgn PRO</span>',
  '<span className="text-[9px] sm:text-[10px] text-rn-accent font-bold mt-1.5">(Atau Klaim Rp 0 dgn PRO)</span>'
);

// Wait, the new image styling in AdminSettingsContent uses "flex items-center justify-center". I should add that to aspect-[3/4] div
content = content.replace(
  '<div className="aspect-[3/4] relative">',
  '<div className="aspect-[3/4] relative flex items-center justify-center">'
);

fs.writeFileSync(path, content);
console.log("Patched UI");
