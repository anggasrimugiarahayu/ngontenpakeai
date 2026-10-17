"use client";

import { toggleFeatureStatus, toggleFeaturePro } from "@/app/actions/adminSettings";

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
  const sortedFeatures = [...(features || [])].sort(
    (a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name)
  );

  return (
    <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
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
            className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-transparent rounded-xl border border-gray-200 dark:border-white/5"
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
            <div className="flex items-center justify-between gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">
              {/* Toggle Aktif/Nonaktif */}
              <div className="flex items-center justify-between flex-1">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  Aktifkan
                </span>
                <button
                  onClick={() => toggleFeatureStatus(f.id, !f.isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    f.isActive ? "bg-rn-accent" : "bg-gray-200 dark:bg-white/10"
                  }`}
                  role="switch"
                  aria-checked={f.isActive}
                >
                  <span className="sr-only">Toggle Status</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      f.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="w-px h-6 bg-gray-200 dark:bg-white/5 mx-1"></div>

              {/* Toggle Pro/Gratis */}
              <div className="flex items-center justify-between flex-1">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  PRO Mode
                </span>
                <button
                  onClick={() => toggleFeaturePro(f.id, !f.isProOnly)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    f.isProOnly ? "bg-rn-accent" : "bg-gray-200 dark:bg-white/10"
                  }`}
                  role="switch"
                  aria-checked={f.isProOnly}
                >
                  <span className="sr-only">Toggle PRO</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      f.isProOnly ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
