const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// The old Edit Price HTML is on line 957-962:
const editPriceRegex = /\{\(editingProduct\.accessLevel === "PREMIUM" \|\| editingProduct\.accessLevel === "PRO"\) && \([\s\S]*?<label className="block text-xs font-bold text-gray-500 mb-1">HARGA E-BOOK \(Rp\)<\/label>[\s\S]*?<\/div>\n              \)\}/;

const newEditPriceHtml = `{(editingProduct.accessLevel === "PREMIUM" || editingProduct.accessLevel === "PRO") && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA JUAL (Rp)</label>
                    <input name="price" type="number" min="0" defaultValue={editingProduct.price || 0} placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA CORET (Rp)</label>
                    <input name="originalPrice" type="number" min="0" defaultValue={editingProduct.originalPrice || ""} placeholder="Contoh: 99000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                  </div>
                </div>
              )}`;

content = content.replace(editPriceRegex, newEditPriceHtml);

fs.writeFileSync(path, content);
console.log("Admin Edit form patched with originalPrice");
