import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCachedFeatures, getCachedHasBlueprint } from "@/lib/cache";
import WorkspaceApp from "../WorkspaceApp";

export const metadata = {
  title: "Ruang Ngonten Workspace - ruangcreativemuslim",
};

export default async function RuangNgontenCatchAllPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const hasBlueprint = await getCachedHasBlueprint(session.user.id);
  const dbFeatures = await getCachedFeatures();
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

  return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} />;
}
