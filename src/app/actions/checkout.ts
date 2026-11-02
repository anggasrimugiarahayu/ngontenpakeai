"use server";

import { auth } from "@/auth";
import { mergePricingConfig } from "@/lib/pricing-packages";
import prisma from "@/lib/prisma";
import { verifyPayment } from "@/app/actions/payment";
import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { attachLightweightCovers } from "@/lib/ebook-covers";
import { getCachedUserOrders, getCachedUserOwnedProducts } from "@/lib/cache";
import { computeUserSubscriptionStatus } from "@/lib/subscription-utils";

export async function revalidateAfterPurchaseAction() {
  try {
    const tags = [
      "user-ownership",
      "ebook-catalog",
      "user-orders",
      "user-session",
      "admin-dashboard-stats",
    ];
    for (const tag of tags) {
      try {
        updateTag(tag);
      } catch {}
      try {
        (revalidateTag as any)(tag);
      } catch {}
      try {
        (revalidateTag as any)(tag, { expire: 0 });
      } catch {}
    }
    revalidatePath("/ruang-belajar");
    revalidatePath("/ruang-ngonten");
    revalidatePath("/ruang-riset");
    revalidatePath("/ruang-automation");
    revalidatePath("/pengaturan");
    revalidatePath("/dashboard");
    revalidatePath("/");
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
  const [user, userOrders, userOwned, rawProduct, pendingDbOrder, rawDigitalProducts, pricingSetting] = await Promise.all([
    userId
      ? prisma.user.findUnique({
          where: { id: userId }
        }).catch(() => null)
      : Promise.resolve(null),

    userId
      ? getCachedUserOrders(userId).catch(() => [])
      : Promise.resolve([]),

    userId
      ? getCachedUserOwnedProducts(userId).catch(() => [])
      : Promise.resolve([]),
    
    (type === "EBOOK" && productId) 
      ? prisma.digitalProduct.findUnique({
          where: { id: productId, isActive: true },
          select: { id: true, title: true, slug: true, price: true, description: true, updatedAt: true, accessLevel: true }
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
    
    // Ambil produk digital berbayar yang aktif (PRO & PREMIUM) untuk keperluan Add-on & Included Addons
    prisma.digitalProduct.findMany({
      where: {
        isActive: true,
        price: { gt: 0 },
        accessLevel: { in: ["PRO", "PREMIUM"] },
      },
      select: { id: true, title: true, price: true, updatedAt: true, accessLevel: true, slug: true }
    }).catch(() => []),

    type !== "EBOOK"
      ? prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const ownedProductIds = new Set((userOwned || []).map((up: any) => up.digitalProductId));
  const subStatus = user ? computeUserSubscriptionStatus(user, userOrders) : { hasBook: false, isAdmin: false };
  const userHasBookAccess = Boolean(subStatus.hasBook || subStatus.isAdmin);

  if (type === "EBOOK") {
    if (!productId || !rawProduct) return { badRequest: true, redirect: "/ruang-belajar" };
    // Jika user sudah memiliki produk ini, arahkan langsung ke halaman produk
    if (ownedProductIds.has(productId)) {
      return { badRequest: true, redirect: `/ruang-belajar/${rawProduct.slug}` };
    }
    if (!rawProduct.price || rawProduct.price <= 0) {
      return { badRequest: true, redirect: `/ruang-belajar/${rawProduct.slug}` };
    }
  }

  const combinedRawProducts = [
    ...(rawProduct ? [rawProduct] : []),
    ...rawDigitalProducts,
  ];
  const combinedWithCovers = await attachLightweightCovers(combinedRawProducts, false);
  const product = rawProduct ? (combinedWithCovers.find((p) => p.id === rawProduct.id) || null) : null;

  let baseAmount = 0;
  let bundledIds: string[] = [];
  let itemName = "";
  let itemDescription = "";
  let productImage = "";
  let isPackageEbookOrPlus = false;

  if (type === "EBOOK") {
    baseAmount = product?.price || rawProduct?.price || 0;
    itemName = product?.title || rawProduct?.title || "";
    itemDescription = (rawProduct as any)?.description || "Akses selamanya untuk produk ini.";
    productImage = product?.coverUrl || "";
  } else {
    // Dynamic lookup for any package in PRICING_PACKAGES
    const pricingConfig = mergePricingConfig(pricingSetting?.value ? JSON.parse(pricingSetting.value) : null);
    const targetPkg = pricingConfig[type] || pricingConfig.packages?.[type];

    if (targetPkg) {
      if (targetPkg.isActive === false) {
        return { badRequest: true, redirect: "/?pricing=true" };
      }
      baseAmount = targetPkg.price;
      itemName = targetPkg.name;
      itemDescription = targetPkg.desc || "Akses paket langganan ruangcreativemuslim.";
      bundledIds = targetPkg.bundledProductIds || [];
      const cat = targetPkg.category;
      if (type.includes("BOOK") || cat === "ebook") productImage = "/img_paket/paket_ebook.png";
      else if (type.includes("TOOLS") || cat === "tools") productImage = "/img_paket/paket_tools.png";
      else if (type.includes("AUTO") || cat === "automation") productImage = "/img_paket/paket_tools.png";
      else if (type.includes("RISET") || cat === "riset") productImage = "/img_paket/paket_tools.png";
      else productImage = "/img_paket/paket_lengkap.png";

      if (cat === "ebook" || cat === "plus" || type.includes("BOOK") || type.includes("PLUS")) {
        isPackageEbookOrPlus = true;
      }
    } else {
      return { badRequest: true, redirect: "/" };
    }
  }

  // Tentukan produk yang sudah "Included (Gratis)" dengan paket yang sedang di-checkout
  const includedSet = new Set<string>();
  if (bundledIds.length > 0) {
    bundledIds.forEach((id) => includedSet.add(id));
  } else if (isPackageEbookOrPlus) {
    // Jika paket E-book / Plus dan belum ada bundledIds manual, semua produk PRO otomatis included
    rawDigitalProducts
      .filter((p) => p.accessLevel === "PRO")
      .forEach((p) => includedSet.add(p.id));
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-rIaAV5Qv-Ue28a9u";

  let existingPendingOrder = null;
  const verifyRes = (pendingDbOrder && pendingDbOrder.midtransId) 
    ? await verifyPayment(pendingDbOrder.id)
    : null;

  // Daftar produk yang termasuk paket gratis (Included)
  const includedAddons = (type.startsWith("PRO_") && includedSet.size > 0)
    ? combinedWithCovers
        .filter((p) => includedSet.has(p.id))
        .map((p) => ({
          id: p.id,
          title: p.title,
          coverUrl: p.coverUrl,
          price: p.price,
        }))
    : [];

  // Daftar Add-on Tambahan Berbayar:
  // 1. Bukan produk utama yang sedang dibeli
  // 2. Bukan produk GRATIS (FREE) dan harga > 0
  // 3. Belum dimiliki oleh user
  // 4. Belum termasuk dalam paket yang sedang dibeli (bukan includedSet)
  // 5. Jika user sedang checkout paket E-book/Plus ATAU sudah punya akses member E-Book,
  //    sembunyikan produk PRO (karena produk PRO sudah otomatis gratis bagi mereka),
  //    sehingga tombol Add-on murni fokus meng-upsell produk PREMIUM!
  const availableAddons = combinedWithCovers
    .filter((p) => {
      if (p.id === productId) return false;
      if (p.accessLevel === "FREE" || !p.price || p.price <= 0) return false;
      if (ownedProductIds.has(p.id)) return false;
      if (includedSet.has(p.id)) return false;
      if ((isPackageEbookOrPlus || userHasBookAccess) && p.accessLevel === "PRO") return false;
      return true;
    })
    .map((p) => ({
      id: p.id,
      title: p.title,
      coverUrl: p.coverUrl,
      price: p.price,
    }));

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
    productSlug: (rawProduct as any)?.slug || "",
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
