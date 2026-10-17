"use client";

import React from "react";
import { RefreshCw, Unlink } from "lucide-react";
import { InstagramIcon } from "../components/AutomationIcons";

interface InstagramConnectionTabProps {
  displayAccount: any;
  currentAgent: any;
  account: any;
  selectedAgentId: string | null;
  avatarError: boolean;
  setAvatarError: (val: boolean) => void;
  isPending: boolean;
  onResyncAccount: () => void;
  onDisconnect: () => void;
  onStartMetaOAuth: (agentId?: any) => void;
}

export function InstagramConnectionTab({
  displayAccount,
  currentAgent,
  account,
  selectedAgentId,
  avatarError,
  setAvatarError,
  isPending,
  onResyncAccount,
  onDisconnect,
  onStartMetaOAuth,
}: InstagramConnectionTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {displayAccount && displayAccount.isLinked ? (
        (() => {
          const d =
            displayAccount.updatedAt || displayAccount.createdAt
              ? new Date(displayAccount.updatedAt || displayAccount.createdAt)
              : new Date();
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const hh = String(d.getHours()).padStart(2, "0");
          const min = String(d.getMinutes()).padStart(2, "0");
          const formattedUpdated = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

          const agentDisplayName = currentAgent?.name || account?.name || "NAMA AGEN";
          const igUsername = displayAccount.username || "ruangcreativemuslim";
          const igProfileName =
            displayAccount.profileName ||
            (displayAccount.name && !displayAccount.name.toUpperCase().startsWith("AGEN")
              ? displayAccount.name
              : null);
          const igBioOrTitle =
            igProfileName ||
            (igUsername.toLowerCase().includes("ruangcreative")
              ? "Harits | Faceless Conten Preneur"
              : "Akun Profesional");

          const avatarSrc =
            displayAccount.profilePicUrl && !avatarError
              ? displayAccount.profilePicUrl
              : igUsername.toLowerCase().includes("ruangcreative")
              ? "/images/instagram/rcm-avatar.png"
              : null;

          return (
            <div className="rounded-2xl border border-gray-200 dark:border-white/5 p-5 sm:p-6 bg-white dark:bg-[#121214] shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
                <div className="flex items-start md:items-center gap-3.5 sm:gap-5">
                  {/* Avatar / Profile Picture */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden shadow-2xs">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={igUsername}
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <InstagramIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detail Akun & Status */}
                  <div className="space-y-0.5 sm:space-y-1">
                    <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-gray-900 dark:text-white leading-tight">
                      {agentDisplayName}
                    </h2>
                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                      @{igUsername}
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-normal leading-normal">
                      {igBioOrTitle}
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-normal leading-normal">
                      Status Koneksi: Terhubung
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal leading-normal">
                      Terakhir Diperbaharui: {formattedUpdated}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto self-stretch sm:self-auto pt-3 sm:pt-0 border-t border-gray-100 dark:border-white/5 sm:border-t-0 shrink-0">
                  <button
                    onClick={onResyncAccount}
                    disabled={isPending}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs active:scale-[0.99]"
                    title="Sinkronkan ulang data profil dari Meta API"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 shrink-0 ${
                        isPending ? "animate-spin" : ""
                      }`}
                    />
                    <span className="truncate">Singkronkan ulang</span>
                  </button>
                  <button
                    onClick={onDisconnect}
                    disabled={isPending}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-white dark:bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs active:scale-[0.99]"
                    title="Putuskan koneksi akun ini"
                  >
                    <Unlink className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="truncate">Putuskan Akun</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* DISCONNECTED STATE */
        <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 p-5 sm:p-7 md:p-8 bg-gray-50/50 dark:bg-white/[0.02] shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0 border border-gray-200/60 dark:border-white/5 shadow-2xs">
                <InstagramIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-heading text-gray-900 dark:text-white leading-snug">
                    Belum Ada Akun Instagram Terhubung
                  </h2>
                  <span className="self-start px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Terputus / Belum Aktif
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                  Hubungkan akun Instagram Bisnis atau Kreator Anda untuk mulai mengaktifkan auto-reply komentar postingan/Reels dan pengiriman DM privat otomatis 24/7.
                </p>
              </div>
            </div>

            <button
              onClick={() => onStartMetaOAuth(displayAccount?.id || selectedAgentId || account?.id)}
              disabled={isPending}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
              title="Hubungkan akun Instagram Anda secara resmi via Meta"
            >
              <InstagramIcon className="w-4 h-4 shrink-0" />
              <span>Hubungkan Akun Instagram</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
