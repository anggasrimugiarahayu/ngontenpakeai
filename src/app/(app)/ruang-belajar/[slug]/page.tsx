import ProductDetailClient from "./ProductDetailClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProductDetailAction } from "@/app/actions/ruangBelajar";
import { getCachedHomepageCards } from "@/lib/cache";
import { verifyPayment } from "@/app/actions/payment";

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    props.params,
    props.searchParams ? props.searchParams : Promise.resolve({} as any),
  ]);

  if (resolvedSearchParams?.order_id && typeof resolvedSearchParams.order_id === "string") {
    try {
      await verifyPayment(resolvedSearchParams.order_id);
    } catch (e) {
      console.error("Failed to verify payment on product detail:", e);
    }
  }

  const [initialData, homepageCards] = await Promise.all([
    getProductDetailAction(slug),
    getCachedHomepageCards(),
  ]);

  const isBelajarDisabled = homepageCards.find((c: any) => c.id === "ruang-belajar")?.isActive === false;
  if (!initialData?.isAdmin && isBelajarDisabled) {
    redirect("/");
  }

  if (initialData?.notFound) {
    redirect("/ruang-belajar");
  }

  const isFree =
    initialData?.ebook?.accessLevel === "FREE" ||
    !initialData?.ebook?.price ||
    initialData?.ebook?.price <= 0;

  // If visitor is not logged in and it's a FREE ebook, redirect immediately to login
  if (!session?.user && isFree) {
    redirect(`/login?redirect=/ruang-belajar/${slug}`);
  }

  return <ProductDetailClient slug={slug} initialData={initialData} />;
}
