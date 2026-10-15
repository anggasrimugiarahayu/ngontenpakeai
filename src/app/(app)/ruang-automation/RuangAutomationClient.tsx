"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  Bot,
  Zap,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  Clock,
  Send,
  MessageSquare,
  ChevronRight,
  Info,
  Check,
  X,
  Loader2,
  Link2,
  Unlink,
  KeyRound,
  Lock,
  Filter,
  MoreVertical,
  Pause,
  Play,
  Copy,
  Pencil,
  Heart,
  Bookmark,
  ChevronDown,
  Wifi,
  BatteryMedium,
  MessageCircle,
  Home,
  Search,
  Film,
  TrendingUp,
  HelpCircle,
  Phone,
  Video,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Camera,
  Mic
} from "lucide-react";
import {
  getInstagramAutomationDataAction,
  createInstagramAgentAction,
  updateInstagramAgentAction,
  deleteInstagramAgentAction,
  saveAutomationRuleAction,
  toggleAutomationRuleAction,
  deleteAutomationRuleAction,
  duplicateAutomationRuleAction,
  connectInstagramAccountAction,
  disconnectInstagramAccountAction,
  getInstagramFeedMediaAction
} from "@/app/actions/instagramAutomation";

// Helper Spintax Randomizer
function parseSpintax(text: string): string {
  if (!text) return "";
  return text.replace(/\{([^{}]+)\}/g, (_, choices) => {
    const parts = choices.split("|");
    return parts[Math.floor(Math.random() * parts.length)];
  });
}

// Helper Variable Resolver for Instagram DM & Comment Live Preview
function resolvePreviewVariables(text: string): string {
  if (!text) return "";
  let resolved = text
    .replace(/@\{username\}/g, "@ruangcreativemuslim")
    .replace(/\{username\}/g, "@ruangcreativemuslim")
    .replace(/\[Nama Pengguna\]/g, "@ruangcreativemuslim")
    .replace(/\{first_name\}/g, "Kak Harits")
    .replace(/\[Nama Depan\]/g, "Kak Harits")
    .replace(/\{last_name\}/g, "Creative")
    .replace(/\[Nama Belakang\]/g, "Creative")
    .replace(/\{full_name\}/g, "Kak Harits Creative")
    .replace(/\[Nama Lengkap\]/g, "Kak Harits Creative");
  try {
    resolved = parseSpintax(resolved);
  } catch (e) {
    // ignore
  }
  return resolved;
}

// Sample Instagram Posts for feed selection & preview matching uploaded screenshot
const SAMPLE_INSTAGRAM_POSTS = [
  {
    id: "post_1",
    title: "Kalau besok saya nggak punya penghasilan tetap lagi...",
    image: "/images/instagram/post-1-full.png",
    thumb: "/images/instagram/thumb-1-clean.png",
    caption: "Kehilangan penghasilan tetap bukan akhir segalanya kalau kamu punya sistem yang...",
    likes: 127,
    comments: 124,
    date: "14 Oct, 2026",
  },
  {
    id: "post_2",
    title: "Pak kalo kamu serius ngejalaninnya..",
    image: "/images/instagram/thumb-2-clean.png",
    thumb: "/images/instagram/thumb-2-clean.png",
    caption: "1 dari 10 niche ini mulai bisa gantiin gaji kantormu dalam 6 bulan ke depan. Luangkan 1 menit buat baca ini.",
    likes: 98,
    comments: 86,
    date: "12 Oct, 2026",
  },
  {
    id: "post_3",
    title: "Gini cara bapak-bapak usia 38+...",
    image: "/images/instagram/thumb-3-clean.png",
    thumb: "/images/instagram/thumb-3-clean.png",
    caption: "Ngonten tanpa nunjukin wajah, tapi bisa ngasilin 2-3x lipat gaji UMR dalam 30 hari. Aku bocorin di slide ini...",
    likes: 215,
    comments: 142,
    date: "10 Oct, 2026",
  },
  {
    id: "post_4",
    title: "Jangan resign...",
    image: "/images/instagram/thumb-4-clean.png",
    thumb: "/images/instagram/thumb-4-clean.png",
    caption: "Bikin IG baru, jangan kasih tahu orang lain, dan kejar 2 digit pakai cara ini.",
    likes: 310,
    comments: 198,
    date: "08 Oct, 2026",
  },
];

// Custom SVGs for platforms
function InstagramIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function RuangAutomationClient({
  initialData,
  isLoggedIn = true,
  isPro,
  isAdmin,
  initialAgentId = null,
}: {
  initialData: any;
  isLoggedIn?: boolean;
  isPro: boolean;
  isAdmin: boolean;
  initialAgentId?: string | null;
}) {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<"instagram" | null>(
    initialData?.account?.isActive || (initialData?.agents && initialData.agents.length > 0) ? "instagram" : null
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(() => {
    if (initialAgentId) return initialAgentId;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("agentId") || null;
    }
    return null;
  });
  const [activeIgTab, setActiveIgTab] = useState<"koneksi" | "komentar" | "dashboard">("koneksi");
  const [userHasExitedToHub, setUserHasExitedToHub] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Read initial agentId from URL query on mount (fallback sync)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const agentIdFromUrl = params.get("agentId");
    if (agentIdFromUrl && agentIdFromUrl !== selectedAgentId) {
      setSelectedAgentId(agentIdFromUrl);
      setActiveIgTab("koneksi");
    }
  }, [selectedAgentId]);

  const shouldFetch = isLoggedIn && (isPro || isAdmin);

  // SWR Caching & Revalidating (Stale-While-Revalidate / STA pattern) with multi-agent support
  const { data: swrData, isLoading, mutate: mutateData } = useSWR(
    shouldFetch ? ["instagramAutomation", selectedAgentId || "all"] : null,
    ([, agentId]) => getInstagramAutomationDataAction(agentId === "all" ? undefined : agentId),
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 5000,
    }
  );

  const data = swrData || initialData || {
    agents: [],
    account: null,
    rules: [],
    stats: { totalComments: 0, totalDms: 0 },
    logs: [],
  };

  const agents: any[] = data.agents || [];
  const account = data.account;
  const currentAgent = agents.find((a: any) => a.id === selectedAgentId) || (account ? {
    id: account.id,
    name: account.name,
    username: account.username,
    profilePicUrl: account.profilePicUrl,
    isLinked: account.isLinked,
    isActive: account.isActive,
  } : null);

  // If user has not exited to hub and platform is null, default to Instagram platform
  useEffect(() => {
    if ((data?.account?.isActive || (data?.agents && data.agents.length > 0)) && !userHasExitedToHub && selectedPlatform === null) {
      setSelectedPlatform("instagram");
    }
  }, [data?.account?.isActive, data?.agents, userHasExitedToHub, selectedPlatform]);

  // Synchronize selectedPlatform with URL and dispatch automation-platform-change for ClientLayout
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedPlatform === "instagram") {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get("platform") !== "instagram") {
        currentUrl.searchParams.set("platform", "instagram");
        window.history.replaceState({}, "", currentUrl.toString());
      }
      window.dispatchEvent(new CustomEvent("automation-platform-change", { detail: "instagram" }));
    } else if (selectedPlatform === null) {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has("platform")) {
        currentUrl.searchParams.delete("platform");
        window.history.replaceState({}, "", currentUrl.toString());
      }
      window.dispatchEvent(new CustomEvent("automation-platform-change", { detail: null }));
    }
  }, [selectedPlatform]);

  // Listen to platform changes dispatched from ClientLayout (e.g. user clicked Back or sub-tool)
  useEffect(() => {
    const handlePlatformChange = (e: any) => {
      const plat = e.detail;
      if (!plat) {
        setUserHasExitedToHub(true);
        setSelectedPlatform(null);
      } else if (plat === "instagram") {
        setUserHasExitedToHub(false);
        setSelectedPlatform("instagram");
      }
    };
    window.addEventListener("automation-platform-change", handlePlatformChange);
    return () => window.removeEventListener("automation-platform-change", handlePlatformChange);
  }, []);

  // Notification Toast state
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Instagram Avatar State
  const [avatarError, setAvatarError] = useState(false);

  // Listen to OAuth Callback query parameters & Platform query
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const username = params.get("username");
    const errorParam = params.get("error");
    const platformParam = params.get("platform");

    // Auto-open Instagram if coming back from login, direct link, or OAuth connect
    if (platformParam === "instagram" || connected === "true" || errorParam) {
      if (isLoggedIn && (isPro || isAdmin)) {
        setUserHasExitedToHub(false);
        setSelectedPlatform("instagram");
      }
    }

    const agentIdParam = params.get("agentId");
    if (connected === "true") {
      setUserHasExitedToHub(false);
      setSelectedPlatform("instagram");
      if (agentIdParam) {
        setSelectedAgentId(agentIdParam);
      }
      setActiveIgTab("koneksi");
      showToast(
        "success",
        username
          ? `Akun @${username} berhasil terhubung via Meta!`
          : "Akun Instagram berhasil terhubung!"
      );
      mutateData();
      const cleanUrl = agentIdParam
        ? `/ruang-automation?platform=instagram&agentId=${encodeURIComponent(agentIdParam)}`
        : "/ruang-automation?platform=instagram";
      window.history.replaceState({}, "", cleanUrl);
    } else if (errorParam) {
      setUserHasExitedToHub(false);
      setSelectedPlatform("instagram");
      if (errorParam === "cancelled") {
        showToast("info", "Proses login Instagram dibatalkan.");
      } else if (errorParam === "no_business_account") {
        showToast(
          "error",
          "Akun Instagram belum berupa Akun Profesional (Kreator/Bisnis) atau belum ditautkan ke Facebook Page."
        );
      } else if (errorParam === "missing_credentials") {
        showToast("error", "Kredensial Meta App belum terpasang di sistem.");
      } else {
        showToast("error", decodeURIComponent(errorParam));
      }
      window.history.replaceState({}, "", "/ruang-automation?platform=instagram");
    }
  }, [mutateData, isLoggedIn, isPro, isAdmin]);

  // Handle click on Instagram Automation Card
  const handleSelectInstagram = () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/ruang-automation?platform=instagram");
      return;
    }
    if (!isPro && !isAdmin) {
      router.push("/?pricing=true");
      return;
    }
    setUserHasExitedToHub(false);
    setSelectedPlatform("instagram");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/ruang-automation?platform=instagram");
      window.dispatchEvent(new CustomEvent("automation-platform-change", { detail: "instagram" }));
      window.dispatchEvent(new Event("app-shallow-navigate"));
    }
  };

  // Redirect to official Meta OAuth login
  const handleStartMetaOAuth = (agentIdToConnect?: any) => {
    const validId =
      typeof agentIdToConnect === "string" && agentIdToConnect.trim() && agentIdToConnect !== "[object Object]"
        ? agentIdToConnect.trim()
        : selectedAgentId || account?.id;

    if (validId) {
      window.location.href = `/api/auth/instagram/login?agentId=${encodeURIComponent(validId)}`;
    } else {
      window.location.href = "/api/auth/instagram/login";
    }
  };

  // Custom Confirmation Modal state (replacing native window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Agent Modals & Menus State
  const [isCreateAgentModalOpen, setIsCreateAgentModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [isSubmittingAgent, setIsSubmittingAgent] = useState(false);
  const [activeDropdownAgentId, setActiveDropdownAgentId] = useState<string | null>(null);

  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<{ id: string; name: string } | null>(null);
  const [editAgentName, setEditAgentName] = useState("");

  // Create New Agent
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) {
      showToast("error", "Nama agen wajib diisi");
      return;
    }

    setIsSubmittingAgent(true);
    const optimisticAgent = {
      id: `temp-${Date.now()}`,
      name: newAgentName.trim(),
      username: "",
      profilePicUrl: null,
      isActive: true,
      isLinked: false,
      createdAt: new Date().toISOString(),
      rulesCount: 0,
      logsCount: 0,
    };

    mutateData(
      (prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          agents: [optimisticAgent, ...(prev.agents || [])],
        };
      },
      false
    );

    try {
      const res = await createInstagramAgentAction({ name: newAgentName.trim() });
      if (res.success && res.agent) {
        showToast("success", `Agen "${newAgentName.trim()}" berhasil dibuat!`);
        setIsCreateAgentModalOpen(false);
        setNewAgentName("");
        await mutateData();
        setSelectedAgentId(res.agent.id);
        setActiveIgTab("koneksi");
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("agentId", res.agent.id);
        window.history.pushState({}, "", newUrl.toString());
      } else {
        showToast("error", res.error || "Gagal membuat agen");
        await mutateData();
      }
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan server");
      await mutateData();
    } finally {
      setIsSubmittingAgent(false);
    }
  };

  // Open Edit Agent Modal
  const handleOpenEditAgentModal = (agent: any) => {
    setEditingAgent({ id: agent.id, name: agent.name });
    setEditAgentName(agent.name);
    setIsEditAgentModalOpen(true);
  };

  // Save Edit Agent Name
  const handleSaveEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent || !editAgentName.trim()) return;

    setIsSubmittingAgent(true);
    mutateData(
      (prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          agents: (prev.agents || []).map((a: any) =>
            a.id === editingAgent.id ? { ...a, name: editAgentName.trim() } : a
          ),
          account: prev.account?.id === editingAgent.id ? { ...prev.account, name: editAgentName.trim() } : prev.account,
        };
      },
      false
    );

    try {
      const res = await updateInstagramAgentAction({ agentId: editingAgent.id, name: editAgentName.trim() });
      if (res.success) {
        showToast("success", "Nama agen berhasil diperbarui!");
        setIsEditAgentModalOpen(false);
        await mutateData();
      } else {
        showToast("error", res.error || "Gagal memperbarui nama agen");
        await mutateData();
      }
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan server");
      await mutateData();
    } finally {
      setIsSubmittingAgent(false);
    }
  };

  // Delete Agent
  const handleDeleteAgent = (agentId: string, agentName: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Hapus Agen "${agentName}"?`,
      description: "Seluruh aturan automasi dan riwayat log milik agen ini akan dihapus secara permanen dari sistem.",
      confirmText: "Ya, Hapus Agen",
      onConfirm: async () => {
        setConfirmModal(null);
        mutateData(
          (prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              agents: (prev.agents || []).filter((a: any) => a.id !== agentId),
            };
          },
          false
        );

        if (selectedAgentId === agentId) {
          setSelectedAgentId(null);
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("agentId");
          window.history.pushState({}, "", newUrl.toString());
        }

        try {
          const res = await deleteInstagramAgentAction(agentId);
          if (res.success) {
            showToast("success", `Agen "${agentName}" berhasil dihapus`);
            await mutateData();
          } else {
            showToast("error", res.error || "Gagal menghapus agen");
            await mutateData();
          }
        } catch (err: any) {
          showToast("error", err.message || "Terjadi kesalahan server");
          await mutateData();
        }
      },
    });
  };

  // Disconnect Agent from Instagram
  const handleDisconnectAgent = (agentId: string, agentName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Putuskan Koneksi Instagram?",
      description: `Putuskan koneksi akun Instagram untuk agen "${agentName}"? Automasi komentar dan DM akan dinonaktifkan sementara.`,
      confirmText: "Ya, Putuskan Koneksi",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await disconnectInstagramAccountAction(agentId);
          if (res.success) {
            showToast("success", `Koneksi Instagram agen "${agentName}" berhasil diputuskan`);
            await mutateData();
          } else {
            showToast("error", res.error || "Gagal memutuskan koneksi");
          }
        } catch (err: any) {
          showToast("error", err.message || "Terjadi kesalahan server");
        }
      },
    });
  };

  // Tab filter: Post Automations, Story Automations, Live Automations, DM Automations
  const [automationTab, setAutomationTab] = useState<"POST" | "STORY" | "LIVE" | "DM">("POST");
  const [activeDropdownRuleId, setActiveDropdownRuleId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Agent filter state (Level 2: Daftar Agen)
  const [agentFilterStatus, setAgentFilterStatus] = useState<"ALL" | "LINKED" | "UNLINKED">("ALL");
  const [isAgentFilterOpen, setIsAgentFilterOpen] = useState(false);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent: any) => {
      if (agentFilterStatus === "LINKED") return agent.isLinked;
      if (agentFilterStatus === "UNLINKED") return !agent.isLinked;
      return true;
    });
  }, [agents, agentFilterStatus]);

  // Sub-Dashboard Tab definitions (matching Pengaturan style: Koneksi Akun, Komentar IG ke DM, Dashboard)
  const igTabs = [
    { id: "koneksi", label: "Koneksi Akun" },
    { id: "komentar", label: "Komentar IG ke DM" },
    { id: "dashboard", label: "Dashboard" },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".rule-dropdown-menu")) {
        setActiveDropdownRuleId(null);
      }
      if (!target.closest(".agent-dropdown-menu")) {
        setActiveDropdownAgentId(null);
      }
      if (!target.closest(".filter-dropdown-container")) {
        setIsFilterOpen(false);
      }
      if (!target.closest(".agent-filter-dropdown-container")) {
        setIsAgentFilterOpen(false);
      }
      if (!target.closest(".target-dropdown-container")) {
        setIsTargetDropdownOpen(false);
      }
      if (!target.closest(".msg-type-dropdown-container")) {
        setIsMsgTypeDropdownOpen(false);
      }
      if (!target.closest(".keyword-rule-dropdown-container")) {
        setIsKeywordRuleDropdownOpen(false);
      }
      if (!target.closest(".button-dropdown-container")) {
        setOpenButtonDropdown(null);
      }
      if (!target.closest(".comment-limit-dropdown-container")) {
        setIsCommentLimitDropdownOpen(false);
      }
      if (!target.closest(".welcome-msg-type-dropdown-container")) {
        setIsWelcomeMsgTypeDropdownOpen(false);
      }
      if (!target.closest(".ask-follow-msg-type-dropdown-container")) {
        setIsAskForFollowMsgTypeDropdownOpen(false);
      }
      if (!target.closest(".follow-up-delay-dropdown-container")) {
        setIsFollowUpDelayDropdownOpen(false);
      }
      if (!target.closest(".follow-up-condition-dropdown-container")) {
        setIsFollowUpConditionDropdownOpen(false);
      }
      if (!target.closest(".follow-up-msg-type-dropdown-container")) {
        setIsFollowUpMsgTypeDropdownOpen(false);
      }
      if (!target.closest(".ask-contact-type-dropdown-container")) {
        setIsAskContactTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rule Modal state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [isMsgTypeDropdownOpen, setIsMsgTypeDropdownOpen] = useState(false);
  const [isKeywordRuleDropdownOpen, setIsKeywordRuleDropdownOpen] = useState(false);
  const [isCommentLimitDropdownOpen, setIsCommentLimitDropdownOpen] = useState(false);
  const [isWelcomeMsgTypeDropdownOpen, setIsWelcomeMsgTypeDropdownOpen] = useState(false);
  const [isAskForFollowMsgTypeDropdownOpen, setIsAskForFollowMsgTypeDropdownOpen] = useState(false);
  const [isFollowUpDelayDropdownOpen, setIsFollowUpDelayDropdownOpen] = useState(false);
  const [isFollowUpConditionDropdownOpen, setIsFollowUpConditionDropdownOpen] = useState(false);
  const [isFollowUpMsgTypeDropdownOpen, setIsFollowUpMsgTypeDropdownOpen] = useState(false);
  const [isAskContactTypeDropdownOpen, setIsAskContactTypeDropdownOpen] = useState(false);
  const [simulatedFollowStep, setSimulatedFollowStep] = useState<"GATE" | "RETRY" | "VERIFIED">("GATE");
  const [openButtonDropdown, setOpenButtonDropdown] = useState<{ id: string; type: "label" | "action" } | null>(null);
  const [simulatedButtonId, setSimulatedButtonId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(SAMPLE_INSTAGRAM_POSTS[0]);
  const [showAllPostsModal, setShowAllPostsModal] = useState(false);
  const [isKeywordRuleOpen, setIsKeywordRuleOpen] = useState(false);

  const [activePreviewTab, setActivePreviewTab] = useState<"COMMENT" | "DM">("COMMENT");

  const [ruleFormData, setRuleFormData] = useState({
    name: "",
    targetOtomasi: "Postingan Tertentu",
    postType: "SPECIFIC",
    postId: SAMPLE_INSTAGRAM_POSTS[0].id,
    triggerCommentType: "KEYWORDS" as "KEYWORDS" | "ALL",
    keywords: "mau",
    keywordRule: "Contains" as "Contains" | "Match" | "Starts with",
    messageType: "BUTTON_TEMPLATE" as "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL",
    dmMessage: "Halo {first_name}! Terima kasih sudah tertarik. Ini link akses yang kamu minta:\nhttps://ruangcreativemuslim.com",
    buttons: [
      {
        id: "btn_1",
        labelType: "Kustom" as "Klik Disini" | "Kustom",
        label: "Button 1",
        action: "Buka Website" as "Buka Website" | "Kirim Teks" | "",
        url: "https://ruangcreativemuslim.com",
        text: "Terima kasih sudah tertarik! Ini info detail balasan dari kami.",
      }
    ],
    carouselSlides: [
      {
        id: "slide_1",
        image: "",
        title: "",
        subtitle: "",
        buttons: [
          {
            id: "slide_btn_1",
            labelType: "Kustom" as "Klik Disini" | "Kustom",
            label: "Button 1",
            action: "Buka Website" as "Buka Website" | "Kirim Teks" | "",
            url: "https://ruangcreativemuslim.com"
          }
        ]
      }
    ],
    quickReplies: [] as { id: string; text: string }[],
    featureFollowUp: false,
    followUpDelay: "1 Jam" as "15 Menit" | "1 Jam" | "3 Jam" | "6 Jam" | "12 Jam" | "23 Jam",
    followUpCondition: "Hanya yang Belum Klik Link" as "Semua Penerima" | "Hanya yang Belum Klik Link",
    followUpMessageType: "Template Tombol" as "Template Tombol" | "Teks Biasa",
    followUpMessage: "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala atau mau tanya-tanya bilang ya 😉",
    followUpButtonLabel: "Buka Link Sekarang",
    featureReplyComment: false,
    commentReplyLimit: "Tak Terbatas" as "Tak Terbatas" | "1 Kali per Pengguna" | "2 Kali per Pengguna",
    commentReplyVariations: [
      "Pesan terkirim! 🚀",
      "Halo @{username}, cek DMnya ya! 📬",
      "{kak|bro|sis}, linknya udah dikirim ke DM ya! 💌",
    ],
    replyCommentTemplates: "Pesan terkirim! 🚀",
    featureWelcomeMessage: false,
    welcomeMessageType: "Template Tombol" as "Template Tombol" | "Teks Biasa",
    welcomeMessage: "Akses nya udah kita buatin nihh!!\n\nMau? ✨",
    welcomeButtonLabel: "Ya, Saya Mau!",
    featureAskForFollow: false,
    askForFollowMessageType: "Template Tombol" as "Template Tombol" | "Teks Biasa",
    askForFollowMessage: "Btw, kayaknya kamu belum follow akun ini nih, sistemnya kita cuma bisa ngasih khusus untuk followers aja.\n\nKalo mau, follow dulu ya dan klik \"Udah Follow\" nanti dikirimin aksesnya",
    askForFollowButtonLabel: "Udah follow 🙌",
    askForFollowHasRetry: false,
    askForFollowRetryMessage: "Ih kayaknya masih belum follow beneran nih 😅\n\nCoba follow dulu ya ke profile, kalo udah nanti klik \"Udah Follow\"",
    askForFollowRetryButtonLabel: "Udah follow 🙌",
    featureAskForContact: false,
    askContactType: "Email Saja" as "Email Saja" | "Nomor WhatsApp Saja" | "Email & WhatsApp",
    askContactMessage: "Sip! Biar aksesnya langsung terkirim dan tersimpan aman di inbox kamu, boleh ketik Email aktif kamu di bawah ini ya 👇",
    askContactInvalidMessage: "Waduh, format emailnya kayaknya belum pas nih kak 😅 Coba cek dan ketik ulang email aktif kamu ya 🙏",
    featureLinkTracking: true,
    isActive: true,
  });

  // Real Instagram Feed Media managed by SWR with Stale-While-Revalidate (STA) pattern
  const {
    data: feedData,
    isLoading: isLoadingFeed,
    isValidating: isValidatingFeed,
    mutate: mutateFeed,
  } = useSWR(
    selectedAgentId && data?.account?.isActive ? ["instagramFeedMedia", selectedAgentId] : null,
    ([, agentId]) => getInstagramFeedMediaAction(30, agentId),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 menit cache STA di memori
    }
  );

  const feedPosts: any[] = (feedData?.success && Array.isArray(feedData.posts) && feedData.posts.length > 0)
    ? feedData.posts
    : SAMPLE_INSTAGRAM_POSTS;
  const isFeedLive = !!feedData?.isLive;
  const feedError = feedData?.error || null;

  // Manual resync feed trigger
  const handleRefreshFeed = async () => {
    try {
      showToast("info", "Menyinkronkan feed terbaru dari Instagram...");
      await mutateFeed();
      showToast("success", "Feed Instagram berhasil diperbarui!");
    } catch {
      showToast("error", "Gagal menyinkronkan feed Instagram.");
    }
  };

  // Spintax test live preview state in modal
  const [spintaxPreview, setSpintaxPreview] = useState("");

  const handleOpenAddRuleModal = () => {
    if (!account || !account.isActive) {
      showToast("error", "Silakan hubungkan akun Instagram terlebih dahulu untuk membuat aturan automasi.");
      return;
    }
    setEditingRule(null);
    const defaultPost = feedPosts.length > 0 ? feedPosts[0] : SAMPLE_INSTAGRAM_POSTS[0];
    setSelectedPost(defaultPost);
    const initialReply = "{Halo|Hai|Kak} @username, cek DM ya kak sudah kami kirimkan link detailnya! 😊";
    setActivePreviewTab("COMMENT");
    setRuleFormData({
      name: "",
      targetOtomasi: "Postingan Tertentu",
      postType: "SPECIFIC",
      postId: defaultPost?.id || "post_1",
      triggerCommentType: "KEYWORDS",
      keywords: "mau",
      keywordRule: "Contains",
      messageType: "BUTTON_TEMPLATE",
      dmMessage: "Halo {first_name}! Terima kasih sudah tertarik. Ini link akses yang kamu minta:\nhttps://ruangcreativemuslim.com",
      buttons: [
        {
          id: "btn_1",
          labelType: "Kustom",
          label: "Button 1",
          action: "Buka Website",
          url: "https://ruangcreativemuslim.com",
          text: "Terima kasih sudah tertarik! Ini info detail balasan dari kami.",
        }
      ],
      carouselSlides: [
        {
          id: "slide_1",
          image: "",
          title: "",
          subtitle: "",
          buttons: [
            {
              id: "slide_btn_1",
              labelType: "Kustom",
              label: "Button 1",
              action: "Buka Website",
              url: "https://ruangcreativemuslim.com"
            }
          ]
        }
      ],
      quickReplies: [],
      featureFollowUp: false,
      followUpDelay: "1 Jam",
      followUpCondition: "Hanya yang Belum Klik Link",
      followUpMessageType: "Template Tombol",
      followUpMessage: "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala atau mau tanya-tanya bilang ya 😉",
      followUpButtonLabel: "Buka Link Sekarang",
      featureReplyComment: false,
      commentReplyLimit: "Tak Terbatas",
      commentReplyVariations: [
        "Pesan terkirim! 🚀",
        "Halo @{username}, cek DMnya ya! 📬",
        "{kak|bro|sis}, linknya udah dikirim ke DM ya! 💌",
      ],
      replyCommentTemplates: "Pesan terkirim! 🚀",
      featureWelcomeMessage: false,
      welcomeMessageType: "Template Tombol",
      welcomeMessage: "Akses nya udah kita buatin nihh!!\n\nMau? ✨",
      welcomeButtonLabel: "Ya, Saya Mau!",
      featureAskForFollow: false,
      askForFollowMessageType: "Template Tombol",
      askForFollowMessage: "Btw, kayaknya kamu belum follow akun ini nih, sistemnya kita cuma bisa ngasih khusus untuk followers aja.\n\nKalo mau, follow dulu ya dan klik \"Udah Follow\" nanti dikirimin aksesnya",
      askForFollowButtonLabel: "Udah follow 🙌",
      askForFollowHasRetry: false,
      askForFollowRetryMessage: "Ih kayaknya masih belum follow beneran nih 😅\n\nCoba follow dulu ya ke profile, kalo udah nanti klik \"Udah Follow\"",
      askForFollowRetryButtonLabel: "Udah follow 🙌",
      featureAskForContact: false,
      askContactType: "Email Saja",
      askContactMessage: "Sip! Biar aksesnya langsung terkirim dan tersimpan aman di inbox kamu, boleh ketik Email aktif kamu di bawah ini ya 👇",
      askContactInvalidMessage: "Waduh, format emailnya kayaknya belum pas nih kak 😅 Coba cek dan ketik ulang email aktif kamu ya 🙏",
      featureLinkTracking: true,
      isActive: true,
    });
    setSpintaxPreview(parseSpintax(initialReply));
    setIsTargetDropdownOpen(false);
    setIsMsgTypeDropdownOpen(false);
    setIsKeywordRuleOpen(false);
    setIsKeywordRuleDropdownOpen(false);
    setIsCommentLimitDropdownOpen(false);
    setIsWelcomeMsgTypeDropdownOpen(false);
    setIsAskForFollowMsgTypeDropdownOpen(false);
    setIsFollowUpDelayDropdownOpen(false);
    setIsFollowUpConditionDropdownOpen(false);
    setIsFollowUpMsgTypeDropdownOpen(false);
    setIsAskContactTypeDropdownOpen(false);
    setSimulatedFollowStep("GATE");
    setOpenButtonDropdown(null);
    setSimulatedButtonId(null);
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRuleModal = (rule: any) => {
    setEditingRule(rule);
    const pool = feedPosts.length > 0 ? feedPosts : SAMPLE_INSTAGRAM_POSTS;
    let matched = pool.find((p) => p.id === rule.specificPostId);
    if (!matched && rule.specificPostId) {
      const isDirectImg =
        typeof rule.buttonUrl === "string" &&
        (rule.buttonUrl.startsWith("/images/") ||
          rule.buttonUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i));
      matched = {
        id: rule.specificPostId,
        title: rule.name || "Postingan Terpilih",
        image: (isDirectImg ? rule.buttonUrl : null) || "/images/instagram/post-1-full.png",
        thumb: (isDirectImg ? rule.buttonUrl : null) || "/images/instagram/thumb-1-clean.png",
      };
    } else if (!matched) {
      matched = pool[0];
    }
    setSelectedPost(matched);
    const keywordsStr = Array.isArray(rule.keywords)
      ? rule.keywords.join(", ")
      : typeof rule.keywords === "string"
      ? rule.keywords
      : "";

    const replyTemplateStr = Array.isArray(rule.commentReplies) && rule.commentReplies.length > 0
      ? rule.commentReplies[0]
      : Array.isArray(rule.replyCommentTemplates) && rule.replyCommentTemplates.length > 0
      ? rule.replyCommentTemplates[0]
      : typeof rule.commentReplies === "string"
      ? rule.commentReplies
      : typeof rule.replyCommentTemplates === "string"
      ? rule.replyCommentTemplates
      : "";

    const commentRepliesArray = Array.isArray(rule.commentReplies) && rule.commentReplies.length > 0
      ? rule.commentReplies
      : Array.isArray(rule.replyCommentTemplates) && rule.replyCommentTemplates.length > 0
      ? rule.replyCommentTemplates
      : (replyTemplateStr && replyTemplateStr.trim()
          ? [replyTemplateStr]
          : [
              "Pesan terkirim! 🚀",
              "Halo @{username}, cek DMnya ya! 📬",
              "{kak|bro|sis}, linknya udah dikirim ke DM ya! 💌",
            ]);

    let config: any = {};
    try {
      if (rule.dmMessage && (rule.dmMessage.startsWith("{") || rule.dmMessage.includes('"mainMessage"'))) {
        config = JSON.parse(rule.dmMessage);
      }
    } catch (e) {}

    const dmTemplateStr =
      config.mainMessage ||
      rule.dmMessage ||
      (Array.isArray(rule.dmTemplates) ? rule.dmTemplates[0] : rule.dmTemplates) ||
      "";
    const target = rule.triggerType === "SPECIFIC_POST" ? "Postingan Tertentu" : "Semua Postingan";

    const hasButtons = Boolean(rule.buttonText || rule.buttonUrl);
    const initialButtons = hasButtons
      ? [{
          id: "btn_1",
          labelType: (rule.buttonText === "Klik Disini" ? "Klik Disini" : "Kustom") as "Klik Disini" | "Kustom",
          label: rule.buttonText || "Button 1",
          action: (rule.buttonUrl ? "Buka Website" : "Kirim Teks") as "Buka Website" | "Kirim Teks" | "",
          url: rule.buttonUrl || "https://ruangcreativemuslim.com",
          text: "Terima kasih sudah tertarik! Ini info detail balasan dari kami.",
        }]
      : [{
          id: "btn_1",
          labelType: "Klik Disini" as "Klik Disini" | "Kustom",
          label: "Klik Disini",
          action: "Buka Website" as "Buka Website" | "Kirim Teks" | "",
          url: "https://ruangcreativemuslim.com",
          text: "Terima kasih sudah tertarik! Ini info detail balasan dari kami.",
        }];

    setActivePreviewTab("COMMENT");
    setRuleFormData({
      name: rule.name || "",
      targetOtomasi: target,
      postType: rule.triggerType === "SPECIFIC_POST" ? "SPECIFIC" : "ALL",
      postId: rule.specificPostId || matched.id,
      triggerCommentType: keywordsStr.trim() ? "KEYWORDS" : "ALL",
      keywords: keywordsStr || "mau, harga, info, spill",
      keywordRule: "Contains",
      messageType: hasButtons ? "BUTTON_TEMPLATE" : "PLAIN_TEXT",
      dmMessage: dmTemplateStr || "Halo {first_name}! Terima kasih sudah tertarik. Ini link akses yang kamu minta:\nhttps://ruangcreativemuslim.com",
      buttons: initialButtons,
      carouselSlides: [
        {
          id: "slide_1",
          image: matched?.image || "",
          title: "Panduan Lengkap Ngonten",
          subtitle: "Pelajari cara mudah buat konten viral",
          buttons: [
            {
              id: "slide_btn_1",
              labelType: "Kustom",
              label: "Button 1",
              action: "Buka Website",
              url: rule.buttonUrl || "https://ruangcreativemuslim.com"
            }
          ]
        }
      ],
      quickReplies: [],
      featureFollowUp: config.featureFollowUp ?? false,
      followUpDelay: config.followUpDelay || "1 Jam",
      followUpCondition: config.followUpCondition || "Hanya yang Belum Klik Link",
      followUpMessageType: config.followUpMessageType || "Template Tombol",
      followUpMessage: config.followUpMessage || "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala atau mau tanya-tanya bilang ya 😉",
      followUpButtonLabel: config.followUpButtonLabel || "Buka Link Sekarang",
      featureReplyComment: config.featureReplyComment ?? Boolean(
        (Array.isArray(rule.commentReplies) && rule.commentReplies.length > 0) ||
        (replyTemplateStr && replyTemplateStr.trim())
      ),
      commentReplyLimit: "Tak Terbatas",
      commentReplyVariations: commentRepliesArray,
      replyCommentTemplates: commentRepliesArray[0] || "Pesan terkirim! 🚀",
      featureWelcomeMessage: config.featureWelcomeMessage ?? false,
      welcomeMessageType: config.welcomeMessageType || "Template Tombol",
      welcomeMessage: config.welcomeMessage || "Akses nya udah kita buatin nihh!!\n\nMau? ✨",
      welcomeButtonLabel: config.welcomeButtonLabel || "Ya, Saya Mau!",
      featureAskForFollow: config.featureAskForFollow ?? false,
      askForFollowMessageType: config.askForFollowMessageType || "Template Tombol",
      askForFollowMessage: config.askForFollowMessage || "Btw, kayaknya kamu belum follow akun ini nih, sistemnya kita cuma bisa ngasih khusus untuk followers aja.\n\nKalo mau, follow dulu ya dan klik \"Udah Follow\" nanti dikirimin aksesnya",
      askForFollowButtonLabel: config.askForFollowButtonLabel || "Udah follow 🙌",
      askForFollowHasRetry: config.askForFollowHasRetry ?? false,
      askForFollowRetryMessage: config.askForFollowRetryMessage || "Ih kayaknya masih belum follow beneran nih 😅\n\nCoba follow dulu ya ke profile, kalo udah nanti klik \"Udah Follow\"",
      askForFollowRetryButtonLabel: config.askForFollowRetryButtonLabel || "Udah follow 🙌",
      featureAskForContact: config.featureAskForContact ?? false,
      askContactType: config.askContactType || "Email Saja",
      askContactMessage: config.askContactMessage || "Sip! Biar aksesnya langsung terkirim dan tersimpan aman di inbox kamu, boleh ketik Email aktif kamu di bawah ini ya 👇",
      askContactInvalidMessage: config.askContactInvalidMessage || "Waduh, format emailnya kayaknya belum pas nih kak 😅 Coba cek dan ketik ulang email aktif kamu ya 🙏",
      featureLinkTracking: true,
      isActive: rule.isActive ?? true,
    });
    setSpintaxPreview(parseSpintax(replyTemplateStr || commentRepliesArray[0] || "Pesan terkirim! 🚀"));
    setIsTargetDropdownOpen(false);
    setIsMsgTypeDropdownOpen(false);
    setIsKeywordRuleOpen(false);
    setIsKeywordRuleDropdownOpen(false);
    setIsCommentLimitDropdownOpen(false);
    setIsWelcomeMsgTypeDropdownOpen(false);
    setIsAskForFollowMsgTypeDropdownOpen(false);
    setIsFollowUpDelayDropdownOpen(false);
    setIsFollowUpConditionDropdownOpen(false);
    setIsFollowUpMsgTypeDropdownOpen(false);
    setIsAskContactTypeDropdownOpen(false);
    setSimulatedFollowStep("GATE");
    setOpenButtonDropdown(null);
    setSimulatedButtonId(null);
    setIsRuleModalOpen(true);
  };

  // Duplicate rule
  const handleDuplicateRule = (ruleId: string) => {
    const existingRule = (data?.rules || []).find((r: any) => r.id === ruleId);
    if (existingRule) {
      const optimisticRule = {
        ...existingRule,
        id: `temp-dup-${Date.now()}`,
        name: `${existingRule.name} (Salinan)`,
        isActive: false,
        createdAt: new Date().toISOString(),
      };
      mutateData(
        (prev: any) => ({
          ...prev,
          rules: [optimisticRule, ...(prev?.rules || [])],
        }),
        false
      );
    }

    startTransition(async () => {
      try {
        const res = await duplicateAutomationRuleAction(ruleId);
        if (res.success) {
          showToast("success", "Salinan aturan berhasil dibuat!");
          await mutateData();
        } else {
          showToast("error", (res as any).error || "Gagal membuat salinan aturan");
          await mutateData();
        }
      } catch (err: any) {
        showToast("error", err.message || "Terjadi kesalahan server");
        await mutateData();
      }
    });
  };

  // Toggle rule status ON/OFF with optimistic SWR update
  const handleToggleRule = (ruleId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Optimistic SWR mutate
    mutateData(
      (prev: any) => ({
        ...prev,
        rules: (prev?.rules || []).map((r: any) => (r.id === ruleId ? { ...r, isActive: nextStatus } : r)),
      }),
      false
    );

    startTransition(async () => {
      try {
        const res = await toggleAutomationRuleAction(ruleId, nextStatus);
        if (res.success) {
          showToast("success", `Aturan berhasil di-${nextStatus ? "aktifkan" : "nonaktifkan"}`);
          await mutateData();
        } else {
          showToast("error", (res as any).error || "Gagal mengubah status aturan");
          await mutateData();
        }
      } catch (err: any) {
        showToast("error", err.message || "Terjadi kesalahan server");
        await mutateData();
      }
    });
  };

  // Delete rule with optimistic SWR update
  const handleDeleteRule = (ruleId: string, ruleName: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Hapus Aturan "${ruleName}"?`,
      description: "Aturan automasi komentar dan DM ini akan dihapus secara permanen dari sistem.",
      confirmText: "Ya, Hapus Aturan",
      onConfirm: () => {
        setConfirmModal(null);
        // Optimistic SWR mutate
        mutateData(
          (prev: any) => ({
            ...prev,
            rules: (prev?.rules || []).filter((r: any) => r.id !== ruleId),
          }),
          false
        );

        startTransition(async () => {
          try {
            const res = await deleteAutomationRuleAction(ruleId);
            if (res.success) {
              showToast("success", "Aturan automasi berhasil dihapus");
              await mutateData();
            } else {
              showToast("error", (res as any).error || "Gagal menghapus aturan");
              await mutateData();
            }
          } catch (err: any) {
            showToast("error", err.message || "Terjadi kesalahan server");
            await mutateData();
          }
        });
      },
    });
  };

  // Save Rule (Create or Update) with Optimistic SWR Update
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormData.name.trim()) {
      showToast("error", "Nama aturan wajib diisi");
      return;
    }

    const keywordArray = ruleFormData.triggerCommentType === "ALL"
      ? []
      : (ruleFormData.keywords || "mau, harga, info, spill")
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);

    const postCoverUrl = ruleFormData.targetOtomasi === "Postingan Tertentu"
      ? (selectedPost?.image || selectedPost?.thumb || null)
      : null;

    const chosenPostId = ruleFormData.targetOtomasi === "Postingan Tertentu"
      ? (selectedPost?.id || ruleFormData.postId || (feedPosts[0]?.id) || "post_1")
      : undefined;

    const primaryButton = ruleFormData.buttons && ruleFormData.buttons.length > 0 ? ruleFormData.buttons[0] : null;
    const buttonText = ruleFormData.messageType === "BUTTON_TEMPLATE" && primaryButton?.label ? primaryButton.label.trim() : null;
    const buttonUrl = ruleFormData.messageType === "BUTTON_TEMPLATE" && primaryButton?.url ? primaryButton.url.trim() : null;

    const extendedConfig = {
      mainMessage: ruleFormData.dmMessage || "Halo @username! Terima kasih sudah tertarik.",
      featureWelcomeMessage: ruleFormData.featureWelcomeMessage,
      welcomeMessageType: ruleFormData.welcomeMessageType,
      welcomeMessage: ruleFormData.welcomeMessage,
      welcomeButtonLabel: ruleFormData.welcomeButtonLabel,
      featureAskForFollow: ruleFormData.featureAskForFollow,
      askForFollowMessageType: ruleFormData.askForFollowMessageType,
      askForFollowMessage: ruleFormData.askForFollowMessage,
      askForFollowButtonLabel: ruleFormData.askForFollowButtonLabel,
      askForFollowHasRetry: ruleFormData.askForFollowHasRetry,
      askForFollowRetryMessage: ruleFormData.askForFollowRetryMessage,
      askForFollowRetryButtonLabel: ruleFormData.askForFollowRetryButtonLabel,
      featureAskForContact: ruleFormData.featureAskForContact,
      askContactType: ruleFormData.askContactType,
      askContactMessage: ruleFormData.askContactMessage,
      askContactInvalidMessage: ruleFormData.askContactInvalidMessage,
      featureFollowUp: ruleFormData.featureFollowUp,
      followUpDelay: ruleFormData.followUpDelay,
      followUpCondition: ruleFormData.followUpCondition,
      followUpMessageType: ruleFormData.followUpMessageType,
      followUpMessage: ruleFormData.followUpMessage,
      followUpButtonLabel: ruleFormData.followUpButtonLabel,
      featureReplyComment: ruleFormData.featureReplyComment,
    };
    const serializedDm = JSON.stringify(extendedConfig);

    const targetAccountId = selectedAgentId || account?.id;
    const payload = {
      ruleId: editingRule?.id,
      accountId: targetAccountId,
      name: ruleFormData.name,
      postType: ruleFormData.targetOtomasi === "Postingan Tertentu" ? "SPECIFIC" : "ALL",
      postId: chosenPostId,
      buttonUrl: buttonUrl || undefined,
      buttonText: buttonText || undefined,
      keywords: keywordArray,
      commentReplies: ruleFormData.featureReplyComment
        ? (ruleFormData.commentReplyVariations.filter((v) => v.trim().length > 0).length > 0
            ? ruleFormData.commentReplyVariations.filter((v) => v.trim().length > 0)
            : ["Pesan terkirim! 🚀"])
        : [],
      dmMessage: serializedDm,
      isActive: ruleFormData.isActive,
    };

    // 1. Optimistic SWR Update: Kartu langsung muncul seketika (0ms) di UI tanpa menunggu server!
    const optimisticId = editingRule?.id || `temp-${Date.now()}`;
    const optimisticRule = {
      id: optimisticId,
      accountId: targetAccountId || "temp",
      name: payload.name,
      triggerType: payload.postType === "SPECIFIC" ? "SPECIFIC_POST" : "ALL_POSTS",
      specificPostId: payload.postId || null,
      buttonUrl: buttonUrl || null,
      buttonText: buttonText || null,
      keywords: keywordArray,
      commentReplies: payload.commentReplies,
      dmMessage: payload.dmMessage,
      isActive: payload.isActive,
      createdAt: new Date().toISOString(),
      _count: { logs: 0 }
    };

    mutateData(
      (prev: any) => {
        if (!prev) return prev;
        const existing = prev.rules || [];
        const updatedRules = editingRule
          ? existing.map((r: any) => (r.id === editingRule.id ? { ...r, ...optimisticRule } : r))
          : [optimisticRule, ...existing];
        return { ...prev, rules: updatedRules };
      },
      false // Jangan revalidate segera untuk menghindari stale cache sementara
    );

    setIsRuleModalOpen(false);
    showToast("success", editingRule ? "Aturan berhasil diperbarui!" : "Aturan baru berhasil ditambahkan!");

    startTransition(async () => {
      try {
        const res = await saveAutomationRuleAction(payload);
        if (res.success && res.rule) {
          // Reconcile optimistic card dengan data resmi dari database
          mutateData(
            (prev: any) => {
              if (!prev) return prev;
              const existing = prev.rules || [];
              const updatedRules = existing.map((r: any) =>
                (r.id === optimisticId || r.id === res.rule.id)
                  ? { ...res.rule, buttonUrl: postCoverUrl || res.rule.buttonUrl }
                  : r
              );
              return { ...prev, rules: updatedRules };
            },
            true // revalidate dengan database
          );
        } else {
          showToast("error", (res as any).error || "Gagal menyimpan aturan");
          await mutateData();
        }
      } catch (err: any) {
        showToast("error", err.message || "Gagal menyimpan aturan");
        await mutateData();
      }
    });
  };


  // Resync Account from Meta API
  const handleResyncAccount = () => {
    startTransition(async () => {
      try {
        const res = await connectInstagramAccountAction();
        if (res.success && res.account) {
          showToast("success", `Akun @${res.account.username} berhasil disinkronkan kembali!`);
          setAvatarError(false);
          await mutateData();
        } else {
          showToast("error", res.error || "Gagal menyinkronkan akun");
        }
      } catch (err: any) {
        showToast("error", err.message || "Terjadi kesalahan koneksi Meta API");
      }
    });
  };

  // Disconnect Account with Optimistic SWR Update
  const handleDisconnect = () => {
    const targetAccountId = selectedAgentId || data.account?.id;
    if (!targetAccountId) return;

    setConfirmModal({
      isOpen: true,
      title: "Putuskan Koneksi Instagram?",
      description: "Putuskan koneksi akun Instagram ini? Automasi komentar dan DM akan dinonaktifkan sementara.",
      confirmText: "Ya, Putuskan Koneksi",
      onConfirm: () => {
        setConfirmModal(null);
        // Optimistically set account to null in SWR cache for instant UI feedback
        mutateData(
          (prev: any) => ({
            ...prev,
            account: null,
          }),
          false
        );

        startTransition(async () => {
          try {
            const res = await disconnectInstagramAccountAction(targetAccountId);
            if (res.success) {
              showToast("info", "Koneksi akun Instagram berhasil diputuskan");
              await mutateData();
            } else {
              showToast("error", res.error || "Gagal memutuskan koneksi");
              await mutateData();
            }
          } catch (err: any) {
            showToast("error", err.message || "Terjadi kesalahan server");
            await mutateData();
          }
        });
      },
    });
  };

  const rules = data?.rules || [];
  const stats = data?.stats || { totalComments: 0, totalDms: 0 };
  const logs = data?.logs || [];

  // Filtered rules according to tab and filter dropdown
  const filteredRules = rules.filter((rule: any) => {
    if (automationTab !== "POST") return false;
    if (filterStatus === "ACTIVE") return rule.isActive;
    if (filterStatus === "INACTIVE") return !rule.isActive;
    return true;
  });

  // Progressive disclosure check for rule creation studio
  const isBasicInfoFilled = Boolean(ruleFormData.name.trim()) && Boolean(ruleFormData.targetOtomasi);

  // Active simulated button for DM interactive preview
  const activeSimulatedButton =
    ruleFormData.buttons.find((b) => b.id === simulatedButtonId) ||
    ruleFormData.buttons.find((b) => b.action === "Kirim Teks") ||
    (ruleFormData.buttons[0]?.action === "Kirim Teks" ? ruleFormData.buttons[0] : null);

  return (
    <div
      className={`flex-1 w-full mx-auto animate-in fade-in duration-300 ${
        selectedPlatform === null
          ? "max-w-5xl px-4 md:px-8 py-10 md:py-16"
          : "max-w-4xl p-6 py-10 md:py-16"
      }`}
    >
      {/* Toast Notification (Seragam dengan Ruang Ngonten & Ruang Belajar) */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-top-5 fade-in duration-300 pointer-events-none">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/10">
            {toast.type === "success" ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : toast.type === "error" ? (
              <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
            )}
            <p className="text-sm font-bold text-gray-900 dark:text-white">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal (Identik dengan Ruang Ngonten & Ruang Belajar) */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl border bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 cursor-pointer"
              >
                {confirmModal.cancelText || "Batal"}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-rose-600 text-white hover:bg-rose-700 shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {confirmModal.confirmText || "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 1: PLATFORM HUB SELECTION */}
      {/* ========================================================================= */}
      {selectedPlatform === null ? (
        <div className="space-y-8">
          {/* Header - EXACT SAME STYLE & CENTER ALIGNED AS RUANG NGONTEN */}
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-6 md:mb-10">
            <div className="space-y-3 flex flex-col items-center">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Mau mulai dari mana?
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
                Pilih platform media sosial di bawah ini untuk mengaktifkan automasi balasan komentar pintar, kirim pesan DM privat otomatis, dan perluas jangkauan audiens Anda 24/7.
              </p>
            </div>
          </div>

          {/* Platform Cards Grid - EXACT SAME STYLE & SIZE AS RUANG NGONTEN TOOLCARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
            {/* 1. INSTAGRAM AUTOMATION */}
            {(() => {
              const canAccess = isLoggedIn && (isPro || isAdmin);
              const igPoints = [
                "Koneksikan Akun Meta",
                "Atur Template Balasan",
                "Auto DM & Komentar 24/7"
              ];

              return (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleSelectInstagram}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleSelectInstagram();
                  }}
                  className={`group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-pointer z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 hover:border-rn-accent dark:hover:border-rn-accent/50 shadow-gray-200 dark:shadow-black/50 hover:shadow-xl hover:-translate-y-1.5`}
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-400 group-hover:bg-rn-accent/10 group-hover:text-rn-accent shrink-0">
                      <InstagramIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-start justify-between w-full">
                        <h3 className="font-bold text-base leading-tight transition-colors text-gray-900 dark:text-white group-hover:text-rn-accent">
                          Instagram Automation
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          {canAccess ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 uppercase tracking-wider">
                              AKTIF
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 uppercase tracking-wider">
                              PRO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
                    Balas komentar postingan & Reels otomatis serta kirim link/DM instan ke followers secara otomatis.
                  </p>

                  {/* Timeline Points List */}
                  <div className="relative ml-1.5 space-y-3">
                    <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />

                    {igPoints.map((point, pIdx) => (
                      <div key={pIdx} className="relative flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full z-10 transition-colors ${
                            pIdx === 0
                              ? "bg-rn-accent ring-4 ring-rn-accent/20"
                              : "bg-gray-300 dark:bg-gray-600 group-hover:bg-rn-accent/50"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-medium transition-colors ${
                            pIdx === 0
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                          }`}
                        >
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 2. TIKTOK AUTOMATION (COMING SOON) */}
            {(() => {
              const ttPoints = [
                "Tautkan Akun TikTok",
                "Filter Kata Kunci",
                "Auto Respon Video VT"
              ];

              return (
                <div
                  className="group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-not-allowed z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 opacity-75"
                  title="TikTok Automation sedang dalam tahap riset & pengembangan"
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0">
                      <TikTokIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-start justify-between w-full">
                        <h3 className="font-bold text-base leading-tight text-gray-800 dark:text-gray-200">
                          TikTok Automation
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400 uppercase tracking-wider">
                            COMING SOON
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
                    Otomasi interaksi video VT, respon komentar audiens, dan pesan instan pengikut TikTok secara otomatis.
                  </p>

                  {/* Timeline Points List */}
                  <div className="relative ml-1.5 space-y-3">
                    <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />

                    {ttPoints.map((point, pIdx) => (
                      <div key={pIdx} className="relative flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full z-10 bg-gray-300 dark:bg-gray-600" />
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 3. WHATSAPP AUTOMATION (COMING SOON) */}
            {(() => {
              const waPoints = [
                "Scan QR WhatsApp",
                "Sambutan CS Otomatis",
                "Broadcast Pesan Terjadwal"
              ];

              return (
                <div
                  className="group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-not-allowed z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 opacity-75"
                  title="WhatsApp Automation sedang dalam tahap riset & pengembangan"
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0">
                      <WhatsAppIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-start justify-between w-full">
                        <h3 className="font-bold text-base leading-tight text-gray-800 dark:text-gray-200">
                          WhatsApp Automation
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400 uppercase tracking-wider">
                            COMING SOON
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
                    Kirim pesan broadcast, sambutan pelanggan otomatis, dan CS chatbot resmi WhatsApp Business API.
                  </p>

                  {/* Timeline Points List */}
                  <div className="relative ml-1.5 space-y-3">
                    <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />

                    {waPoints.map((point, pIdx) => (
                      <div key={pIdx} className="relative flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full z-10 bg-gray-300 dark:bg-gray-600" />
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : selectedAgentId === null ? (
        /* ========================================================================= */
        /* LEVEL 2: DAFTAR AGEN OTOMASI INSTAGRAM (AGENT CARDS GRID) */
        /* ========================================================================= */
        <div className="animate-in fade-in duration-200 space-y-6">
          {/* Header & Actions Card (Meniru Persis Style Komentar IG ke DM / Pengaturan Ruang Belajar) */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214] shadow-sm">
            <div className="mb-2 md:mb-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                IG Automation
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kelola asisten agen otomasi untuk akun Instagram Anda. 1 Agen mewakili 1 akun Instagram yang terhubung.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto self-start sm:self-auto shrink-0">
              {/* Filter Dropdown */}
              <div className="relative agent-filter-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsAgentFilterOpen(!isAgentFilterOpen)}
                  className={`px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    agentFilterStatus !== "ALL"
                      ? "border-gray-900 dark:border-white bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  {agentFilterStatus !== "ALL" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>

                {isAgentFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Status Koneksi
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAgentFilterStatus("ALL");
                        setIsAgentFilterOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        agentFilterStatus === "ALL"
                          ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      Semua Status
                      {agentFilterStatus === "ALL" && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAgentFilterStatus("LINKED");
                        setIsAgentFilterOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        agentFilterStatus === "LINKED"
                          ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      Terhubung Meta
                      {agentFilterStatus === "LINKED" && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAgentFilterStatus("UNLINKED");
                        setIsAgentFilterOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        agentFilterStatus === "UNLINKED"
                          ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      Belum Terhubung
                      {agentFilterStatus === "UNLINKED" && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Tombol Buat Agen Baru */}
              <button
                type="button"
                onClick={() => {
                  setNewAgentName("");
                  setIsCreateAgentModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Agen Baru</span>
              </button>
            </div>
          </div>

          {/* List Agen: Empty State vs Cards Grid */}
          {agents.length === 0 ? (
            <div className="rounded-[24px] border-2 border-dashed border-gray-200 dark:border-white/10 p-8 sm:p-12 text-center bg-gray-50/50 dark:bg-white/[0.02] flex flex-col items-center justify-center max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 shadow-sm">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                Belum Ada Agen Otomasi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                Buat agen pertama Anda untuk menghubungkan akun Instagram dan mengotomasi balasan komentar serta DM secara cerdas dan efisien.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNewAgentName("");
                  setIsCreateAgentModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Agen Pertama</span>
              </button>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="rounded-[20px] border border-gray-200 dark:border-white/10 p-8 text-center bg-white dark:bg-[#18181b] max-w-md mx-auto my-8 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Tidak ada agen dengan status filter yang dipilih.
              </p>
              <button
                type="button"
                onClick={() => setAgentFilterStatus("ALL")}
                className="text-xs font-bold text-orange-500 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAgents.map((agent: any) => (
                <div
                  key={agent.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    setActiveIgTab("koneksi");
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set("agentId", agent.id);
                    window.history.pushState({}, "", newUrl.toString());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedAgentId(agent.id);
                      setActiveIgTab("koneksi");
                      const newUrl = new URL(window.location.href);
                      newUrl.searchParams.set("agentId", agent.id);
                      window.history.pushState({}, "", newUrl.toString());
                    }
                  }}
                  className="group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 cursor-pointer z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 hover:border-orange-500 dark:hover:border-orange-500/50 shadow-gray-200 dark:shadow-black/50 hover:shadow-xl hover:-translate-y-1.5"
                >
                  {/* Card Header: Icon/Avatar, Name, Status Badge, & Three-dots Menu */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-400 group-hover:bg-orange-500/10 group-hover:text-orange-500 shrink-0 overflow-hidden">
                      {agent.isLinked && agent.profilePicUrl ? (
                        <img
                          src={agent.profilePicUrl}
                          alt={agent.username || agent.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <InstagramIcon className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 w-full min-w-0">
                      <div className="flex items-center justify-between w-full gap-2">
                        <h3 className="font-bold text-base leading-tight transition-colors text-gray-900 dark:text-white group-hover:text-orange-500 truncate">
                          {agent.name}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {agent.isLinked ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 uppercase tracking-wider">
                              TERHUBUNG
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 uppercase tracking-wider">
                              OFFLINE
                            </span>
                          )}

                          {/* Dropdown Menu Titik Tiga */}
                          <div className="relative agent-dropdown-menu">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownAgentId(activeDropdownAgentId === agent.id ? null : agent.id);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeDropdownAgentId === agent.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-white/10 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownAgentId(null);
                                    handleOpenEditAgentModal(agent);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer text-left"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                  <span>Ubah Nama Agen</span>
                                </button>

                                {agent.isLinked && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownAgentId(null);
                                      handleDisconnectAgent(agent.id, agent.name);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 cursor-pointer text-left"
                                  >
                                    <Unlink className="w-3.5 h-3.5" />
                                    <span>Putuskan Koneksi IG</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownAgentId(null);
                                    handleDeleteAgent(agent.id, agent.name);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-t border-gray-100 dark:border-white/5 cursor-pointer text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus Agen</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400 truncate">
                        {agent.isLinked && agent.username ? `@${agent.username}` : "Belum terhubung ke Instagram"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
                    {agent.isLinked && agent.username
                      ? `Asisten aktif untuk @${agent.username}. Mengotomasi balasan komentar dan kirim DM instan 24/7.`
                      : "Agen siap dikoneksikan. Klik untuk menghubungkan akun Instagram Bisnis atau Kreator Anda."}
                  </p>

                  {/* Timeline Points List (Persis seperti card di Mau Mulai Dari Mana) */}
                  <div className="relative ml-1.5 space-y-3">
                    <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />

                    {/* Point 1: Instagram Account */}
                    <div className="relative flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full z-10 transition-colors ${
                          agent.isLinked
                            ? "bg-emerald-500 ring-4 ring-emerald-500/20"
                            : "bg-orange-500 ring-4 ring-orange-500/20"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-medium transition-colors ${
                          agent.isLinked
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {agent.isLinked && agent.username ? `Akun: @${agent.username}` : "Koneksi Akun Instagram"}
                      </span>
                    </div>

                    {/* Point 2: Rules Count */}
                    <div className="relative flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full z-10 bg-gray-300 dark:bg-gray-600 group-hover:bg-orange-500/50 transition-colors" />
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {agent.rulesCount || 0} Aturan Otomasi Aktif
                      </span>
                    </div>

                    {/* Point 3: Sent Responses */}
                    <div className="relative flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full z-10 bg-gray-300 dark:bg-gray-600 group-hover:bg-orange-500/50 transition-colors" />
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {agent.logsCount || 0} Pesan & Respon Terkirim
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* LEVEL 3: WORKSPACE AGEN AKTIF (TAMPILAN SCREENSHOT) */
        /* ========================================================================= */
        <div className="animate-in fade-in duration-200">
          {/* Top Navigation & Active Agent Header */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedAgentId(null);
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete("agentId");
                window.history.pushState({}, "", newUrl.toString());
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 bg-gray-100 dark:bg-white/5 hover:bg-orange-500/10 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 transition-colors w-fit cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar Agen</span>
            </button>
          </div>

          {/* Header Title - EXACT SAME STYLE & MARGIN AS PENGATURAN */}
          <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
            IG Automation
          </h1>

          <div className="space-y-6">
            {/* Horizontal Tabs Navigation (Pengaturan style) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {igTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveIgTab(tab.id as any)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border ${
                    activeIgTab === tab.id
                      ? "border-orange-500 text-orange-500 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          {/* ========================================================================= */}
          {/* TAB 1: KONEKSI AKUN */}
          {/* ========================================================================= */}
          {activeIgTab === "koneksi" && (
            <div className="space-y-6 animate-in fade-in duration-200">
          {account && account.isActive ? (
            <div className="rounded-2xl border border-gray-200 dark:border-white/5 p-6 bg-white dark:bg-[#121214] shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start md:items-center gap-4">
                  {/* Avatar / Profile Picture */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 overflow-hidden">
                      {account.profilePicUrl && !avatarError ? (
                        <img
                          src={account.profilePicUrl}
                          alt={account.username || "Instagram Avatar"}
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <InstagramIcon className="w-7 h-7 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-black font-heading text-gray-900 dark:text-white">
                      @{account.username}
                    </h2>
                    {account.name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {account.name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>
                        Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Terhubung</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Connected Account */}
                <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
                  <button
                    onClick={handleResyncAccount}
                    disabled={isPending}
                    className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    title="Sinkronkan ulang data profil dari Meta API"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
                    Sinkronkan Ulang
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={isPending}
                    className="px-3.5 py-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Putuskan koneksi akun ini"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    Putuskan Koneksi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* DISCONNECTED STATE */
            <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 p-6 md:p-8 bg-gray-50/50 dark:bg-white/[0.02] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <InstagramIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                        Belum Ada Akun Instagram Terhubung
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Terputus / Belum Aktif
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                      Hubungkan akun Instagram Bisnis atau Kreator Anda untuk mulai mengaktifkan auto-reply komentar postingan/Reels dan pengiriman DM privat otomatis 24/7.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartMetaOAuth(selectedAgentId || account?.id)}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
                  title="Hubungkan akun Instagram Anda secara resmi via Meta"
                >
                  <InstagramIcon className="w-4 h-4" />
                  Hubungkan Akun Instagram
                </button>
              </div>
            </div>
          )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: KOMENTAR IG KE DM */}
          {/* ========================================================================= */}
          {activeIgTab === "komentar" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header & Actions Card (Identical to Pengaturan Ruang Belajar style) */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214] shadow-sm">
                <div className="mb-2 md:mb-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Komentar IG ke DM
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Secara otomatis mengirim pesan langsung ke pengguna yang berkomentar pada postingan Instagram Anda.
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto self-start sm:self-auto shrink-0">
                  {/* Filter Dropdown */}
                  <div className="relative filter-dropdown-container">
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className={`px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
                        filterStatus !== "ALL"
                          ? "border-gray-900 dark:border-white bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                          : "border-gray-200 dark:border-white/10 bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filter</span>
                      {filterStatus !== "ALL" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>

                    {isFilterOpen && (
                      <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Status Aturan
                        </div>
                        <button
                          onClick={() => {
                            setFilterStatus("ALL");
                            setIsFilterOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between ${
                            filterStatus === "ALL"
                              ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          Semua Status
                          {filterStatus === "ALL" && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white" />}
                        </button>
                        <button
                          onClick={() => {
                            setFilterStatus("ACTIVE");
                            setIsFilterOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between ${
                            filterStatus === "ACTIVE"
                              ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          Berjalan (Aktif)
                          {filterStatus === "ACTIVE" && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        </button>
                        <button
                          onClick={() => {
                            setFilterStatus("INACTIVE");
                            setIsFilterOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between ${
                            filterStatus === "INACTIVE"
                              ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          Nonaktif
                          {filterStatus === "INACTIVE" && <Check className="w-3.5 h-3.5 text-gray-400" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Buat Automation Button (Orange Style like Tambah E-Book) */}
                  <button
                    onClick={handleOpenAddRuleModal}
                    className="justify-center bg-rn-accent hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-opacity flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Automation
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Pill Tabs (Placed outside card) */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200/60 dark:border-white/5 overflow-x-auto max-w-full">
                  {[
                    { id: "POST", label: "Post Automations" },
                    { id: "STORY", label: "Story Automations" },
                    { id: "LIVE", label: "Live Automations" },
                    { id: "DM", label: "DM Automations" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAutomationTab(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        automationTab === tab.id
                          ? "bg-white dark:bg-[#18181b] text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-white/10"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

            {/* Grid of Automation Cards */}
            {filteredRules.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl space-y-4 bg-white dark:bg-[#18181b]">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 flex items-center justify-center">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {automationTab === "POST" 
                      ? filterStatus !== "ALL" 
                        ? "Tidak ada aturan yang sesuai filter" 
                        : "Belum Ada Post Automation" 
                      : `${automationTab === "STORY" ? "Story" : automationTab === "LIVE" ? "Live" : "DM"} Automations Segera Hadir`}
                  </h4>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    {automationTab === "POST"
                      ? "Buat aturan automasi postingan pertama Anda agar sistem membalas komentar dan mengirim link ke DM followers secara instan."
                      : "Fitur automasi ini sedang dalam pengembangan dan akan segera aktif via pembaruan Meta Graph API."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredRules.map((rule: any) => {
                  const keywordList = Array.isArray(rule.keywords)
                    ? rule.keywords
                    : typeof rule.keywords === "string"
                    ? JSON.parse(rule.keywords || "[]")
                    : [];

                  const sentCount = rule._count?.logs ?? (stats.totalComments > 0 ? Math.floor(stats.totalComments / Math.max(1, rules.length)) : 0);
                  const clickCount = sentCount > 0 ? Math.round(sentCount * 0.58) : 0;
                  const followerCount = sentCount > 0 ? Math.max(1, Math.round(sentCount * 0.04)) : 0;
                  const ctrRate = sentCount > 0 ? ((clickCount / sentCount) * 100).toFixed(2) + "%" : "0%";

                  return (
                    <div
                      key={rule.id}
                      className={`flex flex-row items-start w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-[16px] sm:rounded-[20px] relative p-3 sm:p-4 gap-3 sm:gap-4 ${
                        rule.isActive ? "" : "opacity-75 bg-gray-50/70 dark:bg-[#141417]"
                      }`}
                    >
                      {/* Sisi Kiri: Cover 3:4 (Gaya E-Book Ruang Belajar) */}
                      <div className="w-[105px] sm:w-[125px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-[10px] sm:rounded-xl shadow-sm">
                        <div className="aspect-[3/4] relative flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-white/5">
                          {rule.triggerType === "SPECIFIC_POST" ? (
                            (() => {
                              const matchedPost =
                                feedPosts.find((p) => p.id === rule.specificPostId) ||
                                SAMPLE_INSTAGRAM_POSTS.find((p) => p.id === rule.specificPostId);
                              const isDirectImg =
                                typeof rule.buttonUrl === "string" &&
                                (rule.buttonUrl.startsWith("/images/") ||
                                  rule.buttonUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i));
                              const coverImg =
                                matchedPost?.thumb ||
                                matchedPost?.image ||
                                (isDirectImg ? rule.buttonUrl : null) ||
                                "/images/instagram/thumb-1-clean.png";

                              return (
                                <>
                                  <img
                                    src={coverImg}
                                    alt={rule.name}
                                    referrerPolicy="no-referrer"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/images/instagram/thumb-1-clean.png";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                  <div className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate drop-shadow">
                                    {matchedPost?.title || rule.name}
                                  </div>
                                </>
                              );
                            })()
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 dark:bg-white/5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white mb-1.5 shadow-sm">
                                <InstagramIcon className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                Semua<br />Postingan
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sisi Kanan: Konten Informasi */}
                      <div className="flex flex-col flex-1 min-w-0 justify-between py-0.5">
                        <div>
                          {/* Baris 1: Judul & Menu Titik Tiga */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3
                              className="text-[15px] sm:text-[17px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white line-clamp-1 flex-1"
                              title={rule.name}
                            >
                              {rule.name}
                            </h3>

                            {/* Menu Titik Tiga Vertikal */}
                            <div className="relative rule-dropdown-menu shrink-0 ml-1">
                              <button
                                type="button"
                                onClick={() => setActiveDropdownRuleId(activeDropdownRuleId === rule.id ? null : rule.id)}
                                className="w-7 h-7 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                title="Opsi Aturan"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeDropdownRuleId === rule.id && (
                                <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                                  {/* 1. Jeda / Lanjutkan */}
                                  <button
                                    onClick={() => {
                                      setActiveDropdownRuleId(null);
                                      handleToggleRule(rule.id, rule.isActive);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                  >
                                    {rule.isActive ? (
                                      <>
                                        <Pause className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                        <span>Jeda</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Lanjutkan</span>
                                      </>
                                    )}
                                  </button>

                                  {/* 2. Buat Salinan */}
                                  <button
                                    onClick={() => {
                                      setActiveDropdownRuleId(null);
                                      handleDuplicateRule(rule.id);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                    <span>Buat Salinan</span>
                                  </button>

                                  {/* 3. Edit */}
                                  <button
                                    onClick={() => {
                                      setActiveDropdownRuleId(null);
                                      handleOpenEditRuleModal(rule);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                    <span>Edit</span>
                                  </button>

                                  {/* 4. Hapus */}
                                  <button
                                    onClick={() => {
                                      setActiveDropdownRuleId(null);
                                      handleDeleteRule(rule.id, rule.name);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors border-t border-gray-100 dark:border-white/5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Baris 2: Status & Target & Lihat Post */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                            <span className={`w-2 h-2 rounded-full ${rule.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                            <span className={`font-semibold ${rule.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                              {rule.isActive ? "Berjalan" : "Nonaktif"}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                              {rule.triggerType === "SPECIFIC_POST" ? "Postingan Tertentu" : "Semua Postingan"}
                            </span>
                            {rule.triggerType === "SPECIFIC_POST" && rule.specificPostId && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <a
                                  href={`https://instagram.com/p/${rule.specificPostId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 inline-flex items-center gap-0.5 font-medium transition-colors"
                                >
                                  Lihat Post <ExternalLink className="w-3 h-3 ml-0.5" />
                                </a>
                              </>
                            )}
                          </div>

                          {/* Baris 3: Kata Pemicu */}
                          <div className="mb-3">
                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                              Kata Pemicu
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {keywordList.length === 0 ? (
                                <span className="font-bold rounded px-2 py-0.5 text-[9px] uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 inline-flex items-center gap-1">
                                  <Link2 className="w-3 h-3" /> Semua Kata
                                </span>
                              ) : (
                                keywordList.map((kw: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="font-bold rounded px-2 py-0.5 text-[9px] uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                                  >
                                    {kw}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Baris 4 (Bawah): 4 Metrics Columns Lengkap (Terkirim, Klik, Follower, CTR) */}
                        <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 grid grid-cols-4 gap-1.5 text-center sm:text-left">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium leading-none">Terkirim</span>
                            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 block mt-1 leading-none">
                              {sentCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium leading-none">Klik</span>
                            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 block mt-1 leading-none">
                              {clickCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium leading-none">Follower</span>
                            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 block mt-1 leading-none">
                              {followerCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium leading-none">CTR</span>
                            <span className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 block mt-1 leading-none">
                              {ctrRate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DASHBOARD */}
          {/* ========================================================================= */}
          {activeIgTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-[#18181b] space-y-2">
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Komentar Terjawab</span>
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
                    {stats.totalComments || 0}
                  </div>
                  <p className="text-[11px] text-gray-400">Total balasan komentar otomatis</p>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-[#18181b] space-y-2">
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">DM Terkirim</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
                    {stats.totalDms || 0}
                  </div>
                  <p className="text-[11px] text-gray-400">Total pesan privat terkirim</p>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-[#18181b] space-y-2">
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Aturan Otomasi</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
                    {rules.length}
                  </div>
                  <p className="text-[11px] text-emerald-500 font-semibold">
                    {rules.filter((r: any) => r.isActive).length} Aktif berjalan
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-[#18181b] space-y-2">
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Tingkat Sukses</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
                    100%
                  </div>
                  <p className="text-[11px] text-gray-400">Eksekusi webhook realtime</p>
                </div>
              </div>

              {/* RIWAYAT LOG AKTIVITAS AUTOMASI */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-6 bg-white dark:bg-[#18181b] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" /> Riwayat Log Automasi Terkini
                    </h4>
                    <p className="text-xs text-gray-500">
                      Memantau eksekusi balasan komentar dan pengiriman DM secara realtime.
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{logs.length} Log Terakhir</span>
                </div>

                {logs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Belum ada aktivitas automasi yang tercatat. Log akan muncul otomatis saat ada user yang berkomentar di Instagram Anda.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-72 overflow-y-auto">
                    {logs.map((log: any) => (
                      <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            @{log.fromUsername || log.commenterUsername || "user"}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">
                            Komentar: <span className="text-gray-700 dark:text-gray-300 font-medium">"{log.commentText || "-"}"</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.replyCommentStatus === "SENT"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            Komentar: {log.replyCommentStatus || "N/A"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.dmStatus === "SENT"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-white/5 text-gray-500"
                            }`}
                          >
                            DM: {log.dmStatus || "N/A"}
                          </span>
                          <span className="text-gray-400 text-[10px]">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUAT AGEN BARU */}
      {/* ========================================================================= */}
      {isCreateAgentModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Buat Agen Baru
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Beri nama untuk agen otomasi Instagram Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateAgentModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Agen
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="Misal: Agen CS Ruang Creative, Agen Toko Fashion"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                  Setelah agen dibuat, Anda dapat langsung menghubungkan akun Instagram milik agen ini pada tab <strong>Koneksi Akun</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreateAgentModalOpen(false)}
                  disabled={isSubmittingAgent}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAgent || !newAgentName.trim()}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSubmittingAgent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Membuat...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Agen</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UBAH NAMA AGEN */}
      {/* ========================================================================= */}
      {isEditAgentModalOpen && editingAgent && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Ubah Nama Agen
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Perbarui nama tampilan agen ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditAgentModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Agen
                </label>
                <input
                  type="text"
                  value={editAgentName}
                  onChange={(e) => setEditAgentName(e.target.value)}
                  placeholder="Nama agen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditAgentModalOpen(false)}
                  disabled={isSubmittingAgent}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAgent || !editAgentName.trim()}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSubmittingAgent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL STUDIO: BUAT / EDIT OTOMASI BARU (2-COLUMN SPLIT VIEW) */}
      {/* ========================================================================= */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-6xl h-[92vh] max-h-[860px] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Top Header Mobile / Tablet Close */}
            <div className="lg:hidden flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                {editingRule ? "Edit Otomasi" : "Buat Otomasi Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Split Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* LEFT COLUMN: Form Builder (42% Ratio) */}
              <div className="lg:col-span-5 xl:col-span-5 p-6 md:p-8 overflow-y-auto space-y-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10">
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-gray-900 dark:text-white">
                    {editingRule ? "Edit Otomasi" : "Buat Otomasi Baru"}
                  </h2>
                </div>

                <form onSubmit={handleSaveRule} className="space-y-6">
                  {/* 1. Nama Otomasi */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      Nama Otomasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ruleFormData.name}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                      placeholder="COBA"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 dark:focus:ring-white/20 transition-all font-medium"
                    />
                    {!ruleFormData.name.trim() && (
                      <p className="text-[11px] text-rose-500 font-medium">Silakan masukkan nama otomasi</p>
                    )}
                  </div>

                  {/* 2. Target Otomasi */}
                  <div className="relative target-dropdown-container space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      Target Otomasi <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                    >
                      <span className="font-medium">{ruleFormData.targetOtomasi || "Postingan Tertentu"}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTargetDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isTargetDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        {[
                          {
                            category: "Post / Reel",
                            items: ["Postingan Tertentu", "Semua Postingan", "Postingan Berikutnya"],
                          },
                          {
                            category: "Story",
                            items: ["Semua Story", "Story Tertentu", "Story Mention"],
                          },
                          {
                            category: "Live",
                            items: ["Live Instagram"],
                          },
                          {
                            category: "Pesan",
                            items: ["Pesan Instagram"],
                          },
                        ].map((grp) => (
                          <div key={grp.category} className="py-1">
                            <div className="px-4 py-1 text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                              {grp.category}
                            </div>
                            {grp.items.map((item) => {
                              const isSelected = ruleFormData.targetOtomasi === item;
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    setRuleFormData({
                                      ...ruleFormData,
                                      targetOtomasi: item,
                                      postType: item === "Postingan Tertentu" ? "SPECIFIC" : "ALL",
                                    });
                                    setIsTargetDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors ${
                                    isSelected
                                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                  }`}
                                >
                                  <span>{item}</span>
                                  {isSelected && <Check className="w-4 h-4 text-gray-900 dark:text-white stroke-[2.5]" />}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Pilih Postingan (dengan tombol Lihat semua) */}
                  {ruleFormData.targetOtomasi === "Postingan Tertentu" && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Pilih Postingan
                          </label>
                          {isFeedLive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              LIVE FEED META
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAllPostsModal(true)}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Lihat semua
                        </button>
                      </div>

                      {/* 4 Post Thumbnails in a row */}
                      <div className="grid grid-cols-4 gap-2.5">
                        {(feedPosts.length > 0 ? feedPosts.slice(0, 4) : SAMPLE_INSTAGRAM_POSTS.slice(0, 4)).map((post) => {
                          const isSelected = selectedPost?.id === post.id;
                          return (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => {
                                setSelectedPost(post);
                                setRuleFormData({ ...ruleFormData, postId: post.id });
                              }}
                              className={`relative rounded-xl overflow-hidden aspect-[4/5] border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? "border-blue-600 ring-2 ring-blue-500/30 scale-[1.02] shadow-sm"
                                  : "border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 opacity-85 hover:opacity-100"
                              }`}
                              title={post.title || post.caption}
                            >
                              <img
                                src={post.thumb || post.image}
                                alt={post.title || "Post"}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/images/instagram/thumb-1-clean.png";
                                }}
                              />
                              {post.mediaType === "VIDEO" && (
                                <div className="absolute top-1 right-1 bg-black/70 rounded px-1 py-0.5 text-[8px] font-bold text-white">
                                  REEL
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Progressive Disclosure Guide when basic info is not yet filled */}
                  {!isBasicInfoFilled && !editingRule && (
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] text-center space-y-1 animate-in fade-in duration-200">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Lengkapi Nama Otomasi di atas
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Pengaturan pemicu komentar, balasan pesan, dan fitur lanjutan akan terbuka otomatis setelahnya.
                      </p>
                    </div>
                  )}

                  {/* Sections 4, 5, 6: Revealed after Nama & Target are filled */}
                  {(isBasicInfoFilled || editingRule) && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* 4. Trigger Komentar */}
                      <div
                        onClick={() => setActivePreviewTab("COMMENT")}
                        className="space-y-3 pt-2"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Trigger Komentar</h3>
                          <p className="text-xs text-gray-500">Komentar yang akan memicu otomasi</p>
                        </div>

                        <div className="space-y-2.5">
                          {/* Radio Card 1: Kata tertentu */}
                          <div
                            onClick={() => setRuleFormData({ ...ruleFormData, triggerCommentType: "KEYWORDS" })}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              ruleFormData.triggerCommentType === "KEYWORDS"
                                ? "border-blue-500 bg-blue-50/40 dark:bg-blue-500/5 ring-1 ring-blue-500/20"
                                : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                ruleFormData.triggerCommentType === "KEYWORDS"
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-black"
                              }`}>
                                {ruleFormData.triggerCommentType === "KEYWORDS" && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                Kata tertentu
                              </span>
                            </div>

                            {ruleFormData.triggerCommentType === "KEYWORDS" && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="mt-3 pl-7 space-y-2 animate-in fade-in duration-150"
                              >
                                {/* Input Keyword */}
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={ruleFormData.keywords}
                                    onChange={(e) => setRuleFormData({ ...ruleFormData, keywords: e.target.value })}
                                    placeholder="Masukkan kata"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                  />
                                  {!ruleFormData.keywords.trim() && (
                                    <p className="text-[11px] text-rose-500 font-medium">Silakan masukkan kata</p>
                                  )}
                                  <p className="text-[10px] text-gray-400">
                                    Gunakan koma untuk memisahkan beberapa kata
                                  </p>
                                </div>

                                {/* Ubah aturan toggle */}
                                <div className="pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setIsKeywordRuleOpen(!isKeywordRuleOpen)}
                                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                  >
                                    <span>Ubah aturan</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isKeywordRuleOpen ? "rotate-180" : ""}`} />
                                  </button>

                                  {isKeywordRuleOpen && (
                                    <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 space-y-1.5 animate-in fade-in duration-150">
                                      <div className="flex items-center gap-1.5">
                                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                          Aturan
                                        </label>
                                        <div className="group relative inline-flex">
                                          <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help" />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 rounded-lg bg-gray-900 text-white text-[10px] shadow-lg z-50 pointer-events-none">
                                            Pilih logika pencocokan kata: Contains (mengandung kata), Match (persis sama), Starts with (diawali dengan).
                                          </div>
                                        </div>
                                      </div>
                                      <div className="relative keyword-rule-dropdown-container">
                                        <button
                                          type="button"
                                          onClick={() => setIsKeywordRuleDropdownOpen(!isKeywordRuleDropdownOpen)}
                                          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                                        >
                                          <span className="font-medium">{ruleFormData.keywordRule || "Contains"}</span>
                                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isKeywordRuleDropdownOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {isKeywordRuleDropdownOpen && (
                                          <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                            {(["Contains", "Match", "Starts with"] as const).map((ruleOpt) => {
                                              const isSelected = ruleFormData.keywordRule === ruleOpt;
                                              return (
                                                <button
                                                  key={ruleOpt}
                                                  type="button"
                                                  onClick={() => {
                                                    setRuleFormData({ ...ruleFormData, keywordRule: ruleOpt });
                                                    setIsKeywordRuleDropdownOpen(false);
                                                  }}
                                                  className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                                    isSelected
                                                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                                  }`}
                                                >
                                                  <span>{ruleOpt}</span>
                                                  {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                      {/* Radio Card 2: Semua komentar */}
                      <div
                        onClick={() => setRuleFormData({ ...ruleFormData, triggerCommentType: "ALL" })}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          ruleFormData.triggerCommentType === "ALL"
                            ? "border-blue-500 bg-blue-50/40 dark:bg-blue-500/5 ring-1 ring-blue-500/20"
                            : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            ruleFormData.triggerCommentType === "ALL"
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-black"
                          }`}>
                            {ruleFormData.triggerCommentType === "ALL" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            Semua komentar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Pesan yang Dikirim Setelah Komentar */}
                  <div
                    onClick={() => setActivePreviewTab("DM")}
                    className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Pesan yang Dikirim Setelah Komentar
                      </h3>
                    </div>

                    {/* Jenis Pesan */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Jenis Pesan
                        </label>
                        <div className="group relative cursor-pointer">
                          <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-52 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50 text-center pointer-events-none">
                            Pilih format pesan balasan DM: Template Tombol, Teks Biasa, atau Carousel.
                          </div>
                        </div>
                      </div>

                      <div className="relative msg-type-dropdown-container">
                        <button
                          type="button"
                          onClick={() => setIsMsgTypeDropdownOpen(!isMsgTypeDropdownOpen)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                        >
                          <span className="font-medium">
                            {ruleFormData.messageType === "BUTTON_TEMPLATE"
                              ? "Template Tombol"
                              : ruleFormData.messageType === "PLAIN_TEXT"
                              ? "Teks Biasa"
                              : "Carousel"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMsgTypeDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isMsgTypeDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                            {[
                              { value: "BUTTON_TEMPLATE", label: "Template Tombol" },
                              { value: "PLAIN_TEXT", label: "Teks Biasa" },
                              { value: "CAROUSEL", label: "Carousel" },
                            ].map((opt) => {
                              const isSelected = ruleFormData.messageType === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setRuleFormData({
                                      ...ruleFormData,
                                      messageType: opt.value as "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL",
                                    });
                                    setIsMsgTypeDropdownOpen(false);
                                    setActivePreviewTab("DM");
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                  {isSelected && <Check className="w-4 h-4 text-gray-900 dark:text-white stroke-[2.5]" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PESAN & VARIABEL CHIPS (For BUTTON_TEMPLATE & PLAIN_TEXT) */}
                    {ruleFormData.messageType !== "CAROUSEL" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                          Pesan
                        </label>
                        <div className="relative">
                          <textarea
                            rows={4}
                            maxLength={ruleFormData.messageType === "BUTTON_TEMPLATE" ? 640 : 1000}
                            value={ruleFormData.dmMessage}
                            onChange={(e) => setRuleFormData({ ...ruleFormData, dmMessage: e.target.value })}
                            placeholder="Pesan"
                            className="w-full px-3.5 py-2.5 pb-7 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans leading-relaxed"
                          />
                          <div className="absolute right-3 bottom-2 text-[10px] text-gray-400 font-mono">
                            {ruleFormData.dmMessage.length}/{ruleFormData.messageType === "BUTTON_TEMPLATE" ? 640 : 1000}
                          </div>
                        </div>

                        {/* Variabel Buttons - 1 Baris Horizontal Slide */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap py-1">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 shrink-0">Variabel:</span>
                          {[
                            { label: "Nama Depan", token: "{first_name}" },
                            { label: "Nama Belakang", token: "{last_name}" },
                            { label: "Nama Lengkap", token: "{full_name}" },
                            { label: "Nama Pengguna", token: "{username}" },
                          ].map((v) => (
                            <button
                              key={v.token}
                              type="button"
                              onClick={() => {
                                const nextMsg = ruleFormData.dmMessage
                                  ? `${ruleFormData.dmMessage} ${v.token} `
                                  : `${v.token} `;
                                setRuleFormData({ ...ruleFormData, dmMessage: nextMsg });
                              }}
                              className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>

                        {!ruleFormData.dmMessage.trim() && (
                          <p className="text-[11px] text-rose-500 font-medium">Silakan masukkan pesan</p>
                        )}
                      </div>
                    )}

                    {/* TOMBOL CARDS (When BUTTON_TEMPLATE) */}
                    {ruleFormData.messageType === "BUTTON_TEMPLATE" && (
                      <div className="space-y-3 pt-1">
                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                          Tombol
                        </label>

                        {ruleFormData.buttons.map((btn, idx) => (
                          <div
                            key={btn.id}
                            className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3 relative shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                Tombol {idx + 1}
                              </h4>
                              {ruleFormData.buttons.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRuleFormData({
                                      ...ruleFormData,
                                      buttons: ruleFormData.buttons.filter((b) => b.id !== btn.id),
                                    });
                                  }}
                                  className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Pilih Label Tombol (Custom Dropdown) */}
                            <div className="relative button-dropdown-container space-y-1">
                              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                                Pilih Label Tombol
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (openButtonDropdown?.id === btn.id && openButtonDropdown?.type === "label") {
                                    setOpenButtonDropdown(null);
                                  } else {
                                    setOpenButtonDropdown({ id: btn.id, type: "label" });
                                  }
                                }}
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className="font-medium">{btn.labelType || "Kustom"}</span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                                    openButtonDropdown?.id === btn.id && openButtonDropdown?.type === "label" ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {openButtonDropdown?.id === btn.id && openButtonDropdown?.type === "label" && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {(["Klik Disini", "Kustom"] as const).map((labelOpt) => {
                                    const isSelected = (btn.labelType || "Kustom") === labelOpt;
                                    return (
                                      <button
                                        key={labelOpt}
                                        type="button"
                                        onClick={() => {
                                          const nextButtons = [...ruleFormData.buttons];
                                          nextButtons[idx].labelType = labelOpt;
                                          if (labelOpt === "Klik Disini") {
                                            nextButtons[idx].label = "Klik Disini";
                                          }
                                          setRuleFormData({ ...ruleFormData, buttons: nextButtons });
                                          setOpenButtonDropdown(null);
                                        }}
                                        className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{labelOpt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Input Kustom Label if Kustom */}
                            {btn.labelType === "Kustom" && (
                              <div className="space-y-1 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                                    Label Tombol
                                  </label>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {btn.label.length}/80
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  maxLength={80}
                                  value={btn.label}
                                  onChange={(e) => {
                                    const nextButtons = [...ruleFormData.buttons];
                                    nextButtons[idx].label = e.target.value;
                                    setRuleFormData({ ...ruleFormData, buttons: nextButtons });
                                  }}
                                  placeholder="Button 1"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                />
                                {!btn.label.trim() && (
                                  <p className="text-[10px] text-rose-500 font-medium">Silakan masukkan label</p>
                                )}
                              </div>
                            )}

                            {/* Pilih Tindakan (Custom Dropdown) */}
                            <div className="relative button-dropdown-container space-y-1">
                              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                                Pilih Tindakan
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (openButtonDropdown?.id === btn.id && openButtonDropdown?.type === "action") {
                                    setOpenButtonDropdown(null);
                                  } else {
                                    setOpenButtonDropdown({ id: btn.id, type: "action" });
                                  }
                                }}
                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className={`font-medium ${!btn.action ? "text-gray-400" : ""}`}>
                                  {btn.action || "Pilih tindakan"}
                                </span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                                    openButtonDropdown?.id === btn.id && openButtonDropdown?.type === "action" ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {openButtonDropdown?.id === btn.id && openButtonDropdown?.type === "action" && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {[
                                    { value: "Buka Website", label: "Buka Website" },
                                    { value: "Kirim Teks", label: "Kirim Teks" },
                                  ].map((actionOpt) => {
                                    const isSelected = btn.action === actionOpt.value;
                                    return (
                                      <button
                                        key={actionOpt.value}
                                        type="button"
                                        onClick={() => {
                                          const nextButtons = [...ruleFormData.buttons];
                                          nextButtons[idx].action = actionOpt.value as any;
                                          setRuleFormData({ ...ruleFormData, buttons: nextButtons });
                                          setOpenButtonDropdown(null);
                                        }}
                                        className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{actionOpt.label}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              {!btn.action && (
                                <p className="text-[10px] text-rose-500 font-medium">Silakan pilih tindakan</p>
                              )}
                            </div>

                            {/* Masukkan URL if Buka Website */}
                            {btn.action === "Buka Website" && (
                              <div className="space-y-1 animate-in fade-in duration-150">
                                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                                  Masukkan URL
                                </label>
                                <input
                                  type="text"
                                  value={btn.url}
                                  onChange={(e) => {
                                    const nextButtons = [...ruleFormData.buttons];
                                    nextButtons[idx].url = e.target.value;
                                    setRuleFormData({ ...ruleFormData, buttons: nextButtons });
                                  }}
                                  placeholder="https://ruangcreativemuslim.com"
                                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                                />
                                {!btn.url.trim() && (
                                  <p className="text-[10px] text-rose-500 font-medium">Silakan masukkan URL</p>
                                )}
                              </div>
                            )}

                            {/* Masukkan Teks if Kirim Teks */}
                            {btn.action === "Kirim Teks" && (
                              <div className="space-y-1 animate-in fade-in duration-150">
                                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                                  Masukkan Teks
                                </label>
                                <div className="relative">
                                  <textarea
                                    rows={3}
                                    maxLength={1000}
                                    value={btn.text ?? ""}
                                    onChange={(e) => {
                                      const nextButtons = [...ruleFormData.buttons];
                                      nextButtons[idx].text = e.target.value;
                                      setRuleFormData({ ...ruleFormData, buttons: nextButtons });
                                    }}
                                    placeholder="Masukkan teks"
                                    className="w-full px-3 py-2 pb-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium leading-relaxed resize-none"
                                  />
                                  <div className="absolute right-2.5 bottom-1.5 text-[10px] text-gray-400 font-mono">
                                    {(btn.text ?? "").length}/1000
                                  </div>
                                </div>
                                {!(btn.text ?? "").trim() && (
                                  <p className="text-[10px] text-rose-500 font-medium">Silakan masukkan teks</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {ruleFormData.buttons.length < 3 && (
                          <button
                            type="button"
                            onClick={() => {
                              setRuleFormData({
                                ...ruleFormData,
                                buttons: [
                                  ...ruleFormData.buttons,
                                  {
                                    id: `btn_${Date.now()}`,
                                    labelType: "Kustom",
                                    label: `Button ${ruleFormData.buttons.length + 1}`,
                                    action: "Buka Website",
                                    url: "https://ruangcreativemuslim.com",
                                    text: "Terima kasih sudah memilih opsi ini! Ada yang bisa kami bantu lagi?",
                                  },
                                ],
                              });
                            }}
                            className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Tombol Lagi</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* QUICK REPLIES (When PLAIN_TEXT) */}
                    {ruleFormData.messageType === "PLAIN_TEXT" && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                            Quick Reply (Opsional)
                          </label>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {ruleFormData.quickReplies.length}/13
                          </span>
                        </div>

                        {ruleFormData.quickReplies.length > 0 && (
                          <div className="space-y-2">
                            {ruleFormData.quickReplies.map((qr, qIdx) => (
                              <div
                                key={qr.id}
                                className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b]"
                              >
                                <input
                                  type="text"
                                  maxLength={20}
                                  value={qr.text}
                                  onChange={(e) => {
                                    const nextQrs = [...ruleFormData.quickReplies];
                                    nextQrs[qIdx].text = e.target.value;
                                    setRuleFormData({ ...ruleFormData, quickReplies: nextQrs });
                                  }}
                                  placeholder="Ketik quick reply..."
                                  className="flex-1 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 font-medium"
                                />
                                <span className="text-[10px] text-gray-400 font-mono shrink-0">
                                  {qr.text.length}/20
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRuleFormData({
                                      ...ruleFormData,
                                      quickReplies: ruleFormData.quickReplies.filter((q) => q.id !== qr.id),
                                    });
                                  }}
                                  className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-500 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {ruleFormData.quickReplies.length < 13 && (
                          <button
                            type="button"
                            onClick={() => {
                              setRuleFormData({
                                ...ruleFormData,
                                quickReplies: [
                                  ...ruleFormData.quickReplies,
                                  { id: `qr_${Date.now()}`, text: "" },
                                ],
                              });
                            }}
                            className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Quick Reply</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* CAROUSEL SLIDES (When CAROUSEL) */}
                    {ruleFormData.messageType === "CAROUSEL" && (
                      <div className="space-y-4 pt-1">
                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                          Slide Carousel
                        </label>

                        {ruleFormData.carouselSlides.map((slide, slideIdx) => (
                          <div
                            key={slide.id}
                            className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3.5 relative shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                Slide {slideIdx + 1}
                              </h4>
                              {ruleFormData.carouselSlides.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRuleFormData({
                                      ...ruleFormData,
                                      carouselSlides: ruleFormData.carouselSlides.filter((s) => s.id !== slide.id),
                                    });
                                  }}
                                  className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-500 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Gambar Box (1:1 Aspect Ratio) */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block">
                                Gambar (1:1)
                              </label>
                              <div className="w-full aspect-video sm:aspect-square max-h-36 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center text-center p-3 relative overflow-hidden group">
                                {slide.image ? (
                                  <>
                                    <img
                                      src={slide.image}
                                      alt={slide.title || "Slide"}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [...ruleFormData.carouselSlides];
                                          next[slideIdx].image = "";
                                          setRuleFormData({ ...ruleFormData, carouselSlides: next });
                                        }}
                                        className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold"
                                      >
                                        Hapus
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div
                                    onClick={() => {
                                      const next = [...ruleFormData.carouselSlides];
                                      next[slideIdx].image = selectedPost?.image || SAMPLE_INSTAGRAM_POSTS[slideIdx % SAMPLE_INSTAGRAM_POSTS.length].image;
                                      setRuleFormData({ ...ruleFormData, carouselSlides: next });
                                    }}
                                    className="flex flex-col items-center gap-1.5 cursor-pointer"
                                  >
                                    <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">
                                      Pilih Gambar dari Postingan (1:1)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Judul */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                                  Judul
                                </label>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {slide.title.length}/80
                                </span>
                              </div>
                              <input
                                type="text"
                                maxLength={80}
                                value={slide.title}
                                onChange={(e) => {
                                  const next = [...ruleFormData.carouselSlides];
                                  next[slideIdx].title = e.target.value;
                                  setRuleFormData({ ...ruleFormData, carouselSlides: next });
                                }}
                                placeholder="Judul Slide"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                              {!slide.title.trim() && (
                                <p className="text-[10px] text-rose-500 font-medium">Silakan masukkan judul</p>
                              )}
                            </div>

                            {/* Subjudul */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                                  Subjudul (Opsional)
                                </label>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {(slide.subtitle || "").length}/80
                                </span>
                              </div>
                              <input
                                type="text"
                                maxLength={80}
                                value={slide.subtitle}
                                onChange={(e) => {
                                  const next = [...ruleFormData.carouselSlides];
                                  next[slideIdx].subtitle = e.target.value;
                                  setRuleFormData({ ...ruleFormData, carouselSlides: next });
                                }}
                                placeholder="Subjudul Slide"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>

                            {/* Tombol Slide */}
                            <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-white/5">
                              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                                Tombol Slide
                              </label>

                              {slide.buttons.map((btn, bIdx) => (
                                <div
                                  key={btn.id}
                                  className="p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                      Tombol {bIdx + 1}
                                    </span>
                                    {slide.buttons.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [...ruleFormData.carouselSlides];
                                          next[slideIdx].buttons = next[slideIdx].buttons.filter((b) => b.id !== btn.id);
                                          setRuleFormData({ ...ruleFormData, carouselSlides: next });
                                        }}
                                        className="text-gray-400 hover:text-rose-500"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    maxLength={80}
                                    value={btn.label}
                                    onChange={(e) => {
                                      const next = [...ruleFormData.carouselSlides];
                                      next[slideIdx].buttons[bIdx].label = e.target.value;
                                      setRuleFormData({ ...ruleFormData, carouselSlides: next });
                                    }}
                                    placeholder="Label Tombol"
                                    className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white"
                                  />
                                  <input
                                    type="text"
                                    value={btn.url}
                                    onChange={(e) => {
                                      const next = [...ruleFormData.carouselSlides];
                                      next[slideIdx].buttons[bIdx].url = e.target.value;
                                      setRuleFormData({ ...ruleFormData, carouselSlides: next });
                                    }}
                                    placeholder="https://ruangcreativemuslim.com"
                                    className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#202024] text-xs text-gray-900 dark:text-white font-mono"
                                  />
                                </div>
                              ))}

                              {slide.buttons.length < 3 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...ruleFormData.carouselSlides];
                                    next[slideIdx].buttons.push({
                                      id: `slide_btn_${Date.now()}`,
                                      labelType: "Kustom",
                                      label: `Button ${next[slideIdx].buttons.length + 1}`,
                                      action: "Buka Website",
                                      url: "https://ruangcreativemuslim.com",
                                    });
                                    setRuleFormData({ ...ruleFormData, carouselSlides: next });
                                  }}
                                  className="w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-white/20 text-[11px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Tambah Tombol</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {ruleFormData.carouselSlides.length < 10 && (
                          <button
                            type="button"
                            onClick={() => {
                              setRuleFormData({
                                ...ruleFormData,
                                carouselSlides: [
                                  ...ruleFormData.carouselSlides,
                                  {
                                    id: `slide_${Date.now()}`,
                                    image: "",
                                    title: "Slide Baru",
                                    subtitle: "",
                                    buttons: [
                                      {
                                        id: `slide_btn_${Date.now()}`,
                                        labelType: "Kustom",
                                        label: "Button 1",
                                        action: "Buka Website",
                                        url: "https://ruangcreativemuslim.com",
                                      },
                                    ],
                                  },
                                ],
                              });
                            }}
                            className="w-full py-2.5 rounded-xl border border-dashed border-blue-400 dark:border-blue-500/40 hover:border-blue-500 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Slide</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 6. Fitur Tambahan (6 Switch Cards) */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Fitur Tambahan
                    </h3>

                    <div className="space-y-2.5">
                      {/* 1. Follow Up */}
                      <div
                        onClick={() => {
                          if (ruleFormData.featureFollowUp) {
                            setActivePreviewTab("DM");
                          }
                        }}
                        className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">Follow Up</span>
                            <p className="text-[11px] text-gray-500">Kirim pesan follow up secara otomatis</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextVal = !ruleFormData.featureFollowUp;
                              setRuleFormData({ ...ruleFormData, featureFollowUp: nextVal });
                              if (nextVal) {
                                setActivePreviewTab("DM");
                              }
                            }}
                            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                              ruleFormData.featureFollowUp ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-white/15"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                              ruleFormData.featureFollowUp ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {ruleFormData.featureFollowUp && (
                          <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3.5 animate-in fade-in duration-150">
                            {/* Kirim Setelah (Delay Waktu) */}
                            <div className="space-y-1.5 relative follow-up-delay-dropdown-container">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Kirim Setelah
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsFollowUpDelayDropdownOpen(!isFollowUpDelayDropdownOpen)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className="font-medium">{ruleFormData.followUpDelay || "1 Jam"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isFollowUpDelayDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              {isFollowUpDelayDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {(["15 Menit", "1 Jam", "3 Jam", "6 Jam", "12 Jam", "23 Jam"] as const).map((delayOpt) => {
                                    const isSelected = (ruleFormData.followUpDelay || "1 Jam") === delayOpt;
                                    return (
                                      <button
                                        key={delayOpt}
                                        type="button"
                                        onClick={() => {
                                          setRuleFormData({ ...ruleFormData, followUpDelay: delayOpt });
                                          setIsFollowUpDelayDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{delayOpt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Kondisi Pengiriman */}
                            <div className="space-y-1.5 relative follow-up-condition-dropdown-container">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Kondisi Pengiriman
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsFollowUpConditionDropdownOpen(!isFollowUpConditionDropdownOpen)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className="font-medium">{ruleFormData.followUpCondition || "Hanya yang Belum Klik Link"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isFollowUpConditionDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              {isFollowUpConditionDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {(["Semua Penerima", "Hanya yang Belum Klik Link"] as const).map((condOpt) => {
                                    const isSelected = (ruleFormData.followUpCondition || "Hanya yang Belum Klik Link") === condOpt;
                                    return (
                                      <button
                                        key={condOpt}
                                        type="button"
                                        onClick={() => {
                                          setRuleFormData({ ...ruleFormData, followUpCondition: condOpt });
                                          setIsFollowUpConditionDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{condOpt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Jenis Pesan */}
                            <div className="space-y-1.5 relative follow-up-msg-type-dropdown-container">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Jenis Pesan
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsFollowUpMsgTypeDropdownOpen(!isFollowUpMsgTypeDropdownOpen)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className="font-medium">{ruleFormData.followUpMessageType || "Template Tombol"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isFollowUpMsgTypeDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              {isFollowUpMsgTypeDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {(["Template Tombol", "Teks Biasa"] as const).map((typeOpt) => {
                                    const isSelected = (ruleFormData.followUpMessageType || "Template Tombol") === typeOpt;
                                    return (
                                      <button
                                        key={typeOpt}
                                        type="button"
                                        onClick={() => {
                                          setRuleFormData({ ...ruleFormData, followUpMessageType: typeOpt });
                                          setIsFollowUpMsgTypeDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{typeOpt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Pesan */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Pesan
                              </label>
                              <div className="relative">
                                <textarea
                                  rows={3}
                                  maxLength={ruleFormData.followUpMessageType === "Template Tombol" ? 640 : 1000}
                                  value={ruleFormData.followUpMessage}
                                  onChange={(e) => setRuleFormData({ ...ruleFormData, followUpMessage: e.target.value })}
                                  placeholder="Tulis pesan follow up..."
                                  className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                                />
                                <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                                  {ruleFormData.followUpMessage.length}/{ruleFormData.followUpMessageType === "Template Tombol" ? 640 : 1000}
                                </div>
                              </div>
                            </div>

                            {/* Label Tombol (Hanya untuk Template Tombol) */}
                            {ruleFormData.followUpMessageType === "Template Tombol" && (
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                  Label Tombol
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    maxLength={80}
                                    value={ruleFormData.followUpButtonLabel}
                                    onChange={(e) => setRuleFormData({ ...ruleFormData, followUpButtonLabel: e.target.value })}
                                    placeholder="Buka Link Sekarang"
                                    className="w-full px-3.5 py-2 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                  />
                                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                                    {ruleFormData.followUpButtonLabel.length}/80
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. Balasan Komentar */}
                      <div
                        onClick={() => setActivePreviewTab("COMMENT")}
                        className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">Balasan Komentar</span>
                            <p className="text-[11px] text-gray-500">Balas pengguna yang mengomentari postingan Anda</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextVal = !ruleFormData.featureReplyComment;
                              setRuleFormData({ ...ruleFormData, featureReplyComment: nextVal });
                              if (nextVal) {
                                setActivePreviewTab("COMMENT");
                              }
                            }}
                            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                              ruleFormData.featureReplyComment ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-white/15"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                              ruleFormData.featureReplyComment ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {ruleFormData.featureReplyComment && (
                          <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-4 animate-in fade-in duration-150">
                            {/* Tips Box */}
                            <div className="p-3.5 sm:p-4 rounded-xl border border-blue-400/50 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-gray-900 dark:text-white">Tips</div>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Tips bermanfaat untuk menghindari spam</p>
                                </div>
                                <div className="w-5 h-5 rounded-full border border-blue-500 text-blue-500 flex items-center justify-center shrink-0 text-xs font-bold font-serif">
                                  i
                                </div>
                              </div>

                              <ol className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400 list-decimal pl-4 leading-relaxed">
                                <li>Matikan fitur ini ketika konten Anda mendapatkan banyak trafik</li>
                                <li>Ganti secara berkala isi balasan komentar</li>
                                <li>Pastikan balasan komentar pada konten Anda berbeda-beda</li>
                                <li>Balas menggunakan <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">@&#123;username&#125;</code> untuk bisa secara dinamis memanggil username audiens</li>
                                <li>Balas menggunakan format <code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">&#123;option1|option2|option3|dan seterusnya..&#125;</code> untuk membuat variasi balasan dalam 1 input</li>
                              </ol>

                              <div className="flex justify-end pt-0.5">
                                <a
                                  href="https://help.instagram.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Panduan</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>

                            {/* Limit Dropdown */}
                            <div className="space-y-1.5 relative comment-limit-dropdown-container">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Limit
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCommentLimitDropdownOpen(!isCommentLimitDropdownOpen)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className="font-medium">{ruleFormData.commentReplyLimit || "Tak Terbatas"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isCommentLimitDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              {isCommentLimitDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {(["Tak Terbatas", "1 Kali per Pengguna", "2 Kali per Pengguna"] as const).map((limitOpt) => {
                                    const isSelected = (ruleFormData.commentReplyLimit || "Tak Terbatas") === limitOpt;
                                    return (
                                      <button
                                        key={limitOpt}
                                        type="button"
                                        onClick={() => {
                                          setRuleFormData({ ...ruleFormData, commentReplyLimit: limitOpt });
                                          setIsCommentLimitDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{limitOpt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Pesan (Variasi Balasan Komentar) */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                  Pesan
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const variations = [...ruleFormData.commentReplyVariations];
                                    if (variations.length === 0) {
                                      variations.push("@{username} ");
                                    } else {
                                      const lastIdx = variations.length - 1;
                                      variations[lastIdx] = `${variations[lastIdx]} @{username} `;
                                    }
                                    setRuleFormData({
                                      ...ruleFormData,
                                      commentReplyVariations: variations,
                                      replyCommentTemplates: variations[0] || "",
                                    });
                                  }}
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                  Tambah @mention
                                </button>
                              </div>

                              <div className="space-y-2">
                                {ruleFormData.commentReplyVariations.map((text, vIdx) => (
                                  <div key={vIdx} className="relative flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={text}
                                      onChange={(e) => {
                                        const nextVariations = [...ruleFormData.commentReplyVariations];
                                        nextVariations[vIdx] = e.target.value;
                                        setRuleFormData({
                                          ...ruleFormData,
                                          commentReplyVariations: nextVariations,
                                          replyCommentTemplates: nextVariations[0] || "",
                                        });
                                      }}
                                      placeholder="Pesan balasan komentar..."
                                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                    />
                                    {ruleFormData.commentReplyVariations.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextVariations = ruleFormData.commentReplyVariations.filter((_, idx) => idx !== vIdx);
                                          setRuleFormData({
                                            ...ruleFormData,
                                            commentReplyVariations: nextVariations,
                                            replyCommentTemplates: nextVariations[0] || "",
                                          });
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                                        title="Hapus variasi"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {ruleFormData.commentReplyVariations.length < 5 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRuleFormData({
                                      ...ruleFormData,
                                      commentReplyVariations: [
                                        ...ruleFormData.commentReplyVariations,
                                        "Terima kasih sudah komen! Cek DM ya kak! 🙌",
                                      ],
                                    });
                                  }}
                                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Tambah variasi balasan</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Pesan Pembuka */}
                      <div
                        onClick={() => setActivePreviewTab("DM")}
                        className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">Pesan Pembuka</span>
                            <p className="text-[11px] text-gray-500">Kirim pesan pertama ke pengguna</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextVal = !ruleFormData.featureWelcomeMessage;
                              setRuleFormData({
                                ...ruleFormData,
                                featureWelcomeMessage: nextVal,
                                ...(nextVal ? {} : { featureAskForFollow: false }),
                              });
                              if (nextVal) {
                                setActivePreviewTab("DM");
                              }
                            }}
                            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                              ruleFormData.featureWelcomeMessage ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-white/15"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                              ruleFormData.featureWelcomeMessage ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {ruleFormData.featureWelcomeMessage && (
                          <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3.5 animate-in fade-in duration-150">
                            {/* Jenis Pesan */}
                            <div className="space-y-1.5 relative welcome-msg-type-dropdown-container">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Jenis Pesan
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsWelcomeMsgTypeDropdownOpen(!isWelcomeMsgTypeDropdownOpen)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className="font-medium">{ruleFormData.welcomeMessageType || "Template Tombol"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isWelcomeMsgTypeDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              {isWelcomeMsgTypeDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {(["Template Tombol", "Teks Biasa"] as const).map((typeOpt) => {
                                    const isSelected = (ruleFormData.welcomeMessageType || "Template Tombol") === typeOpt;
                                    return (
                                      <button
                                        key={typeOpt}
                                        type="button"
                                        onClick={() => {
                                          setRuleFormData({ ...ruleFormData, welcomeMessageType: typeOpt });
                                          setIsWelcomeMsgTypeDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{typeOpt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Pesan */}
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Pesan
                              </label>
                              <div className="relative">
                                <textarea
                                  rows={3}
                                  maxLength={ruleFormData.welcomeMessageType === "Template Tombol" ? 640 : 1000}
                                  value={ruleFormData.welcomeMessage}
                                  onChange={(e) => setRuleFormData({ ...ruleFormData, welcomeMessage: e.target.value })}
                                  placeholder="Ketik pesan pembuka..."
                                  className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium leading-relaxed resize-none"
                                />
                                <div className="absolute right-2.5 bottom-1.5 text-[10px] text-gray-400 font-mono">
                                  {ruleFormData.welcomeMessage.length}/{ruleFormData.welcomeMessageType === "Template Tombol" ? 640 : 1000}
                                </div>
                              </div>
                            </div>

                            {/* Label Tombol (only when Template Tombol) */}
                            {ruleFormData.welcomeMessageType === "Template Tombol" && (
                              <div className="space-y-1 animate-in fade-in duration-150">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                  Label Tombol
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    maxLength={80}
                                    value={ruleFormData.welcomeButtonLabel}
                                    onChange={(e) => setRuleFormData({ ...ruleFormData, welcomeButtonLabel: e.target.value })}
                                    placeholder="Ya, Saya Mau!"
                                    className="w-full px-3.5 py-2 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                  />
                                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                                    {ruleFormData.welcomeButtonLabel.length}/80
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 4. Ask For Follow */}
                      <div
                        onClick={() => {
                          if (ruleFormData.featureWelcomeMessage && ruleFormData.featureAskForFollow) {
                            setActivePreviewTab("DM");
                          }
                        }}
                        className={`p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3 transition-all ${
                          !ruleFormData.featureWelcomeMessage ? "opacity-60" : "opacity-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">Ask For Follow</span>
                              {!ruleFormData.featureWelcomeMessage && (
                                <span className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  Perlu Pesan Pembuka
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500">Minta pengguna untuk mengikuti akun Anda</p>
                          </div>
                          <button
                            type="button"
                            disabled={!ruleFormData.featureWelcomeMessage}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!ruleFormData.featureWelcomeMessage) {
                                showToast("info", "Aktifkan Pesan Pembuka terlebih dahulu");
                                return;
                              }
                              const nextVal = !ruleFormData.featureAskForFollow;
                              setRuleFormData({ ...ruleFormData, featureAskForFollow: nextVal });
                              if (nextVal) {
                                setActivePreviewTab("DM");
                                setSimulatedFollowStep("GATE");
                              }
                            }}
                            title={!ruleFormData.featureWelcomeMessage ? "Aktifkan Pesan Pembuka terlebih dahulu" : undefined}
                            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                              !ruleFormData.featureWelcomeMessage
                                ? "bg-gray-200 dark:bg-white/10 cursor-not-allowed opacity-50"
                                : ruleFormData.featureAskForFollow
                                ? "bg-gray-900 dark:bg-white cursor-pointer"
                                : "bg-gray-200 dark:bg-white/15 cursor-pointer"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                              ruleFormData.featureAskForFollow && ruleFormData.featureWelcomeMessage ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {ruleFormData.featureWelcomeMessage && ruleFormData.featureAskForFollow && (
                          <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3.5 animate-in fade-in duration-150">
                            {/* Jenis Pesan */}
                            <div className="space-y-1.5 relative ask-follow-msg-type-dropdown-container">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Jenis Pesan
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsAskForFollowMsgTypeDropdownOpen(!isAskForFollowMsgTypeDropdownOpen)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className="font-medium">{ruleFormData.askForFollowMessageType || "Template Tombol"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isAskForFollowMsgTypeDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              {isAskForFollowMsgTypeDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {(["Template Tombol", "Teks Biasa"] as const).map((typeOpt) => {
                                    const isSelected = (ruleFormData.askForFollowMessageType || "Template Tombol") === typeOpt;
                                    return (
                                      <button
                                        key={typeOpt}
                                        type="button"
                                        onClick={() => {
                                          setRuleFormData({ ...ruleFormData, askForFollowMessageType: typeOpt });
                                          setIsAskForFollowMsgTypeDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{typeOpt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Pesan Utama */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Pesan
                              </label>
                              <div className="relative">
                                <textarea
                                  rows={4}
                                  maxLength={ruleFormData.askForFollowMessageType === "Template Tombol" ? 640 : 1000}
                                  value={ruleFormData.askForFollowMessage}
                                  onChange={(e) => setRuleFormData({ ...ruleFormData, askForFollowMessage: e.target.value })}
                                  placeholder="Tulis pesan ajakan follow..."
                                  className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                                />
                                <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                                  {ruleFormData.askForFollowMessage.length}/{ruleFormData.askForFollowMessageType === "Template Tombol" ? 640 : 1000}
                                </div>
                              </div>
                            </div>

                            {/* Label Tombol (Hanya untuk Template Tombol) */}
                            {ruleFormData.askForFollowMessageType === "Template Tombol" && (
                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                  Label Tombol
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    maxLength={80}
                                    value={ruleFormData.askForFollowButtonLabel}
                                    onChange={(e) => setRuleFormData({ ...ruleFormData, askForFollowButtonLabel: e.target.value })}
                                    placeholder="Udah follow 🙌"
                                    className="w-full px-3.5 py-2 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                  />
                                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                                    {ruleFormData.askForFollowButtonLabel.length}/80
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Masih belum mengikuti? (+ Tambah Pesan / Pesan ke-2) */}
                            {ruleFormData.askForFollowHasRetry ? (
                              <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between">
                                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Pesan
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setRuleFormData({ ...ruleFormData, askForFollowHasRetry: false })}
                                    className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus pesan pengingat"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="relative">
                                  <textarea
                                    rows={4}
                                    maxLength={ruleFormData.askForFollowMessageType === "Template Tombol" ? 640 : 1000}
                                    value={ruleFormData.askForFollowRetryMessage}
                                    onChange={(e) => setRuleFormData({ ...ruleFormData, askForFollowRetryMessage: e.target.value })}
                                    placeholder="Ih kayaknya masih belum follow beneran nih 😅..."
                                    className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                                  />
                                  <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                                    {ruleFormData.askForFollowRetryMessage.length}/{ruleFormData.askForFollowMessageType === "Template Tombol" ? 640 : 1000}
                                  </div>
                                </div>

                                {ruleFormData.askForFollowMessageType === "Template Tombol" && (
                                  <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                      Label Tombol
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="text"
                                        maxLength={80}
                                        value={ruleFormData.askForFollowRetryButtonLabel}
                                        onChange={(e) => setRuleFormData({ ...ruleFormData, askForFollowRetryButtonLabel: e.target.value })}
                                        placeholder="Udah follow 🙌"
                                        className="w-full px-3.5 py-2 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                      />
                                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                                        {ruleFormData.askForFollowRetryButtonLabel.length}/80
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="pt-2 space-y-2">
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                  Masih belum mengikuti?
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setRuleFormData({ ...ruleFormData, askForFollowHasRetry: true })}
                                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Tambah Pesan</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 5. Ask for Contact */}
                      <div
                        onClick={() => {
                          if (ruleFormData.featureAskForContact) {
                            setActivePreviewTab("DM");
                          }
                        }}
                        className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">Ask for Contact</span>
                            <p className="text-[11px] text-gray-500">Kumpulkan email atau nomor WhatsApp sebelum mengirim konten</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextVal = !ruleFormData.featureAskForContact;
                              setRuleFormData({ ...ruleFormData, featureAskForContact: nextVal });
                              if (nextVal) {
                                setActivePreviewTab("DM");
                              }
                            }}
                            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                              ruleFormData.featureAskForContact ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-white/15"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                              ruleFormData.featureAskForContact ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {ruleFormData.featureAskForContact && (
                          <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3.5 animate-in fade-in duration-150">
                            {/* Data yang Diminta */}
                            <div className="space-y-1.5 relative ask-contact-type-dropdown-container">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Data yang Diminta
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsAskContactTypeDropdownOpen(!isAskContactTypeDropdownOpen)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-between hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer"
                              >
                                <span className="font-medium">{ruleFormData.askContactType || "Email Saja"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isAskContactTypeDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              {isAskContactTypeDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                  {(["Email Saja", "Nomor WhatsApp Saja", "Email & WhatsApp"] as const).map((typeOpt) => {
                                    const isSelected = (ruleFormData.askContactType || "Email Saja") === typeOpt;
                                    return (
                                      <button
                                        key={typeOpt}
                                        type="button"
                                        onClick={() => {
                                          setRuleFormData({
                                            ...ruleFormData,
                                            askContactType: typeOpt,
                                            askContactMessage: typeOpt === "Nomor WhatsApp Saja"
                                              ? "Sip! Biar aksesnya langsung terkirim ke WhatsApp kamu, boleh ketik nomor WhatsApp aktif kamu di bawah ini ya 👇"
                                              : "Sip! Biar aksesnya langsung terkirim dan tersimpan aman di inbox kamu, boleh ketik Email aktif kamu di bawah ini ya 👇",
                                          });
                                          setIsAskContactTypeDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                          isSelected
                                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                      >
                                        <span>{typeOpt}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-gray-900 dark:text-white stroke-[2.5]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Pesan Permintaan Kontak */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Pesan Permintaan Kontak
                              </label>
                              <div className="relative">
                                <textarea
                                  rows={3}
                                  maxLength={640}
                                  value={ruleFormData.askContactMessage}
                                  onChange={(e) => setRuleFormData({ ...ruleFormData, askContactMessage: e.target.value })}
                                  placeholder="Ketik pesan permintaan kontak..."
                                  className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                                />
                                <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                                  {ruleFormData.askContactMessage.length}/640
                                </div>
                              </div>
                            </div>

                            {/* Pesan Jika Format Salah */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                                Pesan Jika Format Salah
                              </label>
                              <div className="relative">
                                <textarea
                                  rows={3}
                                  maxLength={640}
                                  value={ruleFormData.askContactInvalidMessage}
                                  onChange={(e) => setRuleFormData({ ...ruleFormData, askContactInvalidMessage: e.target.value })}
                                  placeholder="Ketik pesan perbaikan format..."
                                  className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-normal resize-none"
                                />
                                <div className="absolute right-2.5 bottom-2 text-[10px] text-gray-400 font-mono">
                                  {ruleFormData.askContactInvalidMessage.length}/640
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 6. Aktifkan Link Tracking */}
                      <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">Aktifkan Link Tracking</span>
                          <p className="text-[11px] text-gray-500">Untuk statistik</p>
                          <p className="text-[10px] text-gray-400">Hanya untuk jenis pesan Tombol atau Carousel</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRuleFormData({ ...ruleFormData, featureLinkTracking: !ruleFormData.featureLinkTracking })}
                          className={`w-10 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                            ruleFormData.featureLinkTracking ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-white/15"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white dark:bg-black shadow-sm transition-transform ${
                            ruleFormData.featureLinkTracking ? "translate-x-4" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
              </div>

              {/* RIGHT COLUMN: Pratinjau (58% Ratio - iPhone 16 Pro Titanium Style) */}
              <div className="lg:col-span-7 xl:col-span-7 bg-gray-50/70 dark:bg-black/30 p-5 md:p-6 flex flex-col justify-between overflow-y-auto">
                {/* Header Pratinjau */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200/60 dark:border-white/5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Pratinjau
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRuleModalOpen(false)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRule}
                      disabled={isPending || !ruleFormData.name.trim()}
                      className="px-4 py-1.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs font-bold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? "Menyimpan..." : editingRule ? "Simpan Perubahan" : "Buat Otomasi"}
                    </button>
                  </div>
                </div>

                {/* Switcher Tab Pratinjau: Postingan & Komentar vs Pesan DM */}
                <div className="flex items-center justify-center pt-2 pb-1">
                  <div className="p-1 rounded-xl bg-gray-200/80 dark:bg-white/10 flex items-center gap-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab("COMMENT")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activePreviewTab === "COMMENT"
                          ? "bg-white dark:bg-[#18181b] text-gray-900 dark:text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      Postingan & Komentar
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab("DM")}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activePreviewTab === "DM"
                          ? "bg-white dark:bg-[#18181b] text-gray-900 dark:text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      Pesan DM
                    </button>
                  </div>
                </div>

                {/* iPhone 16 Pro Mockup Chassis */}
                <div className="my-auto py-3">
                  <div className="w-[285px] sm:w-[295px] h-[585px] mx-auto rounded-[52px] p-[6px] bg-gradient-to-b from-[#38383e] via-[#1c1c1f] to-[#121214] ring-1 ring-white/20 shadow-2xl relative select-none">
                    {/* Left Hardware Buttons */}
                    <div className="w-[3px] h-3.5 bg-gray-600 rounded-l absolute -left-[3px] top-24" />
                    <div className="w-[3px] h-8 bg-gray-600 rounded-l absolute -left-[3px] top-32" />
                    <div className="w-[3px] h-8 bg-gray-600 rounded-l absolute -left-[3px] top-42" />
                    {/* Right Hardware Button */}
                    <div className="w-[3px] h-12 bg-gray-600 rounded-r absolute -right-[3px] top-32" />

                    {/* Screen Inner Container */}
                    <div className="w-full h-full bg-white dark:bg-black rounded-[46px] overflow-hidden flex flex-col relative border border-black/80 text-gray-900 dark:text-white">
                      {/* Dynamic Island Floating Notch */}
                      <div className="w-24 h-6 bg-black rounded-full mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-end pr-2.5 shadow-md">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#18181b] ring-1 ring-white/10" />
                      </div>

                      {/* Status Bar */}
                      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-gray-900 dark:text-white shrink-0 z-20">
                        <span>10:03</span>
                        <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                          <Wifi className="w-3.5 h-3.5" />
                          <div className="w-4 h-2.5 border border-current rounded-xs p-0.5 flex items-center relative">
                            <div className="w-full h-full bg-current rounded-2xs" />
                          </div>
                        </div>
                      </div>

                      {activePreviewTab === "DM" ? (
                        /* INSTAGRAM DM CHAT VIEW */
                        <div className="flex-1 flex flex-col overflow-hidden pt-2 relative bg-white dark:bg-black">
                          {/* Instagram DM Top Header */}
                          <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-gray-100 dark:border-white/5 shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                type="button"
                                onClick={() => setActivePreviewTab("COMMENT")}
                                className="text-gray-800 dark:text-gray-200 hover:opacity-70 transition-opacity cursor-pointer p-0.5"
                                title="Lihat Postingan"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5 shrink-0 overflow-hidden shadow-2xs">
                                <img
                                  src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                  alt={account?.username || "ruangcreativemuslim"}
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="block font-bold text-xs text-gray-900 dark:text-white truncate leading-tight">
                                  {currentAgent?.name || "Harits | Faceless Cor"}
                                </span>
                                <span className="block text-[10px] text-gray-400 truncate -mt-0.5 font-medium">
                                  @{account?.username || "ruangcreativemuslim"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200 shrink-0">
                              <Phone className="w-4 h-4 cursor-pointer hover:opacity-70" />
                              <Video className="w-4 h-4 cursor-pointer hover:opacity-70" />
                            </div>
                          </div>

                          {/* Scrollable Chat Area */}
                          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs bg-gray-50/50 dark:bg-[#121214]">
                            {/* Centered Trigger Notification Badge */}
                            <div className="flex justify-center pt-1">
                              <span className="px-3 py-1 rounded-full bg-gray-200/90 dark:bg-white/10 text-[10px] font-medium text-gray-600 dark:text-gray-300 shadow-2xs text-center">
                                User commented on your post
                              </span>
                            </div>

                            {/* 0. PESAN PEMBUKA (Icebreaker / Welcome Message) */}
                            {ruleFormData.featureWelcomeMessage && (
                              <>
                                {/* Bot Welcome Message */}
                                <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                                    <img
                                      src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                      alt="Profile"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                      }}
                                    />
                                  </div>

                                  <div className="flex-1 max-w-[85%] space-y-2">
                                    {ruleFormData.welcomeMessageType === "Template Tombol" ? (
                                      <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs">
                                        <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                          {resolvePreviewVariables(ruleFormData.welcomeMessage || "Akses nya udah kita buatin nihh!!\n\nMau? ✨")}
                                        </div>
                                        <div className="pt-0.5">
                                          <div className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#2a2a2e] border border-gray-200/80 dark:border-white/10 shadow-2xs text-center text-xs font-semibold text-gray-900 dark:text-white truncate">
                                            {ruleFormData.welcomeButtonLabel || "Ya, Saya Mau!"}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs">
                                        <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                          {resolvePreviewVariables(ruleFormData.welcomeMessage || "Halo! Terima kasih sudah berkomentar.")}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* User Simulated Response to Welcome Button (Right - Balon Ungu) */}
                                {ruleFormData.welcomeMessageType === "Template Tombol" && (
                                  <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                    <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                                      {ruleFormData.welcomeButtonLabel || "Ya, Saya Mau!"}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* 1. ASK FOR FOLLOW (Gatekeeper Message) */}
                            {ruleFormData.featureWelcomeMessage && ruleFormData.featureAskForFollow && (
                              <>
                                {/* Bot Ask For Follow Message Bubble */}
                                <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                                    <img
                                      src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                      alt="Profile"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                      }}
                                    />
                                  </div>

                                  <div className="flex-1 max-w-[85%] space-y-2">
                                    {ruleFormData.askForFollowMessageType === "Template Tombol" ? (
                                      <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs">
                                        <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                          {resolvePreviewVariables(ruleFormData.askForFollowMessage || "Btw, kayaknya kamu belum follow akun ini nih, sistemnya kita cuma bisa ngasih khusus untuk followers aja.\n\nKalo mau, follow dulu ya dan klik \"Udah Follow\" nanti dikirimin aksesnya")}
                                        </div>
                                        <div className="pt-0.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (ruleFormData.askForFollowHasRetry && simulatedFollowStep === "GATE") {
                                                setSimulatedFollowStep("RETRY");
                                              } else {
                                                setSimulatedFollowStep("VERIFIED");
                                              }
                                            }}
                                            className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#2a2a2e] border border-gray-200/80 dark:border-white/10 shadow-2xs text-center text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer truncate"
                                          >
                                            {ruleFormData.askForFollowButtonLabel || "Udah follow 🙌"}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs">
                                        <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                          {resolvePreviewVariables(ruleFormData.askForFollowMessage || "Btw, kayaknya kamu belum follow akun ini nih...")}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Step: RETRY (Pengguna klik tombol tapi disimulasikan belum follow) */}
                                {simulatedFollowStep === "RETRY" && (
                                  <>
                                    {/* User Simulated Response */}
                                    <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                      <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                                        {ruleFormData.askForFollowButtonLabel || "Udah follow 🙌"}
                                      </div>
                                    </div>

                                    {/* Bot Retry Message */}
                                    <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                                        <img
                                          src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                          alt="Profile"
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                          }}
                                        />
                                      </div>

                                      <div className="flex-1 max-w-[85%] space-y-2">
                                        {ruleFormData.askForFollowMessageType === "Template Tombol" ? (
                                          <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs">
                                            <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                              {resolvePreviewVariables(ruleFormData.askForFollowRetryMessage || "Ih kayaknya masih belum follow beneran nih 😅\n\nCoba follow dulu ya ke profile, kalo udah nanti klik \"Udah Follow\"")}
                                            </div>
                                            <div className="pt-0.5">
                                              <button
                                                type="button"
                                                onClick={() => setSimulatedFollowStep("VERIFIED")}
                                                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#2a2a2e] border border-gray-200/80 dark:border-white/10 shadow-2xs text-center text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer truncate"
                                              >
                                                {ruleFormData.askForFollowRetryButtonLabel || "Udah follow 🙌"}
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs">
                                            <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                              {resolvePreviewVariables(ruleFormData.askForFollowRetryMessage || "Ih kayaknya masih belum follow beneran nih 😅...")}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* Step: VERIFIED (Setelah Follow Terverifikasi) */}
                                {simulatedFollowStep === "VERIFIED" && (
                                  <>
                                    <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                      <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                                        {ruleFormData.askForFollowHasRetry ? (ruleFormData.askForFollowRetryButtonLabel || "Udah follow 🙌") : (ruleFormData.askForFollowButtonLabel || "Udah follow 🙌")}
                                      </div>
                                    </div>
                                    <div className="flex justify-center pt-0.5 pb-1">
                                      <button
                                        type="button"
                                        onClick={() => setSimulatedFollowStep("GATE")}
                                        className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        <RefreshCw className="w-2.5 h-2.5" />
                                        <span>Ulangi Simulasi Follow</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </>
                            )}

                            {/* 2. Bot Main Message (Hanya tampil jika tidak ada Ask For Follow, atau sudah lolos Verifikasi Follow) */}
                            {(!ruleFormData.featureWelcomeMessage || !ruleFormData.featureAskForFollow || simulatedFollowStep === "VERIFIED") && (
                              <>
                                {/* Ask for Contact Gate (Jika aktif) */}
                                {ruleFormData.featureAskForContact && (
                                  <>
                                    <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                                        <img
                                          src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                          alt="Profile"
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                          }}
                                        />
                                      </div>
                                      <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs max-w-[85%]">
                                        <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                          {resolvePreviewVariables(ruleFormData.askContactMessage || "Sip! Biar aksesnya langsung terkirim dan tersimpan aman di inbox kamu, boleh ketik Email aktif kamu di bawah ini ya 👇")}
                                        </div>
                                      </div>
                                    </div>

                                    {/* User Response to Ask for Contact (Purple Pill) */}
                                    <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                      <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                                        {ruleFormData.askContactType === "Nomor WhatsApp Saja" ? "+62 812-3456-7890" : "budi@gmail.com"}
                                      </div>
                                    </div>
                                  </>
                                )}

                                <div className="flex items-start gap-2 pt-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                  {/* Small Avatar on left */}
                                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                                    <img
                                      src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                      alt="Profile"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                      }}
                                    />
                                  </div>

                                  {/* Message Content Bubble */}
                                  <div className="flex-1 max-w-[85%] space-y-2">
                                    {/* 1. BUTTON TEMPLATE VIEW */}
                                    {ruleFormData.messageType === "BUTTON_TEMPLATE" && (
                                      <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs max-w-[85%]">
                                        <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                          {resolvePreviewVariables(ruleFormData.dmMessage || "Halo {first_name}! Terima kasih sudah tertarik.")}
                                        </div>

                                        {ruleFormData.buttons && ruleFormData.buttons.length > 0 && (
                                          <div className="space-y-1.5 pt-0.5">
                                            {ruleFormData.buttons.map((btn, bIdx) => {
                                              const isBtnActive = activeSimulatedButton?.id === btn.id;
                                              return (
                                                <button
                                                  key={btn.id || bIdx}
                                                  type="button"
                                                  onClick={() => setSimulatedButtonId(btn.id)}
                                                  className={`w-full py-2 px-3 rounded-xl border shadow-2xs text-center text-xs font-semibold transition-all cursor-pointer truncate ${
                                                    isBtnActive
                                                      ? "bg-white dark:bg-[#2a2a2e] border-purple-500/50 ring-1 ring-purple-500/30 text-purple-700 dark:text-purple-300"
                                                      : "bg-white dark:bg-[#2a2a2e] border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                                  }`}
                                                >
                                                  {btn.labelType === "Klik Disini" ? "Klik Disini" : btn.label || `Button ${bIdx + 1}`}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* 2. PLAIN TEXT VIEW */}
                                    {ruleFormData.messageType === "PLAIN_TEXT" && (
                                      <div className="space-y-2">
                                        <div className="p-3 rounded-2xl rounded-tl-xs bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white text-xs leading-relaxed shadow-xs whitespace-pre-wrap break-words">
                                          {resolvePreviewVariables(ruleFormData.dmMessage || "Halo {first_name}! Terima kasih sudah tertarik.")}
                                        </div>

                                        {/* Quick Replies chips */}
                                        {ruleFormData.quickReplies && ruleFormData.quickReplies.length > 0 && (
                                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                                            {ruleFormData.quickReplies.map((qr) => (
                                              <span
                                                key={qr.id}
                                                className="px-2.5 py-1 rounded-full border border-blue-500/40 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-500/10 shrink-0 shadow-2xs"
                                              >
                                                {qr.text || "Quick Reply"}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* 3. CAROUSEL VIEW */}
                                    {ruleFormData.messageType === "CAROUSEL" && (
                                      <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-none -mr-2 pr-2">
                                        {ruleFormData.carouselSlides.map((slide, sIdx) => (
                                          <div
                                            key={slide.id || sIdx}
                                            className="w-44 shrink-0 rounded-2xl bg-white dark:bg-[#202024] border border-gray-200 dark:border-white/10 shadow-xs overflow-hidden flex flex-col"
                                          >
                                            <div className="w-full aspect-square bg-gray-100 dark:bg-white/5 overflow-hidden">
                                              <img
                                                src={slide.image || selectedPost?.image || SAMPLE_INSTAGRAM_POSTS[sIdx % SAMPLE_INSTAGRAM_POSTS.length].image}
                                                alt={slide.title || "Slide"}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                            <div className="p-2.5 space-y-0.5 flex-1">
                                              <h5 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                                {slide.title || "Judul Slide"}
                                              </h5>
                                              <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
                                                {slide.subtitle || "Subjudul slide"}
                                              </p>
                                            </div>
                                            {slide.buttons && slide.buttons.length > 0 && (
                                              <div className="border-t border-gray-200 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
                                                {slide.buttons.map((sBtn, sbIdx) => (
                                                  <div
                                                    key={sBtn.id || sbIdx}
                                                    className="py-1.5 px-2 text-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate"
                                                  >
                                                    {sBtn.label || `Button ${sbIdx + 1}`}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* User Simulated Response Bubble (Right - Balon Ungu) */}
                                {ruleFormData.messageType === "BUTTON_TEMPLATE" && activeSimulatedButton && activeSimulatedButton.action === "Kirim Teks" && (
                                  <>
                                    <div className="flex justify-end pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                      <div className="px-3.5 py-1.5 rounded-2xl rounded-tr-xs bg-[#7048e8] text-white text-xs font-semibold shadow-xs max-w-[75%] break-words">
                                        {activeSimulatedButton.labelType === "Klik Disini" ? "Klik Disini" : (activeSimulatedButton.label || "Klik")}
                                      </div>
                                    </div>

                                    {/* Bot Follow-up Message Bubble (Left, with Avatar) */}
                                    <div className="flex items-start gap-2 pt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                                        <img
                                          src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                          alt="Profile"
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                          }}
                                        />
                                      </div>
                                      <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 px-3.5 py-2 text-xs leading-relaxed text-gray-900 dark:text-white shadow-xs max-w-[80%] whitespace-pre-wrap break-words font-medium">
                                        {resolvePreviewVariables(activeSimulatedButton.text || "Terima kasih sudah tertarik! Ini info detail balasan dari kami.")}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* 3. FOLLOW UP MESSAGE (Jika aktif) */}
                                {ruleFormData.featureFollowUp && (
                                  <div className="pt-2 space-y-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                    {/* Delay Time Pill */}
                                    <div className="flex justify-center">
                                      <span className="px-2.5 py-0.5 rounded-full bg-gray-200/90 dark:bg-white/10 text-[9px] font-semibold text-gray-600 dark:text-gray-300 shadow-2xs text-center flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span>{ruleFormData.followUpDelay || "1 Jam"} kemudian...</span>
                                      </span>
                                    </div>

                                    {/* Bot Follow Up Bubble */}
                                    <div className="flex items-start gap-2 pt-0.5">
                                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-white/10">
                                        <img
                                          src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                          alt="Profile"
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                          }}
                                        />
                                      </div>

                                      <div className="flex-1 max-w-[85%] space-y-2">
                                        {ruleFormData.followUpMessageType === "Template Tombol" ? (
                                          <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 space-y-2.5 shadow-2xs">
                                            <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                              {resolvePreviewVariables(ruleFormData.followUpMessage || "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala atau mau tanya-tanya bilang ya 😉")}
                                            </div>
                                            <div className="pt-0.5">
                                              <div className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#2a2a2e] border border-gray-200/80 dark:border-white/10 shadow-2xs text-center text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                {ruleFormData.followUpButtonLabel || "Buka Link Sekarang"}
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-[#202024] border border-gray-200/80 dark:border-white/10 p-3 shadow-2xs">
                                            <div className="text-xs leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap break-words font-medium">
                                              {resolvePreviewVariables(ruleFormData.followUpMessage || "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum?...")}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Instagram DM Bottom Bar */}
                          <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-black shrink-0">
                            {/* Purple Camera Circle */}
                            <button
                              type="button"
                              className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>

                            {/* Pill Input Bar */}
                            <div className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#202024] text-xs text-gray-400">
                              <span className="text-[11px]">Message...</span>
                              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Mic className="w-3.5 h-3.5 hover:text-gray-900 dark:hover:text-white cursor-pointer" />
                                <ImageIcon className="w-3.5 h-3.5 hover:text-gray-900 dark:hover:text-white cursor-pointer" />
                                <Plus className="w-3.5 h-3.5 hover:text-gray-900 dark:hover:text-white cursor-pointer" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* POSTINGAN VIEW */
                        <div className="flex-1 flex flex-col overflow-hidden pt-2 relative">
                        {/* Instagram App Top Header */}
                        <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-100 dark:border-white/5 shrink-0">
                          <ArrowLeft className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                          <div className="text-center">
                            <span className="text-[10px] text-gray-400 block -mb-0.5 font-medium">
                              {account?.username || "ruangcreativemuslim"}
                            </span>
                            <span className="text-xs font-bold">
                              {ruleFormData.targetOtomasi.includes("Story") ? "Story" : "Postingan"}
                            </span>
                          </div>
                          <div className="w-4" />
                        </div>

                        {/* Scrollable Post Content */}
                        <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                          {/* Post Author Row */}
                          <div className="flex items-center justify-between px-4 pt-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-0.5 shrink-0 overflow-hidden shadow-xs">
                                <div className="w-full h-full rounded-full bg-white dark:bg-black overflow-hidden flex items-center justify-center">
                                  <img
                                    src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                    alt={account?.username || "ruangcreativemuslim"}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="font-bold text-xs">{account?.username || "ruangcreativemuslim"}</span>
                            </div>
                            <span className="text-gray-800 dark:text-gray-200 text-sm font-bold tracking-widest leading-none">•••</span>
                          </div>

                          {/* Post Media Container (Aspect 4:5 Portrait) */}
                          <div className="w-full aspect-[4/5] bg-gray-100 dark:bg-white/5 flex flex-col items-center justify-center text-center overflow-hidden">
                            {ruleFormData.targetOtomasi === "Postingan Tertentu" && selectedPost ? (
                              <img
                                src={selectedPost.image}
                                alt={selectedPost.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 p-4">
                                {ruleFormData.targetOtomasi === "Semua Postingan"
                                  ? "Semua Postingan"
                                  : ruleFormData.targetOtomasi}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center justify-between px-4 pt-0.5">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                                <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                                  {selectedPost?.likes ?? 127}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                                <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">
                                  {selectedPost?.comments ?? 124}
                                </span>
                              </div>
                              <Send className="w-3.5 h-3.5 text-gray-800 dark:text-gray-200" />
                            </div>
                            <Bookmark className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                          </div>

                          {/* Caption Block */}
                          <div className="space-y-0.5 px-4 pt-0.5 pb-2">
                            <p className="text-xs leading-relaxed">
                              <strong className="font-bold mr-1.5">{account?.username || "ruangcreativemuslim"}</strong>
                              <span className="text-gray-700 dark:text-gray-300">
                                {selectedPost?.caption || "Kehilangan penghasilan tetap bukan akhir segalanya kalau kamu punya sistem yang..."}
                              </span>
                            </p>
                            <span className="text-[11px] text-gray-400 block pt-0.5 cursor-pointer">Lihat semua komentar</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wider block">
                              {selectedPost?.date || "14 Oct, 2026"}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Nav */}
                        <div className="flex items-center justify-around py-2.5 px-3 border-t border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 bg-white dark:bg-black shrink-0">
                          <Home className="w-4 h-4" />
                          <Search className="w-4 h-4" />
                          <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center font-bold text-[10px]">
                            +
                          </div>
                          <Film className="w-4 h-4" />
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-0.5 shrink-0 overflow-hidden">
                            <img
                              src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                              }}
                            />
                          </div>
                        </div>

                        {/* INSTAGRAM COMMENTS BOTTOM SHEET (Overlay on top of post) */}
                        {(isBasicInfoFilled || editingRule) && (
                          <div className="absolute inset-x-0 bottom-0 top-[36%] bg-white dark:bg-[#18181b] rounded-t-[22px] shadow-[0_-8px_30px_rgba(0,0,0,0.25)] border-t border-gray-200/80 dark:border-white/10 flex flex-col z-20 animate-in slide-in-from-bottom duration-300">
                            {/* Drag Handle */}
                            <div className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto my-2 shrink-0" />

                            {/* Header */}
                            <div className="text-center pb-2 border-b border-gray-100 dark:border-white/5 shrink-0">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                                Komentar
                              </h4>
                            </div>

                            {/* Comment Item */}
                            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                  {/* Gray Circle Avatar */}
                                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                                  <div className="space-y-0.5 min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-xs text-gray-900 dark:text-white">
                                        Nama Pengguna
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        baru saja
                                      </span>
                                    </div>
                                    {/* The live synced comment text */}
                                    <p className="text-xs text-gray-800 dark:text-gray-200 break-words font-normal">
                                      {ruleFormData.triggerCommentType === "ALL"
                                        ? "Komentar"
                                        : (ruleFormData.keywords.split(",")[0]?.trim() || ruleFormData.keywords.trim() || "Komentar")}
                                    </p>
                                    <button
                                      type="button"
                                      className="text-[10px] text-gray-400 font-semibold hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer pt-0.5"
                                    >
                                      Balas
                                    </button>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-rose-500 pt-1 shrink-0 cursor-pointer transition-colors"
                                >
                                  <Heart className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* 2. Bot Reply Comment (when featureReplyComment is active) */}
                              {ruleFormData.featureReplyComment && (
                                <div className="flex items-start justify-between gap-2.5 pl-6 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                    {/* Bot Avatar */}
                                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 mt-0.5">
                                      <img
                                        src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                        alt="Bot"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-0.5 min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-xs text-gray-900 dark:text-white">
                                          {account?.username || currentAgent?.name || "ruangcreativemuslim"}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                          baru saja
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-800 dark:text-gray-200 break-words font-normal">
                                        {resolvePreviewVariables(
                                          ruleFormData.commentReplyVariations?.[0] ||
                                          ruleFormData.replyCommentTemplates ||
                                          "Pesan terkirim! 🚀"
                                        )}
                                      </p>
                                      <button
                                        type="button"
                                        className="text-[10px] text-gray-400 font-semibold hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer pt-0.5"
                                      >
                                        Balas
                                      </button>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="text-gray-400 hover:text-rose-500 pt-1 shrink-0 cursor-pointer transition-colors"
                                  >
                                    <Heart className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Quick Emoji Reaction Bar */}
                            <div className="flex items-center justify-around px-3 py-2 border-t border-gray-100 dark:border-white/5 text-base select-none shrink-0 bg-white dark:bg-[#18181b]">
                              <span className="hover:scale-125 transition-transform cursor-pointer">❤️</span>
                              <span className="hover:scale-125 transition-transform cursor-pointer">🙌</span>
                              <span className="hover:scale-125 transition-transform cursor-pointer">🔥</span>
                              <span className="hover:scale-125 transition-transform cursor-pointer">👏</span>
                              <span className="hover:scale-125 transition-transform cursor-pointer">😢</span>
                              <span className="hover:scale-125 transition-transform cursor-pointer">😍</span>
                            </div>

                            {/* Add Comment Input Bar */}
                            <div className="flex items-center gap-2.5 px-3 py-2 border-t border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] shrink-0">
                              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                                <img
                                  src={account?.profilePicUrl || currentAgent?.profilePicUrl || "/images/instagram/rcm-avatar.png"}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/images/instagram/rcm-avatar.png";
                                  }}
                                />
                              </div>
                              <div className="text-[11px] text-gray-400 font-normal">
                                Tambahkan komentar..
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                      {/* Bottom Home Indicator */}
                      <div className="w-24 h-1 rounded-full bg-black/40 dark:bg-white/40 mx-auto my-1.5 shrink-0 z-30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP: LIHAT SEMUA POSTINGAN */}
      {showAllPostsModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                Pilih Postingan Instagram
              </h4>
              <button
                type="button"
                onClick={() => setShowAllPostsModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {(feedPosts.length > 0 ? feedPosts : SAMPLE_INSTAGRAM_POSTS).map((post) => {
                const isSelected = selectedPost?.id === post.id;
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      setSelectedPost(post);
                      setRuleFormData({ ...ruleFormData, postId: post.id });
                      setShowAllPostsModal(false);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-[4/5] border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-500/30 scale-[1.02] shadow-sm"
                        : "border-gray-200 dark:border-white/10 hover:border-gray-400 opacity-85 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={post.thumb || post.image}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/instagram/thumb-1-clean.png";
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
