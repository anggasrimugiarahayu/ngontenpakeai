import { Suspense } from "react";
import CheckoutWrapperClient from "./CheckoutWrapperClient";

export const metadata = {
  title: "Checkout - Ruang Ngonten",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full flex justify-center py-6 px-4 sm:py-8 items-center h-[50vh]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat...</p>
        </div>
      </div>
    }>
      <CheckoutWrapperClient />
    </Suspense>
  );
}
