const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { headers } from "next/headers";')) {
  code = code.replace(
    'import { notFound, redirect } from "next/navigation";',
    'import { notFound, redirect } from "next/navigation";\nimport { headers } from "next/headers";'
  );
  fs.writeFileSync(file, code);
}
console.log("Fixed headers import");
