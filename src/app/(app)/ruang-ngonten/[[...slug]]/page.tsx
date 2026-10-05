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
  const isPro = session?.user?.role === "PRO" || session?.user?.role === "ADMIN" || session?.user?.email === "anggasrimugiarahayu@gmail.com";

  return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} />;
}
