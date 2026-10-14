import { auth } from "@/auth";
import { getInstagramAutomationDataAction } from "@/app/actions/instagramAutomation";
import { getCachedAppUser } from "@/lib/cache";
import RuangAutomationClient from "./RuangAutomationClient";

export const metadata = {
  title: "Ruang Automation - Otomasi Instagram, TikTok & WhatsApp",
  description: "Pusat automasi balasan komentar, direct message, dan interaksi media sosial otomatis.",
};

export default async function RuangAutomationPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";

  let isPro = isAdmin;
  if (!isAdmin && session?.user?.id) {
    const dbUser = await getCachedAppUser(session.user.id);
    const hasTools = dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date();
    isPro = !!hasTools || dbUser?.role === "ADMIN" || dbUser?.role === "PRO";
  }

  let initialData = { account: null, rules: [], stats: { totalComments: 0, totalDms: 0 }, logs: [] };
  if (isLoggedIn && (isPro || isAdmin)) {
    try {
      initialData = await getInstagramAutomationDataAction();
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
    />
  );
}
