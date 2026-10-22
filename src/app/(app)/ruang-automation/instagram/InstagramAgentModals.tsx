"use client";

import React from "react";
import { Bot, Check, Loader2, Pencil, Plus, X } from "lucide-react";

interface InstagramAgentModalsProps {
  isCreateAgentModalOpen: boolean;
  setIsCreateAgentModalOpen: (open: boolean) => void;
  newAgentName: string;
  setNewAgentName: (name: string) => void;
  isSubmittingAgent: boolean;
  handleCreateAgent: (e: React.FormEvent) => void;
  isEditAgentModalOpen: boolean;
  setIsEditAgentModalOpen: (open: boolean) => void;
  editingAgent: { id: string; name: string } | null;
  editAgentName: string;
  setEditAgentName: (name: string) => void;
  handleSaveEditAgent: (e: React.FormEvent) => void;
}

export function InstagramAgentModals({
  isCreateAgentModalOpen,
  setIsCreateAgentModalOpen,
  newAgentName,
  setNewAgentName,
  isSubmittingAgent,
  handleCreateAgent,
  isEditAgentModalOpen,
  setIsEditAgentModalOpen,
  editingAgent,
  editAgentName,
  setEditAgentName,
  handleSaveEditAgent,
}: InstagramAgentModalsProps) {
  return (
    <>
      {/* MODAL: BUAT AGEN BARU */}
      {isCreateAgentModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Buat Agen Baru
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Beri nama untuk agen otomasi Instagram Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAgentModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Agen
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="Misal: Agen CS Ruang Creative, Agen Toko Fashion"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                  Setelah agen dibuat, Anda dapat langsung menghubungkan akun Instagram milik agen ini pada tab{" "}
                  <strong>Koneksi Akun</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreateAgentModalOpen(false)}
                  disabled={isSubmittingAgent}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white hover:bg-gray-50 dark:bg-[#141B31] dark:hover:bg-[#1f2947] text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAgent || !newAgentName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSubmittingAgent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Membuat...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Agen</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UBAH NAMA AGEN */}
      {isEditAgentModalOpen && editingAgent && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Ubah Nama Agen
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Perbarui nama tampilan agen ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditAgentModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Agen
                </label>
                <input
                  type="text"
                  value={editAgentName}
                  onChange={(e) => setEditAgentName(e.target.value)}
                  placeholder="Nama agen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditAgentModalOpen(false)}
                  disabled={isSubmittingAgent}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white hover:bg-gray-50 dark:bg-[#141B31] dark:hover:bg-[#1f2947] text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAgent || !editAgentName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSubmittingAgent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
