const fs = require('fs');

// Fix in payment.ts
let file1 = 'src/app/actions/payment.ts';
let code1 = fs.readFileSync(file1, 'utf8');

if (code1.includes('headers().get("host")')) {
  code1 = code1.replace(
    'headers().get("host")',
    '(await headers()).get("host")'
  );
  fs.writeFileSync(file1, code1);
}

// Fix in [slug]/page.tsx
let file2 = 'src/app/ruang-belajar/[slug]/page.tsx';
let code2 = fs.readFileSync(file2, 'utf8');

if (code2.includes('headers().get("host")')) {
  // Replace all occurrences of headers().get
  code2 = code2.replace(/headers\(\)\.get\("host"\)/g, '(await headers()).get("host")');
  fs.writeFileSync(file2, code2);
}

console.log("Fixed headers() await");
