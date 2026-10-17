"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import { getCheckoutDetailsAction } from "@/app/actions/checkout";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutWrapperClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const type = searchParams.get("type");
  const productId = searchParams.get("productId") || undefined;

  const { data, isLoading } = useSWR(
    type ? ["checkout", type, productId] : null,
    () => getCheckoutDetailsAction(type as string, productId)
  );

  if (!type) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

  if (isLoading || !data) {
    return (
      <LoadingSpinner message="Menyiapkan Pembayaran..." />
    );
  }

  if (data.notAuthorized) {
    router.replace(`/login?redirect=/checkout?type=${type}${productId ? `&productId=${productId}` : ''}`);
    return null;
  }

  if (data.badRequest) {
    router.replace(data.redirect || "/");
    return null;
  }

  return (
    <div className="flex-1 w-full flex justify-center py-6 px-4 sm:py-8 items-center h-full">
      <div className="w-full max-w-5xl">
        <CheckoutClient 
          type={data.type as any} 
          productId={data.productId} 
          itemName={data.itemName || ""}
          itemDescription={data.itemDescription || ""}
          baseAmount={data.baseAmount || 0}
          clientKey={data.clientKey || ""}
          isProduction={Boolean(data.isProduction)}
          initialName={data.initialName || ""}
          initialEmail={data.initialEmail || ""}
          initialPhone={data.initialPhone || ""}
          productImage={data.productImage}
          existingPendingOrder={data.existingPendingOrder}
          availableAddons={data.availableAddons || []}
          includedAddons={data.includedAddons || []}
        />
      </div>
    </div>
  );
}
