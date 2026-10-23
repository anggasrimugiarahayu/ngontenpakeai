"use client";

import { useState, useEffect } from "react";
import { mutate } from "swr";
import toast from "react-hot-toast";
import {
  createAiModel,
  setDefaultModel,
  setFallbackModel,
  toggleModel,
  deleteModel,
} from "@/app/actions/adminSettings";
import { confirmSwal } from "./confirmSwal";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";

export function AdminAiModelTab({ models }: { models: any[] }) {
  const [modelList, setModelList] = useState(models || []);
  const [newModel, setNewModel] = useState({ name: "", modelId: "", provider: "google" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setModelList(models || []);
  }, [models]);

  const handleAddModel = async () => {
    if (!newModel.name || !newModel.modelId) return;
    setLoading(true);
    try {
      await createAiModel(newModel);
      mutate("pengaturan");
      setNewModel({ name: "", modelId: "", provider: "google" });
      toast.success("Model AI berhasil ditambahkan");
    } catch {
      toast.error("Gagal menambahkan model AI");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModel = async (id: string, nextVal: boolean) => {
    const prevModels = [...modelList];
    setModelList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: nextVal } : m))
    );
    try {
      await toggleModel(id, nextVal);
      mutate("pengaturan");
    } catch {
      setModelList(prevModels);
      toast.error("Gagal mengubah status model AI");
      mutate("pengaturan");
    }
  };

  const handleSetDefault = async (id: string) => {
    const prevModels = [...modelList];
    setModelList((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
    try {
      await setDefaultModel(id);
      mutate("pengaturan");
    } catch {
      setModelList(prevModels);
      toast.error("Gagal mengatur model default");
      mutate("pengaturan");
    }
  };

  const handleSetFallback = async (id: string) => {
    const prevModels = [...modelList];
    setModelList((prev) =>
      prev.map((m) => ({ ...m, isFallback: m.id === id }))
    );
    try {
      await setFallbackModel(id);
      mutate("pengaturan");
    } catch {
      setModelList(prevModels);
      toast.error("Gagal mengatur model alternatif");
      mutate("pengaturan");
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (await confirmSwal("Hapus model ini?")) {
      const prevModels = [...modelList];
      setModelList((prev) => prev.filter((m) => m.id !== id));
      try {
        await deleteModel(id);
        mutate("pengaturan");
        toast.success("Model berhasil dihapus");
      } catch {
        setModelList(prevModels);
        toast.error("Gagal menghapus model");
        mutate("pengaturan");
      }
    }
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
          {modelList.map((model: any) => (
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
                  <Switch
                    size="sm"
                    checked={Boolean(model.isActive)}
                    onChange={(nextVal) => handleToggleModel(model.id, nextVal)}
                  />
                </div>

                {!model.isDefault && model.isActive && (
                  <button
                    onClick={() => handleSetDefault(model.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
                  >
                    Set Default
                  </button>
                )}

                {!model.isFallback && model.isActive && (
                  <button
                    onClick={() => handleSetFallback(model.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                  >
                    Set Alternatif
                  </button>
                )}

                <button
                  onClick={() => handleDeleteModel(model.id)}
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
