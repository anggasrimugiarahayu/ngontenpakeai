"use client";

import React from "react";
import NextLink from "next/link";
import { ArrowUp, ArrowDown, Search, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DONUT_COLORS = ["#059669", "#f59e0b", "#10b981", "#d97706", "#047857"];

interface DashboardStatisticsTabProps {
  data: any;
  dynamicTotalViews: number;
  dynamicTotalClicks: number;
  salesChartData: any[];
  formatIDR: (num: number) => string;
  formatShortIDR: (num: number) => string;
  selectedPackage: any;
  setSelectedPackage: (val: any) => void;
  isPackageModalOpen: boolean;
  setIsPackageModalOpen: (val: boolean) => void;
}

export function DashboardStatisticsTab({
  data,
  dynamicTotalViews,
  dynamicTotalClicks,
  salesChartData,
  formatIDR,
  formatShortIDR,
  selectedPackage,
  setSelectedPackage,
  isPackageModalOpen,
  setIsPackageModalOpen,
}: DashboardStatisticsTabProps) {
  const pieData =
    data.realProductSales && data.realProductSales.length > 0
      ? data.realProductSales
          .filter((p: any) => p.sold > 0)
          .map((p: any) => ({
            name: p.title.substring(0, 15) + "...",
            value: p.sold,
          }))
      : [{ name: "No Sales", value: 1 }];

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246] flex flex-col justify-center">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              Total Views & Clicks
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {formatIDR(dynamicTotalViews + dynamicTotalClicks)}
              </h3>
              {data.viewsGrowth >= 0 ? (
                <span className="text-xs font-bold text-emerald-500 flex items-center">
                  <ArrowUp size={12} /> {data.viewsGrowth}%
                </span>
              ) : (
                <span className="text-xs font-bold text-red-500 flex items-center">
                  <ArrowDown size={12} /> {Math.abs(data.viewsGrowth)}%
                </span>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246] flex flex-col justify-center">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Total Sales
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {data.lifetimeOrders}
            </h3>
          </div>
          <div className="bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Sales Value (IDR)
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                {formatIDR(data.lifetimeSalesIDR)}
              </h3>
              {data.salesGrowth >= 0 ? (
                <span className="text-xs font-bold text-emerald-500 flex items-center">
                  <ArrowUp size={12} /> {data.salesGrowth}%
                </span>
              ) : (
                <span className="text-xs font-bold text-red-500 flex items-center">
                  <ArrowDown size={12} /> {Math.abs(data.salesGrowth)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Value Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Sales Value (IDR)
                  </h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatIDR(data.lifetimeSalesIDR)}
                  </h2>
                  <div className="flex flex-col text-[10px] font-bold text-emerald-500 leading-tight">
                    {data.salesGrowth >= 0 ? (
                      <span className="flex items-center text-emerald-500">
                        <ArrowUp size={10} /> {data.salesGrowth}%
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500">
                        <ArrowDown size={10} /> {Math.abs(data.salesGrowth)}%
                      </span>
                    )}
                    <span className="text-gray-400 font-medium">vs previous period</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesChartData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                  barGap={0}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#333"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={false} width={10} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 4, 4]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Distribution Donut */}
          <div className="lg:col-span-1 bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246] flex flex-col">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">
              Sales Distribution
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-gray-400 font-medium">Top 5</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white">
                    Products
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Lifetime Sales Table */}
        <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2C3246] overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-[#2C3246] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Product Lifetime Sales
            </h3>
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Product Title</th>
                  <th className="px-6 py-4 font-bold text-center">Views</th>
                  <th className="px-6 py-4 font-bold text-center">Sold</th>
                  <th className="px-6 py-4 font-bold text-center">Amount (IDR)</th>
                  <th className="px-6 py-4 font-bold text-center">Conversion</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {(data.realProductSales && data.realProductSales.length > 0
                  ? data.realProductSales
                  : []
                ).map((product: any) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 max-w-[320px]">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded border border-gray-200 dark:border-white/20 text-[9px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-transparent">
                              shop
                            </span>
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-snug line-clamp-2 uppercase">
                              {product.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {product.views}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {product.sold}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {formatShortIDR(product.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {product.conversion}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.orderType && product.orderType.startsWith("PRO_") ? (
                        <button
                          onClick={() => {
                            setSelectedPackage(product);
                            setIsPackageModalOpen(true);
                          }}
                          className="inline-block px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-orange-500/20"
                        >
                          View
                        </button>
                      ) : (
                        <NextLink
                          href={`/ruang-belajar/${product.slug}`}
                          className="inline-block px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-orange-500/20"
                        >
                          View
                        </NextLink>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPackageModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#141B31] border border-gray-100 dark:border-[#2C3246] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Detail Paket Penjualan
              </h3>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 items-center mb-6">
              <div className="w-20 h-20 bg-gray-50 dark:bg-[#0A1128] rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-[#2C3246] flex items-center justify-center p-1">
                <img
                  src={selectedPackage.image}
                  alt={selectedPackage.title}
                  className="max-w-full max-h-full object-contain drop-shadow-sm"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">
                  Bundle Package
                </p>
                <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1">
                  {selectedPackage.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {selectedPackage.sold}
                  </span>{" "}
                  terjual
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-6 border border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Views</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedPackage.views}x
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Pendapatan</span>
                <span className="font-bold text-green-600">
                  Rp {(selectedPackage.amount || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Conversion Rate</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedPackage.conversion}%
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Tutup
              </button>
              <NextLink
                href="/?pricing=true"
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white text-center transition-colors shadow-lg shadow-orange-500/20"
              >
                Lihat Halaman Promo
              </NextLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
