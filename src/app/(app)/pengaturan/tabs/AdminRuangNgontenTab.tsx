"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import toast from "react-hot-toast";
import {
  toggleFeatureStatus,
  toggleFeaturePro,
  updateFeatureQuotaConfig,
} from "@/app/actions/adminSettings";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Save, LayoutTemplate, Bot, Search } from "lucide-react";
import { tokens, cn } from "@/lib/design-tokens";

const NGONTEN_ORDER = [
  "Master Blueprint",
  "Bio Builder",
  "Idea Rooms",
  "Script Builder",
  "Carousel Prompt Builder",
  "ATM Content Builder",
  "Ebook Prompt Builder",
  "Content Calendar",
];

const AUTO_ORDER = [
  "Instagram Automation",
  "TikTok Automation",
  "WhatsApp Automation",
];

const RISET_ORDER = [
  "Riset Instagram",
  "Riset YouTube",
  "Riset TikTok",
  "Riset Facebook",
];

export function AdminRuangNgontenTab({
  features,
  settings,
}: {
  features: any[];
  settings?: any[];
}) {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<"ngonten" | "automation" | "riset">("ngonten");
  const [featureList, setFeatureList] = useState(features || []);

  // Parse initial quota config from settings
  const quotaSettingRaw = settings?.find((s: any) => s.key === "FEATURE_QUOTA_CONFIG")?.value;
  let parsedQuotaConfig = {
    ngontenFreeLimit: 3,
    risetFreeLimit: 3,
    automationFreeTrialDays: 3,
  };
  if (quotaSettingRaw) {
    try {
      const parsed = JSON.parse(quotaSettingRaw);
      parsedQuotaConfig = {
        ngontenFreeLimit: Number(parsed.ngontenFreeLimit) || 3,
        risetFreeLimit: Number(parsed.risetFreeLimit) || 3,
        automationFreeTrialDays: Number(parsed.automationFreeTrialDays) || 3,
      };
    } catch (e) {
      console.error("Failed to parse FEATURE_QUOTA_CONFIG:", e);
    }
  }

  const [quotaConfig, setQuotaConfig] = useState(parsedQuotaConfig);
  const [isSavingQuota, setIsSavingQuota] = useState(false);

  useEffect(() => {
    setFeatureList(features || []);
  }, [features]);

  const handleToggleStatus = async (id: string, nextVal: boolean) => {
    const prevFeatures = [...featureList];
    setFeatureList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: nextVal } : f))
    );
    try {
      await toggleFeatureStatus(id, nextVal);
      mutate("pengaturan");
      router.refresh();
      toast.success("Status aktif fitur berhasil diperbarui");
    } catch {
      setFeatureList(prevFeatures);
      toast.error("Gagal mengubah status aktif fitur");
      mutate("pengaturan");
    }
  };

  const handleTogglePro = async (id: string, nextVal: boolean) => {
    const prevFeatures = [...featureList];
    setFeatureList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isProOnly: nextVal } : f))
    );
    try {
      await toggleFeaturePro(id, nextVal);
      mutate("pengaturan");
      router.refresh();
      toast.success("Status PRO fitur berhasil diperbarui");
    } catch {
      setFeatureList(prevFeatures);
      toast.error("Gagal mengubah status PRO fitur");
      mutate("pengaturan");
    }
  };

  const handleSaveQuotaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingQuota(true);
    try {
      await updateFeatureQuotaConfig(quotaConfig);
      mutate("pengaturan");
      router.refresh();
      toast.success("Pengaturan batas kuota gratis berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan pengaturan kuota");
    } finally {
      setIsSavingQuota(false);
    }
  };

  // Filter features based on active sub-tab
  const currentFeatures = featureList
    .filter((f: any) => {
      const cat = f.category || "ngonten";
      return cat === activeSubTab;
    })
    .sort((a: any, b: any) => {
      if (activeSubTab === "ngonten") {
        return NGONTEN_ORDER.indexOf(a.name) - NGONTEN_ORDER.indexOf(b.name);
      }
      if (activeSubTab === "automation") {
        return AUTO_ORDER.indexOf(a.name) - AUTO_ORDER.indexOf(b.name);
      }
      return RISET_ORDER.indexOf(a.name) - RISET_ORDER.indexOf(b.name);
    });

  return (
    <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31] space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Manajemen Fitur & Ruang
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Atur ketersediaan alat, status PRO / Free mode, dan kuota percobaan gratis untuk setiap ruang.
        </p>
      </div>

      {/* Horizontal Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-[#2C3246]/60 pb-3 overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveSubTab("ngonten")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer",
            activeSubTab === "ngonten"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1f2947]"
          )}
        >
          <LayoutTemplate className="w-4 h-4" />
          Ruang Ngonten
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("automation")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer",
            activeSubTab === "automation"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1f2947]"
          )}
        >
          <Bot className="w-4 h-4" />
          Ruang Automation
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("riset")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer",
            activeSubTab === "riset"
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1f2947]"
          )}
        >
          <Search className="w-4 h-4" />
          Ruang Riset
        </button>
      </div>

      {/* Sub-Tab 1: RUANG NGONTEN QUOTA SETTING */}
      {activeSubTab === "ngonten" && (
        <form
          onSubmit={handleSaveQuotaConfig}
          className="p-4 sm:p-5 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/60 dark:border-orange-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-orange-500" />
              Batas Percobaan Gratis Ruang Ngonten
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Jumlah batas generate AI gratis untuk setiap fitur yang diset ke <strong>Free Mode</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-24">
              <Input
                type="number"
                min={1}
                max={100}
                value={quotaConfig.ngontenFreeLimit}
                onChange={(e) =>
                  setQuotaConfig({
                    ...quotaConfig,
                    ngontenFreeLimit: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">kali / fitur</span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingQuota}
              isLoading={isSavingQuota}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold ml-auto sm:ml-0"
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan
            </Button>
          </div>
        </form>
      )}

      {/* Sub-Tab 2: RUANG AUTOMATION FREE TRIAL DAYS SETTING */}
      {activeSubTab === "automation" && (
        <form
          onSubmit={handleSaveQuotaConfig}
          className="p-4 sm:p-5 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/60 dark:border-orange-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-orange-500" />
              Durasi Free Trial Ruang Automation
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Jumlah hari masa uji coba gratis untuk pengguna saat automasi diset ke <strong>Free Mode</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-24">
              <Input
                type="number"
                min={1}
                max={30}
                value={quotaConfig.automationFreeTrialDays}
                onChange={(e) =>
                  setQuotaConfig({
                    ...quotaConfig,
                    automationFreeTrialDays: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">hari trial</span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingQuota}
              isLoading={isSavingQuota}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold ml-auto sm:ml-0"
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan
            </Button>
          </div>
        </form>
      )}

      {/* Sub-Tab 3: RUANG RISET FREE TRY LIMIT SETTING */}
      {activeSubTab === "riset" && (
        <form
          onSubmit={handleSaveQuotaConfig}
          className="p-4 sm:p-5 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/60 dark:border-orange-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-500" />
              Batas Percobaan Riset Gratis Ruang Riset
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Jumlah batas riset akun media sosial gratis untuk setiap platform yang diset ke <strong>Free Mode</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-24">
              <Input
                type="number"
                min={1}
                max={100}
                value={quotaConfig.risetFreeLimit}
                onChange={(e) =>
                  setQuotaConfig({
                    ...quotaConfig,
                    risetFreeLimit: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">kali / platform</span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSavingQuota}
              isLoading={isSavingQuota}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold ml-auto sm:ml-0"
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan
            </Button>
          </div>
        </form>
      )}

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentFeatures.map((f: any) => (
          <div
            key={f.id}
            className="flex flex-col justify-between gap-3 p-4 bg-gray-50 dark:bg-[#0A1128] rounded-xl border border-gray-200 dark:border-[#2C3246]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {f.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!f.isActive ? (
                    <Badge variant="neutral" size="xs">Nonaktif</Badge>
                  ) : f.isProOnly ? (
                    <Badge variant="primary" size="xs">PRO</Badge>
                  ) : (
                    <Badge variant="success" size="xs">FREE</Badge>
                  )}
                </div>
              </div>
              {f.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {f.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-[#2C3246]/50">
              {/* Toggle Aktifkan */}
              <div className="flex items-center justify-between flex-1">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Aktifkan
                </span>
                <Switch
                  size="sm"
                  checked={Boolean(f.isActive)}
                  onChange={(nextVal) => handleToggleStatus(f.id, nextVal)}
                />
              </div>

              <div className="w-px h-6 bg-gray-200 dark:bg-[#2C3246] mx-1"></div>

              {/* Toggle PRO Mode */}
              <div className="flex items-center justify-between flex-1">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  PRO Mode
                </span>
                <Switch
                  size="sm"
                  checked={Boolean(f.isProOnly)}
                  onChange={(nextVal) => handleTogglePro(f.id, nextVal)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
