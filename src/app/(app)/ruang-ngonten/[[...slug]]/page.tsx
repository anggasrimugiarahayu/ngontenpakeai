import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCachedFeatures, getCachedHasBlueprint, getCachedNicheReferences, getCachedAppUser } from "@/lib/cache";
import WorkspaceApp from "../WorkspaceApp";
import { isAdminEmail } from "@/lib/admin";

export const metadata = {
  title: "Ruang Ngonten Workspace - ruangcreativemuslim",
};

export default async function RuangNgontenCatchAllPage(props: { params: Promise<{ slug?: string[] }> }) {
  const [params, session] = await Promise.all([props.params, auth()]);
  const isLoggedIn = !!session?.user;
  const isAdmin = isAdminEmail(session?.user?.email);

  const [hasBlueprint, dbFeatures, nicheReferences, dbUser] = await Promise.all([
    session?.user?.id ? getCachedHasBlueprint(session.user.id) : Promise.resolve(false),
    getCachedFeatures(),
    getCachedNicheReferences(),
    !isAdmin && session?.user?.id ? getCachedAppUser(session.user.id) : Promise.resolve(null),
  ]);

  let isPro = isAdmin;
  if (!isAdmin && dbUser) {
    const hasTools = !!(dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date());
    isPro = hasTools || dbUser?.role === "ADMIN";
  }

  // Intercept direct URL access
  if (params?.slug && params.slug.length > 0) {
    const currentSlug = params.slug[0];

    if (!isLoggedIn) {
      const slugPath = params.slug.join('/');
      redirect(`/login?redirect=/ruang-ngonten/${slugPath}`);
    }

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

    if (matchingFeature && !matchingFeature.isActive && !isAdmin) {
      redirect("/ruang-ngonten");
    }

    const isProOnly = matchingFeature ? matchingFeature.isProOnly : false;
    if (isProOnly && !isPro) {
      redirect("/?pricing=true&cat=tools");
    }

    if (!hasBlueprint && currentSlug !== "master-blueprint") {
      redirect("/ruang-ngonten");
    }
  }

  return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isLoggedIn={isLoggedIn} nicheReferences={nicheReferences} userImage={session?.user?.image} />;
}
