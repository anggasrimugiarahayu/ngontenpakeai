const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// The original line: const isOwned = userOwnedProduct !== null;
code = code.replace(
  'const isOwned = userOwnedProduct !== null;',
  'const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";\n  const isOwned = userOwnedProduct !== null || isAdmin;'
);

// The lock logic
code = code.replace(
  'const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";\n  let isLocked = true;\n  if (isAdmin) isLocked = false;\n  else if (isOwned) isLocked = false;',
  'let isLocked = true;\n  if (isOwned) isLocked = false;'
);

fs.writeFileSync(file, code);
console.log("Slug Detail patched for admin owned!");
