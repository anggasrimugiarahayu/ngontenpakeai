"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { snap, coreApi, isProduction } from "@/lib/midtrans";
import { revalidatePath, revalidateTag } from "next/cache";
import { calculatePaymentFees, PAYMENT_METHODS, PaymentMethodKey } from "@/lib/payment-calc";
import { mergePricingConfig } from "@/lib/pricing-packages";
import { calculateSubscriptionFulfillment } from "@/lib/subscription-utils";

export async function createCheckoutToken(data: { 
  type: string, 
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
  let productPrice = 0;
  let orderName = "";
  
  if (data.type === "EBOOK") {
    if (!data.productId) throw new Error("Product ID required for Ebook");
    const product = await prisma.digitalProduct.findUnique({ where: { id: data.productId } });
    if (!product || !product.isActive) throw new Error("Produk tidak ditemukan atau sedang tidak aktif");
    
    if (!product.price || product.price <= 0) {
      throw new Error("Produk ini gratis, silakan gunakan tombol klaim.");
    }
    
    baseAmount = product.price;
    productPrice = product.price;
    orderName = `E-Book: ${product.title}`;
  } else {
    const setting = await prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } });
    const pricingConfig = mergePricingConfig(setting?.value ? JSON.parse(setting.value) : null);
    const targetPkg = pricingConfig[data.type] || pricingConfig.packages?.[data.type];
    
    if (targetPkg) {
      if (targetPkg.isActive === false) {
        throw new Error("Paket langganan ini sedang dinonaktifkan");
      }
      baseAmount = targetPkg.price;
      orderName = targetPkg.name;
    } else {
      throw new Error("Harga paket tidak ditemukan");
    }
  }

  if (data.addonIds && data.addonIds.length > 0) {
    const addons = await prisma.digitalProduct.findMany({
      where: { id: { in: data.addonIds }, isActive: true }
    });
    
    addons.forEach(addon => {
      baseAmount += (addon.price || 0);
    });
  }

  let verifiedDiscountAmount = 0;
  let verifiedVoucherCode: string | undefined = undefined;

  // Voucher is strictly allowed ONLY for digital products (EBOOK), not subscription packages
  if (data.type === "EBOOK" && data.productId && data.voucherCode && data.voucherCode.trim()) {
    const voucher = await prisma.voucher.findFirst({
      where: {
        code: data.voucherCode.trim().toUpperCase(),
        digitalProductId: data.productId,
        isActive: true,
      }
    });
    if (voucher) {
      verifiedVoucherCode = voucher.code;
      // Discount applies to the main product base price only (not addon upsells)
      if (voucher.discountType === "PERCENTAGE") {
        verifiedDiscountAmount = Math.floor((productPrice * voucher.discountValue) / 100);
      } else {
        verifiedDiscountAmount = voucher.discountValue;
      }
      verifiedDiscountAmount = Math.min(verifiedDiscountAmount, Math.max(0, baseAmount - 1000));
      baseAmount = Math.max(1000, baseAmount - verifiedDiscountAmount);
    }
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
      voucherCode: verifiedVoucherCode,
      discountAmount: verifiedDiscountAmount,
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
    const session = await auth();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false };

    // Security: Only order owner or admin can verify order status
    if (
      session?.user?.id &&
      order.userId !== session.user.id &&
      session?.user?.email?.toLowerCase() !== "anggasrimugiarahayu@gmail.com"
    ) {
      return { success: false, error: "Unauthorized" };
    }

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

    // Check expiry time from Snap Token endpoint if available
    if (finalStatus === "PENDING" && order.midtransId) {
      try {
        const snapBaseUrl = isProduction ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
        const snapRes = await fetch(`${snapBaseUrl}/snap/v1/transactions/${order.midtransId}`, {
          headers: { "Accept": "application/json" },
          cache: "no-store"
        });
        if (snapRes.status === 200) {
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
        // Atomic compare-and-swap: guarantees fulfillment executes exactly once
        const claimResult = await tx.order.updateMany({
          where: { id: orderId, status: { not: "SUCCESS" } },
          data: { status: "SUCCESS" }
        });

        if (claimResult.count === 0) {
          // Already fulfilled concurrently by Midtrans webhook
          return;
        }

        // Grant the Item!
        if (order.orderType === "EBOOK") {
          const productIdsToGrant = Array.from(new Set([
            ...(order.digitalProductId ? [order.digitalProductId] : []),
            ...(order.addonIds && Array.isArray(order.addonIds) ? (order.addonIds as string[]) : [])
          ])).filter(Boolean);

          if (productIdsToGrant.length > 0) {
            await tx.userOwnedProduct.createMany({
              data: productIdsToGrant.map((pid) => ({
                userId: order.userId,
                digitalProductId: pid
              })),
              skipDuplicates: true
            });
          }
        } else {
          // Dynamic PRO subscription & package fulfillment (4 independent pillars: Ebook, Tools, Automation, Riset)
          const setting = await tx.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } });
          const rawConfig = setting?.value ? JSON.parse(setting.value as string) : null;

          const currentUser = await tx.user.findUnique({
            where: { id: order.userId },
            select: {
              role: true,
              hasProBook: true,
              proToolsExpiredAt: true,
              proAutomationExpiredAt: true,
              proRisetExpiredAt: true,
              automationAgentLimit: true,
            },
          });

          const { meta, updateData } = calculateSubscriptionFulfillment({
            orderType: order.orderType,
            currentUser,
            rawPricingConfig: rawConfig,
          });

          await tx.user.update({
            where: { id: order.userId },
            data: updateData,
          });

          // Update per-agent expiry jika paket adalah automation / plus
          if (meta.category === "automation" || meta.category === "plus") {
            const days = meta.durationDays > 0 ? meta.durationDays : 30;
            const now = new Date();
            const existingAccounts = await tx.instagramAccount.findMany({
              where: { userId: order.userId },
              orderBy: { createdAt: "asc" },
            });
            if (existingAccounts.length > 0) {
              const target = existingAccounts[0];
              const cur = target.expiredAt && new Date(target.expiredAt) > now ? new Date(target.expiredAt) : now;
              const newAgentExpiry = new Date(cur.getTime() + days * 86400000);
              await tx.instagramAccount.update({
                where: { id: target.id },
                data: { expiredAt: newAgentExpiry, isActive: true },
              });
            }
          }

          // Unlock bundled E-books from PRICING_PACKAGES config + any add-on E-books purchased with the package
          const allGrantIds = Array.from(
            new Set([
              ...(meta.bundledProductIds || []),
              ...(order.addonIds && Array.isArray(order.addonIds) ? (order.addonIds as string[]) : []),
            ])
          ).filter(Boolean);

          if (allGrantIds.length > 0) {
            await tx.userOwnedProduct.createMany({
              data: allGrantIds.map((pid) => ({
                userId: order.userId,
                digitalProductId: pid,
              })),
              skipDuplicates: true,
            });
          }
        }
      });
      revalidatePath("/");
      revalidatePath("/ruang-belajar");
      revalidatePath("/ruang-ngonten");
      revalidatePath("/ruang-riset");
      revalidatePath("/ruang-automation");
      revalidatePath("/pengaturan");
      revalidatePath("/dashboard");
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