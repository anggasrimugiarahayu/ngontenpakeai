"use client";

import React from "react";
import {
  ExternalLink,
  Pencil,
  X,
  TrendingUp,
  Link2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  RefreshCw,
  Clock,
  MousePointerClick,
} from "lucide-react";
import { parseClientRuleConfig, parseClientLogMeta } from "../utils/automationHelpers";

interface InstagramRuleDetailModalProps {
  detailRuleId: string | null;
  setDetailRuleId: (id: string | null) => void;
  rules: any[];
  feedPosts: any[];
  accountUsername?: string | null;
  logs: any[];
  handleOpenEditRuleModal: (rule: any) => void;
  isRetryingFailed: boolean;
  setIsRetryingFailed: (val: boolean) => void;
  isRewindingComments: boolean;
  setIsRewindingComments: (val: boolean) => void;
  retryFailedAutomationLogsAction: (ruleId: string) => Promise<any>;
  rewindAutomationCommentsAction: (ruleId: string) => Promise<any>;
  showToast: (type: "success" | "error" | "info", message: string) => void;
  mutateData: () => Promise<any>;
}

export function InstagramRuleDetailModal({
  detailRuleId,
  setDetailRuleId,
  rules,
  feedPosts,
  accountUsername,
  logs,
  handleOpenEditRuleModal,
  isRetryingFailed,
  setIsRetryingFailed,
  isRewindingComments,
  setIsRewindingComments,
  retryFailedAutomationLogsAction,
  rewindAutomationCommentsAction,
  showToast,
  mutateData,
}: InstagramRuleDetailModalProps) {
  const [hoveredDot, setHoveredDot] = React.useState<any | null>(null);

  if (!detailRuleId) return null;
  const detailRule = (rules || []).find((r: any) => r.id === detailRuleId);
  if (!detailRule) return null;

  const detailConfig = parseClientRuleConfig(detailRule.dmMessage);
  const detailMatchedPost = detailRule.specificPostId
    ? feedPosts.find((p) => String(p.id) === String(detailRule.specificPostId))
    : null;

  const detailPostPermalink =
    detailMatchedPost?.permalink ||
    detailConfig.postPermalink ||
    (accountUsername
      ? `https://www.instagram.com/${accountUsername}/`
      : "https://www.instagram.com/");

  const fourteenDaysAgoMs = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const allRuleLogs = (logs || []).filter((l: any) => l.ruleId === detailRule.id);
  const recent14dLogs = allRuleLogs.filter((l: any) => {
    const ts = l.createdAt ? new Date(l.createdAt).getTime() : Date.now();
    return ts >= fourteenDaysAgoMs;
  });

  // Hitung 7 KPI Metrics secara akurat dari database log
  const sentLogs = allRuleLogs.filter((l: any) => l.dmStatus === "SENT");
  const kpiSend = sentLogs.length > 0 ? sentLogs.length : (detailRule._count?.logs || 0);
  let kpiRead = 0;
  let kpiClicked = 0;
  let kpiNewFollower = 0;
  let kpiPaid = 0;
  let kpiTotalEarning = 0;

  for (const l of allRuleLogs) {
    const m = parseClientLogMeta(l.errorMessage);
    if (m.read || m.clicked || m.newFollower || m.contact) kpiRead += 1;
    if (m.clicked) kpiClicked += 1;
    if (m.newFollower) kpiNewFollower += 1;
    if (m.paid) kpiPaid += 1;
    if (typeof m.earning === "number") kpiTotalEarning += m.earning;
  }

  const kpiCtr =
    kpiSend > 0
      ? ((kpiClicked / kpiSend) * 100).toFixed(1).replace(/\.0$/, "") + "%"
      : "0%";

  // Bangun data grafik 14 hari terakhir (harian)
  const dailyBuckets: {
    dateKey: string;
    label: string;
    send: number;
    read: number;
    clicked: number;
    follower: number;
  }[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const label = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    dailyBuckets.push({ dateKey, label, send: 0, read: 0, clicked: 0, follower: 0 });
  }

  for (const l of recent14dLogs) {
    const d = l.createdAt ? new Date(l.createdAt) : new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    const bucket = dailyBuckets.find((b) => b.dateKey === key);
    if (bucket) {
      if (l.dmStatus === "SENT") bucket.send += 1;
      const m = parseClientLogMeta(l.errorMessage);
      if (m.read || m.clicked || m.newFollower || m.contact) bucket.read += 1;
      if (m.clicked) bucket.clicked += 1;
      if (m.newFollower) bucket.follower += 1;
    }
  }

  const maxPerfValue = Math.max(
    1,
    ...dailyBuckets.map((b) => Math.max(b.send, b.read, b.follower))
  );
  const maxClickValue = Math.max(1, ...dailyBuckets.map((b) => b.clicked));

  // Konfigurasi fitur Aktif / Nonaktif
  const hasReplyComment =
    detailConfig.featureReplyComment !== false &&
    Array.isArray(detailRule.commentReplies) &&
    detailRule.commentReplies.length > 0;
  const hasWelcomeMsg = Boolean(detailConfig.featureWelcomeMessage);
  const hasAskFollow = Boolean(detailConfig.featureAskForFollow);
  const hasAskContact = Boolean(detailConfig.featureAskForContact);
  const hasFollowUp = Boolean(detailConfig.featureFollowUp);
  const hasAskPayment = Boolean(detailConfig.featureAskForPayment);

  const configItems = [
    { label: "Balas Komentar", active: hasReplyComment },
    { label: "Pesan Pembuka", active: hasWelcomeMsg },
    { label: "Ask For Follow", active: hasAskFollow },
    { label: "Ask for Contact", active: hasAskContact },
    { label: "Follow Up", active: hasFollowUp },
    { label: "Ask For Payment", active: hasAskPayment },
  ];

  // Ekstraksi seluruh tombol interaksi yang terkonfigurasi pada aturan ini
  const welcomeButton = detailConfig.featureWelcomeMessage
    ? [
        {
          id: "welcome_btn",
          label: detailConfig.welcomeButtonLabel?.trim() || "Ya, Saya Mau!",
          module: "Pesan Pembuka",
          action: "Konfirmasi Minat",
          type: "postback" as const,
          destination: "Melanjutkan alur DM setelah konfirmasi audiens",
          badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        },
      ]
    : [];

  const askFollowButton = detailConfig.featureAskForFollow
    ? [
        {
          id: "ask_follow_btn",
          label: detailConfig.askForFollowButtonLabel?.trim() || "Sudah mengikuti 🙌",
          module: "Ask For Follow",
          action: "Verifikasi Follow",
          type: "postback" as const,
          destination: "Verifikasi status follow real-time ke Meta API",
          badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        },
      ]
    : [];

  const mainButtons: any[] = [];
  if (detailConfig.messageType === "CAROUSEL") {
    if (Array.isArray(detailConfig.carouselSlides)) {
      detailConfig.carouselSlides.forEach((slide: any, sIdx: number) => {
        if (Array.isArray(slide.buttons)) {
          slide.buttons.forEach((b: any, bIdx: number) => {
            if (b?.label?.trim()) {
              mainButtons.push({
                id: `carousel_${sIdx}_${bIdx}`,
                label: b.label.trim(),
                module: "Carousel DM",
                action: `Slide ${sIdx + 1}`,
                type: "web_url" as const,
                destination: b.url?.trim() || "-",
                badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
              });
            }
          });
        }
      });
    }
  } else if (detailConfig.messageType === "PLAIN_TEXT") {
    if (Array.isArray(detailConfig.quickReplies) && detailConfig.quickReplies.length > 0) {
      detailConfig.quickReplies.forEach((q: any, qIdx: number) => {
        const qLbl = q.label?.trim() || q.text?.trim();
        if (qLbl) {
          mainButtons.push({
            id: q.id || `qr_${qIdx}`,
            label: qLbl,
            module: "Quick Reply",
            action: "Pilihan Cepat",
            type: "quick_reply" as const,
            destination: q.text?.trim() ? `Balasan: "${q.text.trim()}"` : "Balasan Cepat",
            badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
          });
        }
      });
    }
  } else {
    // BUTTON_TEMPLATE atau Default
    if (Array.isArray(detailConfig.buttons) && detailConfig.buttons.length > 0) {
      detailConfig.buttons.forEach((b: any, bIdx: number) => {
        const lbl = b.labelType === "Klik Disini" ? "Klik Disini" : b.label?.trim();
        if (lbl) {
          const isText = b.action === "Kirim Teks";
          mainButtons.push({
            id: b.id || `btn_${bIdx}`,
            label: lbl,
            module: "Pesan Utama",
            action: isText ? "Kirim Teks" : "Buka Website",
            type: isText ? ("postback" as const) : ("web_url" as const),
            destination: isText
              ? b.text?.trim()
                ? `Balasan: "${b.text.trim()}"`
                : "Balasan Teks Otomatis"
              : b.url?.trim() || "-",
            badgeColor: isText
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
          });
        }
      });
    } else if (detailRule.buttonText) {
      mainButtons.push({
        id: "main_default_btn",
        label: detailRule.buttonText.trim(),
        module: "Pesan Utama",
        action: "Buka Website",
        type: "web_url" as const,
        destination: detailRule.buttonUrl?.trim() || "-",
        badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      });
    }
  }

  const liveButtons: any[] = [];
  if (Array.isArray(detailConfig.liveContents)) {
    detailConfig.liveContents.forEach((c: any, cIdx: number) => {
      if (Array.isArray(c.buttons)) {
        c.buttons.forEach((b: any, bIdx: number) => {
          const lbl = b.labelType === "Klik Disini" ? "Klik Disini" : b.label?.trim();
          if (lbl) {
            const isText = b.action === "Kirim Teks";
            liveButtons.push({
              id: b.id || `live_btn_${cIdx}_${bIdx}`,
              label: lbl,
              module: `Live Item ${cIdx + 1}`,
              action: isText ? "Kirim Teks" : "Buka Website",
              type: isText ? ("postback" as const) : ("web_url" as const),
              destination: isText
                ? b.text?.trim()
                  ? `Balasan: "${b.text.trim()}"`
                  : "Balasan Teks Otomatis"
                : b.url?.trim() || "-",
              badgeColor: isText
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
            });
          }
        });
      }
      if (Array.isArray(c.quickReplies)) {
        c.quickReplies.forEach((q: any, qIdx: number) => {
          const qLbl = q.label?.trim() || q.text?.trim();
          if (qLbl) {
            liveButtons.push({
              id: q.id || `live_qr_${cIdx}_${qIdx}`,
              label: qLbl,
              module: `Live Item ${cIdx + 1}`,
              action: "Quick Reply",
              type: "quick_reply" as const,
              destination: q.text?.trim() ? `Balasan: "${q.text.trim()}"` : "Balasan Cepat",
              badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
            });
          }
        });
      }
    });
  }

  const followUpButton =
    detailConfig.featureFollowUp && detailConfig.followUpMessageType !== "Teks Biasa"
      ? [
          {
            id: "followup_btn",
            label: detailConfig.followUpButtonLabel?.trim() || detailRule.buttonText?.trim() || "Buka Link Sekarang",
            module: "Follow Up",
            action: "Buka Website",
            type: "web_url" as const,
            destination: detailRule.buttonUrl?.trim() || "https://ruangcreativemuslim.com",
            badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
          },
        ]
      : [];

  const allConfiguredButtons = [
    ...welcomeButton,
    ...askFollowButton,
    ...mainButtons,
    ...liveButtons,
    ...followUpButton,
  ];

  // Hitung agregasi klik tombol dari log
  const clickCountsByLabel = new Map<string, number>();
  let legacyWebClicks = 0;
  let legacyWelcomeClicks = 0;
  let legacyFollowClicks = 0;
  let totalClicksSum = 0;

  for (const l of allRuleLogs) {
    const m = parseClientLogMeta(l.errorMessage);

    if (Array.isArray(m.buttonClicks) && m.buttonClicks.length > 0) {
      for (const clk of m.buttonClicks) {
        totalClicksSum += 1;
        const lbl = (clk.label || "").trim().toLowerCase();
        if (lbl) clickCountsByLabel.set(lbl, (clickCountsByLabel.get(lbl) || 0) + 1);
      }
    } else {
      if (m.clicked) {
        const count = Number(m.clickCount) || 1;
        legacyWebClicks += count;
        totalClicksSum += count;
      }
      if (m.lastPostbackPayload?.startsWith("WELCOME_AGREE")) {
        legacyWelcomeClicks += 1;
        totalClicksSum += 1;
      }
      if (m.lastPostbackPayload?.startsWith("CHECK_FOLLOW") || m.newFollower) {
        legacyFollowClicks += 1;
        totalClicksSum += 1;
      }
    }
  }

  const resolvedButtons = allConfiguredButtons.map((btn) => {
    const lblLower = btn.label.trim().toLowerCase();
    let clicks = clickCountsByLabel.get(lblLower) || 0;

    // Fallback retro-compatibility
    if (btn.module === "Pesan Pembuka") {
      clicks += legacyWelcomeClicks;
    } else if (btn.module === "Ask For Follow") {
      clicks += legacyFollowClicks;
    } else if (btn.type === "web_url" && (btn.module === "Pesan Utama" || btn.action === "Buka Website")) {
      const webUrlBtns = allConfiguredButtons.filter((b) => b.type === "web_url");
      if (webUrlBtns.length <= 1) {
        clicks += legacyWebClicks;
      }
    }

    const ctr = kpiSend > 0 ? ((clicks / kpiSend) * 100).toFixed(1).replace(/\.0$/, "") + "%" : "0%";
    const share = totalClicksSum > 0 ? Math.round((clicks / totalClicksSum) * 100) : 0;

    return {
      ...btn,
      clicks,
      ctr,
      share,
    };
  });

  const totalTrackedClicks = Math.max(kpiClicked, totalClicksSum);

  // Bangun data Dot Matrix 14 Hari (Opsi A Solusi 1: Setiap Titik mewakili Tombol)
  const dotMatrixMaxPos = 12;
  const dotMatrixMaxNeg = 8;

  const dotMatrixDays = dailyBuckets.map((b) => {
    const dayLogs = recent14dLogs.filter((l: any) => {
      const d = l.createdAt ? new Date(l.createdAt) : new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}` === b.dateKey;
    });

    const daySends = b.send;

    // Hitung performa setiap tombol pada hari ini
    const buttonsWithDayStats = allConfiguredButtons.map((btn) => {
      let clicks = 0;
      for (const l of dayLogs) {
        const m = parseClientLogMeta(l.errorMessage);
        if (Array.isArray(m.buttonClicks) && m.buttonClicks.length > 0) {
          for (const clk of m.buttonClicks) {
            if (
              clk.label?.trim().toLowerCase() === btn.label.trim().toLowerCase() ||
              clk.action?.trim().toLowerCase() === btn.action.trim().toLowerCase()
            ) {
              clicks += 1;
            }
          }
        } else {
          if (btn.module === "Pesan Pembuka" && m.lastPostbackPayload?.startsWith("WELCOME_AGREE")) {
            clicks += 1;
          } else if (
            btn.module === "Ask For Follow" &&
            (m.lastPostbackPayload?.startsWith("CHECK_FOLLOW") || m.newFollower)
          ) {
            clicks += 1;
          } else if (btn.type === "web_url" && m.clicked) {
            clicks += Number(m.clickCount) || 1;
          }
        }
      }

      const ctr = daySends > 0 ? Math.round((clicks / daySends) * 100) : 0;
      return {
        ...btn,
        dayClicks: clicks,
        dayCtr: ctr,
      };
    });

    // 1. Titik Positif (Di atas garis 0) -> Tombol yang berhasil diklik
    const positiveDots: any[] = [];
    const activeClickedButtons = buttonsWithDayStats.filter((btn) => btn.dayClicks > 0);

    activeClickedButtons.forEach((btn) => {
      const dotCount = Math.max(1, Math.min(4, btn.dayClicks));
      for (let i = 0; i < dotCount; i++) {
        let dotColor = "bg-[#86EFAC]"; // Hijau muda (CTR < 15%)
        let dotHex = "#86EFAC";
        if (btn.dayCtr >= 35) {
          dotColor = "bg-[#0284C7]"; // Biru (CTR sangat tinggi)
          dotHex = "#0284C7";
        } else if (btn.dayCtr >= 20) {
          dotColor = "bg-[#16A34A]"; // Hijau tua (CTR tinggi)
          dotHex = "#16A34A";
        } else if (btn.dayCtr >= 10) {
          dotColor = "bg-[#22C55E]"; // Hijau sedang (CTR bagus)
          dotHex = "#22C55E";
        }

        positiveDots.push({
          id: `${btn.id}_${b.dateKey}_${i}`,
          label: btn.label,
          module: btn.module,
          action: btn.action,
          destination: btn.destination,
          clicks: btn.dayClicks,
          ctr: btn.dayCtr,
          color: dotColor,
          colorHex: dotHex,
          isHighlight: i === 0 && btn.dayCtr >= 20,
          isPositive: true,
          dateLabel: b.label,
        });
      }
    });

    // 2. Titik Negatif (Di bawah garis 0) -> Tombol yang diabaikan / dropoff
    const negativeDots: any[] = [];
    if (daySends > 0) {
      const dropoffButtons = buttonsWithDayStats.filter((btn) => btn.dayClicks === 0);
      const dayDropoffCount = Math.max(0, daySends - b.clicked);
      const dropoffDotCount = Math.max(
        dropoffButtons.length > 0 ? 1 : 0,
        Math.min(dotMatrixMaxNeg, Math.max(1, Math.round(dayDropoffCount / Math.max(1, Math.ceil(daySends / 6)))))
      );

      for (let j = 0; j < dropoffDotCount; j++) {
        const refBtn = dropoffButtons[j % Math.max(1, dropoffButtons.length)] || {
          label: "Pesan Diabaikan",
          module: "Pesan Utama",
          action: "Dropoff",
          destination: "Audiens belum menekan tombol",
        };

        let dropoffColor = "bg-[#FEF08A]"; // Kuning muda (Dropoff rendah)
        let dropoffHex = "#FEF08A";
        const dropoffRate = daySends > 0 ? (dayDropoffCount / daySends) * 100 : 0;
        if (dropoffRate >= 75) {
          dropoffColor = "bg-[#DC2626]"; // Merah pekat
          dropoffHex = "#DC2626";
        } else if (dropoffRate >= 50) {
          dropoffColor = "bg-[#EA580C]"; // Oranye pekat
          dropoffHex = "#EA580C";
        } else if (dropoffRate >= 25) {
          dropoffColor = "bg-[#FBBF24]"; // Kuning tua / Amber
          dropoffHex = "#FBBF24";
        }

        negativeDots.push({
          id: `drop_${b.dateKey}_${j}`,
          label: refBtn.label,
          module: refBtn.module,
          action: refBtn.action,
          destination: refBtn.destination,
          clicks: 0,
          ctr: 0,
          dropoffCount: dayDropoffCount,
          color: dropoffColor,
          colorHex: dropoffHex,
          isHighlight: false,
          isPositive: false,
          dateLabel: b.label,
        });
      }
    }

    return {
      dateKey: b.dateKey,
      label: b.label,
      sends: daySends,
      hasActivity: daySends > 0,
      positiveDots: positiveDots.slice(0, dotMatrixMaxPos),
      negativeDots: negativeDots.slice(0, dotMatrixMaxNeg),
    };
  });

  const detailKeywords = Array.isArray(detailRule.keywords)
    ? detailRule.keywords
    : typeof detailRule.keywords === "string"
    ? JSON.parse(detailRule.keywords || "[]")
    : [];

  const detailCommentReplies = Array.isArray(detailRule.commentReplies)
    ? detailRule.commentReplies
    : [];

  const mainDmContent = detailConfig.mainMessage || detailRule.dmMessage || "-";
  const failedLogsCount = recent14dLogs.filter(
    (l: any) => l.dmStatus === "FAILED" || l.replyCommentStatus === "FAILED"
  ).length;

  const formatDateTimeId = (isoStr?: string | null) => {
    if (!isoStr) return "-";
    try {
      const dt = new Date(isoStr);
      return dt.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="fixed inset-0 z-[145] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141417] border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER MODAL DETAIL */}
        <div className="px-5 sm:px-7 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between gap-4 bg-white dark:bg-[#18181b] shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate">
                {detailRule.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  detailRule.isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-gray-100 dark:bg-white/10 text-gray-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    detailRule.isActive ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
                {detailRule.isActive ? "Berjalan" : "Nonaktif"}
              </span>
              {detailRule.triggerType === "SPECIFIC_POST" && detailRule.specificPostId && (
                <a
                  href={detailPostPermalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
                >
                  Lihat Post <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Analitik performa realtime, status konfigurasi funnel, dan riwayat log komentar 14 hari terakhir.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const targetRule = detailRule;
                setDetailRuleId(null);
                handleOpenEditRuleModal(targetRule);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Otomasi
            </button>
            <button
              type="button"
              onClick={() => setDetailRuleId(null)}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BODY MODAL DETAIL (SCROLLABLE) */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* 1. 7 KPI METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#18181b] p-3.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block whitespace-nowrap">
                Send
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1 block">
                {kpiSend}
              </span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Pesan terkirim</span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#18181b] p-3.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block whitespace-nowrap">
                Read
              </span>
              <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                {kpiRead}
              </span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Direspon / dibaca</span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#18181b] p-3.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block whitespace-nowrap">
                Clicked
              </span>
              <span className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mt-1 block">
                {kpiClicked}
              </span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Total klik link</span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#18181b] p-3.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block whitespace-nowrap">
                New Follower
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {kpiNewFollower}
              </span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Dari Ask Follow</span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#18181b] p-3.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block whitespace-nowrap">
                CTR
              </span>
              <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                {kpiCtr}
              </span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Rasio klik / kirim</span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#18181b] p-3.5">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block whitespace-nowrap">
                Paid
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1 block">
                {kpiPaid}
              </span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Transaksi lunas</span>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-[#18181b] p-3.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block whitespace-nowrap">
                Total Earning
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block truncate">
                Rp {kpiTotalEarning.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">Pendapatan</span>
            </div>
          </div>

          {/* 2. PERFORMA OTOMASI (WAFFLE CHART FUNNEL 4 PARAMETER - LEBAR PENUH) */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Performa Otomasi (Funnel Konversi)
                </h4>
                <p className="text-[11px] text-gray-500">
                  Rasio keberhasilan konversi pesan dari terkirim, dibaca, diklik hingga follower baru
                </p>
              </div>
            </div>

            {/* 4 Kolom Matriks Waffle 10x10 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 pt-2">
              {[
                {
                  id: "send",
                  title: "Pesan Terkirim",
                  description: "Pesan otomasi berhasil dikirim ke DM audiens",
                  percentage:
                    kpiSend > 0
                      ? failedLogsCount > 0
                        ? Math.round((kpiSend / (kpiSend + failedLogsCount)) * 100)
                        : 100
                      : 0,
                  countLabel: `${kpiSend} Pesan`,
                  solidBg: "bg-[#3D5A27]",
                  pastelBg: "bg-[#EAF2E4] dark:bg-[#3D5A27]/25",
                  textColor: "text-[#3D5A27] dark:text-[#84cc16]",
                },
                {
                  id: "read",
                  title: "Direspon / Dibaca",
                  description: "Audiens aktif membuka atau merespon pesan",
                  percentage: kpiSend > 0 ? Math.min(100, Math.round((kpiRead / kpiSend) * 100)) : 0,
                  countLabel: `${kpiRead} Direspon`,
                  solidBg: "bg-[#C91D1D]",
                  pastelBg: "bg-[#FCEAEA] dark:bg-[#C91D1D]/25",
                  textColor: "text-[#C91D1D] dark:text-[#f87171]",
                },
                {
                  id: "clicked",
                  title: "Tautan Diklik (CTR)",
                  description: "Audiens menekan tombol link yang dibagikan",
                  percentage: kpiSend > 0 ? Math.min(100, Math.round((kpiClicked / kpiSend) * 100)) : 0,
                  countLabel: `${kpiClicked} Klik`,
                  solidBg: "bg-[#1E88E5]",
                  pastelBg: "bg-[#E3F2FD] dark:bg-[#1E88E5]/25",
                  textColor: "text-[#1E88E5] dark:text-[#60a5fa]",
                },
                {
                  id: "follower",
                  title: "Follower Baru",
                  description: "Audiens terverifikasi follow dari Ask Follow",
                  percentage: kpiSend > 0 ? Math.min(100, Math.round((kpiNewFollower / kpiSend) * 100)) : 0,
                  countLabel: `${kpiNewFollower} Follower`,
                  solidBg: "bg-[#E69100]",
                  pastelBg: "bg-[#FEF5E1] dark:bg-[#E69100]/25",
                  textColor: "text-[#E69100] dark:text-[#fbbf24]",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex flex-col justify-between"
                >
                  {/* Waffle Grid 10x10 (100 Kotak) */}
                  <div className="grid grid-cols-10 gap-1 w-full max-w-[140px] aspect-square mx-auto mb-4">
                    {Array.from({ length: 100 }).map((_, idx) => {
                      const row = Math.floor(idx / 10);
                      const col = idx % 10;
                      const fromBottom = 9 - row;
                      const blockIndex = fromBottom * 10 + col;
                      const isFilled = blockIndex < item.percentage;

                      return (
                        <div
                          key={idx}
                          className={`w-full aspect-square rounded-[2px] transition-colors duration-200 ${
                            isFilled ? item.solidBg : item.pastelBg
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Keterangan & Angka Persentase */}
                  <div className="space-y-1">
                    <div className={`text-2xl sm:text-3xl font-black ${item.textColor}`}>
                      {item.percentage}%
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                      {item.description}
                    </p>
                    <div className="pt-1.5">
                      <span className="inline-block text-[10px] sm:text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-white/10 px-2 py-0.5 rounded-md border border-gray-200/80 dark:border-white/10 shadow-2xs">
                        {item.countLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. PERFORMA TOMBOL (KLIK) - DISIMPAN DI BAWAH PERFORMA OTOMASI DENGAN LEBAR PENUH */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-purple-500" /> Performa Tombol (Klik)
                </h4>
                <p className="text-[11px] text-gray-500">
                  Statistik &amp; konversi klik seluruh tombol interaksi DM (Pesan Utama, Pembuka, Ask Follow, Quick Reply)
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-extrabold">
                Total {totalTrackedClicks} Klik ({kpiCtr})
              </span>
            </div>

            {/* 2. DIVERGING DOT MATRIX CHART (100% PERSIS GAYA WASHINGTON POST: SETIAP TITIK 1 TOMBOL) */}
            <div className="relative pt-2 pb-1 px-1 sm:px-2 border-b border-gray-100 dark:border-white/5 select-none">
              {/* Header Legend Skala Warna (Persis Kanan Atas Gambar) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Winners and Losers: Sebaran Performa Tombol Harian
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Setiap titik mewakili 1 tombol interaksi. Diarsir berdasarkan rasio CTR konversi (atas) &amp; dropoff (bawah).
                  </p>
                </div>

                {/* Legend Heatmap Warna */}
                <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                    <span className="mr-1 text-[#DC2626]">◄ DROPOFF</span>
                    <div className="w-3.5 h-3 rounded-[2px] bg-[#DC2626]" title="Dropoff >75%" />
                    <div className="w-3.5 h-3 rounded-[2px] bg-[#EA580C]" title="Dropoff 50-75%" />
                    <div className="w-3.5 h-3 rounded-[2px] bg-[#FBBF24]" title="Dropoff 25-50%" />
                    <div className="w-3.5 h-3 rounded-[2px] bg-[#FEF08A]" title="Dropoff <25%" />
                    <div className="w-1.5 h-3 mx-0.5 border-l border-dashed border-gray-300 dark:border-white/20" title="0% Baseline" />
                    <div className="w-3.5 h-3 rounded-[2px] bg-[#86EFAC]" title="CTR <10%" />
                    <div className="w-3.5 h-3 rounded-[2px] bg-[#22C55E]" title="CTR 10-20%" />
                    <div className="w-3.5 h-3 rounded-[2px] bg-[#16A34A]" title="CTR 20-35%" />
                    <div className="w-3.5 h-3 rounded-[2px] bg-[#0284C7]" title="CTR >35%" />
                    <span className="ml-1 text-[#0284C7]">CTR TINGGI ►</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">1 Titik = 1 Tombol Interaksi</span>
                </div>
              </div>

              {/* Area Canvas Matrix Titik Bersekat Sumbu 0 */}
              <div className="flex gap-1.5 sm:gap-3 items-stretch">
                {/* Y-Axis Label Kiri (Persis Gambar: SECTORS RISING > / < SECTORS FALLING) */}
                <div className="flex flex-col justify-between text-[9px] font-bold text-gray-400 dark:text-gray-500 py-1 w-10 sm:w-16 shrink-0 text-right pr-1 sm:pr-2 select-none">
                  <div className="flex flex-col items-end justify-start h-[120px] pb-1">
                    <span className="text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">▲ KLIK</span>
                    <span className="text-gray-400 mt-auto">+10</span>
                  </div>
                  <div className="py-0.5 font-black text-gray-700 dark:text-gray-200 text-[10px]">
                    0 ──
                  </div>
                  <div className="flex flex-col items-end justify-between h-[90px] pt-1">
                    <span className="text-gray-400">-5</span>
                    <span className="text-[8px] sm:text-[9px] text-amber-600 dark:text-amber-400 uppercase tracking-tight">▼ DROPOFF</span>
                  </div>
                  <div className="pt-2 text-[9px] text-gray-400">
                    Unch.
                  </div>
                </div>

                {/* 14 Kolom Tanggal Flex */}
                <div className="flex-1 flex justify-between items-stretch gap-1 sm:gap-2">
                  {dotMatrixDays.map((day) => (
                    <div key={day.dateKey} className="flex-1 min-w-0 flex flex-col items-center">
                      {/* 1. Tumpukan Positif (Di atas Garis 0) */}
                      <div className="h-[120px] w-full flex flex-col-reverse items-center justify-start gap-1 pb-1">
                        {day.positiveDots.length === 0 ? (
                          <div className="w-2.5 sm:w-3 aspect-square rounded-full bg-gray-100 dark:bg-white/5 opacity-40" />
                        ) : (
                          day.positiveDots.map((dot: any) => (
                            <button
                              key={dot.id}
                              type="button"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredDot({
                                  ...dot,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredDot(null)}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dot.color} transition-transform hover:scale-135 cursor-pointer relative shadow-2xs`}
                            >
                              {dot.isHighlight && (
                                <span className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-gray-900 dark:bg-black" />
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* 2. Garis Horizontal Baseline 0 */}
                      <div className="w-full h-[2px] bg-gray-300 dark:bg-white/20" />

                      {/* 3. Tumpukan Negatif (Di bawah Garis 0) */}
                      <div className="h-[90px] w-full flex flex-col items-center justify-start gap-1 pt-1">
                        {day.negativeDots.length === 0 ? (
                          <div className="w-2.5 sm:w-3 aspect-square rounded-full bg-gray-100 dark:bg-white/5 opacity-40" />
                        ) : (
                          day.negativeDots.map((dot: any) => (
                            <button
                              key={dot.id}
                              type="button"
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredDot({
                                  ...dot,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredDot(null)}
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dot.color} transition-transform hover:scale-135 cursor-pointer shadow-2xs`}
                            />
                          ))
                        )}
                      </div>

                      {/* 4. Baris Unchanged (Unch.) di paling bawah */}
                      <div className="pt-2 pb-1">
                        <div
                          className={`w-2 h-2 rounded-full transition-colors ${
                            !day.hasActivity
                              ? "bg-gray-400 dark:bg-gray-500"
                              : "bg-gray-200 dark:bg-white/10"
                          }`}
                          title={!day.hasActivity ? "Tidak ada pesan terkirim (Unchanged)" : "Ada pesan terkirim"}
                        />
                      </div>

                      {/* 5. Label Tanggal X-Axis */}
                      <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 truncate max-w-full text-center mt-1">
                        {day.label.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tooltip Mengambang (Persis Kotak Gelap Construction di Gambar) */}
              {hoveredDot && (
                <div
                  className="fixed z-[200] pointer-events-none bg-gray-900/95 dark:bg-black/95 text-white px-3 py-2 rounded-xl shadow-2xl border border-white/10 text-xs backdrop-blur-md transition-all duration-75 animate-in fade-in zoom-in-95"
                  style={{
                    left: `${hoveredDot.x}px`,
                    top: `${hoveredDot.y - 12}px`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                      style={{ backgroundColor: hoveredDot.colorHex }}
                    />
                    <span className="truncate max-w-[210px]">{hoveredDot.label}</span>
                  </div>
                  <div className="text-[11px] text-gray-300 flex items-center justify-between gap-3 mt-0.5">
                    <span className="font-medium text-gray-400">{hoveredDot.dateLabel}</span>
                    <span className={hoveredDot.isPositive ? "text-emerald-400 font-extrabold" : "text-amber-400 font-extrabold"}>
                      {hoveredDot.isPositive
                        ? `+${hoveredDot.ctr}% CTR (${hoveredDot.clicks} Klik)`
                        : `${hoveredDot.dropoffCount} Dropoff`}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 border-t border-white/10 pt-1 flex items-center justify-between gap-2">
                    <span>Modul: {hoveredDot.module}</span>
                    <span className="italic">{hoveredDot.action}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rincian Seluruh Tombol Interaksi & Tautan DM */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-orange-500" />
                  Rincian Performa per Tombol ({resolvedButtons.length})
                </span>
                <span className="text-[11px] text-gray-400">
                  Melacak klik tautan web, konfirmasi pembuka, verifikasi follow, &amp; respon tombol DM
                </span>
              </div>

              {resolvedButtons.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-gray-400 text-xs">
                  Tidak ada tombol atau quick reply yang dikonfigurasi pada aturan ini (Pesan Teks Biasa).
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {resolvedButtons.map((btn) => (
                    <div
                      key={btn.id}
                      className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] hover:bg-gray-100/70 dark:hover:bg-white/[0.04] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Sisi Kiri: Badge Modul, Label Tombol & Aksi/Target */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${btn.badgeColor}`}>
                            {btn.module}
                          </span>
                          <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                            {btn.label}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400 bg-white dark:bg-white/5 px-1.5 py-0.5 rounded border border-gray-200/60 dark:border-white/10">
                            {btn.action}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {btn.type === "web_url" && /^https?:\/\//i.test(btn.destination) ? (
                            <a
                              href={btn.destination}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 hover:underline flex items-center gap-1 truncate"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{btn.destination}</span>
                            </a>
                          ) : (
                            <span className="truncate">{btn.destination}</span>
                          )}
                        </div>
                      </div>

                      {/* Sisi Kanan: Metrik Klik, CTR, & Progress Bar */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-orange-600 dark:text-orange-400">
                            {btn.clicks} Klik
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                            {btn.ctr} CTR
                          </span>
                        </div>
                        <div className="w-24 sm:w-28 bg-gray-200 dark:bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden" title={`${btn.share}% dari total klik`}>
                          <div
                            className="bg-gradient-to-r from-purple-500 to-orange-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(btn.clicks > 0 ? 4 : 0, btn.share))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. KONFIGURASI & KONTEN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Konfigurasi Status (6 Fitur) */}
            <div className="lg:col-span-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-5 space-y-3.5">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Konfigurasi Otomasi
                </h4>
                <p className="text-[11px] text-gray-500">
                  Status modul fitur yang diterapkan pada aturan ini
                </p>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {configItems.map((item) => (
                  <div
                    key={item.label}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                        item.active
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-gray-100 dark:bg-white/5 text-gray-400"
                      }`}
                    >
                      {item.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </>
                      ) : (
                        "Nonaktif"
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Konten Otomasi */}
            <div className="lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Konten Otomasi
                </h4>
                <p className="text-[11px] text-gray-500">
                  Detail kata kunci pemicu, variasi balasan komentar, dan isi pesan DM utama
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Kata Kunci Pemicu
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {detailKeywords.length === 0 ? (
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-[11px]">
                        Semua Komentar (Semua Kata)
                      </span>
                    ) : (
                      detailKeywords.map((kw: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 font-bold text-gray-800 dark:text-gray-200"
                        >
                          {kw}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Variasi Balasan Komentar ({detailCommentReplies.length})
                  </span>
                  {detailCommentReplies.length === 0 ? (
                    <span className="text-gray-400 italic">
                      Balas komentar publik dinonaktifkan
                    </span>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {detailCommentReplies.map((rep: string, i: number) => (
                        <li key={i} className="truncate">
                          {rep}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Pesan DM Utama & Tautan
                  </span>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                    {mainDmContent}
                  </p>
                  {detailRule.buttonUrl && (
                    <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-white/10 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        [{detailRule.buttonText || "Buka Tautan"}]
                      </span>
                      <a
                        href={detailRule.buttonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[260px]"
                      >
                        {detailRule.buttonUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. LOG KOMENTAR (14 HARI TERAKHIR) + TOMBOL COBA LAGI & REWIND */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" /> Log Komentar
                </h4>
                <p className="text-xs text-gray-500">
                  Log ini menampilkan komentar dari 14 hari terakhir yang memicu otomatisasi
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isRetryingFailed || failedLogsCount === 0}
                  onClick={async () => {
                    try {
                      setIsRetryingFailed(true);
                      showToast("info", "Mencoba ulang semua pengiriman yang gagal...");
                      const res = await retryFailedAutomationLogsAction(detailRule.id);
                      if (res.success) {
                        showToast(
                          "success",
                          res.message || "Berhasil mencoba ulang log yang gagal!"
                        );
                        await mutateData();
                      } else {
                        showToast(
                          "error",
                          (res as any).error || "Gagal mencoba ulang log."
                        );
                      }
                    } catch (err: any) {
                      showToast(
                        "error",
                        err.message || "Terjadi kesalahan saat mencoba ulang."
                      );
                    } finally {
                      setIsRetryingFailed(false);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 text-xs font-bold text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isRetryingFailed ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                  )}
                  <span>
                    Coba Lagi Semua yang Gagal{" "}
                    {failedLogsCount > 0 ? `(${failedLogsCount})` : ""}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isRewindingComments}
                  onClick={async () => {
                    try {
                      setIsRewindingComments(true);
                      showToast(
                        "info",
                        "Memindai komentar terlewat dari 14 hari terakhir di Instagram..."
                      );
                      const res = await rewindAutomationCommentsAction(detailRule.id);
                      if (res.success) {
                        showToast("success", res.message || "Rewind komentar selesai!");
                        await mutateData();
                      } else {
                        showToast(
                          "error",
                          (res as any).error || "Gagal melakukan Rewind Komentar."
                        );
                      }
                    } catch (err: any) {
                      showToast(
                        "error",
                        err.message || "Terjadi kesalahan saat Rewind Komentar."
                      );
                    } finally {
                      setIsRewindingComments(false);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  {isRewindingComments ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  <span>Rewind Komentar</span>
                </button>
              </div>
            </div>

            {/* Tabel Log 14 Hari Terakhir */}
            <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Komentar</th>
                    <th className="py-3 px-4">Pesan</th>
                    <th className="py-3 px-4">Balasan Komentar</th>
                    <th className="py-3 px-4">Dikomentari pada</th>
                    <th className="py-3 px-4">Diproses pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {recent14dLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-400">
                        Belum ada komentar dalam 14 hari terakhir untuk aturan otomasi ini.
                      </td>
                    </tr>
                  ) : (
                    recent14dLogs.map((log: any) => {
                      const meta = parseClientLogMeta(log.errorMessage);
                      const isDmSent = log.dmStatus === "SENT";
                      const isReplySent = log.replyCommentStatus === "SENT";
                      const commentedAtStr = formatDateTimeId(
                        meta.commentedAt || log.createdAt
                      );
                      const processedAtStr = formatDateTimeId(log.createdAt);

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-gray-900 dark:text-white">
                              @{log.fromUsername ? log.fromUsername.replace(/^@/, "") : (log.commenterUsername || "user")}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300 mt-0.5">
                              "{log.commentText || "-"}"
                            </div>
                            {meta.contact && (
                              <span className="mt-1 inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                                Kontak: {meta.contact}
                              </span>
                            )}
                            {meta.clicked && (
                              <span className="mt-1 ml-1 inline-block px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-semibold">
                                Klik Link ({meta.clickCount || 1}x)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isDmSent
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {isDmSent ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" /> Terkirim
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" /> Tidak
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isReplySent
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {isReplySent ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" /> Terkirim
                                </>
                              ) : (
                                "Tidak"
                              )}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {commentedAtStr}
                          </td>

                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {processedAtStr}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
