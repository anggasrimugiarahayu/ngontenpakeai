const fs = require('fs');
const path = './prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('author      String?')) {
  content = content.replace(
    'formatType  String?         @default("PDF / Digital")',
    'formatType  String?         @default("PDF / Digital")\n  author      String?         @default("Admin")'
  );
  fs.writeFileSync(path, content);
  console.log("Schema patched with author");
}
