const fs = require('fs');

let file = 'src/app/pengaturan/AdminSettingsContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add state for Add Form
code = code.replace(
  'const [showAddProduct, setShowAddProduct] = useState(false);',
  'const [showAddProduct, setShowAddProduct] = useState(false);\n  const [addAccessLevel, setAddAccessLevel] = useState("FREE");'
);

// Modify the Add Form's accessLevel select to use onChange
code = code.replace(
  /<select name="accessLevel" defaultValue="FREE" className="w-full/g,
  '<select name="accessLevel" value={addAccessLevel} onChange={(e) => setAddAccessLevel(e.target.value)} className="w-full'
);

// Insert Price input in Add Form
const addPriceInput = `
              </div>
              
              {addAccessLevel === "PREMIUM" && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">HARGA E-BOOK (Rp)</label>
                  <input name="price" type="number" min="0" placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                </div>
              )}
`;
// Carefully replace in Add Form
code = code.replace(
  /<\/select>\s*<\/div>\s*<label className="mt-2 flex items-center/g, // This matches the end of accessLevel div and start of isDownloadable label
  '</select>\n              </div>\n              \n              {addAccessLevel === "PREMIUM" && (\n                <div className="mt-4">\n                  <label className="block text-xs font-bold text-gray-500 mb-1">HARGA E-BOOK (Rp)</label>\n                  <input name="price" type="number" min="0" placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />\n                </div>\n              )}\n\n              <label className="mt-2 flex items-center'
);


// Now for the Edit Form
// Modify the Edit Form's accessLevel select
code = code.replace(
  /<select name="accessLevel" defaultValue={editingProduct\.accessLevel} className="w-full/g,
  '<select name="accessLevel" value={editingProduct.accessLevel} onChange={(e) => setEditingProduct({...editingProduct, accessLevel: e.target.value})} className="w-full'
);

// Insert Price input in Edit Form
// Wait, the edit form is down below, let's just do a specific replace.
// We can use a regex that matches the edit form specifically.
const editPriceInput = `
              {editingProduct.accessLevel === "PREMIUM" && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">HARGA E-BOOK (Rp)</label>
                  <input name="price" type="number" min="0" defaultValue={editingProduct.price || 0} placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                </div>
              )}
`;

// In Edit Form, we need to match the end of the select and insert the price input.
code = code.replace(
  /<\/select>\s*<\/div>\s*<label className="mt-2 flex items-center gap-3 p-3 bg-blue-50/g,
  function(match) {
    // Only replace the second occurrence if there's multiple, wait, we already replaced the first one differently! 
    // Wait, the first one was replaced because it matched defaultValue="FREE". The second one has defaultValue={editingProduct.accessLevel}.
    // But my first regex actually looked for `</select>\s*</div>\s*<label className="mt-2 flex items-center`.
    // Let me just replace ALL of them, and for the edit form, it's easier to just do it via a generic replace.
    return '</select>\n              </div>\n              ' + editPriceInput + '\n              <label className="mt-2 flex items-center gap-3 p-3 bg-blue-50';
  }
);


// Third thing: Fix the UI on the Card
// Find:
/*
                   <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3 mt-auto">
                      {prod.isProOnly && (
                        <span className="text-[8px] sm:text-[9px] font-bold text-orange-700 dark:text-gray-300 bg-orange-100 dark:bg-[#222225] px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-200 dark:border-white/5 whitespace-nowrap">
                          PREMIUM
                        </span>
                      )}
                      <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#222225] px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-200 dark:border-white/5 whitespace-nowrap truncate max-w-[80px] sm:max-w-[100px]">
                        {prod.category?.name?.toUpperCase() || 'PRODUK DIGITAL'}
                      </span>
                   </div>

                   <div className="border-t border-gray-100 dark:border-white/5 pt-2 sm:pt-3 flex items-center justify-between gap-1.5">
                     <span className="text-orange-600 dark:text-orange-400 font-bold text-[10px] sm:text-xs whitespace-nowrap truncate">
                       {prod.accessLevel}
                     </span>
                     
*/

const newCardUI = `
                   <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3 mt-auto">
                      <span className={\`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border whitespace-nowrap \${prod.accessLevel === 'FREE' ? 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300' : prod.accessLevel === 'PRO' ? 'bg-orange-100 border-orange-200 text-orange-700 dark:bg-[#222225] dark:text-gray-300' : 'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400'}\`}>
                        {prod.accessLevel}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#222225] px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-200 dark:border-white/5 whitespace-nowrap truncate max-w-[80px] sm:max-w-[100px]">
                        {prod.category?.name?.toUpperCase() || 'PRODUK DIGITAL'}
                      </span>
                   </div>

                   <div className="border-t border-gray-100 dark:border-white/5 pt-2 sm:pt-3 flex items-center justify-between gap-1.5">
                     <span className="text-gray-600 dark:text-gray-400 font-bold text-[10px] sm:text-xs whitespace-nowrap truncate">
                       {prod.accessLevel === 'PREMIUM' ? \`Rp \${(prod.price || 0).toLocaleString('id-ID')}\` : (prod.isDownloadable ? "Bisa di-download" : "Hanya Baca")}
                     </span>
`;

code = code.replace(/<div className="flex flex-wrap gap-1\.5 mb-2 sm:mb-3 mt-auto">[\s\S]*?(?=<div className="flex gap-1\.5 shrink-0">)/, newCardUI + '\n                     ');

fs.writeFileSync(file, code);
console.log("Admin UI Patched for Price!");
