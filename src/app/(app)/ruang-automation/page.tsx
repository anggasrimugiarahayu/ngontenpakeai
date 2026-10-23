import { auth } from "@/auth";
import { getInstagramAutomationDataAction } from "@/app/actions/instagramAutomation";
import { getCachedAppUser, getCachedUserOrders } from "@/lib/cache";
import RuangAutomationClient from "./RuangAutomationClient";

export const metadata = {
  title: "Ruang Automation - Otomasi Instagram, TikTok & WhatsApp",
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

  let isPro = isAdmin;
  if (!isAdmin && session?.user?.id) {
    try {
      const dbUser = await getCachedAppUser(session.user.id);
      const hasAutomation = !!((dbUser as any)?.proAutomationExpiredAt && new Date((dbUser as any).proAutomationExpiredAt) > new Date());
      isPro = hasAutomation || dbUser?.role === "ADMIN";
    } catch (err) {
      console.error("Error checking pro status in RuangAutomationPage:", err);
    }
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialAgentId = typeof resolvedParams.agentId === "string" ? resolvedParams.agentId : null;
  const initialPlatform = (isLoggedIn && (isPro || isAdmin) && resolvedParams.platform === "instagram") ? "instagram" : null;

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
      initialAgentId={initialAgentId}
      initialPlatform={initialPlatform}
    />
  );
}
