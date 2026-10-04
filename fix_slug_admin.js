const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const isOwned = ownedProductIds.has(ebook.id);',
  'const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";\n  const isOwned = ownedProductIds.has(ebook.id) || isAdmin;'
);

fs.writeFileSync(file, code);
console.log("Admin fix applied to slug page!");
