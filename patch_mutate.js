const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { mutate } from "swr";')) {
  content = content.replace('import { useState } from "react";', 'import { useState } from "react";\\nimport { mutate } from "swr";');
}

// Replace occurrences of setLoading(false); after await actions with mutate("pengaturan"); setLoading(false);
// We can just globally replace setLoading(false); but let's be safe.
// We'll replace it inside the product actions:
content = content.replace(
  'await createProduct({',
  'await createProduct({'
);

// Actually, just find `setLoading(false);` and replace it with `mutate("pengaturan");\n              setLoading(false);`
// But wait, there are many. Let's do it with a regex for all `setLoading(false);`
// Let's check how many there are:
let lines = content.split('\\n');
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('setLoading(false);') && 
     (lines[i-1].includes('await ') || lines[i-2]?.includes('});') || lines[i-1].includes('});'))) {
    lines[i] = lines[i].replace('setLoading(false);', 'mutate("pengaturan"); setLoading(false);');
  }
}

// Special case for updateProduct since we modified it:
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('setLoading(false);') && lines[i-1] && lines[i-1].includes('setEditingProduct(null);')) {
     lines[i] = lines[i].replace('setLoading(false);', 'mutate("pengaturan"); setLoading(false);');
  }
}

fs.writeFileSync(path, lines.join('\\n'));
console.log("Patched mutate");
