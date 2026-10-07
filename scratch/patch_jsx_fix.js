const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/className="\$\{([^\}]+)\}\s*(w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300)"/g, 'className={`\\${$1} $2`}');

fs.writeFileSync(path, content);
console.log("Fixed JSX syntax");
