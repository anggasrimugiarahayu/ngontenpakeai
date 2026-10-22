"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { InstagramIcon } from "../components/AutomationIcons";
import { Button } from "@/components/ui/Button";
import { tokens, cn } from "@/lib/design-tokens";

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
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-200 dark:border-[#2C3246] bg-gray-100 dark:bg-[#0F172A] overflow-hidden shrink-0 shadow-2xs">
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
                <div className="flex flex-col items-center md:items-end justify-between gap-3.5 sm:gap-4 shrink-0 md:self-stretch pt-3 md:pt-0 border-t border-gray-100 dark:border-[#2C3246] md:border-t-0">
                  <div className="w-full text-center md:text-right text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Terhubung: {formattedUpdated}
                  </div>
                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={onResyncAccount}
                      disabled={isPending}
                      isLoading={isPending}
                      className="flex-1 md:flex-initial"
                      title="Sinkronkan ulang data profil dari Meta API"
                    >
                      <span className="truncate">Singkronkan ulang</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={onDisconnect}
                      disabled={isPending}
                      className="flex-1 md:flex-initial"
                      title="Putuskan koneksi akun ini"
                    >
                      <span className="truncate">Putuskan Koneksi</span>
                    </Button>
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
            <div className="flex flex-col items-center md:items-end justify-between gap-3.5 sm:gap-4 shrink-0 md:self-stretch pt-3 md:pt-0 border-t border-gray-100 dark:border-[#2C3246] md:border-t-0">
              <div className="w-full text-center md:text-right text-xs text-gray-400 dark:text-gray-500 font-normal">
                Belum Terhubung ke akun
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => onStartMetaOAuth(displayAccount?.id || selectedAgentId || account?.id)}
                disabled={isPending}
                isLoading={isPending}
                className="w-full md:w-auto"
                title="Hubungkan akun Instagram Anda secara resmi via Meta"
              >
                <span>Hubungkan Akun IG</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
