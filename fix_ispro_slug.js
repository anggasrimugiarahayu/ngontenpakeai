const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace isPro definition in slug
code = code.replace(
  'const isPro = session?.user?.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";',
  'const userObj = await prisma.user.findUnique({ where: { id: userId } });\n  const isPro = userObj?.role === "PRO" || session?.user?.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";'
);

fs.writeFileSync(file, code);
console.log("isPro fixed in slug!");
