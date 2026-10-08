import ReadEbookClient from "./ReadEbookClient";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ReadEbookPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const slug = (await params).slug || params.slug;
  return <ReadEbookClient slug={slug} />;
}
