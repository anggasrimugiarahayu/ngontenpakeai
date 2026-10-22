"use client";

import { useState } from "react";
import { mutate } from "swr";
import {
  createAiModel,
  setDefaultModel,
  setFallbackModel,
  toggleModel,
  deleteModel,
} from "@/app/actions/adminSettings";
import { confirmSwal } from "./confirmSwal";

export function AdminAiModelTab({ models }: { models: any[] }) {
  const [newModel, setNewModel] = useState({ name: "", modelId: "", provider: "google" });
  const [loading, setLoading] = useState(false);

  const handleAddModel = async () => {
    if (!newModel.name || !newModel.modelId) return;
    setLoading(true);
    await createAiModel(newModel);
    mutate("pengaturan");
    setNewModel({ name: "", modelId: "", provider: "google" });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Model Baru</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            placeholder="Nama (ex: Gemini Flash)"
            value={newModel.name}
            onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
            className="bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all"
          />
          <input
            placeholder="Model ID (ex: gemini-1.5-flash)"
            value={newModel.modelId}
            onChange={(e) => setNewModel({ ...newModel, modelId: e.target.value })}
            className="bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all"
          />
          <button
            onClick={handleAddModel}
            disabled={loading || !newModel.name || !newModel.modelId}
            className="bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-orange-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            Tambah
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Daftar Model AI</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pilih model mana yang aktif, dan set model default sistem.
          </p>
        </div>
        <div className="space-y-3">
          {models.map((model: any) => (
            <div
              key={model.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-[#0A1128] rounded-xl border border-gray-200 dark:border-[#2C3246] gap-4"
            >
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{model.name}</span>
                  {model.isDefault && (
                    <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Default
                    </span>
                  )}
                  {model.isFallback && (
                    <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Cadangan
                    </span>
                  )}
                  {!model.isActive && (
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Nonaktif
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-mono mt-1 break-all">
                  {model.modelId}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-2">
                <div className="flex items-center gap-2 mr-2 sm:mr-4">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Aktif</span>
                  <button
                    onClick={async () => {
                      await toggleModel(model.id, !model.isActive);
                      mutate("pengaturan");
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      model.isActive ? "bg-[#f97316]" : "bg-gray-200 dark:bg-[#141B31] border dark:border-[#2C3246]"
                    }`}
                    role="switch"
                    aria-checked={model.isActive}
                  >
                    <span className="sr-only">Toggle Model</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        model.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {!model.isDefault && model.isActive && (
                  <button
                    onClick={async () => {
                      await setDefaultModel(model.id);
                      mutate("pengaturan");
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
                  >
                    Set Default
                  </button>
                )}

                {!model.isFallback && model.isActive && (
                  <button
                    onClick={async () => {
                      await setFallbackModel(model.id);
                      mutate("pengaturan");
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                  >
                    Set Alternatif
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (await confirmSwal("Hapus model ini?")) {
                      await deleteModel(model.id);
                      mutate("pengaturan");
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
