"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { verifyPayment } from "@/app/actions/payment";

export async function getCheckoutDetailsAction(type: string, productId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { notAuthorized: true };
  if (!type) return { badRequest: true };

  // Run independent queries concurrently
  const [user, product, pendingDbOrder, availableAddons] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id }
    }).catch(() => null),
    
    (type === "EBOOK" && productId) 
      ? prisma.digitalProduct.findUnique({ where: { id: productId } }).catch(() => null)
      : Promise.resolve(null),
      
    prisma.order.findFirst({
      where: {
        userId: session.user.id,
        orderType: type as any,
        ...(productId ? { digitalProductId: productId } : {}),
        status: "PENDING"
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => null),
    
    prisma.digitalProduct.findMany({
      where: { isActive: true, id: { not: productId || undefined } },
      select: { id: true, title: true, coverUrl: true, price: true }
    }).catch(() => [])
  ]);

  if (!user) return { notAuthorized: true };

  let baseAmount = 0;
  let bundledIds: string[] = [];
  let itemName = "";
  let itemDescription = "";
  let productImage = "";

  if (type === "EBOOK") {
    if (!productId || !product) return { badRequest: true, redirect: "/ruang-belajar" };
    if (!product.price || product.price <= 0) return { badRequest: true, redirect: `/ruang-belajar/${product.slug}` };
    
    baseAmount = product.price;
    itemName = product.title;
    itemDescription = product.description || "Akses selamanya untuk produk ini.";
    productImage = product.coverUrl || "";
  } else if (type === "PRO_BASIC" || type === "PRO_TOOLS" || type === "PRO_LENGKAP") {
    const setting = await prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } });
    const pricingConfig = setting?.value ? JSON.parse(setting.value) : null;

    

    if (pricingConfig && pricingConfig[type]) {
      baseAmount = pricingConfig[type].price;
      itemName = pricingConfig[type].name;
      itemDescription = pricingConfig[type].desc;
      bundledIds = pricingConfig[type].bundledProductIds || [];
      switch(type) {
        case "PRO_BASIC": productImage = "/img_paket/paket_ebook.png"; break;
        case "PRO_TOOLS": productImage = "/img_paket/paket_tools.png"; break;
        case "PRO_LENGKAP": productImage = "/img_paket/paket_lengkap.png"; break;
      }
    } else {

      // Fallback defaults
      if (type === "PRO_BASIC") {
        baseAmount = 99000; itemName = "Paket Basic (Ebook)"; itemDescription = "Cocok buat yang mau fokus belajar teori faceless creator.";
      } else if (type === "PRO_TOOLS") {
        baseAmount = 99000; itemName = "Paket Sistem Tools"; itemDescription = "Cocok buat yang butuh bantuan AI untuk eksekusi ngonten.";
      } else if (type === "PRO_LENGKAP") {
        baseAmount = 149000; itemName = "Paket Lengkap (Ebook)"; itemDescription = "Bonus terbanyak, akses jualan (PLR) dan Lifetime support.";
      }
    }
  } else {
    return { badRequest: true, redirect: "/" };
  }

  const isProduction = process.env.NODE_ENV === "production" && process.env.MIDTRANS_IS_PRODUCTION === "true";
  const clientKey = isProduction ? process.env.MIDTRANS_CLIENT_KEY : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-rIaAV5Qv-Ue28a9u";

  // OPTIMIZATION: Run Midtrans API check and bundled addons fetch concurrently (Promise.all)
  let existingPendingOrder = null;
  
  const midtransPromise = (pendingDbOrder && pendingDbOrder.midtransId) 
    ? verifyPayment(pendingDbOrder.id)
    : Promise.resolve(null);

  const includedAddonsPromise = (type.startsWith("PRO_") && bundledIds && bundledIds.length > 0)
    ? prisma.digitalProduct.findMany({
        where: { id: { in: bundledIds } },
        select: { id: true, title: true, coverUrl: true, price: true }
      }).catch(() => [])
    : Promise.resolve([]);

  const [verifyRes, includedAddons] = await Promise.all([
    midtransPromise,
    includedAddonsPromise
  ]);

  if (verifyRes && verifyRes.success && verifyRes.status === "PENDING" && verifyRes.expiryTime && pendingDbOrder) {
    existingPendingOrder = {
      token: pendingDbOrder.midtransId,
      orderId: pendingDbOrder.id,
      expiryTime: verifyRes.expiryTime,
      paymentMethodKey: pendingDbOrder.paymentMethod || "QRIS"
    };
  }

  return {
    type,
    productId,
    itemName,
    itemDescription,
    baseAmount,
    clientKey,
    isProduction,
    initialName: user.name || "",
    initialEmail: user.email || "",
    initialPhone: user.phone || "",
    productImage,
    existingPendingOrder,
    availableAddons,
    includedAddons
  };
}


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
