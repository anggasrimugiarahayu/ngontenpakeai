import { auth } from "@/auth";
import { getInstagramAutomationDataAction } from "@/app/actions/instagramAutomation";
import { getCachedAppUser, getCachedFeatures, getCachedQuotaConfig } from "@/lib/cache";
import prisma from "@/lib/prisma";
import RuangAutomationClient from "./RuangAutomationClient";

export const metadata = {
  title: "Ruang Automation | ruangcreativemuslim",
  description: "Pusat automasi balasan komentar, direct message, dan interaksi media sosial otomatis.",
};

export default async function RuangAutomationPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";

  const [allFeatures, quotaConfig] = await Promise.all([
    getCachedFeatures(),
    getCachedQuotaConfig(),
  ]);

  const igFeature = allFeatures.find((f) => f.name === "Instagram Automation");
  const isAutoProOnly = igFeature ? igFeature.isProOnly : true;

  let isPro = isAdmin;
  if (!isAdmin && session?.user?.id) {
    try {
      const dbUser = await getCachedAppUser(session.user.id);
      let hasAutomation = !!(
        (dbUser as any)?.proAutomationExpiredAt &&
        new Date((dbUser as any).proAutomationExpiredAt) > new Date()
      );

      // Jika diset Free Mode (!isAutoProOnly) dan user belum pernah punya masa aktif:
      // Berikan Free Trial sesuai kuota yang diset admin (default 3 hari)
      if (!isAutoProOnly && !(dbUser as any)?.proAutomationExpiredAt) {
        const trialDays = quotaConfig.automationFreeTrialDays || 3;
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + trialDays);
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            proAutomationExpiredAt: trialExpiry,
            automationAgentLimit: Math.max(1, (dbUser as any)?.automationAgentLimit || 1),
          },
        });
        hasAutomation = true;
      }

      isPro = hasAutomation || (dbUser as any)?.role === "ADMIN";
    } catch (err) {
      console.error("Error checking pro status in RuangAutomationPage:", err);
    }
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialAgentId = typeof resolvedParams.agentId === "string" ? resolvedParams.agentId : null;
  const canEnter = isLoggedIn && (isPro || isAdmin || !isAutoProOnly);
  const initialPlatform = (canEnter && resolvedParams.platform === "instagram") ? "instagram" : null;

  let initialData = { agents: [], account: null, rules: [], stats: { totalComments: 0, totalDms: 0 }, logs: [] };
  if (isLoggedIn && (isPro || isAdmin)) {
    try {
      initialData = await getInstagramAutomationDataAction(initialAgentId || undefined);
    } catch (err) {
      console.error("Error fetching initialData in RuangAutomationPage:", err);
    }
  }

  return (
    <RuangAutomationClient
      initialData={initialData}
      isLoggedIn={isLoggedIn}
      isPro={isPro}
      isAdmin={isAdmin}
      isProOnly={isAutoProOnly}
      initialAgentId={initialAgentId}
      initialPlatform={initialPlatform}
    />
  );
}
