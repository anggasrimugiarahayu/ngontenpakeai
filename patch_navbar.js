const fs = require('fs');
const file = 'src/components/layout/Navbar.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldLine = 'const isWorkspace = pathname?.startsWith("/ruang-ngonten") || pathname?.startsWith("/ruang-belajar") || pathname?.startsWith("/ruang-growing");';
const newLine = 'const isWorkspace = pathname?.startsWith("/ruang-ngonten") || pathname?.startsWith("/ruang-belajar") || pathname?.startsWith("/ruang-growing") || pathname?.startsWith("/pengaturan") || pathname?.startsWith("/bantuan") || pathname?.startsWith("/feedback");';

if (code.includes(oldLine)) {
  code = code.replace(oldLine, newLine);
  fs.writeFileSync(file, code);
  console.log("Navbar patched");
} else {
  console.log("Could not find the exact line in Navbar.");
}
