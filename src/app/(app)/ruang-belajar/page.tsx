import { verifyPayment } from "@/app/actions/payment";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";
import { getCachedHomepageCards } from "@/lib/cache";
import { redirect } from "next/navigation";
import RuangBelajarClient from "./RuangBelajarClient";

export const metadata = {
  title: "Ruang Belajar | ruangcreativemuslim",
  description: "Belajar bikin konten",
};

export default async function RuangBelajarPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  
  const resolvedSearchParams = await searchParams;
  if (resolvedSearchParams?.order_id && typeof resolvedSearchParams.order_id === 'string') {
    await verifyPayment(resolvedSearchParams.order_id);
  }
  
  const [initialData, homepageCards] = await Promise.all([
    getRuangBelajarDataAction(),
    getCachedHomepageCards(),
  ]);

  const isBelajarDisabled = homepageCards.find((c: any) => c.id === "ruang-belajar")?.isActive === false;
  if (!initialData?.isAdmin && isBelajarDisabled) {
    redirect("/");
  }

  return <RuangBelajarClient initialData={initialData} />;
}
