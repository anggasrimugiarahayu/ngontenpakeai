const fs = require('fs');
const file = 'src/app/ruang-ngonten/ClientLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldLine = `const isDashboard = pathname === '/ruang-ngonten' || pathname === '/ruang-ngonten/' || pathname.startsWith('/ruang-belajar') || pathname.startsWith('/ruang-growing');`;
const newLine = `const isDashboard = pathname === '/ruang-ngonten' || pathname === '/ruang-ngonten/' || pathname.startsWith('/ruang-belajar') || pathname.startsWith('/ruang-growing') || pathname.startsWith('/pengaturan') || pathname.startsWith('/bantuan') || pathname.startsWith('/feedback');`;

if (code.includes(oldLine)) {
  code = code.replace(oldLine, newLine);
  fs.writeFileSync(file, code);
  console.log("Successfully updated ClientLayout.tsx");
} else {
  console.log("Could not find the exact line in ClientLayout.tsx");
}
