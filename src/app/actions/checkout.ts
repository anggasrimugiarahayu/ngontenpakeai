"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { verifyPayment } from "@/app/actions/payment";

export async function getCheckoutDetailsAction(type: string, productId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { notAuthorized: true };
  if (!type) return { badRequest: true };

  // Run independent queries concurrently
  const [user, product, pendingDbOrder] = await Promise.all([
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
    }).catch(() => null)
  ]);

  if (!user) return { notAuthorized: true };

  let baseAmount = 0;
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
  } else if (type === "PRO_BASIC") {
    baseAmount = 99000;
    itemName = "Ruang Ngonten Faceless (PRO Basic)";
    itemDescription = "Akses modul dasar, tanpa AI tools.";
  } else if (type === "PRO_TOOLS") {
    baseAmount = 99000;
    itemName = "Sistem Tools AI (PRO Tools)";
    itemDescription = "Akses sistem prompt AI khusus untuk ngonten.";
  } else if (type === "PRO_LENGKAP") {
    baseAmount = 149000;
    itemName = "Paket Lengkap (Modul + Tools)";
    itemDescription = "Akses seluruh modul dan sistem tools AI.";
  } else {
    return { badRequest: true, redirect: "/" };
  }

  const isProduction = process.env.NODE_ENV === "production" && process.env.MIDTRANS_IS_PRODUCTION === "true";
  const clientKey = isProduction ? process.env.MIDTRANS_CLIENT_KEY : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-rIaAV5Qv-Ue28a9u";

  let existingPendingOrder = null;
  if (pendingDbOrder && pendingDbOrder.midtransId) {
    const verifyRes = await verifyPayment(pendingDbOrder.id);
    if (verifyRes.success && verifyRes.status === "PENDING" && verifyRes.expiryTime) {
      existingPendingOrder = {
        token: pendingDbOrder.midtransId,
        orderId: pendingDbOrder.id,
        expiryTime: verifyRes.expiryTime,
        paymentMethodKey: pendingDbOrder.paymentMethod || "QRIS"
      };
    }
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
    existingPendingOrder
  };
}
