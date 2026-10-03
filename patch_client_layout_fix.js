const fs = require('fs');
const file = 'src/app/ruang-ngonten/ClientLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove it from line 67
const declLine = "const isSettingsArea = pathname.startsWith('/pengaturan') || pathname.startsWith('/bantuan') || pathname.startsWith('/feedback');";
code = code.replace(declLine, "");

// 2. Put it before backHref (which is around line 52)
const backHrefLine = "const backHref = isSettingsArea ? '/' : (pathSegments.length > 1 ? '/' + pathSegments[0] : '/');";
code = code.replace(backHrefLine, declLine + "\n  " + backHrefLine);

fs.writeFileSync(file, code);
console.log("Fixed isSettingsArea declaration order.");
