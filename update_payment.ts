import * as fs from 'fs';

const filePath = 'src/app/actions/payment.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace verifyPayment completely and add cancelPayment
const replaceTarget = `export async function verifyPayment(orderId: string) {`;
const newContent = `
export async function cancelPayment(orderId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== session.user.id) return { success: false, message: "Order not found" };

    if (order.status === "SUCCESS") return { success: false, message: "Cannot cancel successful order" };

    try {
      await coreApi.transaction.cancel(orderId);
    } catch (midtransErr) {
      console.log("Midtrans cancel warning:", midtransErr);
      // Even if Midtrans throws (e.g. because it's not strictly pending or already expired), we can still mark it FAILED locally
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED" }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Cancel Error:", error);
    return { success: false, message: error.message };
  }
}

export async function verifyPayment(orderId: string) {
  try {
    const statusResponse = await coreApi.transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const expiryTime = statusResponse.expiry_time; // Provided by Midtrans

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
      return { success: true, status: finalStatus, justUpdated: true, expiryTime };
    }
    
    // Update to failed if midtrans says it failed but our DB is still pending
    if (order.status === "PENDING" && finalStatus === "FAILED") {
       await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
    }

    return { success: true, status: finalStatus, justUpdated: false, expiryTime };
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false };
  }
}
`;

content = content.replace(/export async function verifyPayment\(orderId: string\) \{[\s\S]*/, newContent.trim());
fs.writeFileSync(filePath, content);
