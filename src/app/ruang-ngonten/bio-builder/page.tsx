import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import BioBuilderClient from "./BioBuilderClient";

export const metadata = {
  title: "Bio Builder - Ruang Ngonten",
  description: "Rakit profil Instagram yang optimasi konversi.",
};

export default async function BioBuilderPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  // Find Master Blueprint
  const blueprint = await prisma.masterBlueprint.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!blueprint) {
    redirect("/ruang-ngonten?error=no_blueprint");
  }

  // Find existing Bio Builder
  const bioBuilder = await prisma.bioBuilder.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  const serializedBio = bioBuilder ? JSON.parse(JSON.stringify(bioBuilder)) : null;

  return <BioBuilderClient initialData={serializedBio} blueprintId={blueprint.id} />;
}
