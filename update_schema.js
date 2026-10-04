const fs = require('fs');
let file = 'prisma/schema.prisma';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'digitalProductId String         @map("digital_product_id")',
  'digitalProductId String?        @map("digital_product_id")\n  orderType        String         @default("EBOOK") // EBOOK, PRO_SUBSCRIPTION'
);

// We need to make the relation optional too
code = code.replace(
  'product          DigitalProduct @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)',
  'product          DigitalProduct? @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)'
);

fs.writeFileSync(file, code);
