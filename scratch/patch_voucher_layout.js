const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

const modalRegex = /(<button onClick=\{\(\) => setShowGlobalVoucherModal\(false\)\} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white\/10 text-gray-400 transition-colors">\s*<X size=\{20\} \/>\s*<\/button>\s*<\/div>)\s*<div className="overflow-y-auto flex-1 mb-4 space-y-3 custom-scrollbar pr-2 min-h-\[150px\]">([\s\S]*?)<\/div>\s*<div className="pt-4 border-t border-gray-200 dark:border-white\/10 shrink-0 bg-white dark:bg-\[#121214\]">\s*<h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buat Voucher Baru<\/h4>\s*<div className="space-y-3">([\s\S]*?)<\/div>\s*<\/div>/;

const match = content.match(modalRegex);
if (!match) {
    console.error("Modal regex failed to match.");
    process.exit(1);
}

const headerPart = match[1];
const listPartInner = match[2];
const formPartInner = match[3];

// Let's rewrite the formPartInner to include headers and change widths.
// original formPartInner inputs:
/*
                <input 
                  type="text" placeholder="Kode Promo (ex: PROMO50)" ... />
                <div className="flex gap-2">
                  <select ... className="w-1/3 ...">
                  ...
                  </select>
                  <input ... className="flex-1 ..." />
                </div>
                <select ...>
                  <option value="" disabled>-- Pilih E-Book Tujuan --</option>
                  {products?.map...}
                </select>
                <button ...>...
*/
// It's easier to just do string replacements on formPartInner.
let newFormPartInner = formPartInner;

newFormPartInner = newFormPartInner.replace(
  /<input\s+type="text" placeholder="Kode Promo \(ex: PROMO50\)"([\s\S]*?)className="([^"]+)"\s*\/>/,
  `<div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kode Promo</label>
                  <input type="text" placeholder="Kode Promo (ex: PROMO50)" $1 className="$2" />
                </div>`
);

newFormPartInner = newFormPartInner.replace(
  /<div className="flex gap-2">\s*<select([\s\S]*?)className="w-1\/3 ([^"]+)"([\s\S]*?)<\/select>\s*<input\s+type="number" placeholder="Nilai Diskon"([\s\S]*?)className="flex-1 ([^"]+)"\s*\/>\s*<\/div>/,
  `<div className="flex gap-2">
                  <div className="w-5/12 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe Diskon</label>
                    <select $1 className="w-full $2" $3</select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nilai Diskon</label>
                    <input type="number" placeholder="Nilai Diskon" $4 className="w-full $5" />
                  </div>
                </div>`
);

// E-book select
newFormPartInner = newFormPartInner.replace(
  /\{\/\* Target E-Book Dropdown \*\/\}\s*<select([\s\S]*?)className="([^"]+)"([\s\S]*?)<\/select>/,
  `{/* Target E-Book Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-Book Tujuan</label>
                  <select $1 className="$2" $3</select>
                </div>`
);

// Now construct the new modal layout
const newModal = `${headerPart}
            
            <div className="shrink-0 bg-white dark:bg-[#121214] mt-2 mb-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buat Voucher Baru</h4>
              <div className="space-y-3">
${newFormPartInner}
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-white/10 flex flex-col flex-1 min-h-[150px]">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">DAFTAR VOUCHER TERSIMPAN</h4>
              <div className="overflow-y-auto space-y-3 custom-scrollbar pr-2 flex-1">
${listPartInner}
              </div>
            </div>`;

content = content.replace(modalRegex, newModal);
fs.writeFileSync(path, content);
console.log("Patched voucher layout successfully!");
