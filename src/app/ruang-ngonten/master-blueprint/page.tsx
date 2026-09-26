import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MasterBlueprintClient from "./MasterBlueprintClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Master Blueprint - Ruang Ngonten",
  description: "Rancang pondasi konten dan bisnismu.",
};

export default async function MasterBlueprintPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  const nicheReferences = await prisma.nicheReference.findMany({
    orderBy: { createdAt: "desc" }
  });
  const blueprint = await prisma.masterBlueprint.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // We must parse JSON if it's returned as an object from Prisma depending on how Prisma is configured,
  // but Prisma already returns JsonValue as JS objects. 
  // Let's pass it cleanly.
  // Serialize to avoid date passing issues if any
  const serializedBlueprint = blueprint ? JSON.parse(JSON.stringify(blueprint)) : null;
  return <MasterBlueprintClient initialData={serializedBlueprint} nicheReferences={nicheReferences} />;
}
