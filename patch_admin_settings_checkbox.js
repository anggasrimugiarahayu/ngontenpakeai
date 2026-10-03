const fs = require('fs');
const file = 'src/app/pengaturan/AdminSettingsContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace p-4 with p-3 and rounded-xl with rounded-lg for checkboxes in Add/Edit product
code = code.replace(/p-4 bg-orange-50 dark:bg-orange-900\/10 border border-orange-100 dark:border-orange-800\/30 rounded-xl/g, 'p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-lg');
code = code.replace(/p-4 bg-blue-50 dark:bg-blue-900\/10 border border-blue-100 dark:border-blue-800\/30 rounded-xl/g, 'p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg');

fs.writeFileSync(file, code);
