import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCachedFeatures, getCachedHasBlueprint } from "@/lib/cache";
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
  const nicheReferences = await prisma.nicheReference.findMany({ select: { id: true, nama: true, data: true } });
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  let isPro = isAdmin;
  
  if (!isAdmin && session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { proToolsExpiredAt: true, role: true }
    });
    const hasTools = dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date();
    isPro = hasTools || dbUser?.role === "ADMIN";
  }

  return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isLoggedIn={isLoggedIn} nicheReferences={nicheReferences} userImage={session?.user?.image} />;
}
