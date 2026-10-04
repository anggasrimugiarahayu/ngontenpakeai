const fs = require('fs');
let file = 'src/app/pengaturan/AdminSettingsContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the edit form select:
code = code.replace(
  /<select name="accessLevel" defaultValue={editingProduct\.accessLevel \|\| 'FREE'} className="w-full/g,
  '<select name="accessLevel" value={editingProduct.accessLevel || "FREE"} onChange={(e) => setEditingProduct({...editingProduct, accessLevel: e.target.value})} className="w-full'
);

// Replace the WRONG addAccessLevel in the edit form:
// We know it's right after the edit form select
code = code.replace(
  /{addAccessLevel === "PREMIUM" && \(\s*<div className="mt-4">\s*<label className="block text-xs font-bold text-gray-500 mb-1">HARGA E-BOOK \(Rp\)<\/label>\s*<input name="price" type="number" min="0" placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black\/20 border border-gray-200 dark:border-white\/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required \/>\s*<\/div>\s*\)}/g,
  '{(editingProduct.accessLevel === "PREMIUM" || editingProduct.accessLevel === "PRO") && (\n                <div className="mt-4">\n                  <label className="block text-xs font-bold text-gray-500 mb-1">HARGA E-BOOK (Rp)</label>\n                  <input name="price" type="number" min="0" defaultValue={editingProduct.price || 0} placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />\n                </div>\n              )}'
);

fs.writeFileSync(file, code);
console.log("Admin Edit form fixed!");
