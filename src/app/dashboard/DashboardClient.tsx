"use client";

import React, { useState } from 'react';
import { 
  User, CheckCircle2, Share2, Link as LinkIcon, BookOpen, PenTool, 
  Video, FileText, Send, Eye, MousePointerClick, 
  TrendingUp, Layers, Users, ShoppingBag
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Image from 'next/image';

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
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://ruangcreativemuslim.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Card: Account Info */}
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex-1 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account</h2>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                <CheckCircle2 size={12} /> Verified
              </span>
            </div>
            <button className="flex items-center gap-2 text-emerald-600 border border-emerald-500 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
              Upgrade to PRO
            </button>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                {user?.image ? (
                  <Image src={user.image} alt="Profile" width={64} height={64} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={32} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Harits | Faceless Contentpreneur</h3>
                <p className="text-emerald-500 text-sm font-medium hover:underline cursor-pointer">
                  https://ruangcreativemuslim.com
                </p>
              </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Free Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersFree)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Pro Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersPro)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-0.5">Monthly Subscribers</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalSubscribers)}</h3>
          </div>
        </div>
      
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Free Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersFree)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Pro Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersPro)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-0.5">Monthly Subscribers</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalSubscribers)}</h3>
          </div>
        </div>

      </div>

    </div>
  );
}
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all bg-emerald-50/50 dark:bg-emerald-900/10"
            >
              <Share2 size={16} /> {copied ? 'Copied!' : 'Share'}
            </button>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Start creating now!</p>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <button className="flex shrink-0 items-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <LinkIcon size={16} /> Add Link
              </button>
              <button className="flex shrink-0 items-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <BookOpen size={16} /> Digital Product
              </button>
              <button className="flex shrink-0 items-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <PenTool size={16} /> Blog Content
              </button>
              <button className="flex shrink-0 items-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Video size={16} /> Course Video
              </button>
              <button className="flex shrink-0 items-center gap-2 px-4 py-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <FileText size={16} /> Media Kit
              </button>
            </div>
            {/* Scroll bar indicator purely visual to match screenshot */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className="w-1/3 h-full bg-gray-300 dark:bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Card: Earnings */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 shadow-sm border border-gray-200/50 dark:border-white/10 w-full md:w-[400px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
          
          <div>
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/40 dark:border-white/10 shadow-sm">
                <div className="w-8 h-8 rounded-full border-4 border-gray-300 dark:border-gray-500"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-lg">Earnings</span>
                  <Eye size={18} className="opacity-50 cursor-pointer" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">
                  <span className="text-xl font-bold mr-1">IDR</span>{formatIDR(data.earningsIDR)}
                </h2>
              </div>
            </div>
            <button className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-3 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5">
              Payout Setting Page
            </button>
          </div>

          <div className="mt-8 bg-white/70 dark:bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/50 dark:border-white/10 flex items-center justify-between group">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">PayMe link</p>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium truncate w-[220px]">
                https://ruangcreativemuslim.com/pay
              </p>
            </div>
            <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#202020] rounded-xl shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
              <LinkIcon size={14} />
            </button>
          </div>
          
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
             <Send size={48} className="transform -rotate-12" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Total Views & Clicks</h2>
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 font-medium mb-1">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div> Views
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalViews || 1003)}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-500 font-medium mb-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Clicks
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalClicks || 948)}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            Select Date..
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MOCK_CHART_DATA}
              margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.15} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              {/* Note: In recharts, rendering a stacked bar requires the same stackId. 
                  In the screenshot, the bars are stacked (views on top of clicks, or just overlapping).
                  The screenshot shows the orange bar (views) is taller, and the green bar (clicks) is inside/below it.
                  A stacked bar chart perfectly replicates this. */}
              <Bar dataKey="clicks" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={8} />
              <Bar dataKey="views" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Lifetime Sales (IDR)</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeSalesIDR)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">My Digital Product</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalDigitalProducts)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsers)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Lifetime Orders</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeOrders)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Free Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersFree)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Pro Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersPro)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-0.5">Monthly Subscribers</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalSubscribers)}</h3>
          </div>
        </div>


      </div>

    </div>
  );
}
