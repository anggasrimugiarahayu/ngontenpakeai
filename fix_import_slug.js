const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { claimFreeEbook } from "../actions";')) {
  code = code.replace(
    'import { auth } from "@/auth";',
    'import { auth } from "@/auth";\nimport { claimFreeEbook } from "../actions";'
  );
  fs.writeFileSync(file, code);
  console.log("Import fixed!");
} else {
  console.log("Import already exists.");
}
