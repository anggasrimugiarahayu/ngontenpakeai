const fs = require('fs');
const file = 'src/app/ruang-ngonten/ClientLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

const fabRegex = /\{\/\* \s*MOBILE FLOATING ACTION BUTTON\s*Visible only on mobile, opens the drawer\s*\*\/\}\s*\{!isOpen && \(\s*<button[\s\S]*?<\/button>\s*\)\}/;

if (fabRegex.test(code)) {
  code = code.replace(fabRegex, '');
  fs.writeFileSync(file, code);
  console.log("FAB removed.");
} else {
  console.log("FAB not found.");
}
