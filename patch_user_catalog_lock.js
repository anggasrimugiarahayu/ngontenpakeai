const fs = require('fs');
let file = 'src/app/ruang-belajar/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the isLocked logic
const oldLockLogic = `              let isLocked = true;
              if (isFree) isLocked = false;
              else if (isProEbook && isPro) isLocked = false;
              else if (isOwned) isLocked = false;`;

const newLockLogic = `              // For Admin, everything is unlocked. For others, ONLY if they own it.
              const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
              let isLocked = true;
              if (isAdmin) isLocked = false;
              else if (isOwned) isLocked = false;`;

code = code.replace(oldLockLogic, newLockLogic);

// Replace the footer rendering AGAIN since the conditions changed
const oldFooter = `{isOwned ? (
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

const newFooter = `{isOwned ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Dimiliki</span>
                        ) : isFree ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Rp 0</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-[17px] font-black text-gray-900 dark:text-white leading-none">
                              Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                            </span>
                            {isProEbook && (
                               <span className="text-[8px] text-rn-accent font-bold mt-1 uppercase tracking-wider">Atau Klaim Rp 0 dgn PRO</span>
                            )}
                          </div>
                        )}`;

code = code.replace(oldFooter, newFooter);

fs.writeFileSync(file, code);
console.log("User Catalog Lock Patched!");
