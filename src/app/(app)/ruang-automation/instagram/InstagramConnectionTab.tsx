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
            <div className="rounded-2xl border border-gray-200 dark:border-white/5 p-6 bg-white dark:bg-[#121214] shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start md:items-center gap-4 sm:gap-5">
                  {/* Avatar / Profile Picture */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden shadow-2xs">
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
                <div className="flex items-center gap-3 self-start lg:self-center flex-wrap shrink-0">
                  <button
                    onClick={onResyncAccount}
                    disabled={isPending}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                    title="Sinkronkan ulang data profil dari Meta API"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 ${
                        isPending ? "animate-spin" : ""
                      }`}
                    />
                    <span>Singkronkan ulang</span>
                  </button>
                  <button
                    onClick={onDisconnect}
                    disabled={isPending}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                    title="Putuskan koneksi akun ini"
                  >
                    <Unlink className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Putuskan Koneksi</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* DISCONNECTED STATE */
        <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 p-6 md:p-8 bg-gray-50/50 dark:bg-white/[0.02] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                <InstagramIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                    Belum Ada Akun Instagram Terhubung
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Terputus / Belum Aktif
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                  Hubungkan akun Instagram Bisnis atau Kreator Anda untuk mulai mengaktifkan auto-reply komentar postingan/Reels dan pengiriman DM privat otomatis 24/7.
                </p>
              </div>
            </div>

            <button
              onClick={() => onStartMetaOAuth(displayAccount?.id || selectedAgentId || account?.id)}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
              title="Hubungkan akun Instagram Anda secara resmi via Meta"
            >
              <InstagramIcon className="w-4 h-4" />
              Hubungkan Akun Instagram
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
