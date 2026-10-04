const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* For PRO ebook (User is FREE) or PREMIUM ebook -> Needs actual Checkout! */')) {
    startIndex = i + 1;
  }
  // Find the end of the `</>` fragment
  if (startIndex !== -1 && i > startIndex && lines[i].includes('</>')) {
    endIndex = i;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const newButtons = `                             <div className="w-full flex flex-col gap-3">
                               <form action={async () => {
                                 "use server";
                                 const res = await createCheckoutToken({ type: "EBOOK", productId: ebook.id });
                                 if (res?.redirectUrl) redirect(res.redirectUrl);
                               }} className="w-full">
                                 <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg">
                                   Beli Eceran (Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'})
                                 </button>
                               </form>
                               {isProEbook && (
                                 <form action={async () => {
                                   "use server";
                                   const res = await createCheckoutToken({ type: "PRO_SUBSCRIPTION" });
                                   if (res?.redirectUrl) redirect(res.redirectUrl);
                                 }} className="w-full">
                                   <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 px-6 py-3.5 rounded-xl font-bold transition-all border border-orange-200 dark:border-orange-500/20">
                                     <Crown className="w-5 h-5" /> Upgrade PRO (Akses Semua E-book)
                                   </button>
                                 </form>
                               )}
                             </div>`;
  
  lines.splice(startIndex, endIndex - startIndex + 1, newButtons);
  fs.writeFileSync(file, lines.join('\n'));
  console.log("Replaced successfully!");
} else {
  console.log("Could not find boundaries.");
}
