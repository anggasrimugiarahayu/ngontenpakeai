const fs = require('fs');
const path = './src/app/(app)/pengaturan/SettingsTabs.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\{ id: "belajar", label: "Ruang Belajar" \},/g,
  '{ id: "belajar", label: "Ruang Belajar" },\n    { id: "pricing", label: "Pricing Paket" },'
);

fs.writeFileSync(path, content);
console.log("Patched admin tabs");
