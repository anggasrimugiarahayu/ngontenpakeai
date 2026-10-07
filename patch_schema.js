const fs = require('fs');
const path = './prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('language String?')) {
  content = content.replace(
    'isProOnly   Boolean         @default(false)',
    'language    String?         @default("Indonesia")\n  formatType  String?         @default("PDF / Digital")\n  isProOnly   Boolean         @default(false)'
  );
  fs.writeFileSync(path, content);
  console.log("Schema patched");
}
