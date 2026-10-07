const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /if \(confirm\('Yakin ingin menghapus E-book ini\?'\)\) \{\n\s*await deleteProduct\(prod\.id\);\n\s*mutate\("pengaturan"\);\n\s*\}/g,
  `if (confirm('Yakin ingin menghapus E-book ini?')) {
                            setLoading(true);
                            await deleteProduct(prod.id);
                            mutate("pengaturan");
                            setLoading(false);
                          }`
);

fs.writeFileSync(path, content);
console.log("Patched loading state");
