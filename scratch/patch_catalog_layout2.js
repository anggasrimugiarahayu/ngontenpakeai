const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/RuangBelajarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add gap-x-2 to the container
content = content.replace(
  /<div className="mt-auto pt-2 flex items-end justify-between">/g,
  '<div className="mt-auto pt-2 flex items-end justify-between gap-x-2">'
);

fs.writeFileSync(path, content);
console.log("Patched catalog layout gap");
