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
  addonIds?: string[],
  voucherCode?: string,
  discountAmount?: number
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
  } else if (data.type.startsWith("PRO_")) {
    const setting = await prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } });
    const pricingConfig = setting?.value ? JSON.parse(setting.value) : null;
    
    if (pricingConfig && pricingConfig[data.type]) {
      baseAmount = pricingConfig[data.type].price;
      orderName = pricingConfig[data.type].name;
    } else {
      throw new Error("Harga paket tidak ditemukan");
    }
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

  if (data.discountAmount && data.discountAmount > 0) {
    baseAmount -= data.discountAmount;
    itemDetails.push({
      id: "DISCOUNT",
      price: -data.discountAmount,
      quantity: 1,
      name: (`Promo: ${data.voucherCode || 'Discount'}`).substring(0, 50)
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
      voucherCode: data.voucherCode,
      discountAmount: data.discountAmount || 0,
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
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false };

    // Fallback 24 hours from creation if Midtrans doesn't provide it
    let expiryTime = new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
    let transactionStatus = "pending";
    let fraudStatus = "";

    try {
      const statusResponse = await coreApi.transaction.status(orderId);
      transactionStatus = statusResponse.transaction_status;
      fraudStatus = statusResponse.fraud_status;
      if (statusResponse.expiry_time) {
        // Midtrans returns "YYYY-MM-DD HH:mm:ss", which JS Date might parse with local timezone.
        // But since we just pass it to the frontend, it's better to format it safely or just pass the string.
        // Actually it's often better to parse it properly, but let's just use what midtrans gives if available.
        expiryTime = statusResponse.expiry_time;
      }
    } catch (midtransErr) {
      console.log("Midtrans status API warning:", midtransErr);
      // Proceed with PENDING if midtrans throws (e.g. 404 because transaction hasn't fully registered)
    }

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