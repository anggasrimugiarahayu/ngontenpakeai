"use client";

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
      <div className="flex-1 w-full flex justify-center py-6 px-4 sm:py-8 items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Menyiapkan pembayaran...</p>
        </div>
      </div>
    );
  }

  if (data.notAuthorized) {
    router.replace("/auth/login?callbackUrl=/checkout");
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
          itemName={data.itemName}
          itemDescription={data.itemDescription}
          baseAmount={data.baseAmount}
          clientKey={data.clientKey!}
          isProduction={data.isProduction}
          initialName={data.initialName}
          initialEmail={data.initialEmail}
          initialPhone={data.initialPhone}
          productImage={data.productImage}
          existingPendingOrder={data.existingPendingOrder}
        />
      </div>
    </div>
  );
}
