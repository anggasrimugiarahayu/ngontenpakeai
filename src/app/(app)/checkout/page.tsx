import { Suspense } from "react";
import CheckoutWrapperClient from "./CheckoutWrapperClient";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Checkout | ruangcreativemuslim",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Menyiapkan Pembayaran..." />}>
      <CheckoutWrapperClient />
    </Suspense>
  );
}
