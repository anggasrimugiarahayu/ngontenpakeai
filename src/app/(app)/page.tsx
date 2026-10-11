import HomePageClient from "./HomePageClient";
import { getPricingPackagesAction } from "@/app/actions/pengaturan";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ngonten Pakai AI - Belajar Faceless Creator",
  description: "Platform belajar ngonten faceless dan sistem tools AI terlengkap.",
};

export const revalidate = 3600;

export default async function Page() {
  const pricingConfig = await getPricingPackagesAction();
  return <HomePageClient initialPricingConfig={pricingConfig} />;
}
