import HomePageClient from "./HomePageClient";
import { getPricingPackagesAction } from "@/app/actions/pengaturan";
import { getHomepageCardsAction } from "@/app/actions/adminSettings";
import { Metadata } from "next";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { getCachedAppUser } from "@/lib/cache";
import { verifyPayment } from "@/app/actions/payment";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ruangcreativemuslim - Strategi Faceless Creator & Automasi AI",
  description: "Platform belajar ngonten faceless dan sistem tools AI terlengkap.",
};

export const revalidate = 3600;

export default async function Page(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const orderId = typeof searchParams.order_id === "string" ? searchParams.order_id : undefined;

  if (orderId) {
    try {
      await verifyPayment(orderId);
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { product: true },
      });

      if (order) {
        if (order.orderType === "EBOOK") {
          if (order.product?.slug) {
            redirect(`/ruang-belajar/${order.product.slug}?order_id=${order.id}`);
          } else {
            redirect(`/ruang-belajar?order_id=${order.id}`);
          }
        } else if (order.orderType.toUpperCase().includes("RISET")) {
          redirect(`/ruang-riset?order_id=${order.id}`);
        } else if (order.orderType.toUpperCase().includes("AUTO")) {
          redirect(`/ruang-automation?order_id=${order.id}`);
        } else if (order.orderType.toUpperCase().includes("TOOLS") || order.orderType.toUpperCase().includes("PLUS")) {
          redirect(`/ruang-ngonten?order_id=${order.id}`);
        }
      }
    } catch (err: any) {
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      console.error("Error verifying payment on Homepage:", err);
    }
  }

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
