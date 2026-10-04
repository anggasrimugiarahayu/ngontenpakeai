const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the isLocked logic
const oldLockLogic = `  let isLocked = true;
  if (isFree) isLocked = false;
  else if (isProEbook && isPro) isLocked = false;
  else if (isOwned) isLocked = false;`;

const newLockLogic = `  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  let isLocked = true;
  if (isAdmin) isLocked = false;
  else if (isOwned) isLocked = false;`;

code = code.replace(oldLockLogic, newLockLogic);

// Add the import for claimFreeEbook
if (!code.includes('claimFreeEbook')) {
  code = code.replace(
    'import { toggleFavorite, addReview } from "../actions";',
    'import { toggleFavorite, addReview, claimFreeEbook } from "../actions";'
  );
}

// Rebuild the Unlock Box!
const oldLockedBox = `                 {isLocked ? (
                   <>
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       <Lock className="w-4 h-4 text-rn-accent" />
                       Buka Akses E-Book
                     </h3>
                     <div className="bg-gray-50 dark:bg-[#18181b] border border-orange-200 dark:border-rn-accent/30 rounded-xl p-5 mb-5 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-rn-accent"></div>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-bold text-gray-900 dark:text-white">{isPremiumEbook ? "Eksklusif Premium" : "Akses Member PRO"}</span>
                         <span className="bg-rn-accent/10 text-rn-accent px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Seumur Hidup</span>
                       </div>
                       <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                         Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                       </div>
                       <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                         {isPremiumEbook 
                           ? "E-book ini sangat eksklusif. Beli sekarang dan dapatkan akses penuh untuk membaca dan mendownload selamanya." 
                           : "Beli eceran untuk akses seumur hidup, ATAU dapatkan secara GRATIS dengan berlangganan paket PRO!"}
                       </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3">
                       <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg">
                         Beli Eceran (Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'})
                       </button>
                       {isProEbook && (
                         <Link 
                           href="/?pricing=true" 
                           className="flex-1 flex items-center justify-center gap-2 bg-rn-accent hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rn-accent/20"
                         >
                           <Crown className="w-5 h-5" />
                           Upgrade PRO (Gratis E-Book)
                         </Link>
                       )}
                     </div>
                   </>
                 ) : (`;

const newLockedBox = `                 {isLocked ? (
                   <>
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       <Lock className="w-4 h-4 text-rn-accent" />
                       Buka Akses E-Book
                     </h3>
                     <div className="bg-gray-50 dark:bg-[#18181b] border border-orange-200 dark:border-rn-accent/30 rounded-xl p-5 mb-5 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-rn-accent"></div>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-bold text-gray-900 dark:text-white">{isFree ? "E-Book Gratis" : (isPremiumEbook ? "Eksklusif Premium" : "E-Book PRO")}</span>
                         <span className="bg-rn-accent/10 text-rn-accent px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Hak Milik Seumur Hidup</span>
                       </div>
                       <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                         Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                       </div>
                       <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                         {isFree
                           ? "Silakan klaim e-book ini secara gratis (Rp 0) untuk memasukkannya ke dalam Brankas Perpustakaan Pribadi Anda seumur hidup."
                           : isPremiumEbook 
                             ? "E-book ini sangat eksklusif. Beli sekarang dan dapatkan akses penuh untuk membaca dan mendownload selamanya." 
                             : "Beli eceran untuk hak milik seumur hidup, ATAU Anda bisa klaim secara GRATIS jika Anda berlangganan paket PRO!"}
                       </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3">
                       {/* If it's a FREE ebook, show the Klaim (Rp 0) Form */}
                       {isFree ? (
                         <form action={async () => {
                           "use server";
                           await claimFreeEbook(ebook.id);
                         }} className="w-full">
                           <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20">
                             Klaim Gratis (Rp 0)
                           </button>
                         </form>
                       ) : (
                         /* Otherwise, show standard pricing logic */
                         <>
                           {/* For PRO ebook AND user is currently PRO -> Show Klaim Rp 0! */}
                           {isProEbook && isPro ? (
                             <form action={async () => {
                               "use server";
                               await claimFreeEbook(ebook.id);
                             }} className="w-full flex flex-col gap-3">
                               <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rn-accent hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rn-accent/20">
                                 Klaim Gratis (Khusus Member PRO)
                               </button>
                             </form>
                           ) : (
                             /* For PRO ebook (User is FREE) or PREMIUM ebook -> Needs actual Checkout! */
                             <>
                               <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg">
                                 Beli Eceran (Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'})
                               </button>
                               {isProEbook && (
                                 <Link 
                                   href="/?pricing=true" 
                                   className="flex-1 flex items-center justify-center gap-2 bg-rn-accent hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rn-accent/20"
                                 >
                                   <Crown className="w-5 h-5" />
                                   Langganan PRO
                                 </Link>
                               )}
                             </>
                           )}
                         </>
                       )}
                     </div>
                   </>
                 ) : (`;

code = code.replace(oldLockedBox, newLockedBox);

fs.writeFileSync(file, code);
console.log("Slug Detail Lock Patched!");
