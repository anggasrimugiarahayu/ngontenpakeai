const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/RuangBelajarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\(\{reviewCount > 0 \? `\$\{reviewCount\} ulasan` : "Belum ada ulasan"\}\)/g,
  '({reviewCount} ulasan)'
);

fs.writeFileSync(path, content);
console.log("Patched ulasan");
