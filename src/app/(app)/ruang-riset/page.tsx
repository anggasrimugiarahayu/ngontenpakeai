import { auth } from "@/auth";
import { getCachedAppUser } from "@/lib/cache";
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
      const dbUser = await getCachedAppUser(session.user.id);
      const hasPro = !!(
        ((dbUser as any)?.proExpiredAt && new Date((dbUser as any).proExpiredAt) > new Date()) ||
        ((dbUser as any)?.proToolsExpiredAt && new Date((dbUser as any).proToolsExpiredAt) > new Date()) ||
        ((dbUser as any)?.proAutomationExpiredAt && new Date((dbUser as any).proAutomationExpiredAt) > new Date()) ||
        dbUser?.role === "ADMIN"
      );
      isPro = hasPro;
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
