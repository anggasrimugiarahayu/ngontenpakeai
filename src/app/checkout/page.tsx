import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CheckoutClient from "./CheckoutClient";
import { verifyPayment } from "@/app/actions/payment";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ type: string, productId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/checkout");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    redirect("/auth/login");
  }

  const { type, productId } = await searchParams;

  if (!type) {
    redirect("/");
  }

    let baseAmount = 0;
  let itemName = "";
  let itemDescription = "";
  let productImage = "";

  if (type === "EBOOK") {
    if (!productId) redirect("/ruang-belajar");
    const product = await prisma.digitalProduct.findUnique({ where: { id: productId } });
    if (!product) redirect("/ruang-belajar");
    if (!product.price || product.price <= 0) redirect(`/ruang-belajar/${product.slug}`);
    
    baseAmount = product.price;
    itemName = product.title;
    itemDescription = "Akses selamanya untuk E-book ini.";
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
    redirect("/");
  }

    const isProduction = process.env.NODE_ENV === "production" && process.env.MIDTRANS_IS_PRODUCTION === "true";
  const clientKey = isProduction ? process.env.MIDTRANS_CLIENT_KEY : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-rIaAV5Qv-Ue28a9u";

  // Check for existing pending order
  let existingPendingOrder = null;
  const pendingDbOrder = await prisma.order.findFirst({
    where: {
      userId: user.id,
      orderType: type as any,
      ...(productId ? { digitalProductId: productId } : {}),
      status: "PENDING"
    },
    orderBy: { createdAt: 'desc' }
  });

  if (pendingDbOrder && pendingDbOrder.midtransId) {
    // Check status in midtrans
    const verifyRes = await verifyPayment(pendingDbOrder.id);
    if (verifyRes.success && verifyRes.status === "PENDING" && verifyRes.expiryTime) {
      existingPendingOrder = {
        token: pendingDbOrder.midtransId,
        orderId: pendingDbOrder.id,
        expiryTime: verifyRes.expiryTime,
        paymentMethodKey: pendingDbOrder.paymentMethod || "QRIS" // Fallback if not saved
      };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 md:py-8 min-h-[calc(100vh-100px)] flex justify-center">
      <div className="w-full max-w-5xl">
        <CheckoutClient 
          type={type as any} 
          productId={productId} 
          itemName={itemName}
          itemDescription={itemDescription}
          baseAmount={baseAmount}
          clientKey={clientKey!}
          isProduction={isProduction}
          initialName={user.name || ""}
          initialEmail={user.email || ""}
          initialPhone={user.phone || ""}
          productImage={productImage}
          existingPendingOrder={existingPendingOrder}
        />
      </div>
    </div>
  );
}