import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCachedFeatures, getCachedHasBlueprint, getCachedNicheReferences, getCachedAppUser } from "@/lib/cache";
import WorkspaceApp from "../WorkspaceApp";

export const metadata = {
  title: "Ruang Ngonten Workspace - ruangcreativemuslim",
};

export default async function RuangNgontenCatchAllPage(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // Intercept item-level clicks if not logged in
  if (params?.slug && params.slug.length > 0 && !isLoggedIn) {
    const slugPath = params.slug.join('/');
    redirect(`/login?redirect=/ruang-ngonten/${slugPath}`);
  }

  let hasBlueprint = false;
  if (session?.user?.id) {
    hasBlueprint = await getCachedHasBlueprint(session.user.id);
  }
  const dbFeatures = await getCachedFeatures();
  const nicheReferences = await getCachedNicheReferences();
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  let isPro = isAdmin;
  
  if (!isAdmin && session?.user?.id) {
    const dbUser = await getCachedAppUser(session.user.id);
    const hasTools = dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date();
    isPro = hasTools || dbUser?.role === "ADMIN";
  }

  // Intercept direct URL access if accessing a pro-only tool while not Pro
  if (params?.slug && params.slug.length > 0 && !isPro) {
    const currentSlug = params.slug[0];
    const matchingFeature = dbFeatures.find((f: any) => {
      const slugName = f.name.toLowerCase().replace(/\s+/g, '-');
      return (
        slugName === currentSlug.toLowerCase() ||
        (currentSlug === "master-blueprint" && f.name === "Master Blueprint") ||
        (currentSlug === "bio-builder" && f.name === "Bio Builder") ||
        (currentSlug === "idea-rooms" && f.name === "Idea Rooms") ||
        (currentSlug === "script-builder" && f.name === "Script Builder") ||
        (currentSlug === "carousel-builder" && f.name === "Carousel Prompt Builder") ||
        (currentSlug === "atm-builder" && f.name === "ATM Content Builder") ||
        (currentSlug === "ebook-builder" && f.name === "Ebook Prompt Builder") ||
        (currentSlug === "content-calendar" && f.name === "Content Calendar")
      );
    });

    const isProOnly = matchingFeature ? matchingFeature.isProOnly : false;
    if (isProOnly) {
      redirect("/?pricing=true");
    }
  }

  return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isLoggedIn={isLoggedIn} nicheReferences={nicheReferences} userImage={session?.user?.image} />;
}
