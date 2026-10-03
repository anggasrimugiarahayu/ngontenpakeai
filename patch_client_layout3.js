const fs = require('fs');
const file = 'src/app/ruang-ngonten/ClientLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const isLocked = !isDashboard && \(\(!hasBlueprint/g,
  `const isLocked = !isDashboard && !isSettingsArea && ((!hasBlueprint`
);

fs.writeFileSync(file, code);
