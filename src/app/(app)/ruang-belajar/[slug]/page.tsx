import ProductDetailClient from "./ProductDetailClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProductDetailAction } from "@/app/actions/ruangBelajar";
import { getCachedHomepageCards } from "@/lib/cache";

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const { slug } = await props.params;
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
