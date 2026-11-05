import HomePageClient from "./HomePageClient";
import { getPricingPackagesAction } from "@/app/actions/pengaturan";
import { getHomepageCardsAction } from "@/app/actions/adminSettings";
import { Metadata } from "next";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { getCachedAppUser } from "@/lib/cache";

export const metadata: Metadata = {
  title: "ruangcreativemuslim - Strategi Faceless Creator & Automasi AI",
  description: "Platform belajar ngonten faceless dan sistem tools AI terlengkap.",
};

export const revalidate = 3600;

export default async function Page() {
  const [pricingConfig, homepageCards, session] = await Promise.all([
    getPricingPackagesAction(),
    getHomepageCardsAction(),
    auth(),
  ]);

  let isAdmin = false;
  if (session?.user?.email) {
    if (isAdminEmail(session.user.email)) {
      isAdmin = true;
    } else if (session?.user?.id) {
      try {
        const dbUser = await getCachedAppUser(session.user.id);
        isAdmin = dbUser?.role === "ADMIN";
      } catch {}
    }
  }

  return (
    <HomePageClient
      initialPricingConfig={pricingConfig}
      initialCards={homepageCards}
      initialIsAdmin={isAdmin}
    />
  );
}
