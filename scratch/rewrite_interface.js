const fs = require('fs');
const path = './src/app/(app)/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /interface CheckoutClientProps \{[\s\S]*?availableAddons\?\:.*?\[\];\n\}/;

const newInterface = `interface CheckoutClientProps {
  type: "EBOOK" | "PRO_BASIC" | "PRO_TOOLS" | "PRO_LENGKAP";
  productId?: string;
  itemName: string;
  itemDescription: string;
  baseAmount: number;
  clientKey: string;
  isProduction: boolean;
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  productImage?: string;
  existingPendingOrder?: { token: string, orderId: string, expiryTime: string, paymentMethodKey: string } | null;
  availableAddons?: { id: string, title: string, coverUrl: string | null, price: number }[];
  includedAddons?: { id: string, title: string, coverUrl: string | null, price: number }[];
}`;

content = content.replace(/interface CheckoutClientProps \{[\s\S]*?\}\n/, newInterface + '\n');
fs.writeFileSync(path, content);
console.log("Rewrote interface");
