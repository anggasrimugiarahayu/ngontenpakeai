const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the invalid className string for Add Form
content = content.replace(
  /className="(\$\{[^}]+\})\s(w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300)"/g,
  'className={`$1 $2`}'
);

fs.writeFileSync(path, content);
console.log("Syntax fixed");
