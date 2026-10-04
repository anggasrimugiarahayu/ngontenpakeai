const fs = require('fs');
let file1 = 'src/app/ruang-belajar/[slug]/page.tsx';
let file2 = 'src/app/ruang-belajar/page.tsx';

if (fs.existsSync(file1)) {
  let code = fs.readFileSync(file1, 'utf8');
  code = code.replace(/Beli Eceran/g, 'Beli Satuan');
  fs.writeFileSync(file1, code);
}

if (fs.existsSync(file2)) {
  let code = fs.readFileSync(file2, 'utf8');
  code = code.replace(/Beli Eceran/g, 'Beli Satuan');
  fs.writeFileSync(file2, code);
}
console.log("Fixed Beli Eceran to Beli Satuan");
