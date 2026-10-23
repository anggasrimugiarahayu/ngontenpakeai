import ReadEbookClient from "./ReadEbookClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEbookDetailAction } from "@/app/actions/ruangBelajar";

export default async function ReadEbookPage(props: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const { slug } = await props.params;
  const initialData = await getEbookDetailAction(slug);

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

  return <ReadEbookClient slug={slug} initialData={initialData} />;
}
