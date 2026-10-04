const fs = require('fs');
let file = 'prisma/schema.prisma';
let code = fs.readFileSync(file, 'utf8');

// Revert Favorite
code = code.replace(
  'model Favorite {\n  id               String         @id @default(cuid())\n  userId           String         @map("user_id")\n  digitalProductId String?        @map("digital_product_id")\n  orderType        String         @default("EBOOK") // EBOOK, PRO_SUBSCRIPTION\n  createdAt        DateTime       @default(now()) @map("created_at")\n\n  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  product          DigitalProduct? @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)',
  'model Favorite {\n  id               String         @id @default(cuid())\n  userId           String         @map("user_id")\n  digitalProductId String         @map("digital_product_id")\n  createdAt        DateTime       @default(now()) @map("created_at")\n\n  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  product          DigitalProduct @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)'
);

// Add to Order
code = code.replace(
  'model Order {\n  id               String         @id @default(cuid())\n  userId           String         @map("user_id")\n  digitalProductId String         @map("digital_product_id")\n  amount           Int\n  status           String         @default("PENDING") // PENDING, SUCCESS, FAILED\n  paymentUrl       String?\n  midtransId       String?        @unique\n  createdAt        DateTime       @default(now()) @map("created_at")\n  updatedAt        DateTime       @updatedAt @map("updated_at")\n\n  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  product          DigitalProduct @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)',
  'model Order {\n  id               String         @id @default(cuid())\n  userId           String         @map("user_id")\n  digitalProductId String?        @map("digital_product_id")\n  orderType        String         @default("EBOOK") // EBOOK, PRO_SUBSCRIPTION\n  amount           Int\n  status           String         @default("PENDING") // PENDING, SUCCESS, FAILED\n  paymentUrl       String?\n  midtransId       String?        @unique\n  createdAt        DateTime       @default(now()) @map("created_at")\n  updatedAt        DateTime       @updatedAt @map("updated_at")\n\n  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  product          DigitalProduct? @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)'
);

fs.writeFileSync(file, code);
