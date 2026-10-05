import { verifyPayment } from "@/app/actions/payment";
import RuangBelajarClient from "./RuangBelajarClient";

export const metadata = {
  title: "Ruang Belajar - Ruang Ngonten",
  description: "Belajar bikin konten",
};

export default async function RuangBelajarPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  
  const resolvedSearchParams = await searchParams;
  if (resolvedSearchParams?.order_id && typeof resolvedSearchParams.order_id === 'string') {
    await verifyPayment(resolvedSearchParams.order_id);
  }
  
  return <RuangBelajarClient />;
}
