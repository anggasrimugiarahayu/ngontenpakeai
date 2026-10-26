import { auth } from "@/auth";
import { getCachedAppUser, getCachedUserOrders } from "@/lib/cache";
import { computeUserSubscriptionStatus } from "@/lib/subscription-utils";
import RuangRisetClient from "./RuangRisetClient";

export const metadata = {
  title: "Ruang Riset - Riset Tren Konten, Audiens & Kompetitor AI",
  description: "Riset ide konten viral, analisis pola audiens, dan bedah strategi kompetitor dengan kekuatan AI.",
};

export default async function RuangRisetPage({
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
      const [dbUser, userOrders] = await Promise.all([
        getCachedAppUser(session.user.id),
        getCachedUserOrders(session.user.id).catch(() => []),
      ]);
      const subStatus = computeUserSubscriptionStatus(dbUser, userOrders);
      isPro = subStatus.hasRiset || subStatus.isAdmin;
    } catch (err) {
      console.error("Error checking pro status in RuangRisetPage:", err);
    }
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialPlatform = (isLoggedIn && (isPro || isAdmin) && resolvedParams.platform === "instagram") ? "instagram" : null;

  return (
    <RuangRisetClient
      isLoggedIn={isLoggedIn}
      isPro={isPro}
      isAdmin={isAdmin}
      initialPlatform={initialPlatform}
    />
  );
}
