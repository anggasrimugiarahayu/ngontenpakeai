const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
pkg.scripts.build = "prisma generate && next build";
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log("package.json fixed");
