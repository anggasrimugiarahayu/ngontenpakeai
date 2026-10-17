"use client";

import { PricingConfigSection } from "./PricingConfigSection";
import { AdminApiKeyTab } from "./tabs/AdminApiKeyTab";
import { AdminAiModelTab } from "./tabs/AdminAiModelTab";
import { AdminRuangNgontenTab } from "./tabs/AdminRuangNgontenTab";
import { AdminRuangBelajarTab } from "./tabs/AdminRuangBelajarTab";

export function AdminSettingsContent({
  activeTab,
  adminData,
}: {
  activeTab: string;
  adminData: any;
}) {
  const { models, settings, features, categories, products } = adminData;

  return (
    <>
      {activeTab === "api" && <AdminApiKeyTab settings={settings} />}
      {activeTab === "model" && <AdminAiModelTab models={models} />}
      {activeTab === "fitur" && <AdminRuangNgontenTab features={features} />}
      {activeTab === "pricing" && (
        <PricingConfigSection products={products} settings={settings} />
      )}
      {activeTab === "belajar" && (
        <AdminRuangBelajarTab categories={categories} products={products} />
      )}
    </>
  );
}
