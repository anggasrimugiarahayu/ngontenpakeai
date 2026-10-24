"use client";

import React from "react";
import { Bot, Pencil, Plus, Check, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
      <Modal
        isOpen={isCreateAgentModalOpen}
        onClose={() => setIsCreateAgentModalOpen(false)}
        title="Buat Agen Baru"
        description="Beri nama untuk agen otomasi Instagram Anda"
        icon={
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
        }
      >
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div>
            <Input
              label="Nama Agen"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              placeholder="Misal: Agen CS Ruang Creative, Agen Toko Fashion"
              autoFocus
              required
            />
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              Setelah agen dibuat, Anda dapat langsung menghubungkan akun Instagram milik agen ini pada tab{" "}
              <strong>Koneksi Akun</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-[#2C3246]/60">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateAgentModalOpen(false)}
              disabled={isSubmittingAgent}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingAgent || !newAgentName.trim()}
              isLoading={isSubmittingAgent}
              loadingText="Membuat..."
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Buat Agen
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UBAH NAMA AGEN */}
      <Modal
        isOpen={isEditAgentModalOpen && Boolean(editingAgent)}
        onClose={() => setIsEditAgentModalOpen(false)}
        title="Ubah Nama Agen"
        description="Perbarui nama pengenal untuk agen ini"
        icon={
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Pencil className="w-5 h-5" />
          </div>
        }
      >
        <form onSubmit={handleSaveEditAgent} className="space-y-4">
          <div>
            <Input
              label="Nama Agen"
              value={editAgentName}
              onChange={(e) => setEditAgentName(e.target.value)}
              placeholder="Ketik nama baru agen..."
              autoFocus
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-[#2C3246]/60">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditAgentModalOpen(false)}
              disabled={isSubmittingAgent}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingAgent || !editAgentName.trim()}
              isLoading={isSubmittingAgent}
              loadingText="Menyimpan..."
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
