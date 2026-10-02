import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ClientLayout from "@/app/ruang-ngonten/ClientLayout";

export default async function RuangGrowingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let hasBlueprint = false;
  
  if (session?.user?.id) {
    const blueprint = await prisma.masterBlueprint.findFirst({
      where: { userId: session.user.id },
      select: { id: true }
    });
    hasBlueprint = !!blueprint;
  }
  
  const dbFeatures = await prisma.feature.findMany();
  const isPro = session?.user?.role === "PRO" || session?.user?.role === "ADMIN" || session?.user?.email === "anggasrimugiarahayu@gmail.com";
  return <ClientLayout hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro}>{children}</ClientLayout>;
}
