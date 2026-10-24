"use server";

import { auth } from "@/auth";
import { mergePricingConfig } from "@/lib/pricing-packages";
import prisma from "@/lib/prisma";
import { verifyPayment } from "@/app/actions/payment";
import { revalidatePath, revalidateTag } from "next/cache";
import { attachLightweightCovers } from "@/lib/ebook-covers";

export async function revalidateAfterPurchaseAction() {
  try {
    revalidateTag("user-ownership", "default");
    revalidateTag("ebook-catalog", "default");
    revalidateTag("user-orders", "default");
    revalidateTag("user-session", "default");
    revalidateTag("admin-dashboard-stats", "default");
    revalidatePath("/ruang-belajar");
    revalidatePath("/ruang-ngonten");
    revalidatePath("/ruang-riset");
    revalidatePath("/ruang-automation");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error("Revalidation error after purchase:", e);
    return { success: false };
  }
}

export async function getCheckoutDetailsAction(type: string, productId?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!type) return { badRequest: true };

  // Run independent queries concurrently
  const [user, rawProduct, pendingDbOrder, rawAvailableAddons, pricingSetting] = await Promise.all([
    userId
      ? prisma.user.findUnique({
          where: { id: userId }
        }).catch(() => null)
      : Promise.resolve(null),
    
    (type === "EBOOK" && productId) 
      ? prisma.digitalProduct.findUnique({
          where: { id: productId },
          select: { id: true, title: true, slug: true, price: true, description: true, updatedAt: true }
        }).catch(() => null)
      : Promise.resolve(null),
      
    userId
      ? prisma.order.findFirst({
          where: {
            userId: userId,
            orderType: type as any,
            ...(productId ? { digitalProductId: productId } : {}),
            status: "PENDING"
          },
          orderBy: { createdAt: 'desc' }
        }).catch(() => null)
      : Promise.resolve(null),
    
    prisma.digitalProduct.findMany({
      where: { isActive: true, id: { not: productId || undefined } },
      select: { id: true, title: true, price: true, updatedAt: true }
    }).catch(() => []),

    type !== "EBOOK"
      ? prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const combinedRawProducts = [
    ...(rawProduct ? [rawProduct] : []),
    ...rawAvailableAddons,
  ];
  const combinedWithCovers = await attachLightweightCovers(combinedRawProducts, false);
  const product = rawProduct ? (combinedWithCovers.find((p) => p.id === rawProduct.id) || null) : null;
  const availableAddons = combinedWithCovers.filter((p) => p.id !== rawProduct?.id);

  let baseAmount = 0;
  let bundledIds: string[] = [];
  let itemName = "";
  let itemDescription = "";
  let productImage = "";

  if (type === "EBOOK") {
    if (!productId || !product) return { badRequest: true, redirect: "/ruang-belajar" };
    if (!product.price || product.price <= 0) return { badRequest: true, redirect: `/ruang-belajar/${(product as any).slug}` };
    
    baseAmount = product.price;
    itemName = product.title;
    itemDescription = (product as any).description || "Akses selamanya untuk produk ini.";
    productImage = (product as any).coverUrl || "";
  } else {
    // Dynamic lookup for any package in PRICING_PACKAGES
    const pricingConfig = mergePricingConfig(pricingSetting?.value ? JSON.parse(pricingSetting.value) : null);
    const targetPkg = pricingConfig[type] || pricingConfig.packages?.[type];

    if (targetPkg) {
      baseAmount = targetPkg.price;
      itemName = targetPkg.name;
      itemDescription = targetPkg.desc || "Akses paket langganan Ngonten Pakai AI.";
      bundledIds = targetPkg.bundledProductIds || [];
      const cat = targetPkg.category;
      if (type.includes("BOOK") || cat === "ebook") productImage = "/img_paket/paket_ebook.png";
      else if (type.includes("TOOLS") || cat === "tools") productImage = "/img_paket/paket_tools.png";
      else if (type.includes("AUTO") || cat === "automation") productImage = "/img_paket/paket_tools.png";
      else if (type.includes("RISET") || cat === "riset") productImage = "/img_paket/paket_tools.png";
      else productImage = "/img_paket/paket_lengkap.png";
    } else {
      return { badRequest: true, redirect: "/" };
    }
  }

  const isProduction = process.env.NODE_ENV === "production" && process.env.MIDTRANS_IS_PRODUCTION === "true";
  const clientKey = isProduction ? process.env.MIDTRANS_CLIENT_KEY : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-rIaAV5Qv-Ue28a9u";

  let existingPendingOrder = null;
  const verifyRes = (pendingDbOrder && pendingDbOrder.midtransId) 
    ? await verifyPayment(pendingDbOrder.id)
    : null;

  const bundledSet = new Set(bundledIds || []);
  const includedAddons = (type.startsWith("PRO_") && bundledSet.size > 0)
    ? availableAddons.filter((a) => bundledSet.has(a.id))
    : [];

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
    initialName: user?.name || "",
    initialEmail: user?.email || "",
    initialPhone: user?.phone || "",
    isLoggedIn: Boolean(userId),
    productImage,
    existingPendingOrder,
    availableAddons,
    includedAddons
  };
}


export async function validatePromoCodeAction(code: string, productId: string) {
  if (!code) return { success: false, message: "Kode promo tidak boleh kosong" };

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
