const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Hide "Edit" and "Hapus" text on mobile
content = content.replace(
  /<Edit className="w-3 h-3" \/> <span>Edit<\/span>/g,
  '<Edit className="w-3 h-3" /> <span className="hidden sm:inline">Edit</span>'
);
content = content.replace(
  /<Trash2 className="w-3 h-3" \/> <span>Hapus<\/span>/g,
  '<Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Hapus</span>'
);

// 2. Hide "No file chosen"
// The class is `block w-full text-[10px] text-gray-500 file:mr-2 ...`
content = content.replace(
  /className="block w-full text-\[10px\] text-gray-500 file:mr-2 /g,
  'className="block w-full text-[10px] text-transparent file:mr-2 '
);

// 3. Add line-through to "originalPrice" inputs
// Find `<input name="originalPrice" ... className="..." />` and add `line-through`
// Add product input:
content = content.replace(
  /<input name="originalPrice" type="number" min="0" placeholder="Contoh: 99000" className="w-full bg-gray-50 dark:bg-black\/20 border border-gray-200 dark:border-white\/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" \/>/g,
  '<input name="originalPrice" type="number" min="0" placeholder="Contoh: 99000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all line-through" />'
);

// Edit product input:
content = content.replace(
  /<input name="originalPrice" type="number" min="0" defaultValue=\{editingProduct.originalPrice \|\| ""\} placeholder="Contoh: 99000" className="w-full bg-gray-50 dark:bg-black\/20 border border-gray-200 dark:border-white\/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" \/>/g,
  '<input name="originalPrice" type="number" min="0" defaultValue={editingProduct.originalPrice || ""} placeholder="Contoh: 99000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all line-through" />'
);

fs.writeFileSync(path, content);
console.log("Patched!");
