"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ShoppingCart,
  BookOpen,
  Clock,
  CheckCheck,
  BellOff,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { AppNotification } from "@/app/actions/notifications";

interface NotificationBellProps {
  isAdmin?: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export function NotificationBell({ isAdmin = false }: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [lastReadTime, setLastReadTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load read status from localStorage
  useEffect(() => {
    try {
      const storedTime = localStorage.getItem("rcm_notif_last_read_time");
      if (storedTime) {
        setLastReadTime(parseInt(storedTime, 10));
      }
      const storedReadIds = localStorage.getItem("rcm_notif_read_ids");
      if (storedReadIds) {
        setReadIds(new Set(JSON.parse(storedReadIds)));
      }
    } catch (e) {
      console.error("Failed to load read notifications state:", e);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Determine unread items
  const isItemUnread = (item: AppNotification) => {
    if (readIds.has(item.id)) return false;
    const itemTime = new Date(item.timestamp).getTime();
    return itemTime > lastReadTime;
  };

  const unreadCount = notifications.filter(isItemUnread).length;

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const now = Date.now();
    setLastReadTime(now);
    try {
      localStorage.setItem("rcm_notif_last_read_time", now.toString());
    } catch (e) {
      console.error(e);
    }
  };

  // Click on a notification item
  const handleNotificationClick = (item: AppNotification) => {
    const updated = new Set(readIds);
    updated.add(item.id);
    setReadIds(updated);
    try {
      localStorage.setItem("rcm_notif_read_ids", JSON.stringify(Array.from(updated)));
    } catch (e) {
      console.error(e);
    }

    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "ORDER_CREATED":
        return <ShoppingCart className="w-3.5 h-3.5 text-orange-500" />;
      case "NEW_PRODUCT":
        return <BookOpen className="w-3.5 h-3.5 text-blue-500" />;
      case "ORDER_STATUS":
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getIconBg = (type: AppNotification["type"]) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "ORDER_CREATED":
        return "bg-orange-500/10 border-orange-500/20";
      case "NEW_PRODUCT":
        return "bg-blue-500/10 border-blue-500/20";
      case "ORDER_STATUS":
      default:
        return "bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Notification Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifikasi"
        className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#141B31] border border-transparent hover:border-gray-200 dark:hover:border-[#2C3246] transition-all cursor-pointer"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge / Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0A1128] animate-in zoom-in duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Compact Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl shadow-xl transition-all duration-150 overflow-hidden z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-[#20273d] flex items-center justify-between bg-gray-50/60 dark:bg-[#101628]/60">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[10px] font-semibold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Tandai dibaca</span>
              </button>
            )}
          </div>

          {/* List Content (Compact scrollable list) */}
          <div className="max-h-[260px] overflow-y-auto divide-y divide-gray-100 dark:divide-[#20273d]/60">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Memuat notifikasi...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a223a] flex items-center justify-center mb-2 text-gray-400">
                  <BellOff className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Belum Ada Notifikasi
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px]">
                  {isAdmin
                    ? "Notifikasi pesanan dan penjualan akan tampil di sini."
                    : "Notifikasi materi baru & pembayaran akan tampil di sini."}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const unread = isItemUnread(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`px-3 py-2 flex items-start gap-2.5 hover:bg-gray-50 dark:hover:bg-[#1a223a]/60 transition-colors cursor-pointer relative group ${
                      unread
                        ? "bg-orange-500/[0.04] dark:bg-orange-500/[0.05]"
                        : ""
                    }`}
                  >
                    {/* Compact Icon indicator */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${getIconBg(
                        item.type
                      )}`}
                    >
                      {getIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <p
                          className={`text-xs truncate ${
                            unread
                              ? "font-bold text-gray-900 dark:text-white"
                              : "font-semibold text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.title}
                        </p>
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight line-clamp-2">
                        {item.message}
                      </p>
                    </div>

                    {/* Unread indicator dot */}
                    {unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 self-center" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Compact Footer Link */}
          <div className="py-2 px-3 border-t border-gray-100 dark:border-[#20273d] bg-gray-50/70 dark:bg-[#101628]/70 text-center">
            {isAdmin ? (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                <span>Lihat Pesanan di Dashboard</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            ) : (
              <Link
                href="/ruang-belajar"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                <span>Jelajahi Materi Ruang Belajar</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
