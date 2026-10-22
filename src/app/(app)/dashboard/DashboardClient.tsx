"use client";

import React, { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getDashboardDataAction,
  getDashboardOrdersAction,
  getAudienceInsightsAction,
  revalidateDashboardAction,
} from "@/app/actions/dashboard";
import { RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { DashboardMainTab } from "./tabs/DashboardMainTab";
import { DashboardOrdersTab } from "./tabs/DashboardOrdersTab";
import "react-day-picker/dist/style.css";

const DashboardStatisticsTab = dynamic(
  () => import("./tabs/DashboardStatisticsTab").then((m) => m.DashboardStatisticsTab),
  {
    loading: () => <LoadingSpinner message="Memuat Grafik Statistik..." />,
    ssr: false,
  }
);
const DashboardInsightsTab = dynamic(
  () => import("./tabs/DashboardInsightsTab").then((m) => m.DashboardInsightsTab),
  {
    loading: () => <LoadingSpinner message="Memuat Audience Insights..." />,
    ssr: false,
  }
);
const PrintModal = dynamic(() => import("./PrintModal"), { ssr: false });
const WhatsAppModal = dynamic(() => import("./WhatsAppModal"), { ssr: false });

export default function DashboardClient({
  user: _user,
  initialData,
}: {
  user: any;
  initialData?: any;
}) {
  const getOrderImage = (order: any) => {
    if (order.product?.coverUrl) return order.product.coverUrl;
    switch (order.orderType) {
      case "PRO_BOOK":
        return "/img_paket/paket_ebook.png";
      case "PRO_TOOLS":
        return "/img_paket/paket_tools.png";
      case "PRO_PLUS":
        return "/img_paket/paket_lengkap.png";
      case "TOOLS":
        return "/img_paket/paket_tools.png";
      default:
        return "/img_paket/paket_ebook.png";
    }
  };

  const getOrderTitle = (order: any) => {
    if (order.product?.title) return order.product.title;
    switch (order.orderType) {
      case "PRO_BOOK":
        return "Paket PRO BOOK";
      case "PRO_TOOLS":
        return "Paket PRO TOOLS";
      case "PRO_PLUS":
        return "Paket PRO PLUS";
      case "TOOLS":
        return "Akses Tools";
      default:
        return "Unknown Product";
    }
  };

  const { data, mutate } = useSWR("dashboard", () => getDashboardDataAction(false), {
    fallbackData: initialData,
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000,
  });
  const { data: insightsData, mutate: mutateInsights } = useSWR(
    "insights",
    getAudienceInsightsAction,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000,
    }
  );

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [orderPage, setOrderPage] = useState(1);
  const [serverOrders, setServerOrders] = useState(data?.fullOrders || []);
  const [totalServerOrders, setTotalServerOrders] = useState(
    data?.fullOrders?.length || 0
  );
  const [_isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 5;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await revalidateDashboardAction();

      const freshData = await getDashboardDataAction(true);
      if (freshData) {
        await mutate(freshData, false);
      } else {
        await mutate();
      }
      mutateInsights();
      const res = await getDashboardOrdersAction(
        orderPage,
        itemsPerPage,
        orderSearch,
        orderStatus
      );
      setServerOrders(res.orders);
      setTotalServerOrders(res.total);
      if (res.orders.length === 0) {
        setSelectedOrder(null);
      }

      await globalMutate(() => true, undefined, { revalidate: true });
      globalMutate("ruangBelajar");
      globalMutate("pengaturan");
      globalMutate("blueprint");
      globalMutate("contentCalendar");
      globalMutate("bioBuilder");

      toast.success("Seluruh data tools & dashboard berhasil disinkronkan!");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyinkronkan data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await getDashboardOrdersAction(
          orderPage,
          itemsPerPage,
          orderSearch,
          orderStatus
        );
        if (isMounted) {
          setServerOrders(res.orders);
          setTotalServerOrders(res.total);
          if (res.orders.length === 0) {
            setSelectedOrder(null);
          }
        }
      } catch (e) {
        console.error(e);
      }
      if (isMounted) setIsLoadingOrders(false);
    };

    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [orderPage, orderStatus, orderSearch]);

  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [waMessage, setWaMessage] = useState("");
  const [waOrder, setWaOrder] = useState<any>(null);

  React.useEffect(() => {
    if (serverOrders.length === 0) {
      setSelectedOrder(null);
    } else if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      if (!selectedOrder || !serverOrders.some((o: any) => o.id === selectedOrder.id)) {
        setSelectedOrder(serverOrders[0]);
      }
    }
  }, [serverOrders]);

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileModalOpen(true);
    }
  };

  const [activeTab, setActiveTab] = useState("main");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 21),
    to: new Date(),
  });

  const { chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData } =
    React.useMemo(() => {
      return {
        chartData: data?.viewsChartData || [],
        dynamicTotalViews: data?.totalViews || 0,
        dynamicTotalClicks: data?.totalClicks || 0,
        salesChartData: data?.salesChartData || [],
      };
    }, [date, data]);

  if (!data) return <LoadingSpinner message="Memuat Dashboard..." />;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatShortIDR = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "JT";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num.toString();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
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
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-[#1C2542] hover:border-gray-300 dark:hover:border-gray-500 transition-all text-gray-700 dark:text-gray-200 shadow-2xs disabled:opacity-50 cursor-pointer active:scale-95"
            title="Sinkronkan seluruh data aplikasi (Dashboard, Ruang Ngonten, Ruang Belajar, dll) langsung dari database"
          >
            <RefreshCw
              size={13}
              className={
                isRefreshing ? "animate-spin text-orange-500" : "text-gray-500"
              }
            />
            <span>
              {isRefreshing
                ? "Menyinkronkan Semua Data..."
                : "Refresh Semua Data"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
          {[
            { id: "main", label: "Main" },
            { id: "statistics", label: "Statistics" },
            { id: "orders", label: "Orders" },
            { id: "insights", label: "Insights" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all rounded-lg border ${
                activeTab === tab.id
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#1f2947]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "main" && (
          <DashboardMainTab
            data={data}
            chartData={chartData}
            dynamicTotalViews={dynamicTotalViews}
            dynamicTotalClicks={dynamicTotalClicks}
            date={date}
            setDate={setDate}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            formatIDR={formatIDR}
          />
        )}

        {activeTab === "statistics" && (
          <DashboardStatisticsTab
            data={data}
            dynamicTotalViews={dynamicTotalViews}
            dynamicTotalClicks={dynamicTotalClicks}
            salesChartData={salesChartData}
            formatIDR={formatIDR}
            formatShortIDR={formatShortIDR}
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
            isPackageModalOpen={isPackageModalOpen}
            setIsPackageModalOpen={setIsPackageModalOpen}
          />
        )}

        {activeTab === "orders" && (
          <DashboardOrdersTab
            serverOrders={serverOrders}
            totalServerOrders={totalServerOrders}
            itemsPerPage={itemsPerPage}
            orderPage={orderPage}
            setOrderPage={setOrderPage}
            orderSearch={orderSearch}
            setOrderSearch={setOrderSearch}
            orderStatus={orderStatus}
            setOrderStatus={setOrderStatus}
            setIsLoadingOrders={setIsLoadingOrders}
            selectedOrder={selectedOrder}
            handleOrderSelect={handleOrderSelect}
            isMobileModalOpen={isMobileModalOpen}
            setIsMobileModalOpen={setIsMobileModalOpen}
            setIsPrintModalOpen={setIsPrintModalOpen}
            setWaMessage={setWaMessage}
            setWaOrder={setWaOrder}
            setIsWaModalOpen={setIsWaModalOpen}
            formatIDR={formatIDR}
            getOrderImage={getOrderImage}
            getOrderTitle={getOrderTitle}
          />
        )}

        {activeTab === "insights" && (
          <DashboardInsightsTab insightsData={insightsData} />
        )}

        {isPrintModalOpen && (
          <PrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            order={selectedOrder}
          />
        )}

        {isWaModalOpen && (
          <WhatsAppModal
            isOpen={isWaModalOpen}
            onClose={() => setIsWaModalOpen(false)}
            order={waOrder}
            message={waMessage}
            setMessage={setWaMessage}
          />
        )}
      </div>
    </>
  );
}
