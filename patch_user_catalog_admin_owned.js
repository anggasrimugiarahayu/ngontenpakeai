const fs = require('fs');
let file = 'src/app/ruang-belajar/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the isOwned definition to include isAdmin
code = code.replace(
  'const isOwned = ownedProductIds.has(ebook.id);',
  'const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";\n              const isOwned = ownedProductIds.has(ebook.id) || isAdmin;'
);

// Remove the redundant isAdmin declaration below it
code = code.replace(
  '// For Admin, everything is unlocked. For others, ONLY if they own it.\n              const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";\n              let isLocked = true;\n              if (isAdmin) isLocked = false;\n              else if (isOwned) isLocked = false;',
  '// For Admin, everything is unlocked. For others, ONLY if they own it.\n              let isLocked = true;\n              if (isOwned) isLocked = false;'
);

fs.writeFileSync(file, code);
console.log("User Catalog patched for admin owned!");
