"use client";

import React from "react";
import {
  Search,
  ShieldCheck,
  BookOpen,
  Wrench,
  Bot,
  Compass,
  ShoppingBag,
  X,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAccessManager } from "@/components/admin/UserAccessManager";

export interface DashboardUsersTabProps {
  users: any[];
  totalUsers: number;
  itemsPerPage: number;
  userPage: number;
  setUserPage: React.Dispatch<React.SetStateAction<number>>;
  userSearch: string;
  setUserSearch: (val: string) => void;
  userFilter: "all" | "pro" | "free";
  setUserFilter: (val: "all" | "pro" | "free") => void;
  selectedUser: any;
  handleUserSelect: (user: any) => void;
  isUserMobileModalOpen: boolean;
  setIsUserMobileModalOpen: (val: boolean) => void;
  onAccessUpdated: (updatedUser: any) => void;
  formatIDR: (num: number) => string;
}

export function DashboardUsersTab({
  users,
  totalUsers,
  itemsPerPage,
  userPage,
  setUserPage,
  userSearch,
  setUserSearch,
  userFilter,
  setUserFilter,
  selectedUser,
  handleUserSelect,
  isUserMobileModalOpen,
  setIsUserMobileModalOpen,
  onAccessUpdated,
  formatIDR,
}: DashboardUsersTabProps) {
  const totalPages = Math.max(1, Math.ceil(totalUsers / itemsPerPage));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column: Clean User List */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl border border-gray-100 dark:border-[#2C3246] shadow-xs overflow-hidden flex flex-col h-full">
            {/* Header & Filters */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-[#2C3246] space-y-4 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    Daftar User ({totalUsers})
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Klik salah satu user untuk melihat riwayat order & mengatur
                    akses FREE / PRO.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {(
                    [
                      { id: "all", label: "Semua" },
                      { id: "pro", label: "PRO Aktif" },
                      { id: "free", label: "FREE" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setUserFilter(f.id);
                        setUserPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        userFilter === f.id
                          ? "bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400"
                          : "border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1C2542]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau nomor WhatsApp user..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
              {users.length === 0 ? (
                <EmptyState
                  title="User tidak ditemukan"
                  description="Tidak ada data user yang sesuai dengan kata kunci atau filter status."
                  className="min-h-[220px]"
                />
              ) : (
                users.map((u: any) => {
                  const isSelected = selectedUser?.id === u.id;
                  const sub = u.subStatus || {};
                  const userOrders = Array.isArray(u.orders) ? u.orders : [];
                  const successOrders = userOrders.filter(
                    (o: any) => o.status === "SUCCESS"
                  );

                  const badgeColor =
                    sub.badgeName === "ADMIN"
                      ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                      : sub.isPro
                      ? "bg-orange-500/15 text-orange-500 border-orange-500/30"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent";

                  const orderSummary =
                    successOrders.length > 0
                      ? successOrders
                          .slice(0, 2)
                          .map((o: any) => o.resolvedTitle || o.orderType)
                          .join(", ") +
                        (successOrders.length > 2
                          ? ` +${successOrders.length - 2} lainnya`
                          : "")
                      : "Belum ada order";

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleUserSelect(u)}
                      className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-orange-500 ring-1 ring-orange-500 bg-orange-50/40 dark:bg-orange-500/5"
                          : "border-gray-200 dark:border-[#2C3246] hover:border-orange-500/50 bg-white dark:bg-[#141B31]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
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
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {u.name || "Tanpa Nama"}
                              </h3>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${badgeColor}`}
                              >
                                {sub.badgeName || "FREE"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                              <span className="truncate">{u.email}</span>
                              {u.phone && <span>• WA: {u.phone}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserSelect(u);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 hover:bg-orange-500 hover:text-white dark:bg-[#1f2947] dark:hover:bg-orange-500 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          Kelola
                        </button>
                      </div>

                      {/* Bottom Row: Active Pillar Indicators & Order Summary */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-[#2C3246]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              sub.hasBook
                                ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                : "bg-gray-100 dark:bg-[#0A1128] text-gray-400 dark:text-gray-500 border-transparent"
                            }`}
                          >
                            <BookOpen size={10} />
                            E-Book
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              sub.hasTools
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-gray-100 dark:bg-[#0A1128] text-gray-400 dark:text-gray-500 border-transparent"
                            }`}
                          >
                            <Wrench size={10} />
                            Tools
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              sub.hasAutomation
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-gray-100 dark:bg-[#0A1128] text-gray-400 dark:text-gray-500 border-transparent"
                            }`}
                          >
                            <Bot size={10} />
                            Auto
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              sub.hasRiset
                                ? "bg-pink-500/10 text-pink-500 border-pink-500/20"
                                : "bg-gray-100 dark:bg-[#0A1128] text-gray-400 dark:text-gray-500 border-transparent"
                            }`}
                          >
                            <Compass size={10} />
                            Riset
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          <ShoppingBag size={12} className="shrink-0 text-gray-400" />
                          <span className="truncate">{orderSummary}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-[#2C3246] bg-white dark:bg-[#141B31] shrink-0">
              <Pagination
                currentPage={userPage}
                totalPages={totalPages}
                onPageChange={(p) => setUserPage(p)}
                totalItems={totalUsers}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Centralized User Access Manager (Desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl border border-gray-100 dark:border-[#2C3246] shadow-xs overflow-hidden h-full">
            <UserAccessManager
              user={selectedUser}
              onAccessUpdated={onAccessUpdated}
              formatIDR={formatIDR}
            />
          </div>
        </div>

        {/* Mobile Modal for Centralized User Access Manager */}
        {isUserMobileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsUserMobileModalOpen(false)}
            ></div>
            <div className="relative bg-white dark:bg-[#141B31] w-full sm:w-[90%] sm:max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10">
              <div className="sticky top-0 right-0 p-4 flex justify-end bg-linear-to-b from-white dark:from-[#141B31] to-transparent z-10 pointer-events-none">
                <button
                  onClick={() => setIsUserMobileModalOpen(false)}
                  className="p-2 bg-white hover:bg-gray-50 dark:bg-[#141B31] dark:hover:bg-[#1f2947] border border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-300 rounded-full transition-colors pointer-events-auto shadow-xs cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="-mt-14 pb-4">
                <UserAccessManager
                  user={selectedUser}
                  onAccessUpdated={onAccessUpdated}
                  formatIDR={formatIDR}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
