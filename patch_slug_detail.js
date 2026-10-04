const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldLockedBox = `                 {isLocked ? (
                   <>
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       <Lock className="w-4 h-4 text-rn-accent" />
                       Buka Akses Premium
                     </h3>
                     <div className="bg-gray-50 dark:bg-[#18181b] border border-orange-200 dark:border-rn-accent/30 rounded-xl p-5 mb-5 shadow-inner relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-rn-accent"></div>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-bold text-gray-900 dark:text-white">Akses Member PRO</span>
                         <span className="bg-rn-accent/10 text-rn-accent px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Akses Tanpa Batas</span>
                       </div>
                       <div className="text-2xl font-black text-gray-900 dark:text-white">
                         Mulai Baca Sekarang
                       </div>
                       <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                         Investasi satu kali untuk membuka e-book ini beserta ratusan materi dan blueprint eksklusif lainnya. Tingkatkan level ngonten Anda hari ini!
                       </p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3">
                       <Link 
                         href="/?pricing=true" 
                         className="flex-1 flex items-center justify-center gap-2 bg-rn-accent hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rn-accent/20"
                       >
                         <Crown className="w-5 h-5" />
                         Upgrade ke PRO Sekarang
                       </Link>
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

code = code.replace(oldLockedBox, newLockedBox);

fs.writeFileSync(file, code);
console.log("Slug Detail patched!");
