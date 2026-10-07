const fs = require('fs');

function patchFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');

  content = content.replace(/border-emerald-500/g, 'border-orange-500');
  content = content.replace(/text-emerald-500/g, 'text-orange-500');
  content = content.replace(/hover:bg-emerald-50\b/g, 'hover:bg-orange-50');
  content = content.replace(/dark:hover:bg-emerald-500\/10/g, 'dark:hover:bg-orange-500/10');
  
  content = content.replace(/bg-emerald-500/g, 'bg-orange-500');
  content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-orange-600');
  content = content.replace(/shadow-emerald-500\/20/g, 'shadow-orange-500/20');
  content = content.replace(/focus:ring-emerald-500/g, 'focus:ring-orange-500');
  
  fs.writeFileSync(filepath, content);
}

patchFile('./src/app/(app)/dashboard/PrintModal.tsx');
patchFile('./src/app/(app)/dashboard/WhatsAppModal.tsx');
console.log("Patched modals!");
