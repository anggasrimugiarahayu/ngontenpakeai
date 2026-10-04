const fs = require('fs');
let file = 'src/app/ruang-belajar/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the footer rendering in the mapping loop
const oldFooter = `{isFree ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Gratis</span>
                        ) : isOwned ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Akses Terbuka</span>
                        ) : (
                          <span className={\`text-[17px] font-black \${isLocked ? 'text-rn-accent' : 'text-gray-400 dark:text-gray-500'}\`}>
                             {isPremiumEbook ? "Premium" : "Pro"}
                          </span>
                        )}`;

const newFooter = `{isOwned ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Akses Terbuka</span>
                        ) : (!isLocked && isProEbook) ? (
                          <span className="text-[17px] font-black text-rn-accent">Akses Terbuka (PRO)</span>
                        ) : isFree ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Rp 0</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-[17px] font-black text-gray-900 dark:text-white leading-none">
                              Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                            </span>
                            {isProEbook && (
                               <span className="text-[8px] text-rn-accent font-bold mt-1 uppercase tracking-wider">Atau Gratis dgn PRO</span>
                            )}
                          </div>
                        )}`;

code = code.replace(oldFooter, newFooter);

fs.writeFileSync(file, code);
console.log("User Catalog patched!");
