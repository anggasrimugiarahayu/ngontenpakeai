"use client";

import React from "react";
import {
  Bot,
  Filter,
  Check,
  Plus,
  MoreVertical,
  Pencil,
  Unlink,
  Trash2,
} from "lucide-react";
import { InstagramIcon } from "../components/AutomationIcons";

interface InstagramAgentListSectionProps {
  agents: any[];
  filteredAgents: any[];
  agentFilterStatus: "ALL" | "LINKED" | "UNLINKED";
  setAgentFilterStatus: (val: "ALL" | "LINKED" | "UNLINKED") => void;
  isAgentFilterOpen: boolean;
  setIsAgentFilterOpen: (val: boolean) => void;
  activeDropdownAgentId: string | null;
  setActiveDropdownAgentId: (val: string | null) => void;
  onSelectAgent: (agentId: string) => void;
  onOpenCreateAgentModal: () => void;
  onOpenEditAgentModal: (agent: any) => void;
  onDisconnectAgent: (agentId: string, agentName: string) => void;
  onDeleteAgent: (agentId: string, agentName: string) => void;
}

export function InstagramAgentListSection({
  agents,
  filteredAgents,
  agentFilterStatus,
  setAgentFilterStatus,
  isAgentFilterOpen,
  setIsAgentFilterOpen,
  activeDropdownAgentId,
  setActiveDropdownAgentId,
  onSelectAgent,
  onOpenCreateAgentModal: onOpenCreateAgent,
  onOpenEditAgentModal: onOpenEditAgent,
  onDisconnectAgent,
  onDeleteAgent,
}: InstagramAgentListSectionProps) {
  return (
    <div className="animate-in fade-in duration-200 space-y-6">
      {/* Header & Actions Card */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214] shadow-sm">
        <div className="mb-2 md:mb-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            IG Automation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola asisten agen otomasi untuk akun Instagram Anda. 1 Agen mewakili 1 akun Instagram yang terhubung.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto self-start sm:self-auto shrink-0">
          {/* Filter Dropdown */}
          <div className="relative agent-filter-dropdown-container">
            <button
              type="button"
              onClick={() => setIsAgentFilterOpen(!isAgentFilterOpen)}
              className={`px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                agentFilterStatus !== "ALL"
                  ? "border-gray-900 dark:border-white bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {agentFilterStatus !== "ALL" && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            {isAgentFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Status Koneksi
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAgentFilterStatus("ALL");
                    setIsAgentFilterOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    agentFilterStatus === "ALL"
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  Semua Status
                  {agentFilterStatus === "ALL" && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAgentFilterStatus("LINKED");
                    setIsAgentFilterOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    agentFilterStatus === "LINKED"
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  Terhubung Meta
                  {agentFilterStatus === "LINKED" && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAgentFilterStatus("UNLINKED");
                    setIsAgentFilterOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    agentFilterStatus === "UNLINKED"
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  Belum Terhubung
                  {agentFilterStatus === "UNLINKED" && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
                </button>
              </div>
            )}
          </div>

          {/* Tombol Buat Agen Baru */}
          <button
            type="button"
            onClick={onOpenCreateAgent}
            className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Agen Baru</span>
          </button>
        </div>
      </div>

      {/* List Agen: Empty State vs Cards Grid */}
      {agents.length === 0 ? (
        <div className="rounded-[24px] border-2 border-dashed border-gray-200 dark:border-white/10 p-8 sm:p-12 text-center bg-gray-50/50 dark:bg-white/[0.02] flex flex-col items-center justify-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 shadow-sm">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            Belum Ada Agen Otomasi
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
            Buat agen pertama Anda untuk menghubungkan akun Instagram dan mengotomasi balasan komentar serta DM secara cerdas dan efisien.
          </p>
          <button
            type="button"
            onClick={onOpenCreateAgent}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Agen Pertama</span>
          </button>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="rounded-[20px] border border-gray-200 dark:border-white/10 p-8 text-center bg-white dark:bg-[#18181b] max-w-md mx-auto my-8 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Tidak ada agen dengan status filter yang dipilih.
          </p>
          <button
            type="button"
            onClick={() => setAgentFilterStatus("ALL")}
            className="text-xs font-bold text-orange-500 hover:underline cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          {filteredAgents.map((agent: any) => (
            <div
              key={agent.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectAgent(agent.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectAgent(agent.id);
                }
              }}
              className="group relative flex items-center justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md gap-4 sm:gap-6"
            >
              {/* Sisi Kiri & Tengah: Avatar + Informasi */}
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                {/* Avatar / Icon */}
                <div className="relative shrink-0">
                  {agent.isLinked ? (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center shadow-2xs">
                      {agent.profilePicUrl ? (
                        <img
                          src={agent.profilePicUrl}
                          alt={agent.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#f43f5e] text-white font-extrabold flex items-center justify-center text-center p-1.5 text-[11px] sm:text-xs leading-tight select-none">
                          {agent.name.toUpperCase()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                      <InstagramIcon className="w-12 h-12 sm:w-14 sm:h-14 text-gray-800 dark:text-gray-200" />
                    </div>
                  )}
                </div>

                {/* Detail Info: Nama, Deskripsi, Status */}
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight"
                    title={agent.name}
                  >
                    {agent.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-normal mt-1">
                    {agent.isLinked
                      ? "Otomatisasi komentar dan DM aktif 24/7"
                      : "Silahkan untuk hubungkan akun IG anda"}
                  </p>
                  <div className="mt-1 sm:mt-1.5">
                    {agent.isLinked ? (
                      <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Terhubung
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500">
                        Terputus
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Menu Titik Tiga (Atas) & Tombol Buka (Bawah) */}
              <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5 pl-2 sm:pl-3">
                {/* Dropdown Menu Titik Tiga */}
                <div
                  className="relative agent-dropdown-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownAgentId(
                        activeDropdownAgentId === agent.id ? null : agent.id
                      );
                    }}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    title="Opsi Agen"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  {activeDropdownAgentId === agent.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-white/10 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownAgentId(null);
                          onOpenEditAgent(agent);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer text-left"
                      >
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                        <span>Ubah Nama Agen</span>
                      </button>

                      {agent.isLinked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownAgentId(null);
                            onDisconnectAgent(agent.id, agent.name);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 cursor-pointer text-left"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>Putuskan Koneksi IG</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownAgentId(null);
                          onDeleteAgent(agent.id, agent.name);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-t border-gray-100 dark:border-white/5 cursor-pointer text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Agen</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Tombol Buka */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAgent(agent.id);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#222226] hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  Buka
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
