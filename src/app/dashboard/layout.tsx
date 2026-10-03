import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ClientLayout from "@/app/ruang-ngonten/ClientLayout";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  if (!isAdmin) {
    redirect("/");
  }

  let hasBlueprint = false;
  if (session?.user?.id) {
    let blueprint = null;
    try {
      blueprint = await prisma.masterBlueprint.findFirst({
        where: { userId: session.user.id },
        select: { id: true }
      });
    } catch (e) {
      console.error("Supabase cold start error for blueprint:", e);
    }
    hasBlueprint = !!blueprint;
  }
  
  let dbFeatures: any[] = [];
  try {
    dbFeatures = await prisma.feature.findMany();
  } catch (e) {
    console.error("Supabase cold start error for features:", e);
  }
  const isPro = session?.user?.role === "PRO" || session?.user?.role === "ADMIN" || isAdmin;
  
  return <ClientLayout hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro}>{children}</ClientLayout>;
}
