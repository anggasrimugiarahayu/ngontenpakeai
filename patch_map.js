const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/ClientLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\{\(isSettingsArea \? SETTINGS_NAV : isDashboard \? GLOBAL_NAV : mappedTools\)\.map\(\(tool\) => \{/g,
  `{itemsToRender.map((tool) => {`
);

fs.writeFileSync(path, content);
console.log("Patched map logic!");
