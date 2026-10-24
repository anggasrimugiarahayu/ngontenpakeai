import { auth } from "@/auth";
import { getCachedFeatures, getCachedHasBlueprint, getCachedAppUser, getCachedHomepageCards } from "@/lib/cache";
import AppShellLayout from "@/components/layout/AppShellLayout";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let hasBlueprint = false;
  let dbFeatures: any = [];
  let homepageCards: any = [];
  let userRole = "USER";
  let hasTools = false;
  let needsOnboarding = false;

  try {
    const [fetchedHasBlueprint, features, cards, dbUser] = await Promise.all([
      session?.user?.id ? getCachedHasBlueprint(session.user.id) : Promise.resolve(false),
      getCachedFeatures(),
      getCachedHomepageCards(),
      session?.user?.id ? getCachedAppUser(session.user.id) : Promise.resolve(null),
    ]);
    hasBlueprint = fetchedHasBlueprint;
    dbFeatures = features;
    homepageCards = cards;
    if (dbUser) {
      if (!dbUser.onboardingCompleted) {
        needsOnboarding = true;
      }
      userRole = dbUser.role || "USER";
      hasTools = dbUser.proToolsExpiredAt ? new Date(dbUser.proToolsExpiredAt) > new Date() : false;
    }
  } catch (error) {
    console.error("Error fetching cache/blueprint", error);
  }
  
  if (needsOnboarding) {
    redirect("/onboarding");
  }
  
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com" || userRole === "ADMIN";
  const isPro = hasTools || isAdmin;
  const isLoggedIn = !!session?.user;
  
  return <AppShellLayout hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isAdmin={isAdmin} isLoggedIn={isLoggedIn} homepageCards={homepageCards}>{children}</AppShellLayout>;
}