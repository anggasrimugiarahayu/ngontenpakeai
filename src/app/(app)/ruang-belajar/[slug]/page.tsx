import ReadEbookClient from "./ReadEbookClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEbookDetailAction } from "@/app/actions/ruangBelajar";

export default async function ReadEbookPage(props: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const { slug } = await props.params;
  if (!session?.user) {
    redirect(`/login?redirect=/ruang-belajar/${slug}`);
  }
  const initialData = await getEbookDetailAction(slug);
  return <ReadEbookClient slug={slug} initialData={initialData} />;
}
