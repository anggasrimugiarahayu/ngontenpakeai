"use client";

import React, { useState } from "react";
import { adminUpdateUserAccessAction } from "@/app/actions/dashboard";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ShieldCheck,
  BookOpen,
  Wrench,
  Bot,
  Compass,
  Plus,
  Trash2,
  Crown,
  ShoppingBag,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export interface UserAccessManagerProps {
  user: any;
  onAccessUpdated?: (updatedUser: any) => void;
  formatIDR?: (num: number) => string;
}

export function UserAccessManager({
  user,
  onAccessUpdated,
  formatIDR = (num: number) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num),
}: UserAccessManagerProps) {
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 min-h-[360px]">
        <UserIcon className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium text-center">
          Pilih user dari daftar di samping untuk melihat detail & mengatur akses
          FREE / PRO
        </p>
      </div>
    );
  }

  const sub = user.subStatus || {};
  const orders = Array.isArray(user.orders) ? user.orders : [];

  const badgeColor =
    sub.badgeName === "ADMIN"
      ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
      : sub.isPro
      ? "bg-orange-500/15 text-orange-500 border-orange-500/30"
      : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent";

  const formatExpiry = (iso: string | null) => {
    if (!iso) return "Tidak aktif";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Tidak aktif";
    const isExpired = d <= new Date();
    const formatted = format(d, "d MMM yyyy", { locale: id });
    return isExpired ? `Berakhir (${formatted})` : `Aktif s/d ${formatted}`;
  };

  const handleUpdateAccess = async (params: {
    target: "book" | "tools" | "automation" | "riset" | "plus" | "revoke_all";
    mode: "grant" | "revoke";
    days?: number;
  }) => {
    const key = `${user.id}:${params.target}:${params.mode}`;
    setProcessingKey(key);
    try {
      const res = await adminUpdateUserAccessAction({
        userId: user.id,
        ...params,
      });
      if (res.success) {
        toast.success(res.message || "Akses user berhasil diperbarui");
        const updatedUser = res.updatedFields
          ? {
              ...user,
              ...res.updatedFields,
            }
          : user;
        onAccessUpdated?.(updatedUser);
      } else {
        toast.error(res.message || "Gagal memperbarui akses user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengubah akses user");
    } finally {
      setProcessingKey(null);
    }
  };

  const waClean = user.phone
    ? user.phone.replace(/\D/g, "").replace(/^0/, "62")
    : null;

  return (
    <div className="p-0 sm:p-4 text-sm space-y-4">
      <div className="flex items-center justify-between px-4 sm:px-0">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-500" />
          Detail & Akses User
        </h3>
        <span
          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase ${badgeColor}`}
        >
          {sub.badgeName || "FREE"}
        </span>
      </div>

      {/* Box 1: User Profile & Quick Summary */}
      <div className="bg-white dark:bg-[#141B31] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-[#2C3246] shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          <img
            src={
              user.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || user.email || "U"
              )}&background=FF6B00&color=fff`
            }
            alt={user.name || "User"}
            className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200 dark:border-[#2C3246]"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-base text-gray-900 dark:text-white truncate">
              {user.name || "Tanpa Nama"}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.email || "-"}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-1.5 text-xs mt-1">
                <Phone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <a
                  href={`https://wa.me/${waClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 font-semibold hover:underline"
                >
                  {user.phone} (Chat WA)
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-[#2C3246]">
          <div className="bg-gray-50 dark:bg-[#0A1128] rounded-lg p-2.5 text-center border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              Total Order
            </div>
            <div className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
              {user._count?.orders ?? orders.length}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#0A1128] rounded-lg p-2.5 text-center border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              E-Book Dimiliki
            </div>
            <div className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
              {user._count?.ownedProducts || 0}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#0A1128] rounded-lg p-2.5 text-center border border-gray-100 dark:border-[#2C3246]/60">
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              Generasi AI
            </div>
            <div className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
              {user._count?.usages || 0}x
            </div>
          </div>
        </div>
      </div>

      {/* Box 2: Kelola Akses 4 Pilar */}
      <div className="bg-white dark:bg-[#141B31] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-[#2C3246] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 dark:text-white">
            Pengaturan Akses 4 Pilar
          </h4>
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            aria-label="Pilih durasi penambahan hari"
            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] text-gray-800 dark:text-gray-200"
          >
            <option value={30}>+30 Hari (1 Bln)</option>
            <option value={90}>+90 Hari (3 Bln)</option>
            <option value={365}>+365 Hari (1 Thn)</option>
          </select>
        </div>

        {/* Quick Actions: Beri PRO PLUS & Reset FREE (Atas & Bawah, lega & rapi) */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() =>
              handleUpdateAccess({
                target: "plus",
                mode: "grant",
                days: selectedDays,
              })
            }
            disabled={processingKey !== null}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Crown size={14} className="shrink-0" />
            <span>Beri PRO PLUS (+{selectedDays} Hari)</span>
          </button>

          {sub.isPro && !sub.isAdmin && (
            <button
              onClick={() =>
                handleUpdateAccess({
                  target: "revoke_all",
                  mode: "revoke",
                })
              }
              disabled={processingKey !== null}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={13} className="shrink-0" />
              <span>Reset ke Status FREE</span>
            </button>
          )}
        </div>

        {/* 4 Individual Pillar Controls */}
        <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-[#2C3246]">
          {/* Pillar 1: E-Book PRO */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-[#0A1128] border border-gray-200/80 dark:border-[#2C3246]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                <BookOpen size={14} className="text-orange-500 shrink-0" />
                <span>E-Book PRO (Ruang Belajar)</span>
              </div>
              <div
                className={`text-[11px] mt-0.5 font-medium ${
                  sub.hasBook
                    ? "text-emerald-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {sub.hasBook ? "Aktif Selamanya" : "Tidak aktif"}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!sub.hasBook ? (
                <button
                  onClick={() =>
                    handleUpdateAccess({
                      target: "book",
                      mode: "grant",
                    })
                  }
                  disabled={processingKey !== null}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
                >
                  Aktifkan
                </button>
              ) : (
                !sub.isAdmin && (
                  <button
                    onClick={() =>
                      handleUpdateAccess({
                        target: "book",
                        mode: "revoke",
                      })
                    }
                    disabled={processingKey !== null}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                  >
                    Cabut
                  </button>
                )
              )}
            </div>
          </div>

          {/* Pillar 2: AI Tools */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-[#0A1128] border border-gray-200/80 dark:border-[#2C3246]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                <Wrench size={14} className="text-blue-500 shrink-0" />
                <span>AI Tools (Ruang Ngonten)</span>
              </div>
              <div
                className={`text-[11px] mt-0.5 font-medium ${
                  sub.hasTools
                    ? "text-emerald-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {formatExpiry(sub.proToolsExpiredAt)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() =>
                  handleUpdateAccess({
                    target: "tools",
                    mode: "grant",
                    days: selectedDays,
                  })
                }
                disabled={processingKey !== null}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={11} />
                {selectedDays}h
              </button>
              {sub.hasTools && !sub.isAdmin && (
                <button
                  onClick={() =>
                    handleUpdateAccess({
                      target: "tools",
                      mode: "revoke",
                    })
                  }
                  disabled={processingKey !== null}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                >
                  Cabut
                </button>
              )}
            </div>
          </div>

          {/* Pillar 3: Automation */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-[#0A1128] border border-gray-200/80 dark:border-[#2C3246]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                <Bot size={14} className="text-emerald-500 shrink-0" />
                <span>Ruang Automation</span>
              </div>
              <div
                className={`text-[11px] mt-0.5 font-medium ${
                  sub.hasAutomation
                    ? "text-emerald-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {formatExpiry(sub.proAutomationExpiredAt)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() =>
                  handleUpdateAccess({
                    target: "automation",
                    mode: "grant",
                    days: selectedDays,
                  })
                }
                disabled={processingKey !== null}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={11} />
                {selectedDays}h
              </button>
              {sub.hasAutomation && !sub.isAdmin && (
                <button
                  onClick={() =>
                    handleUpdateAccess({
                      target: "automation",
                      mode: "revoke",
                    })
                  }
                  disabled={processingKey !== null}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                >
                  Cabut
                </button>
              )}
            </div>
          </div>

          {/* Pillar 4: Ruang Riset */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-[#0A1128] border border-gray-200/80 dark:border-[#2C3246]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                <Compass size={14} className="text-pink-500 shrink-0" />
                <span>Ruang Riset</span>
              </div>
              <div
                className={`text-[11px] mt-0.5 font-medium ${
                  sub.hasRiset
                    ? "text-emerald-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {formatExpiry(sub.proRisetExpiredAt)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() =>
                  handleUpdateAccess({
                    target: "riset",
                    mode: "grant",
                    days: selectedDays,
                  })
                }
                disabled={processingKey !== null}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20 hover:bg-pink-500/20 cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={11} />
                {selectedDays}h
              </button>
              {sub.hasRiset && !sub.isAdmin && (
                <button
                  onClick={() =>
                    handleUpdateAccess({
                      target: "riset",
                      mode: "revoke",
                    })
                  }
                  disabled={processingKey !== null}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                >
                  Cabut
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Box 3: Riwayat Order User */}
      <div className="bg-white dark:bg-[#141B31] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-[#2C3246] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <ShoppingBag size={15} className="text-orange-500" />
            <span>Riwayat Order User ({orders.length})</span>
          </h4>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic py-2">
            User ini belum memiliki riwayat transaksi.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {orders.map((o: any) => (
              <div
                key={o.id}
                className="p-3 rounded-xl bg-gray-50/70 dark:bg-[#0A1128] border border-gray-100 dark:border-[#2C3246] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
                    {o.resolvedTitle || o.orderType}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {format(new Date(o.createdAt), "d MMM yyyy HH:mm", {
                      locale: id,
                    })}{" "}
                    • Rp {formatIDR(o.amount || 0)}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    o.status === "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : o.status === "FAILED"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
