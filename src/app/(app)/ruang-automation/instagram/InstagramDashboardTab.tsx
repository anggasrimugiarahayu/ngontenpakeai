"use client";

import React from "react";
import { MessageSquare, Send, Bot, TrendingUp, Clock } from "lucide-react";

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
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-[#18181b] space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Komentar Terjawab</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
            {stats.totalComments || 0}
          </div>
          <p className="text-[11px] text-gray-400">Total balasan komentar otomatis</p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-[#18181b] space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">DM Terkirim</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
            {stats.totalDms || 0}
          </div>
          <p className="text-[11px] text-gray-400">Total pesan privat terkirim</p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-[#18181b] space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Aturan Otomasi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
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

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-[#18181b] space-y-2">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tingkat Sukses</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
            100%
          </div>
          <p className="text-[11px] text-gray-400">Eksekusi webhook realtime</p>
        </div>
      </div>

      {/* RIWAYAT LOG AKTIVITAS AUTOMASI */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-[#18181b] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" /> Riwayat Log Automasi Terkini
            </h4>
            <p className="text-xs text-gray-500">
              Memantau eksekusi balasan komentar dan pengiriman DM secara realtime.
            </p>
          </div>
          <span className="text-xs text-gray-400">{logs.length} Log Terakhir</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            Belum ada aktivitas automasi yang tercatat. Log akan muncul otomatis saat ada user yang berkomentar di Instagram Anda.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-72 overflow-y-auto">
            {logs.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    @{log.fromUsername || log.commenterUsername || "user"}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    Komentar:{" "}
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      &quot;{log.commentText || "-"}&quot;
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.replyCommentStatus === "SENT"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Komentar: {log.replyCommentStatus || "N/A"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.dmStatus === "SENT"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-gray-100 dark:bg-white/5 text-gray-500"
                    }`}
                  >
                    DM: {log.dmStatus || "N/A"}
                  </span>
                  <span className="text-gray-400 text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
