const fs = require('fs');
let file1 = 'src/app/ruang-belajar/[slug]/page.tsx';

let code = fs.readFileSync(file1, 'utf8');

// Replace /#pricing with /?pricing=true
code = code.replace(/href="\/\#pricing"/g, 'href="/?pricing=true"');

// Replace Upgrade PRO (Akses Semua E-book) with Upgrade PRO (Akses Semua E-book PRO)
code = code.replace(/Upgrade PRO \(Akses Semua E-book\)/g, 'Upgrade PRO (Akses Semua E-book PRO)');

fs.writeFileSync(file1, code);

// And in ruang-belajar/page.tsx
let file2 = 'src/app/ruang-belajar/page.tsx';
if (fs.existsSync(file2)) {
  let code2 = fs.readFileSync(file2, 'utf8');
  code2 = code2.replace(/Upgrade PRO \(Akses Semua E-book\)/g, 'Upgrade PRO (Akses Semua E-book PRO)');
  code2 = code2.replace(/href="\/\#pricing"/g, 'href="/?pricing=true"');
  fs.writeFileSync(file2, code2);
}

console.log("Fixed link and text");
