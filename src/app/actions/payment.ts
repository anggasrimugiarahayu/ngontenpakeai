"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { snap, coreApi, isProduction } from "@/lib/midtrans";
import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { calculatePaymentFees, PAYMENT_METHODS, PaymentMethodKey } from "@/lib/payment-calc";

export async function createCheckoutToken(data: { 
  type: "EBOOK" | "PRO_BOOK" | "PRO_TOOLS" | "PRO_PLUS", 
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
  
  const isShortExpiry = ['QRIS', 'GOPAY', 'SHOPEEPAY', 'OVO', 'DANA'].includes(data.paymentMethodKey);
  const expiryDurationMinutes = isShortExpiry ? 15 : 24 * 60;
  const calculatedExpiryTime = new Date(order.createdAt.getTime() + expiryDurationMinutes * 60 * 1000).toISOString();

  const parameter: any = {
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
    enabled_payments: paymentMethod.enabled,
    expiry: {
      unit: isShortExpiry ? "minute" : "hour",
      duration: isShortExpiry ? 15 : 24
    }
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

    return { token: transaction.token, orderId: order.id, expiryTime: calculatedExpiryTime };
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

function normalizeMidtransExpiry(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    let cleaned = dateStr.trim();
    // Handle "YYYY-MM-DD HH:mm:ss +0000" by stripping space before offset
    cleaned = cleaned.replace(/\s+([+-]\d{4})$/, "$1");
    // Replace space between date and time with T
    cleaned = cleaned.replace(" ", "T");
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
    const raw = new Date(dateStr);
    if (!isNaN(raw.getTime())) {
      return raw.toISOString();
    }
  } catch (e) {}
  return null;
}

export async function verifyPayment(orderId: string) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false };

    // Fallback based on payment method: 15 mins for QRIS/E-Wallet, 24 hours for others
    const isShort = ['QRIS', 'GOPAY', 'SHOPEEPAY', 'OVO', 'DANA'].includes(order.paymentMethod || '');
    const expiryDurationMs = (isShort ? 15 : 24 * 60) * 60 * 1000;
    let expiryTime = new Date(order.createdAt.getTime() + expiryDurationMs).toISOString();
    // If already marked SUCCESS in DB, return immediately
    if (order.status === "SUCCESS") {
      return { success: true, status: "SUCCESS", justUpdated: false, expiryTime };
    }

    let transactionStatus = "pending";
    let fraudStatus = "";

    try {
      const statusResponse = await coreApi.transaction.status(orderId);
      transactionStatus = statusResponse.transaction_status;
      fraudStatus = statusResponse.fraud_status;
      if (statusResponse.expiry_time) {
        const norm = normalizeMidtransExpiry(statusResponse.expiry_time);
        if (norm) expiryTime = norm;
      }
    } catch (midtransErr) {
      console.log("Midtrans status API warning:", midtransErr);
      // Proceed with PENDING if midtrans throws (e.g. 404 because transaction hasn't fully registered)
    }

    console.log("verifyPayment called for:", orderId, "Status from Midtrans:", transactionStatus);
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

    // Fallback: If still PENDING, check directly with Snap Token endpoint
    if (finalStatus === "PENDING" && order.midtransId) {
      try {
        const snapBaseUrl = isProduction ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
        const snapRes = await fetch(`${snapBaseUrl}/snap/v1/transactions/${order.midtransId}`, {
          headers: { "Accept": "application/json" },
          cache: "no-store"
        });
        if (snapRes.status === 409) {
          const snapText = await snapRes.text();
          if (snapText.includes("succeed")) {
            console.log("Verified SUCCESS via Snap token state for order:", orderId);
            finalStatus = "SUCCESS";
          }
        } else if (snapRes.status === 200) {
          const snapJson = await snapRes.json();
          if (snapJson.expiry_time) {
            const norm = normalizeMidtransExpiry(snapJson.expiry_time);
            if (norm) expiryTime = norm;
          }
        }
      } catch (snapErr) {
        console.log("Snap fallback check warning:", snapErr);
      }
    }

    if (order.status !== "SUCCESS" && finalStatus === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        // Update Order
        await tx.order.update({
          where: { id: orderId },
          data: { status: "SUCCESS" }
        });

        // Grant the Item!
        if (order.orderType === "EBOOK") {
          const productIdsToGrant = [];
          if (order.digitalProductId) productIdsToGrant.push(order.digitalProductId);
          if (order.addonIds && Array.isArray(order.addonIds)) {
            productIdsToGrant.push(...(order.addonIds as string[]));
          }

          for (const pid of productIdsToGrant) {
            await tx.userOwnedProduct.upsert({
              where: {
                userId_digitalProductId: {
                  userId: order.userId,
                  digitalProductId: pid
                }
              },
              update: {},
              create: {
                userId: order.userId,
                digitalProductId: pid
              }
            });
          }
        } else if (order.orderType === "PRO_BOOK" || order.orderType === "PRO_TOOLS" || order.orderType === "PRO_PLUS") {
          // 1. Upgrade to PRO role
          let updateData: any = { role: "PRO" };
          
          // If they bought TOOLS or LENGKAP, give them 30 days of proToolsExpiredAt
          if (order.orderType === "PRO_TOOLS" || order.orderType === "PRO_PLUS") {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            updateData.proToolsExpiredAt = expiryDate;
          }

          await tx.user.update({
            where: { id: order.userId },
            data: updateData
          });

          // 2. Unlock bundled E-books from PRICING_PACKAGES config
          const setting = await tx.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } });
          const pricingConfig = setting?.value ? JSON.parse(setting.value as string) : null;
          
          if (pricingConfig && pricingConfig[order.orderType] && pricingConfig[order.orderType].bundledProductIds) {
            const bundledIds = pricingConfig[order.orderType].bundledProductIds;
            for (const pid of bundledIds) {
              const existing = await tx.userOwnedProduct.findFirst({
                where: { userId: order.userId, digitalProductId: pid }
              });
              if (!existing) {
                await tx.userOwnedProduct.create({
                  data: {
                    userId: order.userId,
                    digitalProductId: pid
                  }
                });
              }
            }
          }
        }
      });
      revalidatePath("/ruang-belajar");
      try {
        revalidateTag("admin-dashboard-stats", "default");
        revalidateTag("global-stats", "default");
        revalidateTag("ebook-catalog", "default");
        revalidateTag("user-ownership", "default");
        revalidateTag("user-orders", "default");
        revalidateTag("user-session", "default");
      } catch (e) {}
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