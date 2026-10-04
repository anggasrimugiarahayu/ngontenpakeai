const fs = require('fs');
let file = 'src/app/actions/payment.ts';
let code = fs.readFileSync(file, 'utf8');

// Add headers import if not present
if (!code.includes('import { headers }')) {
  code = code.replace(
    'import { revalidatePath } from "next/cache";',
    'import { revalidatePath } from "next/cache";\nimport { headers } from "next/headers";\nimport { coreApi } from "@/lib/midtrans";'
  );
}

// Update the redirect URL logic
code = code.replace(
  'finish: data.redirectUrl || "https://ngontenpakeai.com/ruang-belajar"',
  `finish: data.redirectUrl || (headers().get("host")?.includes("localhost") ? "http://localhost:3000/ruang-belajar" : "https://ngontenpakeai.com/ruang-belajar")`
);

// Add verifyPayment action
const verifyAction = `
export async function verifyPayment(orderId: string) {
  try {
    const statusResponse = await coreApi.transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let finalStatus = "PENDING";
    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") finalStatus = "PENDING";
      else if (fraudStatus === "accept") finalStatus = "SUCCESS";
    } else if (transactionStatus === "settlement") {
      finalStatus = "SUCCESS";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      finalStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      finalStatus = "PENDING";
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false };

    if (order.status !== "SUCCESS" && finalStatus === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: orderId }, data: { status: "SUCCESS" } });

        if (order.orderType === "EBOOK" && order.digitalProductId) {
          await tx.userOwnedProduct.upsert({
            where: { userId_digitalProductId: { userId: order.userId, digitalProductId: order.digitalProductId } },
            update: {},
            create: { userId: order.userId, digitalProductId: order.digitalProductId }
          });
        } else if (order.orderType === "PRO_BASIC" || order.orderType === "PRO_TOOLS" || order.orderType === "PRO_LENGKAP") {
          await tx.user.update({ where: { id: order.userId }, data: { role: "PRO" } });
        }
      });
      revalidatePath("/ruang-belajar");
      return { success: true, status: finalStatus, justUpdated: true };
    }
    
    return { success: true, status: order.status, justUpdated: false };
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false };
  }
}
`;

if (!code.includes('verifyPayment(orderId')) {
  code += verifyAction;
}

fs.writeFileSync(file, code);
