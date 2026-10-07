const fs = require('fs');
const path = './prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

const voucherModel = `
model Voucher {
  id               String         @id @default(cuid())
  code             String
  discountType     String         @default("PERCENTAGE")
  discountValue    Int            
  isActive         Boolean        @default(true)
  digitalProductId String         @map("digital_product_id")
  createdAt        DateTime       @default(now()) @map("created_at")

  product          DigitalProduct @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)

  @@unique([code, digitalProductId])
  @@map("vouchers")
}
`;

if (!content.includes('model Voucher')) {
  content += '\n' + voucherModel;
}

if (!content.includes('voucherCode')) {
  content = content.replace(
    /addonIds         String\[\]       @default\(\[\]\)/,
    'addonIds         String[]       @default([])\n  voucherCode      String?        @map("voucher_code")\n  discountAmount   Int            @default(0) @map("discount_amount")'
  );
}

// Add vouchers relation specifically to DigitalProduct
if (!content.includes('vouchers         Voucher[]')) {
  // Let's find "model DigitalProduct" and add it there
  const digitalProductRegex = /model DigitalProduct \{[\s\S]*?id               String         @id @default\(cuid\(\)\)/;
  content = content.replace(
    digitalProductRegex,
    (match) => match.replace('@id @default(cuid())', '@id @default(cuid())\n  vouchers         Voucher[]')
  );
}

fs.writeFileSync(path, content);
console.log("Patched schema.prisma with Voucher correctly!");
