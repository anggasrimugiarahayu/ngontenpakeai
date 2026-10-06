const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/RuangBelajarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<div className="flex flex-col">
                            <span className="text-[17px] font-black text-gray-900 dark:text-white leading-none">
                              Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                            </span>`;

const replacement = `<div className="flex flex-col">
                            {ebook.originalPrice && ebook.originalPrice > ebook.price ? (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through leading-none mb-0.5">
                                Rp {ebook.originalPrice.toLocaleString('id-ID')}
                              </span>
                            ) : null}
                            <span className="text-[17px] font-black text-gray-900 dark:text-white leading-none">
                              Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                            </span>`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content);
console.log("RuangBelajarClient patched with Harga Coret");
