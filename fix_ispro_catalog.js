const fs = require('fs');
let file = 'src/app/ruang-belajar/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace isPro definition in catalog
code = code.replace(
  'let isPro = false;\n\n  if (session?.user?.email) {\n    isPro = session.user.email.toLowerCase() === "anggasrimugiarahayu@gmail.com";\n  }',
  'let isPro = false;\n  if (session?.user?.id) {\n    const userObj = await prisma.user.findUnique({ where: { id: session.user.id } });\n    isPro = userObj?.role === "PRO" || session.user.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";\n  }'
);

fs.writeFileSync(file, code);
console.log("isPro fixed in catalog!");
