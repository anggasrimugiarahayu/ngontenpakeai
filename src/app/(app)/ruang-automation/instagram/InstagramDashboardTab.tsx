"use client";

import React from "react";
import {
  MessageSquare,
  Send,
  Bot,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { parseClientLogMeta, formatDateTimeId } from "../utils/automationHelpers";

interface InstagramDashboardTabProps {
  stats: { totalComments: number; totalDms: number };
  rules: any[];
  logs: any[];
}

export function InstagramDashboardTab({
  stats,
  rules,
  logs,
}: InstagramDashboardTabProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  const fourteenDaysAgoMs = React.useMemo(
    () => Date.now() - 14 * 24 * 60 * 60 * 1000,
    []
  );

  const recent14dLogs = React.useMemo(() => {
    return (logs || []).filter((l: any) => {
      const ts = l.createdAt ? new Date(l.createdAt).getTime() : Date.now();
      return ts >= fourteenDaysAgoMs;
    });
  }, [logs, fourteenDaysAgoMs]);

  const totalPages = Math.ceil(recent14dLogs.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = recent14dLogs.slice(startIndex, endIndex);

  // Jika halaman melebihi total halaman (misal filter berubah), reset ke halaman 1
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Komentar Terjawab (1 Line) */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-[#2C3246] p-5 bg-white dark:bg-[#141B31] space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 gap-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap truncate">
              Komentar Terjawab
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
            {stats.totalComments || 0}
          </div>
          <p className="text-[11px] text-gray-400">Total balasan komentar otomatis</p>
        </div>

        {/* Card 2: DM Terkirim */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-[#2C3246] p-5 bg-white dark:bg-[#141B31] space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 gap-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap truncate">
              DM Terkirim
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
            {stats.totalDms || 0}
          </div>
          <p className="text-[11px] text-gray-400">Total pesan privat terkirim</p>
        </div>

        {/* Card 3: Instagram Automation */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-[#2C3246] p-5 bg-white dark:bg-[#141B31] space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 gap-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap truncate">
              Instagram Automation
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
            {rules.length}
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold">
            {rules.filter((r: any) => r.isActive).length} Aktif berjalan
          </p>
        </div>

        {/* Card 4: Tingkat Sukses */}
        <div className="rounded-2xl border-2 border-gray-200 dark:border-[#2C3246] p-5 bg-white dark:bg-[#141B31] space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 gap-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap truncate">
              Tingkat Sukses
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
            100%
          </div>
          <p className="text-[11px] text-gray-400">Eksekusi webhook realtime</p>
        </div>
      </div>

      {/* LOG KOMENTAR (14 HARI TERAKHIR) DENGAN TABEL LENGKAP & PAGINASI */}
      <div className="rounded-2xl border-2 border-gray-200 dark:border-[#2C3246] p-5 sm:p-6 bg-white dark:bg-[#141B31] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-500" /> Log Komentar
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Log ini menampilkan komentar dari 14 hari terakhir yang memicu otomatisasi
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 self-start sm:self-auto">
            {recent14dLogs.length} Log (14 Hari Terakhir)
          </span>
        </div>

        {recent14dLogs.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-[#2C3246] rounded-xl">
            Belum ada komentar dalam 14 hari terakhir yang memicu otomatisasi.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Tabel Log */}
            <div className="overflow-x-auto border border-gray-200 dark:border-[#2C3246] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#141B31] border-b border-gray-200 dark:border-[#2C3246] text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Komentar</th>
                    <th className="py-3 px-4">Pesan</th>
                    <th className="py-3 px-4">Balasan Komentar</th>
                    <th className="py-3 px-4">Dikomentari pada</th>
                    <th className="py-3 px-4">Diproses pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {paginatedLogs.map((log: any) => {
                    const meta = parseClientLogMeta(log.errorMessage);
                    const isDmSent = log.dmStatus === "SENT";
                    const isReplySent = log.replyCommentStatus === "SENT";
                    const commentedAtStr = formatDateTimeId(
                      meta.commentedAt || log.createdAt
                    );
                    const processedAtStr = formatDateTimeId(log.createdAt);

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 dark:text-white">
                            @{log.fromUsername ? log.fromUsername.replace(/^@/, "") : (log.commenterUsername || "user")}
                          </div>
                          <div className="text-gray-600 dark:text-gray-300 mt-0.5">
                            &quot;{log.commentText || "-"}&quot;
                          </div>
                          {meta.contact && (
                            <span className="mt-1 inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                              Kontak: {meta.contact}
                            </span>
                          )}
                          {meta.clicked && (
                            <span className="mt-1 ml-1 inline-block px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-semibold">
                              Klik Link ({meta.clickCount || 1}x)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isDmSent
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isDmSent ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Terkirim
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Tidak
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isReplySent
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {isReplySent ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Terkirim
                              </>
                            ) : (
                              "Tidak"
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {commentedAtStr}
                        </td>

                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {processedAtStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-[#2C3246] text-xs text-gray-500">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span>–
                  <span className="font-semibold text-gray-900 dark:text-white">{Math.min(endIndex, recent14dLogs.length)}</span> dari{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">{recent14dLogs.length}</span> log
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-2.5 sm:px-3 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        const prevPage = arr[idx - 1];
                        const hasGap = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {hasGap && (
                              <span className="w-6 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                                ...
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                currentPage === page
                                  ? "bg-orange-500 text-white border border-orange-500 shadow-sm"
                                  : "border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-300 font-bold"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 px-2.5 sm:px-3 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
