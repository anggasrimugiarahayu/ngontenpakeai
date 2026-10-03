"use client";

import React, { useState } from 'react';
import { 
  User, CheckCircle2, Share2, Link as LinkIcon, BookOpen, PenTool, 
  Video, FileText, Send, Eye, MousePointerClick, 
  TrendingUp, Layers, Users, ShoppingBag, Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const MOCK_CHART_DATA = [
  { date: '12 Sep', views: 65, clicks: 30 },
  { date: '13 Sep', views: 120, clicks: 60 },
  { date: '14 Sep', views: 110, clicks: 52 },
  { date: '15 Sep', views: 90, clicks: 45 },
  { date: '16 Sep', views: 142, clicks: 68 },
  { date: '17 Sep', views: 138, clicks: 67 },
  { date: '18 Sep', views: 45, clicks: 20 },
  { date: '19 Sep', views: 52, clicks: 25 },
  { date: '20 Sep', views: 53, clicks: 26 },
  { date: '21 Sep', views: 57, clicks: 28 },
  { date: '22 Sep', views: 72, clicks: 36 },
  { date: '23 Sep', views: 74, clicks: 37 },
  { date: '24 Sep', views: 130, clicks: 62 },
  { date: '25 Sep', views: 105, clicks: 52 },
  { date: '26 Sep', views: 85, clicks: 40 },
  { date: '27 Sep', views: 48, clicks: 22 },
  { date: '28 Sep', views: 60, clicks: 29 },
  { date: '29 Sep', views: 80, clicks: 40 },
  { date: '30 Sep', views: 165, clicks: 80 },
  { date: '1 Oct', views: 110, clicks: 52 },
  { date: '2 Oct', views: 90, clicks: 45 },
  { date: '3 Oct', views: 28, clicks: 13 },
];

export default function DashboardClient({ data, user }: { data: any, user: any }) {
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-4">
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
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> Views
                </div>
                <div className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalViews || 1003)}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Clicks
                </div>
                <div className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalClicks || 948)}</div>
              </div>
            </div>
          </div>
          
          {/* Simple Native Date Range Filter for matching UI */}
          <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2">
            <Calendar size={14} className="text-gray-400 mr-2" />
            <select className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 focus:outline-none appearance-none cursor-pointer">
              <option value="30">Last 30 Days</option>
              <option value="7">Last 7 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MOCK_CHART_DATA}
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
              <Bar dataKey="views" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={8} />
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
  );
}
