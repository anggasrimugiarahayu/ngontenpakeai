const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Layout Fix: Move Jumlah Halaman into the grid-cols-2 before Kategori (Add Form)
const addLayoutTarget = `<div className="mt-4 space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman</label>
                  <input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue={0} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                  <select name="categoryId" required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all appearance-none">
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-3 mt-2">`;

const addLayoutReplacement = `              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman</label>
                  <input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue={0} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                  <select name="categoryId" required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all appearance-none">
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-3 mt-2">`;

content = content.replace(addLayoutTarget, addLayoutReplacement);

// If the previous replace failed because of whitespace or missing mt-2, let's try a regex
if (!content.includes(addLayoutReplacement)) {
  content = content.replace(
    /<div className="mt-4 space-y-1.5">\s*<label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman<\/label>\s*<input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue=\{0\} className="w-full [^>]+>\s*<\/div>\s*<div className="grid grid-cols-2 gap-4">\s*<div className="space-y-1.5">\s*<label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori<\/label>\s*<select name="categoryId"/s,
    `<div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman</label>
                  <input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue={0} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                  <select name="categoryId"`
  );
}

// 2. Layout Fix: Edit Form
content = content.replace(
  /<div className="mt-4 space-y-1.5">\s*<label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman<\/label>\s*<input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue=\{editingProduct.pageCount \|\| 0\} className="w-full [^>]+>\s*<\/div>\s*<div className="grid grid-cols-2 gap-4">\s*<div className="space-y-1.5">\s*<label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori<\/label>\s*<select name="categoryId" defaultValue=\{editingProduct.categoryId\}/s,
  `<div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman</label>
                  <input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue={editingProduct.pageCount || 0} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                  <select name="categoryId" defaultValue={editingProduct.categoryId}`
);


// 3. Image Preview Bugs
// Add Form Images
content = content.replace(
  /<img id="preview-coverUrlInput" src=\{undefined\}/g,
  '<img id="preview-coverUrlInput" src={uploadedUrls["coverUrlInput"] || undefined}'
);
content = content.replace(
  /<img id="preview-coverUrl2Input" src=\{undefined\}/g,
  '<img id="preview-coverUrl2Input" src={uploadedUrls["coverUrl2Input"] || undefined}'
);
content = content.replace(
  /<img id="preview-coverUrl3Input" src=\{undefined\}/g,
  '<img id="preview-coverUrl3Input" src={uploadedUrls["coverUrl3Input"] || undefined}'
);

// Edit Form Images
content = content.replace(
  /<img id="preview-editCoverUrlInput" src=\{editingProduct.coverUrl \|\| undefined\} className=\{`/g,
  '<img id="preview-editCoverUrlInput" src={uploadedUrls["editCoverUrlInput"] || editingProduct.coverUrl || undefined} className={`'
);
content = content.replace(
  /<img id="preview-editCoverUrl2Input" src=\{editingProduct.coverUrl2 \|\| undefined\} className=\{`/g,
  '<img id="preview-editCoverUrl2Input" src={uploadedUrls["editCoverUrl2Input"] || editingProduct.coverUrl2 || undefined} className={`'
);
content = content.replace(
  /<img id="preview-editCoverUrl3Input" src=\{editingProduct.coverUrl3 \|\| undefined\} className=\{`/g,
  '<img id="preview-editCoverUrl3Input" src={uploadedUrls["editCoverUrl3Input"] || editingProduct.coverUrl3 || undefined} className={`'
);

// Also we need to make sure the hidden state is correct. If uploadedUrls has the URL, we shouldn't hide it.
// Add Form hidden fix:
// className="hidden w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300"
content = content.replace(
  /<img id="preview-coverUrlInput" src=\{uploadedUrls\["coverUrlInput"\] \|\| undefined\} className="hidden /g,
  '<img id="preview-coverUrlInput" src={uploadedUrls["coverUrlInput"] || undefined} className={`${uploadedUrls["coverUrlInput"] ? "" : "hidden"} '
);
content = content.replace(
  /<img id="preview-coverUrl2Input" src=\{uploadedUrls\["coverUrl2Input"\] \|\| undefined\} className="hidden /g,
  '<img id="preview-coverUrl2Input" src={uploadedUrls["coverUrl2Input"] || undefined} className={`${uploadedUrls["coverUrl2Input"] ? "" : "hidden"} '
);
content = content.replace(
  /<img id="preview-coverUrl3Input" src=\{uploadedUrls\["coverUrl3Input"\] \|\| undefined\} className="hidden /g,
  '<img id="preview-coverUrl3Input" src={uploadedUrls["coverUrl3Input"] || undefined} className={`${uploadedUrls["coverUrl3Input"] ? "" : "hidden"} '
);

// Edit Form hidden fix:
content = content.replace(
  /\$\{editingProduct\.coverUrl \? '' : 'hidden'\}/g,
  '${uploadedUrls["editCoverUrlInput"] || editingProduct.coverUrl ? "" : "hidden"}'
);
content = content.replace(
  /\$\{editingProduct\.coverUrl2 \? '' : 'hidden'\}/g,
  '${uploadedUrls["editCoverUrl2Input"] || editingProduct.coverUrl2 ? "" : "hidden"}'
);
content = content.replace(
  /\$\{editingProduct\.coverUrl3 \? '' : 'hidden'\}/g,
  '${uploadedUrls["editCoverUrl3Input"] || editingProduct.coverUrl3 ? "" : "hidden"}'
);

fs.writeFileSync(path, content);
console.log("Patched layout and image previews");
