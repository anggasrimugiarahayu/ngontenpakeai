const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace createProduct
content = content.replace(
  /language: formData\.get\("language"\) as string,[\s]*formatType: formData\.get\("formatType"\) as string/,
  'language: formData.get("language") as string,\n                formatType: formData.get("formatType") as string,\n                author: formData.get("author") as string'
);

// Replace updateProduct
content = content.replace(
  /accessLevel: formData\.get\("accessLevel"\) as string,/,
  'accessLevel: formData.get("accessLevel") as string,\n                language: formData.get("language") as string,\n                formatType: formData.get("formatType") as string,\n                author: formData.get("author") as string,'
);

// Replace UI inputs (we find the grid-cols-2 that we added and replace it with grid-cols-3 and the new input)
// For Add Form
const oldAddHtml = `<div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa</label>
                  <input name="language" defaultValue="Indonesia" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</label>
                  <input name="formatType" defaultValue="PDF / Digital" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>`;

const newAddHtml = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Penulis</label>
                  <input name="author" defaultValue="Admin" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa</label>
                  <input name="language" defaultValue="Indonesia" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</label>
                  <input name="formatType" defaultValue="PDF / Digital" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>`;

content = content.replace(oldAddHtml, newAddHtml);

// For Edit Form
const oldEditHtml = `<div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa</label>
                  <input name="language" defaultValue={editingProduct.language || 'Indonesia'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</label>
                  <input name="formatType" defaultValue={editingProduct.formatType || 'PDF / Digital'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>`;

const newEditHtml = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Penulis</label>
                  <input name="author" defaultValue={editingProduct.author || 'Admin'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa</label>
                  <input name="language" defaultValue={editingProduct.language || 'Indonesia'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</label>
                  <input name="formatType" defaultValue={editingProduct.formatType || 'PDF / Digital'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>`;

content = content.replace(oldEditHtml, newEditHtml);

fs.writeFileSync(path, content);
console.log("Admin forms patched with author and fixed updateProduct");
