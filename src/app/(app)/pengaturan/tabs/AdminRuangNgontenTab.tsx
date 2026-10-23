"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import toast from "react-hot-toast";
import { toggleFeatureStatus, toggleFeaturePro } from "@/app/actions/adminSettings";
import { Switch } from "@/components/ui/Switch";
import { tokens, cn } from "@/lib/design-tokens";

const ORDER = [
  "Master Blueprint",
  "Bio Builder",
  "Idea Rooms",
  "Script Builder",
  "Carousel Prompt Builder",
  "ATM Content Builder",
  "Ebook Prompt Builder",
  "Content Calendar",
];

export function AdminRuangNgontenTab({ features }: { features: any[] }) {
  const router = useRouter();
  const [featureList, setFeatureList] = useState(features || []);

  useEffect(() => {
    setFeatureList(features || []);
  }, [features]);

  const sortedFeatures = [...(featureList || [])].sort(
    (a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name)
  );

  const handleToggleStatus = async (id: string, nextVal: boolean) => {
    const prevFeatures = [...featureList];
    setFeatureList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: nextVal } : f))
    );
    try {
      await toggleFeatureStatus(id, nextVal);
      mutate("pengaturan");
      router.refresh();
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
    } catch {
      setFeatureList(prevFeatures);
      toast.error("Gagal mengubah status PRO fitur");
      mutate("pengaturan");
    }
  };

  return (
    <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Manajemen Ruang Ngonten
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Atur ketersediaan alat dan status PRO untuk setiap fitur.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedFeatures.map((f: any) => (
          <div
            key={f.id}
            className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-[#0A1128] rounded-xl border border-gray-200 dark:border-[#2C3246]"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white">{f.name}</span>
              <div className="flex gap-2">
                {f.isProOnly && (
                  <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    PRO
                  </span>
                )}
                {!f.isActive && (
                  <span className="bg-gray-500/10 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Hidden
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-[#2C3246]/50">
              {/* Toggle Aktif/Nonaktif */}
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

              {/* Toggle Pro/Gratis */}
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
