const fs = require('fs');
const path = './prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('pageCount   Int?')) {
  content = content.replace(
    'price       Int             @default(0)',
    'price       Int             @default(0)\n  originalPrice Int?          @default(0)\n  pageCount   Int?            @default(0)'
  );
  fs.writeFileSync(path, content);
  console.log("Schema patched with pageCount and originalPrice");
}
