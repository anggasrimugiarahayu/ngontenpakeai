"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
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
  const isLinked = Boolean(displayAccount && displayAccount.isLinked);
  const agentDisplayName = currentAgent?.name || account?.name || "Nama Agen";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {isLinked ? (
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
            <div className="rounded-2xl border border-gray-200 dark:border-[#2C3246] p-5 sm:p-6 bg-white dark:bg-[#141B31] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
                {/* Left: Avatar + Account Info */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4.5 min-w-0 flex-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0 shadow-2xs">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={igUsername}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-rose-500 text-white font-bold text-base sm:text-lg">
                        {igUsername.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                      {agentDisplayName}
                    </h2>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal leading-tight mt-1 truncate">
                      @{igUsername}
                    </div>
                    {igBioOrTitle && (
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal leading-tight mt-0.5 truncate">
                        {igBioOrTitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status (top right) & Action Buttons (bottom right) */}
                <div className="flex flex-col items-center md:items-end justify-between gap-3.5 sm:gap-4 shrink-0 md:self-stretch pt-3 md:pt-0 border-t border-gray-100 dark:border-white/5 md:border-t-0">
                  <div className="w-full text-center md:text-right text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Terhubung: {formattedUpdated}
                  </div>
                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button
                      onClick={onResyncAccount}
                      disabled={isPending}
                      className="flex-1 md:flex-initial px-4 py-2 sm:py-2.5 rounded-xl bg-[#222226] hover:bg-black dark:bg-[#222226] dark:hover:bg-[#2c2c31] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                      title="Sinkronkan ulang data profil dari Meta API"
                    >
                      {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />}
                      <span className="truncate">Singkronkan ulang</span>
                    </button>
                    <button
                      onClick={onDisconnect}
                      disabled={isPending}
                      className="flex-1 md:flex-initial px-4 py-2 sm:py-2.5 rounded-xl bg-[#222226] hover:bg-black dark:bg-[#222226] dark:hover:bg-[#2c2c31] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                      title="Putuskan koneksi akun ini"
                    >
                      <span className="truncate">Putuskan Koneksi</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* DISCONNECTED STATE */
        <div className="rounded-2xl border border-gray-200 dark:border-[#2C3246] p-5 sm:p-6 bg-white dark:bg-[#141B31] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            {/* Left: Instagram Icon + Agent Info */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4.5 min-w-0 flex-1">
              <InstagramIcon className="w-12 h-12 sm:w-14 sm:h-14 text-gray-800 dark:text-gray-200 shrink-0" />

              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {agentDisplayName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal leading-relaxed mt-1">
                  Belum ada akun instagram terhubung, silahkan klik “Hubungkan Akun Instagram” sekarang.
                </p>
              </div>
            </div>

            {/* Right: Status (top right) & Action Button (bottom right) */}
            <div className="flex flex-col items-center md:items-end justify-between gap-3.5 sm:gap-4 shrink-0 md:self-stretch pt-3 md:pt-0 border-t border-gray-100 dark:border-white/5 md:border-t-0">
              <div className="w-full text-center md:text-right text-xs text-gray-400 dark:text-gray-500 font-normal">
                Belum Terhubung ke akun
              </div>
              <button
                onClick={() => onStartMetaOAuth(displayAccount?.id || selectedAgentId || account?.id)}
                disabled={isPending}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#222226] hover:bg-black dark:bg-[#222226] dark:hover:bg-[#2c2c31] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                title="Hubungkan akun Instagram Anda secara resmi via Meta"
              >
                {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />}
                <span>Hubungkan Akun IG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
