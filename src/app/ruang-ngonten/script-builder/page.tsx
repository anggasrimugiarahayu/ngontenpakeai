import { Metadata } from "next";
import ScriptBuilderClient from "./ScriptBuilderClient";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Script Builder - Ruang Ngonten",
  description: "Buat naskah video pendek yang engaging dan menahan penonton sampai akhir.",
};

export default async function ScriptBuilderPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const blueprint = await prisma.masterBlueprint.findFirst({
    where: { userId: session.user.id }
  });

  if (!blueprint) {
    redirect("/ruang-ngonten/master-blueprint?error=missing_blueprint");
  }

  return <ScriptBuilderClient blueprintData={blueprint} />;
}
