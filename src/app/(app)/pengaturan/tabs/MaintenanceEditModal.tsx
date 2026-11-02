"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Wrench } from "lucide-react";
import { MaintenanceConfig } from "@/lib/cache";

interface MaintenanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MaintenanceConfig;
  onSave: (updated: MaintenanceConfig) => Promise<void>;
}

export function MaintenanceEditModal({
  isOpen,
  onClose,
  config,
  onSave,
}: MaintenanceEditModalProps) {
  const [title, setTitle] = useState(config.title || "");
  const [estimatedTime, setEstimatedTime] = useState(config.estimatedTime || "");
  const [message, setMessage] = useState(config.message || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(config.title || "");
    setEstimatedTime(config.estimatedTime || "");
    setMessage(config.message || "");
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...config,
        title: title.trim(),
        estimatedTime: estimatedTime.trim() || undefined,
        message: message.trim(),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-[#2C3246] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              Edit Konten Under Maintenance
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Sesuaikan judul, estimasi waktu penyelesaian, dan pesan informasi pengunjung.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Judul Halaman */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Judul Halaman Maintenance
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Sistem Sedang Dalam Pemeliharaan"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          {/* Estimasi Waktu */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Estimasi Waktu Selesai (Opsional)
            </label>
            <input
              type="text"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="Contoh: 30 Menit, 1 Jam, atau kosongkan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          {/* Pesan Informasi Pengunjung */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Pesan Informasi Pengunjung
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Kami sedang melakukan peningkatan sistem dan pembaruan fitur agar pengalaman ngontenmu semakin optimal. Kami akan segera kembali!"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] text-gray-900 dark:text-white text-xs sm:text-sm font-normal leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#0A1128] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
