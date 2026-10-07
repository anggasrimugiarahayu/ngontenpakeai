const fs = require('fs');
const path = './src/app/actions/checkout.ts';
let content = fs.readFileSync(path, 'utf8');

const validatePromoCodeAction = `
export async function validatePromoCodeAction(code: string, productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const voucher = await prisma.voucher.findFirst({
    where: {
      code: code.toUpperCase(),
      digitalProductId: productId,
      isActive: true
    }
  });

  if (!voucher) {
    return { success: false, message: "Kode promo tidak valid atau sudah kadaluarsa." };
  }

  return {
    success: true,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue
  };
}
`;

if (!content.includes('validatePromoCodeAction')) {
  content += '\n' + validatePromoCodeAction;
  fs.writeFileSync(path, content);
  console.log("Added validatePromoCodeAction!");
}
