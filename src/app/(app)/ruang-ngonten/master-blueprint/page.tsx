import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MasterBlueprintClient from "./MasterBlueprintClient";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

export const metadata = {
  title: "Master Blueprint - Ruang Ngonten",
  description: "Rancang pondasi konten dan bisnismu.",
};

const getCachedNiche = unstable_cache(
  async () => {
    try {
      return await prisma.nicheReference.findMany({ orderBy: { createdAt: "desc" } });
    } catch { return []; }
  },
  ['niche-references'],
  { revalidate: 3600 }
);

export default async function MasterBlueprintPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const nicheReferences = await getCachedNiche();

  return <MasterBlueprintClient nicheReferences={nicheReferences} />;
}
