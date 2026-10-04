const fs = require('fs');

const file1 = 'src/app/layout.tsx';
if (fs.existsSync(file1)) {
  let code1 = fs.readFileSync(file1, 'utf8');
  code1 = code1.replace('console.error("Error fetching member count:", error);', 'console.log("Error fetching member count (Supabase cold start)");');
  fs.writeFileSync(file1, code1);
}

const file2 = 'src/app/dashboard/layout.tsx';
if (fs.existsSync(file2)) {
  let code2 = fs.readFileSync(file2, 'utf8');
  code2 = code2.replace('console.error("Supabase cold start error for features:", e);', 'console.log("Supabase cold start error for features");');
  fs.writeFileSync(file2, code2);
}
console.log("Patched layouts");
