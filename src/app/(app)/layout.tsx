import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getCachedFeatures, getCachedHasBlueprint } from "@/lib/cache";
import ClientLayout from "./ruang-ngonten/ClientLayout";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let hasBlueprint = false;
  let dbFeatures: any = [];
  
  try {
    if (session?.user?.id) {
      hasBlueprint = await getCachedHasBlueprint(session.user.id);
    }
    dbFeatures = await getCachedFeatures();
  } catch (error) {
    console.error("Error fetching cache/blueprint", error);
  }
  
  let userRole = "USER";
  let hasTools = false;
  let needsOnboarding = false;

  if (session?.user?.id) {
    try {
      const dbUser = await prisma.user.findUnique({ 
        where: { id: session.user.id }, 
        select: { role: true, proToolsExpiredAt: true, onboardingCompleted: true } 
      });
      if (dbUser) {
        if (!dbUser.onboardingCompleted) {
          needsOnboarding = true;
        }
        userRole = dbUser.role || "USER";
        hasTools = dbUser.proToolsExpiredAt ? new Date(dbUser.proToolsExpiredAt) > new Date() : false;
      }
    } catch (error) {
      console.error("Error fetching dbUser in AppLayout", error);
    }
  }
  
  if (needsOnboarding) {
    redirect("/onboarding");
  }
  
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com" || userRole === "ADMIN";
  const isPro = hasTools || isAdmin;
  const isLoggedIn = !!session?.user;
  
  return <ClientLayout hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isAdmin={isAdmin} isLoggedIn={isLoggedIn}>{children}</ClientLayout>;
}