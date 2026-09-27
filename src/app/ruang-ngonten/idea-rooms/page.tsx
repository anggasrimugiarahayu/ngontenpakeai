import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import IdeaRoomsClient from "./IdeaRoomsClient";

export const metadata = {
  title: "Idea Rooms - Ruang Ngonten",
  description: "Ubah Ide kamu menjadi rencana konten.",
};

export default async function IdeaRoomsPage() {
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

  // In NextJS we can fetch previous idea rooms data from DB if needed, 
  // but for now we pass the blueprint.
  return <IdeaRoomsClient blueprintId={blueprint.id} blueprintData={blueprint.aiResult} />;
}
