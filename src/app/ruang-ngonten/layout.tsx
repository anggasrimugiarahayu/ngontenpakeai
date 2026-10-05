import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getCachedFeatures, getCachedHasBlueprint } from "@/lib/cache";
import ClientLayout from "./ClientLayout";

export default async function RuangNgontenLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let hasBlueprint = false;
  
  if (session?.user?.id) {
    hasBlueprint = await getCachedHasBlueprint(session.user.id);
  }
  
  const dbFeatures = await getCachedFeatures();
  const isPro = session?.user?.role === "PRO" || session?.user?.role === "ADMIN" || session?.user?.email === "anggasrimugiarahayu@gmail.com";
  return <ClientLayout hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro}>{children}</ClientLayout>;
}
