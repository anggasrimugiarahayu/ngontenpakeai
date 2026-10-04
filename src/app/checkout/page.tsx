import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import CheckoutClient from "./CheckoutClient";
import { isProduction } from "@/lib/midtrans";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ type?: string, productId?: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const resolved = await searchParams;
  const type = resolved.type;
  const productId = resolved.productId;

  if (!type) return notFound();

  let baseAmount = 0;
  let itemName = "";
  let itemDescription = "";

  if (type === "EBOOK") {
    if (!productId) return notFound();
    const product = await prisma.digitalProduct.findUnique({ where: { id: productId } });
    if (!product || !product.price || product.price <= 0) return notFound();
    baseAmount = product.price;
    itemName = product.title;
    itemDescription = "Akses selamanya untuk E-book ini.";
  } else if (type === "PRO_BASIC") {
    baseAmount = 99000;
    itemName = "Paket Basic";
    itemDescription = "Akses semua E-book PRO.";
  } else if (type === "PRO_TOOLS") {
    baseAmount = 99000;
    itemName = "Paket Sistem Tools";
    itemDescription = "Akses AI Tools.";
  } else if (type === "PRO_LENGKAP") {
    baseAmount = 149000;
    itemName = "Paket Lengkap";
    itemDescription = "Akses semua E-book PRO + AI Tools + Bonus PLR.";
  } else {
    return notFound();
  }

  const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex items-center justify-center p-4">
      <CheckoutClient 
        type={type as any}
        productId={productId}
        itemName={itemName}
        itemDescription={itemDescription}
        baseAmount={baseAmount}
        clientKey={clientKey}
        isProduction={isProduction}
      />
    </div>
  );
}
