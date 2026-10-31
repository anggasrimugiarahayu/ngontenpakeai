import { auth } from "@/auth";
import {
  getCachedAppUser,
  getCachedUserOrders,
  getCachedFeatures,
  getCachedQuotaConfig,
  getCachedUserUsages,
} from "@/lib/cache";
import { computeUserSubscriptionStatus } from "@/lib/subscription-utils";
import RuangRisetClient from "./RuangRisetClient";

export const metadata = {
  title: "Ruang Riset | ruangcreativemuslim",
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

  const [allFeatures, quotaConfig, userUsages] = await Promise.all([
    getCachedFeatures(),
    getCachedQuotaConfig(),
    session?.user?.id
      ? getCachedUserUsages(session.user.id).catch(() => [])
      : Promise.resolve([]),
  ]);

  const risetFeatures = allFeatures.filter(
    (f: any) => f.category === "riset" || f.name.toLowerCase().startsWith("riset ")
  );

  const resolvedParams = searchParams ? await searchParams : {};
  const plat = resolvedParams.platform;
  const matchedFeature = plat
    ? risetFeatures.find(
        (f: any) =>
          f.name.toLowerCase() === `riset ${plat}` ||
          f.name.toLowerCase().includes(plat as string)
      )
    : null;

  const canEnterInitial =
    isLoggedIn && (isPro || isAdmin || (matchedFeature && !matchedFeature.isProOnly));

  const initialPlatform =
    canEnterInitial &&
    (plat === "instagram" ||
      plat === "youtube" ||
      plat === "tiktok" ||
      plat === "facebook")
      ? plat
      : null;

  return (
    <RuangRisetClient
      isLoggedIn={isLoggedIn}
      isPro={isPro}
      isAdmin={isAdmin}
      initialPlatform={initialPlatform}
      features={risetFeatures}
      usages={userUsages}
      quotaConfig={quotaConfig}
    />
  );
}
