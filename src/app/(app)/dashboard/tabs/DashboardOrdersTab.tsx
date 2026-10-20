"use client";

import React from "react";
import { format } from "date-fns";
import { User, ShoppingBag, Settings, Search, Download, Printer, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { getDashboardOrdersAction } from "@/app/actions/dashboard";

interface DashboardOrdersTabProps {
  serverOrders: any[];
  totalServerOrders: number;
  itemsPerPage: number;
  orderPage: number;
  setOrderPage: React.Dispatch<React.SetStateAction<number>>;
  orderSearch: string;
  setOrderSearch: (val: string) => void;
  orderStatus: string;
  setOrderStatus: (val: string) => void;
  setIsLoadingOrders: (val: boolean) => void;
  selectedOrder: any;
  handleOrderSelect: (order: any) => void;
  isMobileModalOpen: boolean;
  setIsMobileModalOpen: (val: boolean) => void;
  setIsPrintModalOpen: (val: boolean) => void;
  setWaMessage: (val: string) => void;
  setWaOrder: (val: any) => void;
  setIsWaModalOpen: (val: boolean) => void;
  formatIDR: (num: number) => string;
  getOrderImage: (order: any) => string;
  getOrderTitle: (order: any) => string;
}

export function DashboardOrdersTab({
  serverOrders,
  totalServerOrders,
  itemsPerPage,
  orderPage,
  setOrderPage,
  orderSearch,
  setOrderSearch,
  orderStatus,
  setOrderStatus,
  setIsLoadingOrders,
  selectedOrder,
  handleOrderSelect,
  isMobileModalOpen,
  setIsMobileModalOpen,
  setIsPrintModalOpen,
  setWaMessage,
  setWaOrder,
  setIsWaModalOpen,
  formatIDR,
  getOrderImage,
  getOrderTitle,
}: DashboardOrdersTabProps) {
  const handleExportExcel = async () => {
    setIsLoadingOrders(true);
    const res = await getDashboardOrdersAction(1, 10000, orderSearch, orderStatus);
    const exportData = res.orders;
    setIsLoadingOrders(false);

    const headers = [
      "Judul Barang",
      "Varian",
      "Harga",
      "qty",
      "sub total",
      "Voucher",
      "shipping fee",
      "Total Addon",
      "Notif fee",
      "Affiliate fee",
      "Affiliator email",
      "Public Affiliate fee",
      "Convenience Fee",
      "Total",
      "Tanggal",
      "Status",
      "Buyer Email",
      "Buyer Name (opsional)",
      "Buyer Phone (Opsional)",
      "Notes (Opsional)",
      "Addon Detail",
      "Voucher Code",
      "Shipping Address",
      "Shipping Method",
      "Appointment info",
      "Ref",
      "PayPal Ref",
    ];

    const rows = exportData.map((o: any) => {
      const addonList = Array.isArray(o.addons) ? o.addons : [];
      const totalAddonPrice = addonList.reduce(
        (sum: number, a: any) => sum + (a.price || 0),
        0
      );
      const addonTitles = addonList.map((a: any) => a.title).join("; ");
      let mainPrice = o.product?.price;
      if (!mainPrice || mainPrice <= 0) {
        mainPrice = Math.max(
          0,
          (o.amount || 0) - totalAddonPrice + (o.discountAmount || 0)
        );
      }
      const subtotalNet = (mainPrice || 0) + totalAddonPrice - (o.discountAmount || 0);
      const convenienceFee = Math.max(0, (o.amount || 0) - subtotalNet);

      const rowData = [
        o.product?.title || "",
        "",
        mainPrice || 0,
        1,
        mainPrice || 0,
        o.discountAmount || 0,
        0,
        totalAddonPrice || 0,
        0,
        0,
        "",
        0,
        convenienceFee || 0,
        o.amount || 0,
        format(new Date(o.createdAt), "dd-MM-yyyy HH:mm"),
        o.status || "",
        o.user?.email || "",
        o.user?.name || "",
        o.user?.phone || "",
        o.note || "",
        addonTitles || "",
        o.voucherCode || "",
        "",
        "",
        "",
        o.id || "",
        "",
      ];

      return rowData
        .map((field) => {
          const str = String(field);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `Orders_Export_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalServerOrders / itemsPerPage);
  const paginatedOrders = serverOrders;
  const filteredOrders = { length: totalServerOrders };

  const OrderDetailsContent = ({ order }: { order: any }) => {
    if (!order)
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
          <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
          <p>Pilih transaksi untuk melihat detail</p>
        </div>
      );

    const orderDate = new Date(order.createdAt);
    const paymentDate = new Date(orderDate.getTime() + 2 * 60000);

    const addonList = Array.isArray(order.addons) ? order.addons : [];
    const addonCount = addonList.length;
    const totalAddonPrice = addonList.reduce(
      (sum: number, a: any) => sum + (a.price || 0),
      0
    );

    let mainItemPrice = order.product?.price;
    if (!mainItemPrice || mainItemPrice <= 0) {
      if (order.orderType === "PRO_BOOK" || order.orderType === "PRO_TOOLS") {
        mainItemPrice = 99000;
      } else if (order.orderType === "PRO_PLUS") {
        mainItemPrice = 149000;
      } else {
        mainItemPrice = Math.max(
          0,
          (order.amount || 0) - totalAddonPrice + (order.discountAmount || 0)
        );
      }
    }

    const subtotalNet =
      (mainItemPrice || 0) + totalAddonPrice - (order.discountAmount || 0);
    const convenienceFee = Math.max(0, (order.amount || 0) - subtotalNet);

    return (
      <div className="p-0 sm:p-4 text-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white print:hidden">
            Order Details
          </h3>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white hidden print:block">
            Invoice
          </h3>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="print:hidden flex items-center gap-2 px-4 py-1.5 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg font-bold transition-colors text-xs tracking-wide"
          >
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
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {format(orderDate, "dd MMM yyyy HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20">Payment:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {format(paymentDate, "dd MMM yyyy HH:mm")}
                  </span>
                </div>
              </div>
              <span
                className={`font-bold text-xs uppercase tracking-wide px-3 py-1.5 rounded-md bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 ${
                  order.status === "SUCCESS"
                    ? "text-orange-500"
                    : order.status === "FAILED"
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex gap-4 items-start mb-5">
              <div className="w-16 h-20 bg-gray-50 dark:bg-[#121214] rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 p-1 flex items-center justify-center">
                {getOrderImage(order) ? (
                  <img
                    src={getOrderImage(order)}
                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                    alt="Product"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400">No Img</span>
                )}
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-gray-900 dark:text-white mt-0.5">
                    1x
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white leading-snug">
                    {getOrderTitle(order)}
                  </p>
                </div>
                <div className="pl-6">
                  <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 border border-gray-200 dark:border-white/20 rounded-full text-gray-500 dark:text-gray-400">
                    digital
                  </span>
                </div>
                <div className="pl-6 pt-1">
                  <p className="text-gray-900 dark:text-gray-200 text-sm font-semibold">
                    1 x {formatIDR(mainItemPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Addon Products List (if any) */}
            {addonCount > 0 && (
              <div className="border-t border-gray-100 dark:border-white/10 pt-3 pb-1 mb-4 space-y-2">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Add-on Produk ({addonCount})
                </p>
                {addonList.map((addon: any, idx: number) => (
                  <div
                    key={addon.id || idx}
                    className="flex gap-3 items-center bg-gray-50/70 dark:bg-[#121214] p-2.5 rounded-lg border border-gray-100 dark:border-white/5"
                  >
                    <div className="w-10 h-12 bg-white dark:bg-[#1a1a1c] rounded overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 p-0.5 flex items-center justify-center">
                      {addon.coverUrl ? (
                        <img
                          src={addon.coverUrl}
                          className="max-w-full max-h-full object-contain"
                          alt={addon.title}
                        />
                      ) : (
                        <span className="text-[9px] text-gray-400">No Img</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 dark:text-white text-xs">
                          1x
                        </span>
                        <p className="font-bold text-gray-900 dark:text-white text-xs truncate">
                          {addon.title}
                        </p>
                      </div>
                      <p className="text-xs text-orange-500 font-semibold pl-4 pt-0.5">
                        1 x {formatIDR(addon.price || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[#f8fafc] dark:bg-[#121214] rounded-lg p-3 border border-gray-100 dark:border-white/5">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                No notes provided
              </p>
            </div>
          </div>

          {/* Box 2: Transaction Detail */}
          <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">
              Transaction Detail
            </h4>

            <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <p className="text-xs break-all mb-4">TRX ID: {order.midtransId || "-"}</p>

              <div className="flex justify-between">
                <span>Total item (1 items)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatIDR(mainItemPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  {addonCount > 0 ? `Total Addon (${addonCount} items)` : "Total Addon"}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {addonCount > 0 ? formatIDR(totalAddonPrice) : "Rp. 0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Convenience fee</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {convenienceFee > 0 ? formatIDR(convenienceFee) : "Rp. 0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">Rp. 0</span>
              </div>
              <div className="flex justify-between">
                <span>Discount {order.voucherCode ? `(${order.voucherCode})` : ""}</span>
                <span className="font-medium text-emerald-500">
                  {order.discountAmount && order.discountAmount > 0
                    ? `- ${formatIDR(order.discountAmount)}`
                    : "- Rp. 0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Affiliate</span>
                <span className="font-medium text-emerald-500">- Rp. 0</span>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white text-base">
                  {formatIDR(order.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Box 3: Customer */}
          <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Customer</h4>
            <div className="space-y-1.5 text-sm text-gray-800 dark:text-gray-300">
              <p>{order.user?.name || "Unknown User"}</p>
              <p>{order.user?.email || "-"}</p>
              <a
                href={`https://wa.me/${(order.user?.phone || "085156339329")
                  .replace(/\D/g, "")
                  .replace(/^0/, "62")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-orange-500 font-medium hover:underline mt-1"
              >
                {order.user?.phone || "085156339329"}
              </a>
            </div>
          </div>

          {/* Box 4: Email Delivery Tracking */}
          <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm print:hidden">
            <h4 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-xs tracking-wider mb-5">
              Email Delivery Tracking
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              <div className="relative flex justify-between items-center text-sm">
                <div className="absolute left-[-29px] w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                <span className="font-medium text-orange-500">Opened</span>
                <span className="text-gray-400 text-xs">
                  {format(new Date(orderDate.getTime() + 4 * 60000), "dd MMM - HH:mm")}
                </span>
              </div>

              <div className="relative flex justify-between items-center text-sm">
                <div className="absolute left-[-29px] w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-gray-500 dark:text-gray-400 text-xs font-medium">
                  Delivered
                </span>
                <span className="text-gray-400 text-xs">
                  {format(new Date(orderDate.getTime() + 2 * 60000), "dd MMM - HH:mm")}
                </span>
              </div>

              <div className="relative flex justify-between items-center text-sm">
                <div className="absolute left-[-29px] w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-gray-500 dark:text-gray-400 text-xs font-medium">
                  Processed
                </span>
                <span className="text-gray-400 text-xs">
                  {format(orderDate, "dd MMM - HH:mm")}
                </span>
              </div>
            </div>
          </div>

          {/* Box 5: Follow Up Text */}
          <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm print:hidden">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                Follow Up Text
              </h4>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                const name = order.user?.name || "Kak";
                const product = order.product?.title || "Produk";
                setWaMessage(
                  `Halo ${name},\n\nTerima kasih sudah memesan *${product}*.\n\nApakah ada yang bisa kami bantu terkait pesanan ini?`
                );
                setWaOrder(order);
                setIsWaModalOpen(true);
              }}
              className="w-full py-3 mb-6 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl font-bold transition-colors"
            >
              Send Follow Up Text via WhatsApp
            </button>

            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                Sending History
              </p>
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Product Orders
                </h2>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center justify-center p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  title="Export to Excel"
                >
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
                <div className="relative shrink-0">
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="py-2 pl-3 pr-8 bg-gray-50 dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="all">Semua Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
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
                          ? "border-orange-500 ring-1 ring-orange-500 bg-orange-50/50 dark:bg-orange-500/5"
                          : "border-gray-200 dark:border-white/10 hover:border-orange-500/50 bg-white dark:bg-[#1a1a1c]"
                      }`}
                    >
                      <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {format(new Date(order.createdAt), "dd MMM yyyy HH:mm")}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 font-bold uppercase tracking-wide ${
                            order.status === "SUCCESS"
                              ? "text-orange-500"
                              : order.status === "FAILED"
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                          <User className="w-3.5 h-3.5" />
                          Customer:{" "}
                          <span className="font-bold">{order.user?.email || "-"}</span>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-14 h-20 bg-gray-50 dark:bg-[#121214] rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 p-1 flex items-center justify-center">
                            {getOrderImage(order) ? (
                              <img
                                src={getOrderImage(order)}
                                className="max-w-full max-h-full object-contain drop-shadow-sm"
                                alt="Product"
                              />
                            ) : (
                              <span className="text-[10px] text-gray-400">No Img</span>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-start">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">
                              {getOrderTitle(order)}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 border border-gray-200 dark:border-white/20 rounded-full text-gray-500 dark:text-gray-400">
                                digital
                              </span>
                              {order.addons && order.addons.length > 0 && (
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40 rounded-full">
                                  +{order.addons.length} Add-on
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-gray-500 font-medium mb-0.5">
                              Total Transaction
                            </p>
                            <p className="font-black text-gray-900 dark:text-white text-sm">
                              {formatIDR(order.amount)}
                            </p>
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
              <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121214] shrink-0">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalServerOrders > 0 ? (orderPage - 1) * itemsPerPage + 1 : 0}
                  </span>
                  –
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min(orderPage * itemsPerPage, totalServerOrders)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalServerOrders}
                  </span>{" "}
                  pesanan
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                    disabled={orderPage === 1}
                    className="h-8 px-2.5 sm:px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                          Math.abs(page - orderPage) <= 1
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
                              onClick={() => setOrderPage(page)}
                              className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                orderPage === page
                                  ? "bg-orange-500 text-white border border-orange-500 shadow-sm"
                                  : "border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium"
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
                    onClick={() => setOrderPage((p) => Math.min(totalPages, p + 1))}
                    disabled={orderPage === totalPages}
                    className="h-8 px-2.5 sm:px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileModalOpen(false)}
            ></div>
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
}
