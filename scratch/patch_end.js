const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<\/div>\n\s*\}\)\}/g,
  `</div>
              );
            })}`
);

fs.writeFileSync(path, content);
console.log("Patched end");
