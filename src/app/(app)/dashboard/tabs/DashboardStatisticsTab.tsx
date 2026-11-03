"use client";

import React, { useState, useMemo } from "react";
import NextLink from "next/link";
import {
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Info,
} from "lucide-react";
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
import { DateRange } from "react-day-picker";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const TOP_PRODUCT_COLORS = [
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
];

interface DashboardStatisticsTabProps {
  data: any;
  dynamicTotalViews: number;
  dynamicTotalClicks: number;
  salesChartData: any[];
  chartData?: any[];
  date?: DateRange | undefined;
  setDate?: (val: DateRange | undefined) => void;
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
  chartData,
  date: propDate,
  setDate: propSetDate,
  formatIDR,
  formatShortIDR,
  selectedPackage,
  setSelectedPackage,
  isPackageModalOpen,
  setIsPackageModalOpen,
}: DashboardStatisticsTabProps) {
  // Local fallback date picker state (default 1 week / 7 days)
  const [internalDate, setInternalDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [salesMetricView, setSalesMetricView] = useState<"amount" | "value">("amount");
  const [searchTerm, setSearchTerm] = useState("");

  const activeDate = propDate || internalDate;
  const handleSelectDate = (newDate: DateRange | undefined) => {
    if (propSetDate) {
      propSetDate(newDate);
    } else {
      setInternalDate(newDate);
    }
  };

  // Filter Views & Clicks data based on selected date
  const filteredViewsData = useMemo(() => {
    const raw =
      chartData && chartData.length > 0
        ? chartData
        : data?.viewsChartData || [];
    if (!activeDate?.from) return raw.slice(-7);

    const fromTime = startOfDay(activeDate.from).getTime();
    const toTime = activeDate.to
      ? endOfDay(activeDate.to).getTime()
      : endOfDay(activeDate.from).getTime();

    const filtered = raw.filter((item: any) => {
      if (item.rawDate) {
        const itemTime = new Date(item.rawDate).getTime();
        return itemTime >= fromTime && itemTime <= toTime;
      }
      return true;
    });

    return filtered.length > 0 ? filtered : raw.slice(-7);
  }, [chartData, data?.viewsChartData, activeDate]);

  // Filter Sales data based on selected date
  const filteredSalesData = useMemo(() => {
    const raw =
      salesChartData && salesChartData.length > 0
        ? salesChartData
        : data?.salesChartData || [];
    if (!activeDate?.from) return raw.slice(-7);

    const fromTime = startOfDay(activeDate.from).getTime();
    const toTime = activeDate.to
      ? endOfDay(activeDate.to).getTime()
      : endOfDay(activeDate.from).getTime();

    const filtered = raw.filter((item: any) => {
      if (item.rawDate) {
        const itemTime = new Date(item.rawDate).getTime();
        return itemTime >= fromTime && itemTime <= toTime;
      }
      return true;
    });

    return filtered.length > 0 ? filtered : raw.slice(-7);
  }, [salesChartData, data?.salesChartData, activeDate]);

  // Function to calculate growth percentage
  const calculateGrowth = (curr: number, prev: number) => {
    if (prev === 0) {
      return curr > 0 ? 100 : 0;
    }
    return parseFloat((((curr - prev) / prev) * 100).toFixed(2));
  };

  // Aggregated period totals & Dynamic % vs previous period calculation
  const {
    periodViews,
    periodClicks,
    periodSalesCount,
    periodSalesIDR,
    viewsGrowth,
    clicksGrowth,
    salesAmountGrowth,
    salesValueGrowth,
  } = useMemo(() => {
    const rawViews =
      chartData && chartData.length > 0
        ? chartData
        : data?.viewsChartData || [];
    const rawSales =
      salesChartData && salesChartData.length > 0
        ? salesChartData
        : data?.salesChartData || [];

    // Current period interval
    const fromDate = activeDate?.from
      ? startOfDay(activeDate.from)
      : subDays(new Date(), 6);
    const toDate = activeDate?.to
      ? endOfDay(activeDate.to)
      : endOfDay(fromDate);
    const currFromTime = fromDate.getTime();
    const currToTime = toDate.getTime();
    const durationMs = Math.max(86400000, currToTime - currFromTime);

    // Previous period interval (same duration immediately preceding)
    const prevToTime = currFromTime - 1;
    const prevFromTime = prevToTime - durationMs;

    let currViews = 0;
    let currClicks = 0;
    let prevViews = 0;
    let prevClicks = 0;

    rawViews.forEach((item: any) => {
      if (item.rawDate) {
        const t = new Date(item.rawDate).getTime();
        if (t >= currFromTime && t <= currToTime) {
          currViews += item.views || 0;
          currClicks += item.clicks || 0;
        } else if (t >= prevFromTime && t <= prevToTime) {
          prevViews += item.views || 0;
          prevClicks += item.clicks || 0;
        }
      }
    });

    let currSalesCount = 0;
    let currSalesIDR = 0;
    let prevSalesCount = 0;
    let prevSalesIDR = 0;

    rawSales.forEach((item: any) => {
      if (item.rawDate) {
        const t = new Date(item.rawDate).getTime();
        if (t >= currFromTime && t <= currToTime) {
          currSalesCount += item.count || 0;
          currSalesIDR += item.sales || 0;
        } else if (t >= prevFromTime && t <= prevToTime) {
          prevSalesCount += item.count || 0;
          prevSalesIDR += item.sales || 0;
        }
      }
    });

    // Fallbacks if entire range selected or 0
    const finalViews = currViews > 0 ? currViews : dynamicTotalViews;
    const finalClicks = currClicks > 0 ? currClicks : dynamicTotalClicks;
    const finalSalesCount =
      currSalesCount > 0 ? currSalesCount : data?.lifetimeOrders || 0;
    const finalSalesIDR =
      currSalesIDR > 0 ? currSalesIDR : data?.lifetimeSalesIDR || 0;

    const vGrowth = calculateGrowth(currViews, prevViews);
    const cGrowth = calculateGrowth(currClicks, prevClicks);
    const sCountGrowth = calculateGrowth(currSalesCount, prevSalesCount);
    const sValGrowth = calculateGrowth(currSalesIDR, prevSalesIDR);

    return {
      periodViews: finalViews,
      periodClicks: finalClicks,
      periodSalesCount: finalSalesCount,
      periodSalesIDR: finalSalesIDR,
      viewsGrowth: vGrowth !== 0 ? vGrowth : data?.viewsGrowth || 0,
      clicksGrowth: cGrowth !== 0 ? cGrowth : data?.viewsGrowth || 0,
      salesAmountGrowth:
        sCountGrowth !== 0 ? sCountGrowth : data?.salesGrowth || 0,
      salesValueGrowth:
        sValGrowth !== 0 ? sValGrowth : data?.salesGrowth || 0,
    };
  }, [
    chartData,
    salesChartData,
    data,
    activeDate,
    dynamicTotalViews,
    dynamicTotalClicks,
  ]);

  // Custom 2-line tick for X-Axis (Day on top, Month below)
  const renderCustomAxisTick = ({ x, y, payload }: any) => {
    if (!payload || !payload.value) return null;
    const parts = String(payload.value).trim().split(" ");
    let day = parts[0];
    let month = parts[1] || "";
    if (isNaN(Number(day)) && !isNaN(Number(month))) {
      const temp = day;
      day = month;
      month = temp;
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={12}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={11}
          fontWeight={600}
        >
          {day}
        </text>
        <text
          x={0}
          y={0}
          dy={24}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={10}
          fontWeight={400}
        >
          {month}
        </text>
      </g>
    );
  };

  // Sales Distribution Data
  const netValueIDR = periodSalesIDR;
  const affiliateIDR = 0;
  const salesDistributionData = useMemo(() => {
    if (netValueIDR === 0 && affiliateIDR === 0) {
      return [{ name: "Net Value (IDR)", value: 1, fill: "#eab308" }];
    }
    return [
      { name: "Net Value (IDR)", value: netValueIDR, fill: "#eab308" },
      { name: "Affiliate IDR", value: affiliateIDR, fill: "#10b981" },
    ];
  }, [netValueIDR, affiliateIDR]);

  // Top 5 Sales by Product Data
  const top5Products = useMemo(() => {
    return (data?.realProductSales || [])
      .filter((p: any) => (p.sold || 0) > 0)
      .slice(0, 5);
  }, [data?.realProductSales]);

  const top5PieData = useMemo(() => {
    if (top5Products.length === 0) {
      return [{ name: "Belum Ada Penjualan", value: 1, fill: "#9ca3af" }];
    }
    return top5Products.map((p: any, idx: number) => ({
      name: p.title,
      value: p.sold,
      fill: TOP_PRODUCT_COLORS[idx % TOP_PRODUCT_COLORS.length],
    }));
  }, [top5Products]);

  // Filtered Products for Lifetime Sales Table
  const filteredProducts = useMemo(() => {
    const list = data?.realProductSales || [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.orderType?.toLowerCase().includes(q)
    );
  }, [data?.realProductSales, searchTerm]);

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* TOP BAR: Reusable Global DateRangePicker */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <DateRangePicker
            value={activeDate}
            onChange={handleSelectDate}
            placeholder="Choose Date"
          />
        </div>

        {/* ================= ROW 1 (Auto-Equal Height): Total Views & Clicks (2/3) + Sales Distribution (1/3) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* CARD 1: TOTAL VIEWS & CLICKS */}
          <div className="lg:col-span-2 bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246] flex flex-col justify-between h-full">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Total Views & Clicks
              </h3>

              <div className="flex flex-wrap items-center gap-8 mb-6">
                {/* Views Stat */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Views
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatIDR(periodViews)}
                    </span>
                    <div className="flex items-center text-[10px] font-bold">
                      {viewsGrowth >= 0 ? (
                        <span className="flex items-center text-emerald-500">
                          <ArrowUp size={11} className="mr-0.5" />
                          {viewsGrowth}%
                        </span>
                      ) : (
                        <span className="flex items-center text-red-500">
                          <ArrowDown size={11} className="mr-0.5" />
                          {Math.abs(viewsGrowth)}%
                        </span>
                      )}
                      <span className="text-gray-400 font-normal ml-1">
                        vs previous period
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clicks Stat */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Clicks
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatIDR(periodClicks)}
                    </span>
                    <div className="flex items-center text-[10px] font-bold">
                      {clicksGrowth >= 0 ? (
                        <span className="flex items-center text-emerald-500">
                          <ArrowUp size={11} className="mr-0.5" />
                          {clicksGrowth}%
                        </span>
                      ) : (
                        <span className="flex items-center text-red-500">
                          <ArrowDown size={11} className="mr-0.5" />
                          {Math.abs(clicksGrowth)}%
                        </span>
                      )}
                      <span className="text-gray-400 font-normal ml-1">
                        vs previous period
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stacked Bar Chart Views & Clicks */}
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredViewsData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  barGap={0}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#888"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={renderCustomAxisTick}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    width={35}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      fontSize: "12px",
                    }}
                    formatter={(value: any, name: any) => [
                      value,
                      name === "views" ? "Views" : "Clicks",
                    ]}
                  />
                  <Bar
                    dataKey="clicks"
                    stackId="a"
                    fill="#10b981"
                    radius={[0, 0, 4, 4]}
                    barSize={10}
                  />
                  <Bar
                    dataKey="views"
                    stackId="a"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    barSize={10}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CARD 2: SALES DISTRIBUTION (Matching Height) */}
          <div className="lg:col-span-1 bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246] flex flex-col justify-between h-full">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                Sales Distribution
              </h3>
            </div>

            {/* Donut Chart with Center Text */}
            <div className="relative flex-1 min-h-[220px] w-full flex items-center justify-center my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {salesDistributionData.map((entry: any, index: number) => (
                      <Cell key={`dist-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`Rp ${formatIDR(Number(val))}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Total Sales
                </span>
                <span className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {formatShortIDR(periodSalesIDR)}
                </span>
              </div>
            </div>

            {/* Legend Pinned at Bottom */}
            <div className="flex items-center justify-around pt-4 mt-auto border-t border-gray-100 dark:border-[#2C3246]">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div>
                  <span>Net Value (IDR)</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatIDR(netValueIDR)}
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                  <span>Affiliate IDR</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatIDR(affiliateIDR)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ROW 2 (Auto-Equal Height): Total Sales (2/3) + Top 5 Sales by Product (1/3) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* CARD 3: TOTAL SALES (Sales Amount & Sales Value IDR) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246] flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Total Sales
                </h3>

                {/* View Switcher: Sales Amount vs Sales Value */}
                <div className="flex items-center p-1 bg-gray-100 dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-[#2C3246] text-xs">
                  <button
                    onClick={() => setSalesMetricView("amount")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      salesMetricView === "amount"
                        ? "bg-white dark:bg-[#141B31] text-amber-600 dark:text-amber-400 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Sales Amount (Order)
                  </button>
                  <button
                    onClick={() => setSalesMetricView("value")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      salesMetricView === "value"
                        ? "bg-white dark:bg-[#141B31] text-emerald-600 dark:text-emerald-400 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Sales Value (IDR)
                  </button>
                </div>
              </div>

              <div className="mb-6">
                {salesMetricView === "amount" ? (
                  /* When Sales Amount is selected, ONLY show Sales Amount */
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Sales Amount
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {periodSalesCount}
                      </span>
                      <div className="flex items-center text-[10px] font-bold">
                        {salesAmountGrowth >= 0 ? (
                          <span className="flex items-center text-emerald-500">
                            <ArrowUp size={11} className="mr-0.5" />
                            {salesAmountGrowth}%
                          </span>
                        ) : (
                          <span className="flex items-center text-red-500">
                            <ArrowDown size={11} className="mr-0.5" />
                            {Math.abs(salesAmountGrowth)}%
                          </span>
                        )}
                        <span className="text-gray-400 font-normal ml-1">
                          vs previous period
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* When Sales Value (IDR) is selected, ONLY show Sales Value (IDR) */
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Sales Value (IDR)
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {formatIDR(periodSalesIDR)}
                      </span>
                      <div className="flex items-center text-[10px] font-bold">
                        {salesValueGrowth >= 0 ? (
                          <span className="flex items-center text-emerald-500">
                            <ArrowUp size={11} className="mr-0.5" />
                            {salesValueGrowth}%
                          </span>
                        ) : (
                          <span className="flex items-center text-red-500">
                            <ArrowDown size={11} className="mr-0.5" />
                            {Math.abs(salesValueGrowth)}%
                          </span>
                        )}
                        <span className="text-gray-400 font-normal ml-1">
                          vs previous period
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart Total Sales */}
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredSalesData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  barGap={0}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#888"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={renderCustomAxisTick}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    width={35}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      fontSize: "12px",
                    }}
                    formatter={(value: any, name: any) => [
                      name === "count"
                        ? `${value} Order`
                        : `Rp ${formatIDR(Number(value))}`,
                      name === "count" ? "Sales Amount" : "Sales Value (IDR)",
                    ]}
                  />
                  {salesMetricView === "amount" ? (
                    <Bar
                      dataKey="count"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      barSize={10}
                    />
                  ) : (
                    <Bar
                      dataKey="sales"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={10}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CARD 4: TOP 5 SALES BY PRODUCT (Matching Height) */}
          <div className="lg:col-span-1 bg-white dark:bg-[#141B31] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2C3246] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Top 5 Sales by Product
                  </h3>
                  <Info size={14} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Donut Chart with Center Text */}
            <div className="relative flex-1 min-h-[190px] w-full flex items-center justify-center my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={top5PieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {top5PieData.map((entry: any, index: number) => (
                      <Cell key={`top-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`${val} terjual`, "Penjualan"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400 font-medium">Top 5</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  Products
                </span>
              </div>
            </div>

            {/* Top 5 Products List Pinned at Bottom */}
            <div className="pt-4 mt-auto border-t border-gray-100 dark:border-[#2C3246] space-y-2.5">
              {top5Products.length > 0 ? (
                top5Products.map((p: any, idx: number) => (
                  <div
                    key={p.id || idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[200px]">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            TOP_PRODUCT_COLORS[
                              idx % TOP_PRODUCT_COLORS.length
                            ],
                        }}
                      ></div>
                      <span
                        className="truncate text-gray-700 dark:text-gray-300 font-medium"
                        title={p.title}
                      >
                        {p.title}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white shrink-0 ml-2">
                      {p.sold} sold
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-gray-400 py-2">
                  Belum ada data transaksi produk
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM FULL-WIDTH: PRODUCT LIFETIME SALES TABLE */}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#2C3246] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-[#2C3246] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Product Title</th>
                  <th className="px-6 py-4 font-bold text-center">Views</th>
                  <th className="px-6 py-4 font-bold text-center">Sold</th>
                  <th className="px-6 py-4 font-bold text-center">
                    Amount (IDR)
                  </th>
                  <th className="px-6 py-4 font-bold text-center">
                    Conversion
                  </th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
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
                          {product.amount === 0 ? "0 (Gratis)" : formatShortIDR(product.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {product.conversion}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.orderType &&
                        product.orderType.startsWith("PRO_") ? (
                          <button
                            onClick={() => {
                              setSelectedPackage(product);
                              setIsPackageModalOpen(true);
                            }}
                            className="inline-block px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-orange-500/20 cursor-pointer"
                          >
                            View
                          </button>
                        ) : (
                          <NextLink
                            href={`/ruang-belajar/${product.slug}`}
                            className="inline-block px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-orange-500/20 cursor-pointer"
                          >
                            View
                          </NextLink>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                      Tidak ada produk yang cocok dengan pencarian &quot;{searchTerm}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Package Detail Modal */}
      {isPackageModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#141B31] border border-gray-100 dark:border-[#2C3246] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Detail Paket Penjualan
              </h3>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f2947] transition-colors text-gray-500 dark:text-gray-400 dark:hover:text-white cursor-pointer"
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

            <div className="space-y-3 bg-gray-50 dark:bg-[#0F172A] p-4 rounded-xl mb-6 border border-gray-100 dark:border-[#2C3246]">
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
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <NextLink
                href="/?pricing=true"
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white text-center transition-colors shadow-sm shadow-orange-500/20"
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
