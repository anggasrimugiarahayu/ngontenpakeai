const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { mutate } from "swr";')) {
  content = content.replace('import { useState } from "react";', 'import { useState } from "react";\\nimport { mutate } from "swr";');
}

// 1. After createProduct
content = content.replace(
  /originalPrice: formData\.get\("originalPrice"\) \? parseInt\(formData\.get\("originalPrice"\) as string\) : 0\n              \}\);\n              setLoading\(false\);/,
  'originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0\n              });\n              mutate("pengaturan");\n              setLoading(false);'
);

// 2. After updateProduct
content = content.replace(
  /originalPrice: formData\.get\("originalPrice"\) \? parseInt\(formData\.get\("originalPrice"\) as string\) : 0\n              \}\);\n              setLoading\(false\);/,
  'originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0\n              });\n              mutate("pengaturan");\n              setLoading(false);'
);

// Let's globally add mutate("pengaturan") before all setLoading(false) just in case?
// No, let's just do it for update and create product.

fs.writeFileSync(path, content);
console.log("Patched mutate 2");
