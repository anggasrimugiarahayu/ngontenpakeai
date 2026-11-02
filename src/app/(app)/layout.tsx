import { auth } from "@/auth";
import {
  getCachedFeatures,
  getCachedHasBlueprint,
  getCachedAppUser,
  getCachedHomepageCards,
  getCachedMaintenanceConfig,
} from "@/lib/cache";
import AppShellLayout from "@/components/layout/AppShellLayout";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let hasBlueprint = false;
  let dbFeatures: any = [];
  let homepageCards: any = [];
  let maintenanceConfig: any = null;
  let userRole = "USER";
  let hasTools = false;
  let needsOnboarding = false;

  try {
    const [fetchedHasBlueprint, features, cards, dbUser, maint] = await Promise.all([
      session?.user?.id ? getCachedHasBlueprint(session.user.id) : Promise.resolve(false),
      getCachedFeatures(),
      getCachedHomepageCards(),
      session?.user?.id ? getCachedAppUser(session.user.id) : Promise.resolve(null),
      getCachedMaintenanceConfig(),
    ]);
    hasBlueprint = fetchedHasBlueprint;
    dbFeatures = features;
    homepageCards = cards;
    maintenanceConfig = maint;
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
  
  const isAdmin = isAdminUser(session?.user ? { email: session.user.email, role: userRole } : null);

  // Jika maintenance mode aktif untuk non-admin, biarkan AppShellLayout menampilkan MaintenanceView terlebih dahulu
  if (needsOnboarding && !(maintenanceConfig?.isActive && !isAdmin)) {
    redirect("/onboarding");
  }

  const isPro = hasTools || isAdmin;
  const isLoggedIn = !!session?.user;
  
  return (
    <AppShellLayout
      hasBlueprint={hasBlueprint}
      dbFeatures={dbFeatures}
      isPro={isPro}
      isAdmin={isAdmin}
      isLoggedIn={isLoggedIn}
      homepageCards={homepageCards}
      maintenanceConfig={maintenanceConfig}
    >
      {children}
    </AppShellLayout>
  );
}