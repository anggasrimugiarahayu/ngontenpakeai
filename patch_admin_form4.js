const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add pageCount and originalPrice to updateProduct payload
content = content.replace(
  'author: formData.get("author") as string,',
  'author: formData.get("author") as string,\n                pageCount: formData.get("pageCount") ? parseInt(formData.get("pageCount") as string) : 0,\n                originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0,'
);

// 2. Add pageCount and originalPrice to createProduct payload
content = content.replace(
  'author: formData.get("author") as string',
  'author: formData.get("author") as string,\n                pageCount: formData.get("pageCount") ? parseInt(formData.get("pageCount") as string) : 0,\n                originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0'
);

// 3. UI: Replace Add Form Price
const addPriceHtml = `              {(addAccessLevel === "PREMIUM" || addAccessLevel === "PRO") && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">HARGA E-BOOK (Rp)</label>
                  <input name="price" type="number" min="0" placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                </div>
              )}`;
const newAddPriceHtml = `              {(addAccessLevel === "PREMIUM" || addAccessLevel === "PRO") && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA JUAL (Rp)</label>
                    <input name="price" type="number" min="0" placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA CORET (Rp)</label>
                    <input name="originalPrice" type="number" min="0" placeholder="Contoh: 99000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                  </div>
                </div>
              )}`;
content = content.replace(addPriceHtml, newAddPriceHtml);

// 4. UI: Replace Edit Form Price
const editPriceHtml = `              {(editingProduct.accessLevel === "PREMIUM" || editingProduct.accessLevel === "PRO") && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">HARGA E-BOOK (Rp)</label>
                  <input name="price" type="number" min="0" defaultValue={editingProduct.price || ""} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                </div>
              )}`;
const newEditPriceHtml = `              {(editingProduct.accessLevel === "PREMIUM" || editingProduct.accessLevel === "PRO") && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA JUAL (Rp)</label>
                    <input name="price" type="number" min="0" defaultValue={editingProduct.price || ""} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA CORET (Rp)</label>
                    <input name="originalPrice" type="number" min="0" defaultValue={editingProduct.originalPrice || ""} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                  </div>
                </div>
              )}`;
content = content.replace(editPriceHtml, newEditPriceHtml);

// 5. UI: Insert pageCount (Jumlah Halaman) in Add form right after Slug URL
const addSlugHtml = `<label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug URL</label>
                  <input name="slug" placeholder="template-carousel" required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>`;
const newAddSlugHtml = addSlugHtml + `\n\n              <div className="mt-4 space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman</label>
                  <input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue={0} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
              </div>`;
content = content.replace(addSlugHtml, newAddSlugHtml);

// 6. UI: Insert pageCount in Edit form right after Slug URL
const editSlugHtml = `<label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug URL</label>
                  <input name="slug" defaultValue={editingProduct.slug} required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>`;
const newEditSlugHtml = editSlugHtml + `\n\n              <div className="mt-4 space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman</label>
                  <input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue={editingProduct.pageCount || 0} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
              </div>`;
content = content.replace(editSlugHtml, newEditSlugHtml);


fs.writeFileSync(path, content);
console.log("Admin forms patched with pageCount and originalPrice");
