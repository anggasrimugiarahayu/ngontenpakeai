"use client";

import React, { useEffect, useState } from "react";
import {
  getDashboardUsersAction,
  adminUpdateUserAccessAction,
} from "@/app/actions/dashboard";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Search,
  ShieldCheck,
  BookOpen,
  Wrench,
  Bot,
  Compass,
  Plus,
  Trash2,
  Crown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export function DashboardUsersTab({
  onAccessUpdated,
}: {
  onAccessUpdated?: () => void;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pro" | "free">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [selectedDaysMap, setSelectedDaysMap] = useState<Record<string, number>>(
    {}
  );
  const limit = 10;

  const fetchUsers = async (
    targetPage = page,
    targetSearch = search,
    targetFilter = filter
  ) => {
    setIsLoading(true);
    try {
      const res = await getDashboardUsersAction(
        targetPage,
        limit,
        targetSearch,
        targetFilter
      );
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Gagal memuat daftar user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(page, search, filter);
    }, 350);
    return () => clearTimeout(timer);
  }, [page, search, filter]);

  const getDaysForUser = (userId: string) => selectedDaysMap[userId] || 30;

  const handleUpdateAccess = async (params: {
    userId: string;
    target: "book" | "tools" | "automation" | "riset" | "plus" | "revoke_all";
    mode: "grant" | "revoke";
    days?: number;
  }) => {
    const key = `${params.userId}:${params.target}:${params.mode}`;
    setProcessingKey(key);
    try {
      const res = await adminUpdateUserAccessAction(params);
      if (res.success) {
        toast.success(res.message || "Akses user berhasil diperbarui");
        await fetchUsers(page, search, filter);
        onAccessUpdated?.();
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

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const formatExpiry = (iso: string | null) => {
    if (!iso) return "Tidak aktif";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Tidak aktif";
    const isExpired = d <= new Date();
    const formatted = format(d, "d MMM yyyy", { locale: id });
    return isExpired ? `Exp: ${formatted}` : `s/d ${formatted}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-orange-500" />
              Kelola Akses FREE & PRO User
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Pantau dan atur status akses 4 pilar (E-Book, AI Tools, Automation,
              Riset) untuk setiap user secara manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "all", label: "Semua User" },
                { id: "pro", label: "PRO Aktif" },
                { id: "free", label: "FREE" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  filter === f.id
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400"
                    : "border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1C2542]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, email, atau nomor WA user..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0D1322] text-gray-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Total ditemukan:{" "}
              <strong className="text-gray-900 dark:text-white">{total}</strong>{" "}
              user
            </span>
            <button
              onClick={() => fetchUsers(page, search, filter)}
              className="p-2 rounded-lg border border-gray-200 dark:border-[#2C3246] hover:bg-gray-50 dark:hover:bg-[#1C2542] text-gray-600 dark:text-gray-300 cursor-pointer"
              title="Muat ulang daftar user"
            >
              <RefreshCw
                size={13}
                className={isLoading ? "animate-spin text-orange-500" : ""}
              />
            </button>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Memuat data user...
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Tidak ada user yang sesuai dengan pencarian.
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => {
              const sub = u.subStatus || {};
              const days = getDaysForUser(u.id);
              const badgeColor =
                sub.badgeName === "ADMIN"
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  : sub.isPro
                  ? "bg-orange-500/15 text-orange-500 border-orange-500/30"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent";

              return (
                <div
                  key={u.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0D1322]/60 space-y-4"
                >
                  {/* Top Row: User Info + Quick Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <img
                        src={
                          u.image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            u.name || u.email || "U"
                          )}&background=FF6B00&color=fff`
                        }
                        alt={u.name || "User"}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 dark:border-[#2C3246]"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {u.name || "Tanpa Nama"}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${badgeColor}`}
                          >
                            {sub.badgeName || "FREE"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>{u.email}</span>
                          {u.phone && <span>• WA: {u.phone}</span>}
                          <span>
                            • {u._count?.orders || 0} Order •{" "}
                            {u._count?.ownedProducts || 0} Ebook
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Duration Selector & Quick All-In-One Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={days}
                        onChange={(e) =>
                          setSelectedDaysMap((prev) => ({
                            ...prev,
                            [u.id]: Number(e.target.value),
                          }))
                        }
                        aria-label="Pilih durasi penambahan hari"
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-gray-800 dark:text-gray-200"
                      >
                        <option value={30}>+30 Hari (1 Bulan)</option>
                        <option value={90}>+90 Hari (3 Bulan)</option>
                        <option value={365}>+365 Hari (1 Tahun)</option>
                      </select>

                      <button
                        onClick={() =>
                          handleUpdateAccess({
                            userId: u.id,
                            target: "plus",
                            mode: "grant",
                            days,
                          })
                        }
                        disabled={processingKey !== null}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50 cursor-pointer"
                        title="Aktifkan semua 4 pilar (E-Book Selamanya + Tools, Auto, Riset sesuai durasi)"
                      >
                        <Crown size={13} />
                        <span>Beri PRO PLUS (+{days}h)</span>
                      </button>

                      {sub.isPro && !sub.isAdmin && (
                        <button
                          onClick={() =>
                            handleUpdateAccess({
                              userId: u.id,
                              target: "revoke_all",
                              mode: "revoke",
                            })
                          }
                          disabled={processingKey !== null}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
                          title="Reset semua akses user kembali ke FREE"
                        >
                          <Trash2 size={12} />
                          <span>Reset ke FREE</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 Pillars Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-gray-200/70 dark:border-[#2C3246]/60">
                    {/* Pillar 1: E-Book */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#141B31] border border-gray-200/80 dark:border-[#2C3246]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                          <BookOpen size={13} className="text-orange-500 shrink-0" />
                          <span className="truncate">E-Book PRO</span>
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
                      <div className="flex items-center gap-1 shrink-0">
                        {!sub.hasBook ? (
                          <button
                            onClick={() =>
                              handleUpdateAccess({
                                userId: u.id,
                                target: "book",
                                mode: "grant",
                              })
                            }
                            disabled={processingKey !== null}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
                          >
                            Aktifkan
                          </button>
                        ) : (
                          !sub.isAdmin && (
                            <button
                              onClick={() =>
                                handleUpdateAccess({
                                  userId: u.id,
                                  target: "book",
                                  mode: "revoke",
                                })
                              }
                              disabled={processingKey !== null}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                            >
                              Cabut
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Pillar 2: AI Tools */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#141B31] border border-gray-200/80 dark:border-[#2C3246]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                          <Wrench size={13} className="text-blue-500 shrink-0" />
                          <span className="truncate">AI Tools</span>
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
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            handleUpdateAccess({
                              userId: u.id,
                              target: "tools",
                              mode: "grant",
                              days,
                            })
                          }
                          disabled={processingKey !== null}
                          className="px-2 py-1 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 cursor-pointer flex items-center gap-0.5"
                          title={`Tambah +${days} hari AI Tools`}
                        >
                          <Plus size={10} />
                          {days}h
                        </button>
                        {sub.hasTools && !sub.isAdmin && (
                          <button
                            onClick={() =>
                              handleUpdateAccess({
                                userId: u.id,
                                target: "tools",
                                mode: "revoke",
                              })
                            }
                            disabled={processingKey !== null}
                            className="px-1.5 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
                            title="Cabut akses AI Tools"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pillar 3: Automation */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#141B31] border border-gray-200/80 dark:border-[#2C3246]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                          <Bot size={13} className="text-emerald-500 shrink-0" />
                          <span className="truncate">Automation</span>
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
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            handleUpdateAccess({
                              userId: u.id,
                              target: "automation",
                              mode: "grant",
                              days,
                            })
                          }
                          disabled={processingKey !== null}
                          className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer flex items-center gap-0.5"
                          title={`Tambah +${days} hari Automation`}
                        >
                          <Plus size={10} />
                          {days}h
                        </button>
                        {sub.hasAutomation && !sub.isAdmin && (
                          <button
                            onClick={() =>
                              handleUpdateAccess({
                                userId: u.id,
                                target: "automation",
                                mode: "revoke",
                              })
                            }
                            disabled={processingKey !== null}
                            className="px-1.5 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
                            title="Cabut akses Automation"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pillar 4: Riset */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#141B31] border border-gray-200/80 dark:border-[#2C3246]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                          <Compass size={13} className="text-pink-500 shrink-0" />
                          <span className="truncate">Ruang Riset</span>
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
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            handleUpdateAccess({
                              userId: u.id,
                              target: "riset",
                              mode: "grant",
                              days,
                            })
                          }
                          disabled={processingKey !== null}
                          className="px-2 py-1 rounded text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20 hover:bg-pink-500/20 cursor-pointer flex items-center gap-0.5"
                          title={`Tambah +${days} hari Ruang Riset`}
                        >
                          <Plus size={10} />
                          {days}h
                        </button>
                        {sub.hasRiset && !sub.isAdmin && (
                          <button
                            onClick={() =>
                              handleUpdateAccess({
                                userId: u.id,
                                target: "riset",
                                mode: "revoke",
                              })
                            }
                            disabled={processingKey !== null}
                            className="px-1.5 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer"
                            title="Cabut akses Ruang Riset"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-gray-100 dark:border-[#2C3246]">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-[#2C3246] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-[#2C3246] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
