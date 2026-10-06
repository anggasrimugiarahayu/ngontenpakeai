const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/ClientLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\{isToolsMode && \(\n\s*\{\/\* BACK TO DASHBOARD BUTTON \(BOTTOM\) \*\/\}/g, 
  `{isToolsMode && (\n          <> {/* BACK TO DASHBOARD BUTTON (BOTTOM) */}`);
  
content = content.replace(/\{isToolsMode && \(\n\s*\{\/\* BACK TO DASHBOARD \(BOTTOM\) \*\/\}/g, 
  `{isToolsMode && (\n            <> {/* BACK TO DASHBOARD (BOTTOM) */}`);
  
content = content.replace(/<\/div>\n\s*\)\}/g, `</div></>\n          )}`);

fs.writeFileSync(path, content);
console.log("Fixed JSX");
