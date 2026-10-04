const fs = require('fs');

let adminUiFile = 'src/app/pengaturan/AdminSettingsContent.tsx';
let adminCode = fs.readFileSync(adminUiFile, 'utf8');

// For creating new product
adminCode = adminCode.replace(
  'isProOnly: formData.get("isProOnly") === "on",',
  'accessLevel: formData.get("accessLevel") as string,\n                isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",'
);

const newDropdownCreate = `
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL AKSES E-BOOK</label>
                <select name="accessLevel" defaultValue="FREE" className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-rn-accent text-sm">
                  <option value="FREE">Free (Gratis untuk semua)</option>
                  <option value="PRO">Pro (Khusus Member Bundle)</option>
                  <option value="PREMIUM">Premium (Pembelian Eceran / Ala Carte)</option>
                </select>
              </div>
`;

adminCode = adminCode.replace(
  /<label className="mt-2 flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900\/10 border border-orange-100 dark:border-orange-800\/30 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900\/20 transition-colors">\s*<input type="checkbox" name="isProOnly" className="w-5 h-5 rounded text-orange-600 focus:ring-orange-600 border-orange-300" \/>\s*<div>\s*<div className="font-bold text-sm text-orange-900 dark:text-orange-300">Khusus Pengguna PRO<\/div>\s*<div className="text-xs text-orange-700\/70 dark:text-orange-400\/70">Hanya member berbayar yang dapat mengakses konten ini<\/div>\s*<\/div>\s*<\/label>/,
  newDropdownCreate
);

// For updating product
adminCode = adminCode.replace(
  'isProOnly: formData.get("isProOnly") === "on",',
  'accessLevel: formData.get("accessLevel") as string,\n                isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",'
);

const newDropdownEdit = `
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL AKSES E-BOOK</label>
                <select name="accessLevel" defaultValue={editingProduct.accessLevel || 'FREE'} className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-rn-accent text-sm">
                  <option value="FREE">Free (Gratis untuk semua)</option>
                  <option value="PRO">Pro (Khusus Member Bundle)</option>
                  <option value="PREMIUM">Premium (Pembelian Eceran / Ala Carte)</option>
                </select>
              </div>
`;

adminCode = adminCode.replace(
  /<label className="mt-2 flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900\/10 border border-orange-100 dark:border-orange-800\/30 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900\/20 transition-colors">\s*<input type="checkbox" name="isProOnly" defaultChecked={editingProduct\.isProOnly} className="w-5 h-5 rounded text-orange-600 focus:ring-orange-600 border-orange-300" \/>\s*<div>\s*<div className="font-bold text-sm text-orange-900 dark:text-orange-300">Khusus Pengguna PRO<\/div>\s*<div className="text-xs text-orange-700\/70 dark:text-orange-400\/70">Hanya member berbayar yang dapat mengakses konten ini<\/div>\s*<\/div>\s*<\/label>/,
  newDropdownEdit
);

// For displaying in the table list
adminCode = adminCode.replace(
  /\{prod\.isProOnly \? "Pro Only" : "Gratis"\}/g,
  '{prod.accessLevel}'
);

fs.writeFileSync(adminUiFile, adminCode);
console.log("Admin UI patched!");
