"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { snap, coreApi } from "@/lib/midtrans";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { calculatePaymentFees, PAYMENT_METHODS, PaymentMethodKey } from "@/lib/payment-calc";

export async function createCheckoutToken(data: { 
  type: "EBOOK" | "PRO_BASIC" | "PRO_TOOLS" | "PRO_LENGKAP", 
  productId?: string, 
  paymentMethodKey: PaymentMethodKey,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  addonIds?: string[]
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // Save phone number if they provided a new one
  if (data.customerPhone && user.phone !== data.customerPhone) {
    await prisma.user.update({
      where: { id: userId },
      data: { phone: data.customerPhone }
    });
  }

  let baseAmount = 0;
  let orderName = "";
  
  if (data.type === "EBOOK") {
    if (!data.productId) throw new Error("Product ID required for Ebook");
    const product = await prisma.digitalProduct.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error("Product not found");
    
    if (!product.price || product.price <= 0) {
      throw new Error("Produk ini gratis, silakan gunakan tombol klaim.");
    }
    
    baseAmount = product.price;
    orderName = `E-Book: ${product.title}`;
  } else if (data.type === "PRO_BASIC") {
    baseAmount = 99000;
    orderName = "Paket Basic";
  } else if (data.type === "PRO_TOOLS") {
    baseAmount = 99000;
    orderName = "Paket Sistem Tools";
  } else if (data.type === "PRO_LENGKAP") {
    baseAmount = 149000;
    orderName = "Paket Lengkap";
  }

  
  let itemDetails: any[] = [{
    id: data.productId || data.type,
    price: baseAmount,
    quantity: 1,
    name: orderName.substring(0, 50)
  }];

  if (data.addonIds && data.addonIds.length > 0) {
    const addons = await prisma.digitalProduct.findMany({
      where: { id: { in: data.addonIds } }
    });
    
    addons.forEach(addon => {
      baseAmount += (addon.price || 0);
      itemDetails.push({
        id: addon.id,
        price: addon.price || 0,
        quantity: 1,
        name: `Add-on: ${addon.title}`.substring(0, 50)
      });
    });
  }

  if (!data.paymentMethodKey || !PAYMENT_METHODS[data.paymentMethodKey]) {

    throw new Error("Metode pembayaran tidak valid");
  }

  const { grossAmount, adminFee } = calculatePaymentFees(baseAmount, data.paymentMethodKey);
  const paymentMethod = PAYMENT_METHODS[data.paymentMethodKey];

  // Create an Order in DB
  const order = await prisma.order.create({
    data: {
      userId,
      orderType: data.type,
      digitalProductId: data.productId,
      addonIds: data.addonIds || [],
      amount: grossAmount,
      status: "PENDING",
      paymentMethod: data.paymentMethodKey
    }
  });

  if (!process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY === 'SB-Mid-server-YOUR_SERVER_KEY') {
    throw new Error("Midtrans Server Key belum disetel di .env. Silakan tambahkan MIDTRANS_SERVER_KEY.");
  }
  
  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: grossAmount
    },
    customer_details: {
      first_name: data.customerName || user.name || "Customer",
      email: data.customerEmail || user.email,
      phone: data.customerPhone || user.phone || ""
    },
    item_details: [
      {
        id: data.type === "EBOOK" ? data.productId : data.type,
        price: baseAmount,
        quantity: 1,
        name: orderName
      },
      {
        id: "FEE_ADMIN",
        price: adminFee,
        quantity: 1,
        name: "Biaya Layanan"
      }
    ],
    enabled_payments: paymentMethod.enabled
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentUrl: transaction.redirect_url,
        midtransId: transaction.token
      }
    });

    return { token: transaction.token, orderId: order.id };
  } catch (error: any) {
    console.error("Midtrans Error:", error.message);
    throw new Error(`Gagal membuat transaksi: ${error.message}`);
  }
}

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