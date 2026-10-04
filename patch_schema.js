const fs = require('fs');

let schemaFile = 'prisma/schema.prisma';
let schemaCode = fs.readFileSync(schemaFile, 'utf8');

// Add UserOwnedProduct model
const userOwnedProductModel = `
model UserOwnedProduct {
  id               String         @id @default(cuid())
  userId           String         @map("user_id")
  digitalProductId String         @map("digital_product_id")
  createdAt        DateTime       @default(now()) @map("created_at")

  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  product          DigitalProduct @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)

  @@unique([userId, digitalProductId])
  @@map("user_owned_products")
}
`;

if (!schemaCode.includes('UserOwnedProduct')) {
  schemaCode += userOwnedProductModel;
  
  // Add relation to User
  schemaCode = schemaCode.replace(
    'orders           Order[]',
    'orders           Order[]\n  ownedProducts    UserOwnedProduct[]'
  );
  
  // Add accessLevel and ownedProducts to DigitalProduct
  schemaCode = schemaCode.replace(
    'isProOnly   Boolean         @default(false)',
    'isProOnly   Boolean         @default(false)\n  accessLevel String          @default("FREE")'
  );
  
  schemaCode = schemaCode.replace(
    'analytics   ProductAnalytics[]',
    'analytics   ProductAnalytics[]\n  owners      UserOwnedProduct[]'
  );
}

fs.writeFileSync(schemaFile, schemaCode);
console.log("Prisma schema patched!");
