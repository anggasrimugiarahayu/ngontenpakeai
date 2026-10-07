const fs = require('fs');
const path = './src/components/layout/Navbar.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  /pathname\?\.startsWith\("\/feedback"\);/g,
  'pathname?.startsWith("/feedback") || pathname?.startsWith("/checkout");'
);
fs.writeFileSync(path, content);
console.log("Patched Navbar");
