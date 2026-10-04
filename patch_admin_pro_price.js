const fs = require('fs');
let file = 'src/app/pengaturan/AdminSettingsContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// Show price input for PRO as well (Add Form)
code = code.replace(
  '{addAccessLevel === "PREMIUM" && (',
  '{(addAccessLevel === "PREMIUM" || addAccessLevel === "PRO") && ('
);

// Show price input for PRO as well (Edit Form)
code = code.replace(
  '{editingProduct.accessLevel === "PREMIUM" && (',
  '{(editingProduct.accessLevel === "PREMIUM" || editingProduct.accessLevel === "PRO") && ('
);

// Admin Card Footer: Show price for both PRO and PREMIUM
code = code.replace(
  "{prod.accessLevel === 'PREMIUM' ? \\`Rp \\${(prod.price || 0).toLocaleString('id-ID')}\\` : (prod.isDownloadable ? \"Bisa di-download\" : \"Hanya Baca\")}",
  "{(prod.accessLevel === 'PREMIUM' || prod.accessLevel === 'PRO') ? \\`Rp \\${(prod.price || 0).toLocaleString('id-ID')}\\` : (prod.isDownloadable ? \"Bisa di-download\" : \"Hanya Baca\")}"
);

fs.writeFileSync(file, code);
console.log("Admin Settings Patched for PRO Price!");
