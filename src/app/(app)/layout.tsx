import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getCachedFeatures, getCachedHasBlueprint } from "@/lib/cache";
import ClientLayout from "./ruang-ngonten/ClientLayout";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let hasBlueprint = false;
  
  if (session?.user?.id) {
    hasBlueprint = await getCachedHasBlueprint(session.user.id);
  }
  
  const dbFeatures = await getCachedFeatures();
  
  let userRole = "USER";
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    if (dbUser) userRole = dbUser.role || "USER";
  }
  
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com" || userRole === "ADMIN";
  const isPro = userRole === "PRO" || isAdmin;
  const isLoggedIn = !!session?.user;
  
  return <ClientLayout hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isAdmin={isAdmin} isLoggedIn={isLoggedIn}>{children}</ClientLayout>;
}
