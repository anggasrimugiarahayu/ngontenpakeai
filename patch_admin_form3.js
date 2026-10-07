const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// For updateProduct
content = content.replace(
  'fileUrl: formData.get("fileUrl"),',
  'fileUrl: formData.get("fileUrl"),\n                language: formData.get("language") as string,\n                formatType: formData.get("formatType") as string,\n                author: formData.get("author") as string,'
);

fs.writeFileSync(path, content);
console.log("Patched updateProduct specifically");
