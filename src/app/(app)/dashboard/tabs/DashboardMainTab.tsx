"use client";

import React from "react";
import {
  User,
  CheckCircle2,
  Link as LinkIcon,
  TrendingUp,
  Layers,
  Users,
  ShoppingBag,
  Calendar as CalendarIcon,
  Eye,
  Send,
  BookOpen,
  Sparkles,
  Bot,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";

interface DashboardMainTabProps {
  data: any;
  chartData: any[];
  dynamicTotalViews: number;
  dynamicTotalClicks: number;
  date: DateRange | undefined;
  setDate: (val: DateRange | undefined) => void;
  showDatePicker: boolean;
  setShowDatePicker: (val: boolean) => void;
  formatIDR: (num: number) => string;
}

export function DashboardMainTab({
  data,
  chartData,
  dynamicTotalViews,
  dynamicTotalClicks,
  date,
  setDate,
  showDatePicker,
  setShowDatePicker,
  formatIDR,
}: DashboardMainTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Section: User Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#2C3246] flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Total Users
              </p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {formatIDR(data.totalUsers)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141B31] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#2C3246] flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
              <User size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Free Users
              </p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {formatIDR(data.totalUsersFree)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141B31] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#2C3246] flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-0.5">
                Pro Users
              </p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {formatIDR(data.totalUsersPro)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#141B31] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#2C3246] flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">
                Monthly Subscribers
              </p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {formatIDR(data.totalSubscribers)}
              </h3>
            </div>
          </div>
        </div>

        {/* Right Card: Earnings */}
        <div className="md:col-span-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#141B31] dark:to-[#0d1326] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-[#2C3246] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 bg-white/50 dark:bg-[#141B31] backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/40 dark:border-[#2C3246] shadow-sm">
                <div className="w-6 h-6 rounded-full border-[3px] border-gray-300 dark:border-gray-500"></div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-sm">Earnings</span>
                  <Eye size={14} className="opacity-50 cursor-pointer" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5 tracking-tight">
                  <span className="text-base font-bold mr-1">IDR</span>
                  {formatIDR(data.earningsIDR)}
                </h2>
              </div>
            </div>
            <a href="/pengaturan" className="text-gray-500 dark:text-gray-400 text-[11px] font-medium mt-2 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
              Pengaturan Pembayaran & Kuota
            </a>
          </div>

          <div className="mt-4 bg-white/70 dark:bg-[#0A1128]/60 backdrop-blur-md p-2.5 rounded-xl border border-white/50 dark:border-[#2C3246] flex items-center justify-between group">
            <div className="px-1 overflow-hidden">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                Link Checkout Platform
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium truncate w-full">
                /checkout
              </p>
            </div>
            <a
              href="/checkout"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-lg shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <LinkIcon size={12} />
            </a>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <Send size={40} className="transform -rotate-12" />
          </div>
        </div>
      </div>

      {/* 4 Pilar Pro Users Breakdown */}
      <div className="bg-white dark:bg-[#141B31] rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 dark:border-[#2C3246]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-rn-accent" />
            Distribusi Pengguna Aktif per 4 Pilar Platform
          </h3>
          <span className="text-[11px] text-gray-400 font-medium">Status Hak Akses Aktif</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
              <BookOpen size={14} />
              Ruang Belajar
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {formatIDR(data.pillarStats?.belajar || 0)} <span className="text-xs font-normal text-gray-500">user</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
            <div className="flex items-center gap-2 mb-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold">
              <Sparkles size={14} />
              Ruang Ngonten
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {formatIDR(data.pillarStats?.ngonten || 0)} <span className="text-xs font-normal text-gray-500">user</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Bot size={14} />
              Ruang Automation
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {formatIDR(data.pillarStats?.automation || 0)} <span className="text-xs font-normal text-gray-500">user</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-2 mb-1.5 text-purple-600 dark:text-purple-400 text-xs font-bold">
              <Search size={14} />
              Ruang Riset
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white">
              {formatIDR(data.pillarStats?.riset || 0)} <span className="text-xs font-normal text-gray-500">user</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#141B31] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-[#2C3246]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Total Views & Clicks
            </h2>
            <div className="flex items-center gap-5">
              <div>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Views
                </div>
                <div className="text-xl font-black text-gray-900 dark:text-white">
                  {formatIDR(dynamicTotalViews)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Clicks
                </div>
                <div className="text-xl font-black text-gray-900 dark:text-white">
                  {formatIDR(dynamicTotalClicks)}
                </div>
              </div>
            </div>
          </div>

          {/* Popover Date Filter */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-200 transition-colors shadow-2xs cursor-pointer"
            >
              <CalendarIcon size={16} className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Select Date..</span>
                )}
              </span>
            </button>

            {showDatePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDatePicker(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-[#141B31] rounded-xl shadow-xl border border-gray-200 dark:border-[#2C3246] p-3">
                  <style>{`
                    .rdp {
                      --rdp-cell-size: 32px !important;
                      --rdp-accent-color: #f97316 !important;
                      --rdp-background-color: #f97316 !important;
                      --rdp-accent-color-dark: #f97316 !important;
                      --rdp-background-color-dark: #ea580c !important;
                      --rdp-outline: 2px solid var(--rdp-accent-color);
                      --rdp-outline-selected: 2px solid var(--rdp-accent-color);
                      margin: 0;
                    }
                    .dark .rdp-day_selected, .dark .rdp-day_selected:focus-visible, .dark .rdp-day_selected:hover {
                       color: white;
                       background-color: #ea580c;
                    }
                    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                       color: white;
                       background-color: #f97316;
                    }
                  `}</style>
                  <DayPicker
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      if (newDate?.from && newDate?.to) {
                        setShowDatePicker(false);
                      }
                    }}
                    numberOfMonths={1}
                    disabled={(d) => d > new Date()}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              barGap={0}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#333"
                opacity={0.15}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="clicks"
                stackId="a"
                fill="#10b981"
                radius={[0, 0, 4, 4]}
                barSize={8}
              />
              <Bar
                dataKey="views"
                stackId="a"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                barSize={8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#141B31] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#2C3246] flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Lifetime Sales (IDR)
            </p>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              {formatIDR(data.lifetimeSalesIDR)}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141B31] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#2C3246] flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              My Digital Product
            </p>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              {formatIDR(data.totalDigitalProducts)}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141B31] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#2C3246] flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <ShoppingBag size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              Lifetime Orders
            </p>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              {formatIDR(data.lifetimeOrders)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
