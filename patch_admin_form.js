const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// For Edit Form
const editFieldsHtml = `
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa</label>
                  <input name="language" defaultValue={editingProduct.language || 'Indonesia'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</label>
                  <input name="formatType" defaultValue={editingProduct.formatType || 'PDF / Digital'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>
`;

// For Add Form
const addFieldsHtml = `
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa</label>
                  <input name="language" defaultValue="Indonesia" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</label>
                  <input name="formatType" defaultValue="PDF / Digital" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>
`;

// Inject into updateProduct form data collection
content = content.replace(
  'accessLevel: formData.get("accessLevel") as string,',
  'accessLevel: formData.get("accessLevel") as string,\n                language: formData.get("language") as string,\n                formatType: formData.get("formatType") as string,'
);

// Inject into createProduct form data collection
content = content.replace(
  'accessLevel: formData.get("accessLevel") as string,\n                isDownloadable: formData.get("isDownloadable") === "on"',
  'accessLevel: formData.get("accessLevel") as string,\n                isDownloadable: formData.get("isDownloadable") === "on",\n                language: formData.get("language") as string,\n                formatType: formData.get("formatType") as string'
);

// Inject HTML into Edit form
const editFormTarget = `<div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL AKSES E-BOOK</label>
                <select name="accessLevel" value={editingProduct.accessLevel || "FREE"}`;
if (content.includes(editFormTarget)) {
  content = content.replace(editFormTarget, editFieldsHtml + '\n              ' + editFormTarget);
}

// Inject HTML into Add form
const addFormTarget = `<div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL AKSES E-BOOK</label>
                <select name="accessLevel" value={addAccessLevel}`;
if (content.includes(addFormTarget)) {
  content = content.replace(addFormTarget, addFieldsHtml + '\n              ' + addFormTarget);
}

fs.writeFileSync(path, content);
console.log("Forms patched");
