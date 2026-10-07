const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/Ganti "view" menjadi "preview"/g, 'Ganti &quot;view&quot; menjadi &quot;preview&quot;');

fs.writeFileSync(path, content);
console.log("Fixed eslint errors");
