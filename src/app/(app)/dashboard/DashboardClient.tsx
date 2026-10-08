"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import NextLink from 'next/link';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getDashboardDataAction } from '@/app/actions/dashboard';
import { 
  User, CheckCircle2, Link as LinkIcon, 
  TrendingUp, Layers, Users, ShoppingBag, Settings, Calendar as CalendarIcon, Eye, Send, ArrowUp, ArrowDown, Search, Image as ImageIcon, Download, Printer, ArrowLeft, ArrowRight, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import PrintModal from './PrintModal';
import WhatsAppModal from './WhatsAppModal';
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

const DONUT_COLORS = ['#059669', '#f59e0b', '#10b981', '#d97706', '#047857'];
const MOCK_DONUT_DATA = [
  { name: 'Scale Plan', value: 60 },
  { name: 'Basic Plan', value: 38 },
  { name: 'Cuan Produk', value: 30 },
  { name: 'Lengkap', value: 8 },
  { name: 'Tools', value: 2 },
];



export default function DashboardClient({ user }: { user: any }) {
  
  const getOrderImage = (order: any) => {
    if (order.product?.coverUrl) return order.product.coverUrl;
    switch (order.orderType) {
      case "PRO_BOOK": return "/img_paket/paket_ebook.png";
      case "PRO_TOOLS": return "/img_paket/paket_tools.png";
      case "PRO_PLUS": return "/img_paket/paket_lengkap.png";
      case "TOOLS": return "/img_paket/paket_tools.png";
      default: return "/img_paket/paket_ebook.png";
    }
  };

  const getOrderTitle = (order: any) => {
    if (order.product?.title) return order.product.title;
    switch (order.orderType) {
      case "PRO_BOOK": return "Paket PRO BOOK";
      case "PRO_TOOLS": return "Paket PRO TOOLS";
      case "PRO_PLUS": return "Paket PRO PLUS";
      case "TOOLS": return "Akses Tools";
      default: return "Unknown Product";
    }
  };

  const { data } = useSWR("dashboard", getDashboardDataAction);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [orderPage, setOrderPage] = useState(1);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [waMessage, setWaMessage] = useState('');
  const [waOrder, setWaOrder] = useState<any>(null);

  React.useEffect(() => {
    if (data?.fullOrders && data.fullOrders.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSelectedOrder(data.fullOrders[0]);
    }
  }, [data?.fullOrders]);

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10';
      case 'PENDING': return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
      case 'FAILED': return 'text-red-600 bg-red-50 dark:bg-red-500/10';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-500/10';
    }
  };

  const [activeTab, setActiveTab] = useState('main');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 21),
    to: new Date(),
  });

  const { chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData } = React.useMemo(() => {
    return { 
       chartData: data?.viewsChartData || [], 
       dynamicTotalViews: data?.totalViews || 0, 
       dynamicTotalClicks: data?.totalClicks || 0, 
       salesChartData: data?.salesChartData || [] 
    };
  }, [date, data]);

  if (!data) return <LoadingSpinner message="Memuat Dashboard..." />;

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


  const renderOrdersTab = () => {
    const ordersList = data.fullOrders || [];
    
    const handleExportExcel = () => {
      const headers = [
        'Judul Barang', 'Varian', 'Harga', 'qty', 'sub total', 'Voucher', 'shipping fee',
        'Total Addon', 'Notif fee', 'Affiliate fee', 'Affiliator email', 'Public Affiliate fee',
        'Convenience Fee', 'Total', 'Tanggal', 'Status', 'Buyer Email', 'Buyer Name (opsional)',
        'Buyer Phone (Opsional)', 'Notes (Opsional)', 'Addon Detail', 'Voucher Code',
        'Shipping Address', 'Shipping Method', 'Appointment info', 'Ref', 'PayPal Ref'
      ];

      const rows = filteredOrders.map((o: any) => {
        const rowData = [
          o.product?.title || '',
          '',
          o.amount || 0,
          1,
          o.amount || 0,
          0,
          0,
          0,
          0,
          0,
          '',
          0,
          0,
          o.amount || 0,
          format(new Date(o.createdAt), 'dd-MM-yyyy HH:mm'),
          o.status || '',
          o.user?.email || '',
          o.user?.name || '',
          o.user?.phone || '',
          o.note || '',
          '',
          '',
          '',
          '',
          '',
          o.id || '',
          ''
        ];

        return rowData.map(field => {
          const str = String(field);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',');
      });

      // Add BOM for Excel UTF-8 recognition
      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `Orders_Export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const filteredOrders = ordersList.filter((o: any) => {
      let matches = true;
      if (orderStatus !== 'all' && o.status !== orderStatus) matches = false;
      const searchStr = orderSearch.toLowerCase();
      if (searchStr) {
        const customerName = (o.user?.name || '').toLowerCase();
        const customerEmail = (o.user?.email || '').toLowerCase();
        if (!customerName.includes(searchStr) && !customerEmail.includes(searchStr)) {
          matches = false;
        }
      }
      return matches;
    });

    // Pagination logic
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);

    const OrderDetailsContent = ({ order }: { order: any }) => {
      if (!order) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
          <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
          <p>Pilih transaksi untuk melihat detail</p>
        </div>
      );
      
      const orderDate = new Date(order.createdAt);
      const paymentDate = new Date(orderDate.getTime() + 2 * 60000);

      return (
        <div className="p-0 sm:p-4 text-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white print:hidden">Order Details</h3>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white hidden print:block">Invoice</h3>
            <button 
              onClick={() => setIsPrintModalOpen(true)}
              className="print:hidden flex items-center gap-2 px-4 py-1.5 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg font-bold transition-colors text-xs tracking-wide">
              <Printer className="w-4 h-4" />
              PRINT
            </button>
          </div>
          
          <div className="space-y-4">
            
            {/* Box 1: Status & Item */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-white/10 pb-4 mb-4 gap-3">
                <div className="space-y-1.5 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-20">Order time:</span> 
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{format(orderDate, 'dd MMM yyyy HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">Payment:</span> 
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{format(paymentDate, 'dd MMM yyyy HH:mm')}</span>
                  </div>
                </div>
                <span className={`font-bold text-xs uppercase tracking-wide px-3 py-1.5 rounded-md bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 ${
                  order.status === 'SUCCESS' ? 'text-orange-500' : 
                  order.status === 'FAILED' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex gap-4 items-start mb-5">
                <div className="w-16 h-20 bg-gray-50 dark:bg-[#121214] rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 p-1 flex items-center justify-center">
                  {getOrderImage(order) ? (
                    <img src={getOrderImage(order)} className="max-w-full max-h-full object-contain drop-shadow-sm" alt="Product" />
                  ) : (
                    <span className="text-[10px] text-gray-400">No Img</span>
                  )}
                </div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="flex gap-2 items-start">
                    <span className="font-bold text-gray-900 dark:text-white mt-0.5">1x</span>
                    <p className="font-bold text-gray-900 dark:text-white leading-snug">{getOrderTitle(order)}</p>
                  </div>
                  <div className="pl-6">
                    <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 border border-gray-200 dark:border-white/20 rounded-full text-gray-500 dark:text-gray-400">
                      digital
                    </span>
                  </div>
                  <div className="pl-6 pt-1">
                    <p className="text-gray-900 dark:text-gray-200 text-sm font-semibold">1 x {formatIDR(order.amount)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#f8fafc] dark:bg-[#121214] rounded-lg p-3 border border-gray-100 dark:border-white/5">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Notes</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">No notes provided</p>
              </div>
            </div>

            {/* Box 2: Transaction Detail */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Transaction Detail</h4>
              
              <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                <p className="text-xs break-all mb-4">TRX ID: {order.midtransId || '-'}</p>
                
                <div className="flex justify-between">
                  <span>Total item (1 items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatIDR(order.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Addon</span>
                  <span className="font-medium text-gray-900 dark:text-white">Rp. 0</span>
                </div>
                <div className="flex justify-between">
                  <span>Total shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">Rp. 0</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-medium text-emerald-500">- Rp. 0</span>
                </div>
                <div className="flex justify-between">
                  <span>Affiliate</span>
                  <span className="font-medium text-emerald-500">- Rp. 0</span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-gray-900 dark:text-white text-base">{formatIDR(order.amount)}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Customer */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Customer</h4>
              <div className="space-y-1.5 text-sm text-gray-800 dark:text-gray-300">
                <p>{order.user?.name || 'Unknown User'}</p>
                <p>{order.user?.email || '-'}</p>
                <a href={`https://wa.me/${(order.user?.phone || '085156339329').replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" className="inline-block text-orange-500 font-medium hover:underline mt-1">{order.user?.phone || '085156339329'}</a>
              </div>
            </div>

            {/* Box 4: Email Delivery Tracking */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm print:hidden">
              <h4 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-xs tracking-wider mb-5">Email Delivery Tracking</h4>
              
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                
                <div className="relative flex justify-between items-center text-sm">
                  <div className="absolute left-[-29px] w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                  <span className="font-medium text-orange-500">Opened</span>
                  <span className="text-gray-400 text-xs">{format(new Date(orderDate.getTime() + 4 * 60000), 'dd MMM - HH:mm')}</span>
                </div>
                
                <div className="relative flex justify-between items-center text-sm">
                  <div className="absolute left-[-29px] w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-gray-500 dark:text-gray-400 text-xs font-medium">Delivered</span>
                  <span className="text-gray-400 text-xs">{format(new Date(orderDate.getTime() + 2 * 60000), 'dd MMM - HH:mm')}</span>
                </div>
                
                <div className="relative flex justify-between items-center text-sm">
                  <div className="absolute left-[-29px] w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-gray-500 dark:text-gray-400 text-xs font-medium">Processed</span>
                  <span className="text-gray-400 text-xs">{format(orderDate, 'dd MMM - HH:mm')}</span>
                </div>
                
              </div>
            </div>

            {/* Box 5: Follow Up Text */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm print:hidden">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Follow Up Text</h4>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              
              <button 
                onClick={() => {
                  const name = order.user?.name || 'Kak';
                  const product = order.product?.title || 'Produk';
                  setWaMessage(`Halo ${name},\n\nTerima kasih sudah memesan *${product}*.\n\nApakah ada yang bisa kami bantu terkait pesanan ini?`);
                  setWaOrder(order);
                  setIsWaModalOpen(true);
                }}
                className="w-full py-3 mb-6 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-colors">
                Send Follow Up Text via WhatsApp
              </button>
              
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Sending History</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No history yet</p>
              </div>
            </div>

          </div>
        </div>
      );
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Left Column: Order List */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col h-full">
              {/* Header & Filters */}
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 space-y-4 shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Product Orders</h2>
                  <button onClick={handleExportExcel} className="flex items-center justify-center p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors" title="Export to Excel">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Cari nama atau email..." 
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white"
                    />
                  </div>
                  <select 
                    value={orderStatus} 
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="py-2 px-3 bg-gray-50 dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    Belum ada data transaksi yang sesuai filter.
                  </div>
                ) : (
                  paginatedOrders.map((order: any) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => handleOrderSelect(order)}
                        className={`cursor-pointer border rounded-xl overflow-hidden transition-all duration-200 ${
                          isSelected 
                            ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50/50 dark:bg-orange-500/5' 
                            : 'border-gray-200 dark:border-white/10 hover:border-orange-500/50 bg-white dark:bg-[#1a1a1c]'
                        }`}
                      >
                        <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" onClick={(e) => e.stopPropagation()} />
                            {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 font-bold uppercase tracking-wide ${
                            order.status === 'SUCCESS' ? 'text-orange-500' : 
                            order.status === 'FAILED' ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                            <User className="w-3.5 h-3.5" />
                            Customer: <span className="font-bold">{order.user?.email || '-'}</span>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="w-14 h-20 bg-gray-50 dark:bg-[#121214] rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 p-1 flex items-center justify-center">
                              {getOrderImage(order) ? (
                    <img src={getOrderImage(order)} className="max-w-full max-h-full object-contain drop-shadow-sm" alt="Product" />
                  ) : (
                    <span className="text-[10px] text-gray-400">No Img</span>
                  )}
                            </div>
                            <div className="flex-1 flex flex-col justify-start">
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">{getOrderTitle(order)}</h3>
                              <div>
                                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 border border-gray-200 dark:border-white/20 rounded-full text-gray-500 dark:text-gray-400">
                                  digital
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-end">
                            <div>
                              <p className="text-[10px] text-gray-500 font-medium mb-0.5">Total Transaction</p>
                              <p className="font-black text-gray-900 dark:text-white text-sm">{formatIDR(order.amount)}</p>
                            </div>
                            <button className="px-5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors">
                              Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-black/20 shrink-0">
                  <span className="text-sm text-gray-500 hidden sm:block">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{((orderPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(orderPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredOrders.length}</span>
                  </span>
                  <div className="flex gap-1 w-full sm:w-auto justify-between sm:justify-end">
                    <button 
                      onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setOrderPage(idx + 1)}
                          className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-bold ${
                            orderPage === idx + 1 
                              ? 'bg-orange-500 border-orange-500 text-white' 
                              : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                      disabled={orderPage === totalPages}
                      className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Details (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden h-full">
              <OrderDetailsContent order={selectedOrder} />
            </div>
          </div>

          {/* Mobile Modal for Order Details */}
          {isMobileModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileModalOpen(false)}></div>
              <div className="relative bg-white dark:bg-[#121214] w-full sm:w-[90%] sm:max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10">
                <div className="sticky top-0 right-0 p-4 flex justify-end bg-gradient-to-b from-white dark:from-[#121214] to-transparent z-10 pointer-events-none">
                  <button 
                    onClick={() => setIsMobileModalOpen(false)}
                    className="p-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors pointer-events-auto shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="-mt-14">
                  <OrderDetailsContent order={selectedOrder} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };
  
  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20px;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    <div className="space-y-6">
      
      {/* HEADLINE & TABS HEADERS */}
      <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
        Dashboard
      </h1>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border ${
            activeTab === 'main'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Main
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border ${
            activeTab === 'statistics'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border ${
            activeTab === 'orders'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
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
               <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div> 
                  Total Views & Clicks
               </div>
               <div className="flex items-baseline gap-2">
                 <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatIDR(dynamicTotalViews + dynamicTotalClicks)}</h3>
                 {data.viewsGrowth >= 0 ? (
                   <span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUp size={12}/> {data.viewsGrowth}%</span>
                 ) : (
                   <span className="text-xs font-bold text-red-500 flex items-center"><ArrowDown size={12}/> {Math.abs(data.viewsGrowth)}%</span>
                 )}
               </div>
            </div>
            <div className="bg-white dark:bg-[#121214] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col justify-center">
               <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> 
                  Total Sales
               </div>
               <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.lifetimeOrders}</h3>
            </div>
            <div className="bg-white dark:bg-[#121214] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
               <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 
                  Sales Value (IDR)
               </div>
               <div className="flex items-baseline gap-2">
                 <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeSalesIDR)}</h3>
                 {data.salesGrowth >= 0 ? (
                   <span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUp size={12}/> {data.salesGrowth}%</span>
                 ) : (
                   <span className="text-xs font-bold text-red-500 flex items-center"><ArrowDown size={12}/> {Math.abs(data.salesGrowth)}%</span>
                 )}
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
                       <h2 className="text-2xl font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeSalesIDR)}</h2>
                       <div className="flex flex-col text-[10px] font-bold text-emerald-500 leading-tight">
                         {data.salesGrowth >= 0 ? (
                         <span className="flex items-center text-emerald-500"><ArrowUp size={10}/> {data.salesGrowth}%</span>
                       ) : (
                         <span className="flex items-center text-red-500"><ArrowDown size={10}/> {Math.abs(data.salesGrowth)}%</span>
                       )}
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
                          data={(data.realProductSales && data.realProductSales.length > 0 
    ? data.realProductSales.filter(p => p.sold > 0).map((p) => ({ name: p.title.substring(0, 15) + '...', value: p.sold })) 
    : [{ name: 'No Sales', value: 1 }])}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {(data.realProductSales && data.realProductSales.length > 0 
    ? data.realProductSales.filter(p => p.sold > 0).map((p) => ({ name: p.title.substring(0, 15) + '...', value: p.sold })) 
    : [{ name: 'No Sales', value: 1 }]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
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
                  {(data.realProductSales && data.realProductSales.length > 0 ? data.realProductSales : []).map((product: any) => (
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
                         {product.orderType && product.orderType.startsWith("PRO_") ? (
                          <button onClick={() => { setSelectedPackage(product); setIsPackageModalOpen(true); }} className="inline-block px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-orange-500/20">
                            View
                          </button>
                         ) : (
                          <NextLink href={`/ruang-belajar/${product.slug}`} className="inline-block px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-orange-500/20">
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
      )}

      {activeTab === 'orders' && renderOrdersTab()}

      <PrintModal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
        order={selectedOrder} 
      />

      
      {isPackageModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1c] border border-gray-100 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detail Paket Penjualan</h3>
              <button onClick={() => setIsPackageModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-4 items-center mb-6">
               <div className="w-20 h-20 bg-gray-50 dark:bg-[#121214] rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 flex items-center justify-center p-1">
                 <img src={selectedPackage.image} alt={selectedPackage.title} className="max-w-full max-h-full object-contain drop-shadow-sm" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Bundle Package</p>
                 <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1">{selectedPackage.title}</h4>
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{selectedPackage.sold}</span> terjual
                 </div>
               </div>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-6 border border-gray-100 dark:border-white/5">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Total Views</span>
                 <span className="font-bold text-gray-900 dark:text-white">{selectedPackage.views}x</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Total Pendapatan</span>
                 <span className="font-bold text-green-600">Rp {(selectedPackage.amount || 0).toLocaleString('id-ID')}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Conversion Rate</span>
                 <span className="font-bold text-gray-900 dark:text-white">{selectedPackage.conversion}%</span>
               </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsPackageModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors">
                Tutup
              </button>
              <NextLink href="/?pricing=true" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white text-center transition-colors shadow-lg shadow-orange-500/20">
                Lihat Halaman Promo
              </NextLink>
            </div>
          </div>
        </div>
      )}

      <WhatsAppModal 
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        order={waOrder}
        message={waMessage}
        setMessage={setWaMessage}
      />
    </div>
    </>
  );
}