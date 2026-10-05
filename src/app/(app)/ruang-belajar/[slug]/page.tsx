import ReadEbookClient from "./ReadEbookClient";

export const dynamic = "force-dynamic";

export default async function ReadEbookPage({ params }: { params: { slug: string } }) {
  const slug = (await params).slug || params.slug;
  return <ReadEbookClient slug={slug} />;
}
