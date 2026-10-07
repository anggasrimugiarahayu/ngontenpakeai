const fs = require('fs');
const path = './src/app/(app)/pengaturan/admin-actions.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /export async function getProducts\(\) \{\n\s*return await prisma\.digitalProduct\.findMany\(\{ include: \{ category: true, vouchers: true \}, orderBy: \{ createdAt: 'desc' \} \}\);\n\}/,
  `export async function getProducts() {
  return await prisma.digitalProduct.findMany({ 
    include: { 
      category: true, 
      vouchers: true, 
      reviews: { select: { rating: true } }, 
      _count: { select: { owners: true } } 
    }, 
    orderBy: { createdAt: 'desc' } 
  });
}`
);

fs.writeFileSync(path, content);
console.log("Patched admin-actions.ts");
