const fs = require('fs');

let file = 'src/app/pengaturan/AdminSettingsContent.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",',
  'isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",\n                price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,'
);

code = code.replace(
  'isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",',
  'isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",\n                price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,'
);

fs.writeFileSync(file, code);
console.log("Admin Submit Patched for Price!");
