// src/app/(app)/ruang-automation/components/AutomationBuilderChoiceModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Sliders, Workflow, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface AutomationBuilderChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBasicBuilder: () => void;
  onSelectFlowBuilder: () => void;
}

export function AutomationBuilderChoiceModal({
  isOpen,
  onClose,
  onSelectBasicBuilder,
  onSelectFlowBuilder,
}: AutomationBuilderChoiceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Metode Pembuatan Otomasi"
      description="Pilih tampilan yang paling nyaman untuk Anda menyusun aturan balasan Instagram"
      className="max-w-xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
        {/* OPTION 1: BASIC STUDIO */}
        <div
          onClick={() => {
            onClose();
            onSelectBasicBuilder();
          }}
          className="group relative p-5 rounded-2xl border-2 border-gray-200 dark:border-[#2C3246] hover:border-orange-500 dark:hover:border-orange-500 bg-white dark:bg-[#141B31] hover:bg-orange-50/20 dark:hover:bg-orange-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Basic Studio (Form Cepat)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Setup praktis dalam formulir 2 kolom. Cocok untuk Anda yang ingin membuat automasi secara cepat tanpa kanvas diagram.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-[#2C3246] flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
            <span>Buka Form Cepat</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* OPTION 2: VISUAL FLOW BUILDER */}
        <div
          onClick={() => {
            onClose();
            onSelectFlowBuilder();
          }}
          className="group relative p-5 rounded-2xl border-2 border-blue-500/80 bg-blue-50/20 dark:bg-blue-950/20 hover:bg-blue-50/40 dark:hover:bg-blue-950/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm"
        >
          {/* Badge Rekomendasi */}
          <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Rekomendasi</span>
          </div>

          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#0084FF] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Workflow className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                <span>Flow Builder (Visual)</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Susun alur logika, percabangan follow, tombol, dan delay waktu secara visual di atas kanvas interaktif ala ManyChat.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-blue-100 dark:border-blue-900/30 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
            <span>Buka Flow Builder</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
