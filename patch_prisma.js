const fs = require('fs');
const file = 'prisma/schema.prisma';
let schema = fs.readFileSync(file, 'utf8');

// Add price and relationships to DigitalProduct
const prodSearch = `  categoryId  String          @map("category_id")
  title       String`;
const prodReplacement = `  categoryId  String          @map("category_id")
  title       String
  price       Int             @default(0)`;
schema = schema.replace(prodSearch, prodReplacement);

const prodRelSearch = `  reviews     Review[]

  @@map("digital_products")`;
const prodRelReplacement = `  reviews     Review[]
  orders      Order[]
  analytics   ProductAnalytics[]

  @@map("digital_products")`;
schema = schema.replace(prodRelSearch, prodRelReplacement);

// Add orders to User
const userRelSearch = `  favorites        Favorite[]
  reviews          Review[]

  @@map("users")`;
const userRelReplacement = `  favorites        Favorite[]
  reviews          Review[]
  orders           Order[]

  @@map("users")`;
schema = schema.replace(userRelSearch, userRelReplacement);

// Append Order and ProductAnalytics models
schema += `

model Order {
  id               String         @id @default(cuid())
  userId           String         @map("user_id")
  digitalProductId String         @map("digital_product_id")
  amount           Int
  status           String         @default("PENDING") // PENDING, SUCCESS, FAILED
  paymentUrl       String?
  midtransId       String?        @unique
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")

  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  product          DigitalProduct @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)

  @@map("orders")
}

model ProductAnalytics {
  id               String         @id @default(cuid())
  digitalProductId String         @map("digital_product_id")
  date             DateTime       @db.Date
  views            Int            @default(0)
  clicks           Int            @default(0)
  
  product          DigitalProduct @relation(fields: [digitalProductId], references: [id], onDelete: Cascade)

  @@unique([digitalProductId, date])
  @@map("product_analytics")
}
`;

fs.writeFileSync(file, schema);
