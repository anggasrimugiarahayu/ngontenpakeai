const fs = require('fs');

const code = `"use client";

import React, { useState } from 'react';
import { 
  User, CheckCircle2, Link as LinkIcon, 
  TrendingUp, Layers, Users, ShoppingBag, Calendar as CalendarIcon, Eye, Send, ArrowUp, Search, Image as ImageIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import 'react-day-picker/dist/style.css';

const MOCK_PRODUCTS = [
  { id: 1, title: 'RUANG NGONTEN (SCALE PLAN) - PAKET LENGKAP', views: 3967, sold: 355, amount: 60000000, conversion: 8.95, image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop' },
  { id: 2, title: 'RUANG NGONTEN (PAKET BASIC)', views: 9700, sold: 379, amount: 38000000, conversion: 3.91, image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop' },
  { id: 3, title: 'CUAN DARI NGONTEN DAN AKSES 8 JUTA++ PRODUK DIGITAL SIAP JUAL (Lisensi PLR, U-PLR & MMR)', views: 16033, sold: 261, amount: 30900000, conversion: 1.63, image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=100&h=100&fit=crop' },
  { id: 4, title: 'RUANG NGONTEN (PAKET LENGKAP) - RECOMMENDED', views: 1333, sold: 53, amount: 8200000, conversion: 3.98, image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=100&h=100&fit=crop' },
  { id: 5, title: 'TOOLS RUANG NGONTEN', views: 255, sold: 25, amount: 2500000, conversion: 9.80, image: 'https://images.unsplash.com/photo-1611162618228-a400f074d209?w=100&h=100&fit=crop' },
  { id: 6, title: 'Tools Ruang Gambar (Lisensi Personal Use)', views: 414, sold: 10, amount: 990000, conversion: 2.42, image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=100&h=100&fit=crop' },
  { id: 7, title: 'Ebook Art Ilustrator Ruang Gambar', views: 472, sold: 13, amount: 637000, conversion: 2.75, image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=100&h=100&fit=crop' },
];

const DONUT_COLORS = ['#10b981', '#fde68a', '#d1fae5', '#34d399', '#059669'];
const MOCK_DONUT_DATA = [
  { name: 'Scale Plan', value: 60 },
  { name: 'Basic Plan', value: 38 },
  { name: 'Cuan Produk', value: 30 },
  { name: 'Lengkap', value: 8 },
  { name: 'Tools', value: 2 },
];

export default function DashboardClient({ data, user }: { data: any, user: any }) {
  const [activeTab, setActiveTab] = useState('main');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 21),
    to: new Date(),
  });

  const { chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData } = React.useMemo(() => {
    if (!date?.from) return { chartData: [], dynamicTotalViews: 0, dynamicTotalClicks: 0, salesChartData: [] };
    const endDate = date.to || date.from;
    try {
      const days = eachDayOfInterval({ start: date.from, end: endDate });
      let tViews = 0;
      let tClicks = 0;
      
      const salesData: any[] = [];
      const newData = days.map((day) => {
        const seed = day.getTime();
        const views = Math.floor(Math.abs(Math.sin(seed)) * 150) + 20;
        const clicks = Math.floor(Math.abs(Math.cos(seed)) * 70) + 5;
        const sales = Math.floor(Math.abs(Math.sin(seed * 2)) * 500000) + 50000;
        
        tViews += views;
        tClicks += clicks;
        
        salesData.push({
          date: format(day, "d MMM"),
          sales
        });
        
        return {
          date: format(day, "d MMM"),
          views,
          clicks
        };
      });
      return { chartData: newData, dynamicTotalViews: tViews, dynamicTotalClicks: tClicks, salesChartData: salesData };
    } catch (e) {
      console.error(e);
      return { chartData: [], dynamicTotalViews: 0, dynamicTotalClicks: 0, salesChartData: [] };
    }
  }, [date]);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0
    }).format(num);
  };
  
  const formatShortIDR = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'JT';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  }

  return (
    <div className="space-y-6">
      
      {/* HEADLINE & TABS HEADERS */}
      <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
        Dashboard
      </h1>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        <button
          onClick={() => setActiveTab('main')}
          className={\`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border \${
            activeTab === 'main'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }\`}
        >
          Main
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={\`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border \${
            activeTab === 'statistics'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }\`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={\`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border \${
            activeTab === 'orders'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }\`}
        >
          Orders
        </button>
      </div>

      {activeTab === 'main' && (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Left Section: User Stats Grid replacing Account Card */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#121214] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Users</p>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsers)}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121214] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Free Users</p>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersFree)}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121214] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Pro Users</p>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersPro)}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121214] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Monthly Subscribers</p>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">{formatIDR(data.totalSubscribers)}</h3>
              </div>
            </div>
          </div>

          {/* Right Card: Earnings */}
          <div className="md:col-span-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 shadow-sm border border-gray-200/50 dark:border-white/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div>
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/40 dark:border-white/10 shadow-sm">
                  <div className="w-6 h-6 rounded-full border-[3px] border-gray-300 dark:border-gray-500"></div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-sm">Earnings</span>
                    <Eye size={14} className="opacity-50 cursor-pointer" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5 tracking-tight">
                    <span className="text-base font-bold mr-1">IDR</span>{formatIDR(data.earningsIDR)}
                  </h2>
                </div>
              </div>
              <button className="text-gray-500 dark:text-gray-400 text-[11px] font-medium mt-2 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
                Payout Setting Page
              </button>
            </div>

            <div className="mt-4 bg-white/70 dark:bg-black/30 backdrop-blur-md p-2 rounded-xl border border-white/50 dark:border-white/10 flex items-center justify-between group">
              <div className="px-1 overflow-hidden">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">PayMe link</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium truncate w-full">
                  lynkti.com/pay
                </p>
              </div>
              <button className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-white dark:bg-[#202020] rounded-lg shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                <LinkIcon size={12} />
              </button>
            </div>
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
               <Send size={40} className="transform -rotate-12" />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-[#121214] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Total Views & Clicks</h2>
              <div className="flex items-center gap-5">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Views
                  </div>
                  <div className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(dynamicTotalViews)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Clicks
                  </div>
                  <div className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(dynamicTotalClicks)}</div>
                </div>
              </div>
            </div>
            
            {/* Popover Date Filter */}
            <div className="relative">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <CalendarIcon size={16} className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {date?.from ? (
                    date.to ? (
                      <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
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
                  <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
                  <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 p-3">
                    <style>{\`
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
                    \`}</style>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.15} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="clicks" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={8} />
                <Bar dataKey="views" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-white dark:bg-[#121214] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Lifetime Sales (IDR)</p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeSalesIDR)}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121214] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">My Digital Product</p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">{formatIDR(data.totalDigitalProducts)}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121214] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Lifetime Orders</p>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeOrders)}</h3>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* STATISTICS TAB */}
      {activeTab === 'statistics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#121214] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col justify-center">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div> 
                  Total Views & Clicks
               </p>
               <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatIDR(dynamicTotalViews + dynamicTotalClicks)}</h3>
            </div>
            <div className="bg-white dark:bg-[#121214] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col justify-center">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> 
                  Total Sales
               </p>
               <h3 className="text-3xl font-black text-gray-900 dark:text-white">1,093</h3>
            </div>
            <div className="bg-white dark:bg-[#121214] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 
                  Sales Value (IDR)
               </p>
               <div className="flex items-baseline gap-2">
                 <h3 className="text-3xl font-black text-gray-900 dark:text-white">2,925,000</h3>
                 <span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUp size={12}/> 84.19%</span>
               </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Value Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#121214] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                       <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sales Value (IDR)</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                       <h2 className="text-2xl font-black text-gray-900 dark:text-white">2,925,000</h2>
                       <div className="flex flex-col text-[10px] font-bold text-emerald-500 leading-tight">
                         <span className="flex items-center"><ArrowUp size={10}/> 84.19%</span>
                         <span className="text-gray-400 font-medium">vs previous period</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={0}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={false} width={10} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 4, 4]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Distribution Donut */}
            <div className="lg:col-span-1 bg-white dark:bg-[#121214] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Sales Distribution</h3>
              <div className="flex-1 flex flex-col items-center justify-center relative">
                 <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_DONUT_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {MOCK_DONUT_DATA.map((entry, index) => (
                            <Cell key={\`cell-\${index}\`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-xs text-gray-400 font-medium">Top 5</span>
                       <span className="text-xl font-black text-gray-900 dark:text-white">Products</span>
                    </div>
                 </div>
              </div>
            </div>

          </div>

          {/* Product Lifetime Sales Table */}
          <div className="bg-white dark:bg-[#121214] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Product Lifetime Sales</h3>
               <div className="relative w-full sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                  {MOCK_PRODUCTS.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-4 max-w-[320px]">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
                               <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                               <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded border border-gray-200 dark:border-white/20 text-[9px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-transparent">shop</span>
                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-snug line-clamp-2 uppercase">{product.title}</p>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{product.views}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{product.sold}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatShortIDR(product.amount)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{product.conversion}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <button className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-500/20">
                           View
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-[#121214] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/10 text-center flex flex-col items-center justify-center min-h-[300px] animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Orders History</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Daftar riwayat transaksi dan pembelian akan tampil di sini.</p>
        </div>
      )}

    </div>
  );
}
`;

fs.writeFileSync('src/app/dashboard/DashboardClient.tsx', code);
