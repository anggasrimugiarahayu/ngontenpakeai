import ProductDetailClient from "./ProductDetailClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProductDetailAction } from "@/app/actions/ruangBelajar";

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const { slug } = await props.params;
  const initialData = await getProductDetailAction(slug);

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
