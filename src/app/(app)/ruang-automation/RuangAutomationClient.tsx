"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { BackButton } from "@/components/ui/BackButton";
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Info,
  Check,
  Filter,
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
  getInstagramFeedMediaAction,
  getInstagramStoriesAction,
  retryFailedAutomationLogsAction,
  rewindAutomationCommentsAction,
} from "@/app/actions/instagramAutomation";

import {
  parseClientRuleConfig,
  getCachedCoverUrl,
  setCachedCoverUrl,
  syncMediaListToCoverCache,
} from "./utils/automationHelpers";
import { PlatformHubSection } from "./components/PlatformHubSection";
import { InstagramAgentListSection } from "./instagram/InstagramAgentListSection";
import { InstagramConnectionTab } from "./instagram/InstagramConnectionTab";
import { InstagramDashboardTab } from "./instagram/InstagramDashboardTab";
import { PostAutomationSection } from "./instagram/sections/PostAutomationSection";
import { StoryAutomationSection } from "./instagram/sections/StoryAutomationSection";
import { LiveAutomationSection } from "./instagram/sections/LiveAutomationSection";
import { DmAutomationSection } from "./instagram/sections/DmAutomationSection";

const InstagramRuleDetailModal = dynamic(
  () =>
    import("./instagram/InstagramRuleDetailModal").then(
      (mod) => mod.InstagramRuleDetailModal
    ),
  { ssr: false }
);

const InstagramAgentModals = dynamic(
  () =>
    import("./instagram/InstagramAgentModals").then(
      (mod) => mod.InstagramAgentModals
    ),
  { ssr: false }
);

const InstagramRuleStudioModal = dynamic(
  () =>
    import("./instagram/InstagramRuleStudioModal").then(
      (mod) => mod.InstagramRuleStudioModal
    ),
  { ssr: false }
);
import {
  MessageButtonItem,
  MessageCarouselSlideItem,
  MessageQuickReplyItem,
} from "./components/MessagePayloadBuilder";


export default function RuangAutomationClient({
  initialData,
  isLoggedIn = true,
  isPro,
  isAdmin,
  initialAgentId = null,
  initialPlatform = null,
}: {
  initialData: any;
  isLoggedIn?: boolean;
  isPro: boolean;
  isAdmin: boolean;
  initialAgentId?: string | null;
  initialPlatform?: "instagram" | null;
}) {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<"instagram" | null>(initialPlatform);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(initialAgentId);
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

  // SWR Caching & Revalidating (Stale-While-Revalidate / STA pattern)
  // Gunakan kunci tunggal "instagramAutomation" (selaras dengan preload di ClientLayout)
  // sehingga saat klik agen & buka Komentar IG ke DM, card langsung tampil 0ms tanpa reset/delay!
  const { data: swrData, isLoading, mutate: mutateData } = useSWR(
    shouldFetch ? "instagramAutomation" : null,
    () => getInstagramAutomationDataAction(selectedAgentId || undefined),
    {
      fallbackData: initialData,
      keepPreviousData: true,
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
    profileName: account.profileName,
    profilePicUrl: account.profilePicUrl,
    isLinked: account.isLinked,
    isActive: account.isActive,
    updatedAt: account.updatedAt,
    createdAt: account.createdAt,
  } : null);
  const displayAccount = currentAgent || account;
  const isAccountLinked = Boolean(displayAccount && displayAccount.isLinked);

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
      if (currentUrl.searchParams.has("platform") || currentUrl.searchParams.has("agentId")) {
        currentUrl.searchParams.delete("platform");
        currentUrl.searchParams.delete("agentId");
        window.history.replaceState({}, "", currentUrl.toString());
      }
      window.dispatchEvent(new CustomEvent("automation-platform-change", { detail: null }));
    }
  }, [selectedPlatform]);

  // Listen to platform changes dispatched from ClientLayout & URL popstate
  useEffect(() => {
    const handlePlatformChange = (e: any) => {
      const plat = e.detail;
      if (!plat) {
        setUserHasExitedToHub(true);
        setSelectedPlatform((prev) => (prev !== null ? null : prev));
        setSelectedAgentId((prev) => (prev !== null ? null : prev));
      } else if (plat === "instagram") {
        setUserHasExitedToHub(false);
        setSelectedPlatform((prev) => (prev !== "instagram" ? "instagram" : prev));
      }
    };

    const handleUrlSync = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const plat = params.get("platform");
      if (plat === "instagram") {
        setUserHasExitedToHub(false);
        setSelectedPlatform((prev) => (prev !== "instagram" ? "instagram" : prev));
        setSelectedAgentId((prev) => (prev !== (params.get("agentId") || null) ? (params.get("agentId") || null) : prev));
      } else {
        setUserHasExitedToHub(true);
        setSelectedPlatform((prev) => (prev !== null ? null : prev));
        setSelectedAgentId((prev) => (prev !== null ? null : prev));
      }
    };

    window.addEventListener("automation-platform-change", handlePlatformChange);
    window.addEventListener("popstate", handleUrlSync);
    window.addEventListener("app-shallow-navigate", handleUrlSync);
    return () => {
      window.removeEventListener("automation-platform-change", handlePlatformChange);
      window.removeEventListener("popstate", handleUrlSync);
      window.removeEventListener("app-shallow-navigate", handleUrlSync);
    };
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
      } else if (errorParam === "account_mismatch") {
        const boundUser = params.get("boundUsername");
        const attemptedUser = params.get("attemptedUsername");
        showToast(
          "error",
          `Akun tidak cocok! Agen ini sudah terkunci permanen untuk akun @${boundUser || "sebelumnya"}. Anda tidak dapat menghubungkan akun @${attemptedUser || "lain"}.`
        );
      } else if (errorParam === "agent_limit_reached") {
        showToast(
          "info",
          "Untuk membuat agen baru, silakan lakukan pembayaran paket terlebih dahulu."
        );
        window.dispatchEvent(new Event("app-loading-start"));
        router.push("/?pricing=true&cat=automation");
      } else if (errorParam === "no_business_account") {
        const detailsParam = params.get("details");
        showToast(
          "error",
          detailsParam
            ? `Meta API Error: ${decodeURIComponent(detailsParam)}`
            : "Akun belum terhubung. Pastikan akun sudah berstatus Akun Profesional & telah disetujui sebagai Tester di Meta Developer (selama tahap Development)."
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
    if (!isLoggedIn || (!isPro && !isAdmin)) {
      window.dispatchEvent(new Event("app-loading-start"));
      router.push("/?pricing=true&cat=automation");
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
        if (res.error === "payment_required") {
          showToast("info", res.message || "Untuk membuat agen baru, silakan lakukan pembayaran paket terlebih dahulu.");
          setIsCreateAgentModalOpen(false);
          await mutateData();
          window.dispatchEvent(new Event("app-loading-start"));
          router.push("/?pricing=true&cat=automation");
        } else {
          showToast("error", res.error || "Gagal membuat agen");
          await mutateData();
        }
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
      if (!target.closest(".frequency-dropdown-container")) {
        setIsFrequencyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rule Modal state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [isFrequencyDropdownOpen, setIsFrequencyDropdownOpen] = useState(false);
  const [activeLiveContentIdx, setActiveLiveContentIdx] = useState<number>(0);
  const [simulatedLiveQrId, setSimulatedLiveQrId] = useState<string | null>(null);
  const [simulatedFollowStep, setSimulatedFollowStep] = useState<"GATE" | "RETRY" | "VERIFIED">("GATE");
  const [simulatedButtonId, setSimulatedButtonId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [showAllPostsModal, setShowAllPostsModal] = useState(false);
  const [detailRuleId, setDetailRuleId] = useState<string | null>(null);
  const [isRetryingFailed, setIsRetryingFailed] = useState(false);
  const [isRewindingComments, setIsRewindingComments] = useState(false);

  const [activePreviewTab, setActivePreviewTab] = useState<"COMMENT" | "DM">("COMMENT");

  const [ruleFormData, setRuleFormData] = useState({
    name: "",
    targetOtomasi: "Postingan Tertentu",
    postType: "SPECIFIC",
    postId: "",
    storyMentionFrequency: "24 jam sekali" as
      | "24 jam sekali"
      | "48 jam sekali"
      | "Mingguan"
      | "Bulanan"
      | "3 bulan sekali"
      | "6 bulan sekali"
      | "Hanya sekali",
    liveContents: [] as {
      id: string;
      keywords: string;
      messageType: "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL";
      message: string;
      buttons: {
        id: string;
        labelType: "Klik Disini" | "Kustom";
        label: string;
        action: "Buka Website" | "Kirim Teks" | "";
        url: string;
        text?: string;
      }[];
      quickReplies: {
        id: string;
        label: string;
        text: string;
      }[];
      carouselSlides: {
        id: string;
        image: string;
        title: string;
        subtitle: string;
        buttons: {
          id: string;
          labelType: "Klik Disini" | "Kustom";
          label: string;
          action: "Buka Website" | "Kirim Teks" | "";
          url: string;
        }[];
      }[];
    }[],
    triggerCommentType: "KEYWORDS" as "KEYWORDS" | "ALL",
    keywords: "mau",
    keywordRule: "Contains" as "Contains" | "Match" | "Starts with",
    messageType: "BUTTON_TEMPLATE" as "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL",
    dmMessage: "Halo {first_name}! Terima kasih sudah tertarik. Ini link akses yang kamu minta:\nhttps://ruangcreativemuslim.com",
    buttons: [
      {
        id: "btn_1",
        labelType: "Kustom",
        label: "Button 1",
        action: "Buka Website",
        url: "https://ruangcreativemuslim.com",
        text: "Terima kasih sudah tertarik! Ini info detail balasan dari kami.",
      },
    ] as MessageButtonItem[],
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
            url: "https://ruangcreativemuslim.com",
          },
        ],
      },
    ] as MessageCarouselSlideItem[],
    quickReplies: [] as MessageQuickReplyItem[],
    featureFollowUp: false,
    followUpDelay: "1 Jam" as "15 Menit" | "1 Jam" | "3 Jam" | "6 Jam" | "12 Jam" | "23 Jam",
    followUpCondition: "Hanya yang Belum Klik Link" as "Semua Penerima" | "Hanya yang Belum Klik Link",
    followUpMessageType: "BUTTON_TEMPLATE" as "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL" | "Template Tombol" | "Teks Biasa" | "Carousel",
    followUpMessage: "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala atau mau tanya-tanya bilang ya 😉",
    followUpButtonLabel: "Buka Link Sekarang",
    followUpButtons: [
      {
        id: "followup_btn_1",
        labelType: "Kustom",
        label: "Buka Link Sekarang",
        action: "Buka Website",
        url: "https://ruangcreativemuslim.com",
      },
    ] as MessageButtonItem[],
    followUpCarouselSlides: [
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
            url: "https://ruangcreativemuslim.com",
          },
        ],
      },
    ] as MessageCarouselSlideItem[],
    followUpQuickReplies: [] as MessageQuickReplyItem[],
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
    replyHeartReaction: false,
    isActive: true,
  });

  const preloadMediaAgentId = selectedAgentId || agents.find((a: any) => a.isLinked)?.id || (account?.isLinked ? account.id : null);
  const isPreloadAgentLinked = Boolean(
    selectedAgentId
      ? isAccountLinked
      : agents.some((a: any) => a.id === preloadMediaAgentId && a.isLinked) || account?.isLinked
  );

  // Real Instagram Feed Media managed by SWR with Stale-While-Revalidate (STA) pattern
  const {
    data: feedData,
    isLoading: isLoadingFeed,
    isValidating: isValidatingFeed,
    mutate: mutateFeed,
  } = useSWR(
    preloadMediaAgentId && isPreloadAgentLinked ? ["instagramFeedMedia", preloadMediaAgentId] : null,
    ([, agentId]) => getInstagramFeedMediaAction(30, agentId),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // 5 menit cache STA di memori
    }
  );

  const feedPosts: any[] = (isAccountLinked && feedData?.success && Array.isArray(feedData.posts) && feedData.posts.length > 0)
    ? feedData.posts
    : [];
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

  // Real Instagram Stories managed by SWR
  const {
    data: storiesData,
    isLoading: isLoadingStories,
    isValidating: isValidatingStories,
    mutate: mutateStories,
  } = useSWR(
    preloadMediaAgentId && isPreloadAgentLinked ? ["instagramStories", preloadMediaAgentId] : null,
    ([, agentId]) => getInstagramStoriesAction(20, agentId),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000,
    }
  );

  const activeStories: any[] = (isAccountLinked && storiesData?.success && Array.isArray(storiesData.stories))
    ? storiesData.stories
    : [];
  const isStoriesLive = !!storiesData?.isLive;

  // Sinkronkan URL cover dari Feed, Story, dan Rules yang sudah ada ke cache lokal (memori + localStorage)
  // agar kartu Postingan Tertentu & Story Tertentu selalu memiliki cover instan 0ms tanpa reload.
  useEffect(() => {
    if (feedPosts.length > 0) {
      syncMediaListToCoverCache(feedPosts);
    }
  }, [feedPosts]);

  useEffect(() => {
    if (activeStories.length > 0) {
      syncMediaListToCoverCache(activeStories);
    }
  }, [activeStories]);

  useEffect(() => {
    const allRules = data?.rules || [];
    for (const r of allRules) {
      if (r?.specificPostId) {
        const cfg = parseClientRuleConfig(r.dmMessage);
        if (cfg.postCoverUrl) {
          setCachedCoverUrl(r.specificPostId, cfg.postCoverUrl);
        }
      }
    }
  }, [data?.rules]);

  // Manual resync stories trigger
  const handleRefreshStories = async () => {
    try {
      showToast("info", "Menyinkronkan story aktif dari Instagram...");
      await mutateStories();
      showToast("success", "Story Instagram berhasil diperbarui!");
    } catch {
      showToast("error", "Gagal menyinkronkan story Instagram.");
    }
  };

  const handleOpenAddRuleModal = () => {
    if (!isAccountLinked) {
      showToast("error", "Silakan hubungkan akun Instagram terlebih dahulu untuk membuat aturan automasi.");
      return;
    }
    setEditingRule(null);
    const defaultPost = feedPosts.length > 0 ? feedPosts[0] : null;
    setSelectedPost(defaultPost);
    setActivePreviewTab("COMMENT");
    setActiveLiveContentIdx(0);
    setSimulatedLiveQrId(null);
    setRuleFormData({
      name: "",
      targetOtomasi: "Postingan Tertentu",
      postType: "SPECIFIC",
      postId: defaultPost?.id || "",
      storyMentionFrequency: "24 jam sekali",
      liveContents: [],
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
      followUpMessageType: "BUTTON_TEMPLATE",
      followUpMessage: "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala atau mau tanya-tanya bilang ya 😉",
      followUpButtonLabel: "Buka Link Sekarang",
      followUpButtons: [
        {
          id: "followup_btn_1",
          labelType: "Kustom",
          label: "Buka Link Sekarang",
          action: "Buka Website",
          url: "https://ruangcreativemuslim.com",
        },
      ],
      followUpCarouselSlides: [
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
              url: "https://ruangcreativemuslim.com",
            },
          ],
        },
      ],
      followUpQuickReplies: [],
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
      replyHeartReaction: false,
      isActive: true,
    });
    setIsTargetDropdownOpen(false);
    setIsFrequencyDropdownOpen(false);
    setSimulatedFollowStep("GATE");
    setSimulatedButtonId(null);
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRuleModal = (rule: any) => {
    setEditingRule(rule);
    const config = parseClientRuleConfig(rule.dmMessage);

    const isDirectImg =
      typeof rule.buttonUrl === "string" &&
      (rule.buttonUrl.startsWith("/images/") ||
        Boolean(rule.buttonUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)));

    const savedCover =
      config.postCoverUrl ||
      getCachedCoverUrl(rule.specificPostId) ||
      (isDirectImg ? rule.buttonUrl : null);

    let matched = feedPosts.find((p) => String(p.id) === String(rule.specificPostId));
    if (!matched && rule.specificPostId) {
      matched = {
        id: rule.specificPostId,
        title: rule.name || "Postingan Terpilih",
        image: savedCover,
        thumb: savedCover,
        permalink: config.postPermalink || null,
      };
    } else if (!matched) {
      matched = feedPosts[0] || null;
    }
    setSelectedPost(matched);

    let matchedStory = activeStories.find((s) => String(s.id) === String(rule.specificPostId));
    if (!matchedStory && rule.specificPostId) {
      matchedStory = {
        id: rule.specificPostId,
        title: rule.name || "Story Terpilih",
        image: savedCover,
        thumb: savedCover,
        date: "Story",
      };
    } else if (!matchedStory) {
      matchedStory = activeStories[0] || null;
    }
    setSelectedStory(matchedStory);
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

    const dmTemplateStr =
      config.mainMessage ||
      rule.dmMessage ||
      (Array.isArray(rule.dmTemplates) ? rule.dmTemplates[0] : rule.dmTemplates) ||
      "";
    const target =
      rule.triggerType === "SPECIFIC_POST"
        ? "Postingan Tertentu"
        : rule.triggerType === "NEXT_POST"
        ? "Postingan Berikutnya"
        : rule.triggerType === "ALL_STORIES" || config.targetOtomasi === "Semua Story"
        ? "Semua Story"
        : rule.triggerType === "SPECIFIC_STORY" || config.targetOtomasi === "Story Tertentu"
        ? "Story Tertentu"
        : rule.triggerType === "STORY_MENTION" || config.targetOtomasi === "Story Mention"
        ? "Story Mention"
        : rule.triggerType === "LIVE" || rule.triggerType === "INSTAGRAM_LIVE" || config.targetOtomasi === "Live Instagram"
        ? "Live Instagram"
        : rule.triggerType === "DM" || config.targetOtomasi === "Pesan Instagram"
        ? "Pesan Instagram"
        : "Semua Postingan";

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

    const defaultSlideList = [
      {
        id: "slide_1",
        image: matched?.image || "",
        title: "Panduan Lengkap Ngonten",
        subtitle: "Pelajari cara mudah buat konten viral",
        buttons: [
          {
            id: "slide_btn_1",
            labelType: "Kustom" as "Klik Disini" | "Kustom",
            label: "Button 1",
            action: "Buka Website" as "Buka Website" | "Kirim Teks" | "",
            url: rule.buttonUrl || "https://ruangcreativemuslim.com",
          },
        ],
      },
    ];

    const initialLiveContents = Array.isArray(config.liveContents) && config.liveContents.length > 0
      ? config.liveContents.map((c: any, idx: number) => ({
          id: c.id || `live_content_${idx + 1}`,
          keywords: c.keywords || "",
          messageType: (c.messageType || "BUTTON_TEMPLATE") as "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL",
          message: c.message ?? c.dmMessage ?? "",
          buttons: Array.isArray(c.buttons) && c.buttons.length > 0 ? c.buttons : initialButtons,
          quickReplies: Array.isArray(c.quickReplies) ? c.quickReplies : [],
          carouselSlides: Array.isArray(c.carouselSlides) && c.carouselSlides.length > 0 ? c.carouselSlides : defaultSlideList,
        }))
      : target === "Live Instagram"
      ? [
          {
            id: `live_content_${Date.now()}`,
            keywords: keywordsStr || "mau",
            messageType: (hasButtons ? "BUTTON_TEMPLATE" : "PLAIN_TEXT") as "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL",
            message: dmTemplateStr || "",
            buttons: initialButtons,
            quickReplies: [],
            carouselSlides: defaultSlideList,
          },
        ]
      : [];

    setActiveLiveContentIdx(0);
    setSimulatedLiveQrId(null);
    setActivePreviewTab(
      target === "Story Mention" || target === "Live Instagram" || target === "Pesan Instagram"
        ? "DM"
        : "COMMENT"
    );
    setRuleFormData({
      name: rule.name || "",
      targetOtomasi: target,
      postType:
        rule.triggerType === "SPECIFIC_POST"
          ? "SPECIFIC"
          : rule.triggerType === "NEXT_POST"
          ? "NEXT"
          : rule.triggerType === "ALL_STORIES" || config.targetOtomasi === "Semua Story"
          ? "ALL_STORIES"
          : rule.triggerType === "SPECIFIC_STORY" || config.targetOtomasi === "Story Tertentu"
          ? "SPECIFIC_STORY"
          : rule.triggerType === "STORY_MENTION" || config.targetOtomasi === "Story Mention"
          ? "STORY_MENTION"
          : rule.triggerType === "LIVE" || rule.triggerType === "INSTAGRAM_LIVE" || config.targetOtomasi === "Live Instagram"
          ? "LIVE"
          : rule.triggerType === "DM" || config.targetOtomasi === "Pesan Instagram"
          ? "DM"
          : "ALL",
      postId: rule.specificPostId || matched?.id || "",
      storyMentionFrequency: config.storyMentionFrequency || "24 jam sekali",
      liveContents: initialLiveContents,
      triggerCommentType:
        target === "Pesan Instagram"
          ? "KEYWORDS"
          : (config.triggerCommentType as "KEYWORDS" | "ALL") || (keywordsStr.trim() ? "KEYWORDS" : "ALL"),
      keywords: keywordsStr || "mau, harga, info, spill",
      keywordRule:
        config.keywordRule === "Match" || config.keywordRule === "match"
          ? "Match"
          : config.keywordRule === "Starts with" || config.keywordRule === "starts with" || config.keywordRule === "StartsWith"
          ? "Starts with"
          : "Contains",
      messageType:
        (config.messageType as "BUTTON_TEMPLATE" | "PLAIN_TEXT" | "CAROUSEL") ||
        (hasButtons ? "BUTTON_TEMPLATE" : "PLAIN_TEXT"),
      dmMessage: dmTemplateStr || "Halo {first_name}! Terima kasih sudah tertarik. Ini link akses yang kamu minta:\nhttps://ruangcreativemuslim.com",
      buttons: Array.isArray(config.buttons) && config.buttons.length > 0 ? config.buttons : initialButtons,
      carouselSlides:
        Array.isArray(config.carouselSlides) && config.carouselSlides.length > 0
          ? config.carouselSlides
          : defaultSlideList,
      quickReplies: Array.isArray(config.quickReplies)
        ? config.quickReplies.map((qr: any, idx: number) => ({
            id: qr.id || `qr_${idx + 1}`,
            label: qr.label ?? qr.text ?? "",
            text: qr.text ?? "",
          }))
        : [],
      featureFollowUp: config.featureFollowUp ?? false,
      followUpDelay: config.followUpDelay || "1 Jam",
      followUpCondition: config.followUpCondition || "Hanya yang Belum Klik Link",
      followUpMessageType:
        config.followUpMessageType === "Teks Biasa" || config.followUpMessageType === "PLAIN_TEXT"
          ? "PLAIN_TEXT"
          : config.followUpMessageType === "Carousel" || config.followUpMessageType === "CAROUSEL"
          ? "CAROUSEL"
          : "BUTTON_TEMPLATE",
      followUpMessage: config.followUpMessage || "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala atau mau tanya-tanya bilang ya 😉",
      followUpButtonLabel: config.followUpButtonLabel || "Buka Link Sekarang",
      followUpButtons:
        Array.isArray(config.followUpButtons) && config.followUpButtons.length > 0
          ? config.followUpButtons
          : [
              {
                id: "followup_btn_1",
                labelType: "Kustom",
                label: config.followUpButtonLabel || "Buka Link Sekarang",
                action: "Buka Website",
                url: rule.buttonUrl || "https://ruangcreativemuslim.com",
              },
            ],
      followUpCarouselSlides:
        Array.isArray(config.followUpCarouselSlides) && config.followUpCarouselSlides.length > 0
          ? config.followUpCarouselSlides
          : defaultSlideList,
      followUpQuickReplies: Array.isArray(config.followUpQuickReplies)
        ? config.followUpQuickReplies.map((qr: any, idx: number) => ({
            id: qr.id || `followup_qr_${idx + 1}`,
            label: qr.label ?? qr.text ?? "",
            text: qr.text ?? "",
          }))
        : [],
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
      featureLinkTracking: config.featureLinkTracking ?? true,
      replyHeartReaction: config.replyHeartReaction ?? false,
      isActive: rule.isActive ?? true,
    });
    setIsTargetDropdownOpen(false);
    setIsFrequencyDropdownOpen(false);
    setActiveLiveContentIdx(0);
    setSimulatedLiveQrId(null);
    setSimulatedFollowStep("GATE");
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
          showToast("success", "Salinan aturan berhasil dibuat! (Status awal: Dijeda)");
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
    if (!isAccountLinked) {
      showToast("error", "Akun Instagram belum terhubung. Hubungkan akun Anda terlebih dahulu di tab Koneksi Akun untuk mengaktifkan aturan ini.");
      return;
    }
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

    const isStoryMentionRule =
      ruleFormData.targetOtomasi === "Story Mention" ||
      ruleFormData.postType === "STORY_MENTION";

    const isLiveRulePayload =
      ruleFormData.targetOtomasi === "Live Instagram" ||
      ruleFormData.postType === "LIVE";

    const isDmRulePayload =
      ruleFormData.targetOtomasi === "Pesan Instagram" ||
      ruleFormData.postType === "DM";

    if (isLiveRulePayload && (!ruleFormData.liveContents || ruleFormData.liveContents.length === 0)) {
      showToast("error", "Minimal tambahkan 1 konten untuk Live Instagram");
      return;
    }

    if (isDmRulePayload && !ruleFormData.keywords.trim()) {
      showToast("error", "Keyword pemicu pesan wajib diisi");
      return;
    }

    const keywordArray = isLiveRulePayload
      ? Array.from(
          new Set(
            ruleFormData.liveContents
              .flatMap((c) => (c.keywords || "").split(","))
              .map((k) => k.trim())
              .filter(Boolean)
          )
        )
      : isDmRulePayload
      ? (ruleFormData.keywords || "mau")
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : isStoryMentionRule || ruleFormData.triggerCommentType === "ALL"
      ? []
      : (ruleFormData.keywords || "mau, harga, info, spill")
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);

    const chosenPostId = ruleFormData.targetOtomasi === "Postingan Tertentu"
      ? (ruleFormData.postId || selectedPost?.id || (feedPosts[0]?.id) || "post_1")
      : ruleFormData.targetOtomasi === "Story Tertentu"
      ? (ruleFormData.postId || selectedStory?.id || (activeStories[0]?.id) || "story_1")
      : undefined;

    const existingRuleConfig = editingRule ? parseClientRuleConfig(editingRule.dmMessage) : {};
    const postCoverUrl = ruleFormData.targetOtomasi === "Postingan Tertentu"
      ? (selectedPost?.image || selectedPost?.thumb || getCachedCoverUrl(chosenPostId) || (ruleFormData.postId === editingRule?.specificPostId ? existingRuleConfig.postCoverUrl : null) || null)
      : ruleFormData.targetOtomasi === "Story Tertentu"
      ? (selectedStory?.image || selectedStory?.thumb || getCachedCoverUrl(chosenPostId) || (ruleFormData.postId === editingRule?.specificPostId ? existingRuleConfig.postCoverUrl : null) || null)
      : null;

    if (chosenPostId && postCoverUrl) {
      setCachedCoverUrl(chosenPostId, postCoverUrl);
    }

    const firstLiveContent = isLiveRulePayload && ruleFormData.liveContents.length > 0 ? ruleFormData.liveContents[0] : null;
    const primaryButton = isLiveRulePayload
      ? (firstLiveContent?.buttons && firstLiveContent.buttons.length > 0 ? firstLiveContent.buttons[0] : null)
      : (ruleFormData.buttons && ruleFormData.buttons.length > 0 ? ruleFormData.buttons[0] : null);
    const effectiveMsgType = isLiveRulePayload ? (firstLiveContent?.messageType || "PLAIN_TEXT") : ruleFormData.messageType;
    const buttonText = effectiveMsgType === "BUTTON_TEMPLATE" && primaryButton?.label ? primaryButton.label.trim() : null;
    const buttonUrl = effectiveMsgType === "BUTTON_TEMPLATE" && primaryButton?.url ? primaryButton.url.trim() : null;

    const extendedConfig = {
      mainMessage: isLiveRulePayload
        ? (firstLiveContent?.message || "Halo {first_name}! Terima kasih sudah berkomentar di Live kami.")
        : (ruleFormData.dmMessage || "Halo @username! Terima kasih sudah tertarik."),
      messageType: effectiveMsgType,
      buttons: ruleFormData.buttons,
      quickReplies: ruleFormData.quickReplies,
      carouselSlides: ruleFormData.carouselSlides,
      liveContents: isLiveRulePayload ? ruleFormData.liveContents : undefined,
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
      followUpButtons: ruleFormData.followUpButtons,
      followUpCarouselSlides: ruleFormData.followUpCarouselSlides,
      followUpQuickReplies: ruleFormData.followUpQuickReplies,
      featureReplyComment: ruleFormData.featureReplyComment,
      featureLinkTracking: ruleFormData.featureLinkTracking,
      replyHeartReaction: ruleFormData.replyHeartReaction,
      targetOtomasi: ruleFormData.targetOtomasi,
      storyMentionFrequency: ruleFormData.storyMentionFrequency || "24 jam sekali",
      keywordRule: ruleFormData.keywordRule,
      triggerCommentType: isStoryMentionRule ? "ALL" : (isLiveRulePayload || isDmRulePayload) ? "KEYWORDS" : ruleFormData.triggerCommentType,
      postPermalink: ruleFormData.targetOtomasi === "Postingan Tertentu"
        ? (selectedPost?.permalink || (ruleFormData.postId === editingRule?.specificPostId ? existingRuleConfig.postPermalink : null) || null)
        : null,
      postCoverUrl: postCoverUrl || null,
    };
    const serializedDm = JSON.stringify(extendedConfig);

    const isStoryTarget = ["Semua Story", "Story Tertentu", "Story Mention"].includes(ruleFormData.targetOtomasi);

    const targetAccountId = selectedAgentId || account?.id;
    const postType =
      ruleFormData.targetOtomasi === "Postingan Tertentu"
        ? "SPECIFIC"
        : ruleFormData.targetOtomasi === "Postingan Berikutnya"
        ? "NEXT"
        : ruleFormData.targetOtomasi === "Semua Story"
        ? "ALL_STORIES"
        : ruleFormData.targetOtomasi === "Story Tertentu"
        ? "SPECIFIC_STORY"
        : ruleFormData.targetOtomasi === "Story Mention"
        ? "STORY_MENTION"
        : ruleFormData.targetOtomasi === "Live Instagram"
        ? "LIVE"
        : ruleFormData.targetOtomasi === "Pesan Instagram"
        ? "DM"
        : "ALL";

    const triggerType =
      postType === "SPECIFIC"
        ? "SPECIFIC_POST"
        : postType === "NEXT"
        ? "NEXT_POST"
        : postType === "ALL_STORIES"
        ? "ALL_STORIES"
        : postType === "SPECIFIC_STORY"
        ? "SPECIFIC_STORY"
        : postType === "STORY_MENTION"
        ? "STORY_MENTION"
        : postType === "LIVE"
        ? "LIVE"
        : postType === "DM"
        ? "DM"
        : "ALL_POSTS";

    const payload = {
      ruleId: editingRule?.id,
      accountId: targetAccountId,
      name: ruleFormData.name,
      postType,
      triggerType,
      postId: chosenPostId,
      buttonUrl: buttonUrl || undefined,
      buttonText: buttonText || undefined,
      keywords: keywordArray,
      commentReplies: (!isStoryTarget && !isLiveRulePayload && !isDmRulePayload && ruleFormData.featureReplyComment)
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
      triggerType: payload.triggerType,
      specificPostId: payload.postId || null,
      buttonUrl: buttonUrl || postCoverUrl || null,
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

    // Otomatis arahkan tab aktif ke jenis automasi yang baru dibuat agar kartu langsung terlihat seketika (0ms)!
    if (isDmRulePayload && automationTab !== "DM") {
      setAutomationTab("DM");
    } else if (isLiveRulePayload && automationTab !== "LIVE") {
      setAutomationTab("LIVE");
    } else if (isStoryTarget && automationTab !== "STORY") {
      setAutomationTab("STORY");
    } else if (!isStoryTarget && !isLiveRulePayload && !isDmRulePayload && automationTab !== "POST") {
      setAutomationTab("POST");
    }

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
        const targetAccountId = selectedAgentId || data.account?.id;
        const res = await connectInstagramAccountAction(undefined, targetAccountId);
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

  const activeAccountId = selectedAgentId || displayAccount?.id || account?.id;
  const rules = useMemo(() => {
    const allRules = data?.rules || [];
    if (!activeAccountId) return allRules;
    return allRules.filter((r: any) => !r.accountId || r.accountId === activeAccountId || r.accountId === "temp");
  }, [data?.rules, activeAccountId]);
  const logs = useMemo(() => {
    const allLogs = data?.logs || [];
    if (!activeAccountId) return allLogs;
    return allLogs.filter((l: any) => !l.accountId || l.accountId === activeAccountId);
  }, [data?.logs, activeAccountId]);
  const stats = useMemo(() => {
    if (!activeAccountId || !Array.isArray(data?.logs)) {
      return data?.stats || { totalComments: 0, totalDms: 0 };
    }
    const sentComments = logs.filter((l: any) => l.replyCommentStatus === "SENT").length;
    const sentDms = logs.filter((l: any) => l.dmStatus === "SENT").length;
    return {
      totalComments: Math.max(sentComments, (!selectedAgentId || selectedAgentId === account?.id) ? (data?.stats?.totalComments || 0) : sentComments),
      totalDms: Math.max(sentDms, (!selectedAgentId || selectedAgentId === account?.id) ? (data?.stats?.totalDms || 0) : sentDms),
    };
  }, [data?.stats, data?.logs, logs, activeAccountId, selectedAgentId, account?.id]);

  const isStoryRule = (r: any) =>
    ["ALL_STORIES", "SPECIFIC_STORY", "STORY_MENTION"].includes(r.triggerType) ||
    ["Semua Story", "Story Tertentu", "Story Mention"].includes(parseClientRuleConfig(r.dmMessage)?.targetOtomasi);

  const isLiveRule = (r: any) =>
    r.triggerType === "LIVE" ||
    r.triggerType === "INSTAGRAM_LIVE" ||
    parseClientRuleConfig(r.dmMessage)?.targetOtomasi === "Live Instagram";

  const isDmRule = (r: any) =>
    r.triggerType === "DM" ||
    parseClientRuleConfig(r.dmMessage)?.targetOtomasi === "Pesan Instagram";

  const isPostRule = (r: any) => !isStoryRule(r) && !isLiveRule(r) && !isDmRule(r);

  // Filtered rules according to tab and filter dropdown
  const filteredRules = rules.filter((rule: any) => {
    if (automationTab === "POST" && !isPostRule(rule)) return false;
    if (automationTab === "STORY" && !isStoryRule(rule)) return false;
    if (automationTab === "LIVE" && !isLiveRule(rule)) return false;
    if (automationTab === "DM" && !isDmRule(rule)) return false;
    if (filterStatus === "ACTIVE") return rule.isActive;
    if (filterStatus === "INACTIVE") return !rule.isActive;
    return true;
  });

  return (
    <div
      className={`flex-1 w-full mx-auto animate-in fade-in duration-300 ${
        selectedPlatform === null
          ? "max-w-7xl p-4 md:p-8"
          : "max-w-4xl p-6 py-10 md:py-16"
      }`}
    >
      {/* Toast Notification (Seragam dengan Ruang Ngonten & Ruang Belajar) */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-top-5 fade-in duration-300 pointer-events-none">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-white border-gray-200 dark:bg-[#141B31] dark:border-[#2C3246]">
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
          <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl border bg-white border-gray-200 dark:bg-[#141B31] dark:border-[#2C3246] animate-in zoom-in-95 duration-200">
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
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:border-[#2C3246] dark:text-gray-200 cursor-pointer"
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
      {/* LEVEL 1: PLATFORM HUB SELECTION (MODULAR PER PLATFORM) */}
      {/* ========================================================================= */}
      {selectedPlatform === null ? (
        <PlatformHubSection
          isLoggedIn={isLoggedIn}
          isPro={isPro}
          isAdmin={isAdmin}
          onSelectInstagram={handleSelectInstagram}
        />
      ) : selectedAgentId === null ? (
        /* ========================================================================= */
        /* LEVEL 2: DAFTAR AGEN OTOMASI INSTAGRAM (MODULAR) */
        /* ========================================================================= */
        <InstagramAgentListSection
          agents={agents}
          filteredAgents={filteredAgents}
          agentFilterStatus={agentFilterStatus}
          setAgentFilterStatus={setAgentFilterStatus}
          isAgentFilterOpen={isAgentFilterOpen}
          setIsAgentFilterOpen={setIsAgentFilterOpen}
          activeDropdownAgentId={activeDropdownAgentId}
          setActiveDropdownAgentId={setActiveDropdownAgentId}
          onBackToPlatformHub={() => {
            setUserHasExitedToHub(true);
            setSelectedPlatform(null);
            setSelectedAgentId(null);
            if (typeof window !== "undefined") {
              window.history.pushState(null, "", "/ruang-automation");
              window.dispatchEvent(new CustomEvent("automation-platform-change", { detail: null }));
              window.dispatchEvent(new Event("app-shallow-navigate"));
            }
          }}
          onOpenCreateAgentModal={() => {
            const agentLimit = (data as any)?.agentLimit ?? 1;
            if (!isAdmin && agents.length >= agentLimit) {
              showToast("info", "Untuk membuat agen baru, silakan lakukan pembayaran paket terlebih dahulu.");
              window.dispatchEvent(new Event("app-loading-start"));
              router.push("/?pricing=true&cat=automation");
              return;
            }
            setNewAgentName("");
            setIsCreateAgentModalOpen(true);
          }}
          onSelectAgent={(agentId) => {
            setSelectedAgentId(agentId);
            setActiveIgTab("koneksi");
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set("agentId", agentId);
            window.history.pushState({}, "", newUrl.toString());
            window.dispatchEvent(new Event("app-shallow-navigate"));
          }}
          onOpenEditAgentModal={handleOpenEditAgentModal}
          onDisconnectAgent={handleDisconnectAgent}
          onDeleteAgent={handleDeleteAgent}
          isAdmin={isAdmin}
        />
      ) : (
        /* ========================================================================= */
        /* LEVEL 3: WORKSPACE AGEN AKTIF (MODULAR PER FITUR INSTAGRAM) */
        /* ========================================================================= */
        <div className="animate-in fade-in duration-200">
          {/* Top Navigation & Active Agent Header */}
          <div className="mb-6">
            <BackButton
              onClick={() => {
                setSelectedAgentId(null);
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete("agentId");
                window.history.pushState({}, "", newUrl.toString());
                window.dispatchEvent(new Event("app-shallow-navigate"));
              }}
            />
          </div>

          {/* Header Title */}
          <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
            IG Automation
          </h1>

          <div className="space-y-6">
            {/* Horizontal Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {igTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveIgTab(tab.id as any)}
                  className={`px-4 py-2 text-xs md:text-sm font-bold whitespace-nowrap transition-colors rounded-xl border ${
                    activeIgTab === tab.id
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#1f2947]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: KONEKSI AKUN */}
            {activeIgTab === "koneksi" && (
              <InstagramConnectionTab
                displayAccount={displayAccount}
                currentAgent={currentAgent}
                account={account}
                selectedAgentId={selectedAgentId}
                avatarError={avatarError}
                setAvatarError={setAvatarError}
                isPending={isPending}
                onResyncAccount={handleResyncAccount}
                onDisconnect={handleDisconnect}
                onStartMetaOAuth={handleStartMetaOAuth}
              />
            )}

            {/* TAB 2: KOMENTAR IG KE DM */}
            {activeIgTab === "komentar" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header & Actions Card */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31] shadow-sm">
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
                            ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            : "border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                        {filterStatus !== "ALL" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>

                      {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shadow-2xl py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Status Aturan
                          </div>
                          <button
                            onClick={() => {
                              setFilterStatus("ALL");
                              setIsFilterOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                              filterStatus === "ALL"
                                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            Semua Status
                            {filterStatus === "ALL" && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 stroke-[2.5]" />}
                          </button>
                          <button
                            onClick={() => {
                              setFilterStatus("ACTIVE");
                              setIsFilterOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                              filterStatus === "ACTIVE"
                                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            Berjalan (Aktif)
                            {filterStatus === "ACTIVE" && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 stroke-[2.5]" />}
                          </button>
                          <button
                            onClick={() => {
                              setFilterStatus("INACTIVE");
                              setIsFilterOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                              filterStatus === "INACTIVE"
                                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            Nonaktif
                            {filterStatus === "INACTIVE" && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 stroke-[2.5]" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Buat Automation Button */}
                    <button
                      onClick={handleOpenAddRuleModal}
                      className="justify-center bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      Buat Automation
                    </button>
                  </div>
                </div>

                {/* Sub-Navigation Pill Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-[#141B31] rounded-xl border border-gray-200 dark:border-[#2C3246] overflow-x-auto max-w-full">
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
                            ? "bg-white dark:bg-[#141B31] text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-[#2C3246]"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Isolated Sub-Feature Sections */}
                {automationTab === "POST" && (
                  <PostAutomationSection
                    filteredRules={filteredRules}
                    filterStatus={filterStatus}
                    isAccountLinked={isAccountLinked}
                    accountUsername={displayAccount?.username || account?.username}
                    feedPosts={feedPosts}
                    logs={logs}
                    activeDropdownRuleId={activeDropdownRuleId}
                    setActiveDropdownRuleId={setActiveDropdownRuleId}
                    handleToggleRule={handleToggleRule}
                    handleDuplicateRule={handleDuplicateRule}
                    handleOpenEditRuleModal={handleOpenEditRuleModal}
                    handleDeleteRule={handleDeleteRule}
                    setDetailRuleId={setDetailRuleId}
                  />
                )}

                {automationTab === "STORY" && (
                  <StoryAutomationSection
                    filteredRules={filteredRules}
                    filterStatus={filterStatus}
                    isAccountLinked={isAccountLinked}
                    accountUsername={displayAccount?.username || account?.username}
                    activeStories={activeStories}
                    logs={logs}
                    activeDropdownRuleId={activeDropdownRuleId}
                    setActiveDropdownRuleId={setActiveDropdownRuleId}
                    handleToggleRule={handleToggleRule}
                    handleDuplicateRule={handleDuplicateRule}
                    handleOpenEditRuleModal={handleOpenEditRuleModal}
                    handleDeleteRule={handleDeleteRule}
                    setDetailRuleId={setDetailRuleId}
                    handleOpenAddRuleModal={handleOpenAddRuleModal}
                  />
                )}

                {automationTab === "LIVE" && (
                  <LiveAutomationSection
                    filteredRules={filteredRules}
                    filterStatus={filterStatus}
                    isAccountLinked={isAccountLinked}
                    accountUsername={displayAccount?.username || account?.username}
                    logs={logs}
                    activeDropdownRuleId={activeDropdownRuleId}
                    setActiveDropdownRuleId={setActiveDropdownRuleId}
                    handleToggleRule={handleToggleRule}
                    handleDuplicateRule={handleDuplicateRule}
                    handleOpenEditRuleModal={handleOpenEditRuleModal}
                    handleDeleteRule={handleDeleteRule}
                    setDetailRuleId={setDetailRuleId}
                    handleOpenAddRuleModal={handleOpenAddRuleModal}
                  />
                )}

                {automationTab === "DM" && (
                  <DmAutomationSection
                    filteredRules={filteredRules}
                    filterStatus={filterStatus}
                    isAccountLinked={isAccountLinked}
                    accountUsername={displayAccount?.username || account?.username}
                    logs={logs}
                    activeDropdownRuleId={activeDropdownRuleId}
                    setActiveDropdownRuleId={setActiveDropdownRuleId}
                    handleToggleRule={handleToggleRule}
                    handleDuplicateRule={handleDuplicateRule}
                    handleOpenEditRuleModal={handleOpenEditRuleModal}
                    handleDeleteRule={handleDeleteRule}
                    setDetailRuleId={setDetailRuleId}
                    handleOpenAddRuleModal={handleOpenAddRuleModal}
                  />
                )}
              </div>
            )}

            {/* TAB 3: DASHBOARD */}
            {activeIgTab === "dashboard" && (
              <InstagramDashboardTab stats={stats} rules={rules} logs={logs} />
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUAT & UBAH AGEN (MODULAR) */}
      {/* ========================================================================= */}
      {(isCreateAgentModalOpen || isEditAgentModalOpen) && (
        <InstagramAgentModals
          isCreateAgentModalOpen={isCreateAgentModalOpen}
          setIsCreateAgentModalOpen={setIsCreateAgentModalOpen}
          newAgentName={newAgentName}
          setNewAgentName={setNewAgentName}
          isSubmittingAgent={isSubmittingAgent}
          handleCreateAgent={handleCreateAgent}
          isEditAgentModalOpen={isEditAgentModalOpen}
          setIsEditAgentModalOpen={setIsEditAgentModalOpen}
          editingAgent={editingAgent}
          editAgentName={editAgentName}
          setEditAgentName={setEditAgentName}
          handleSaveEditAgent={handleSaveEditAgent}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL STUDIO: BUAT / EDIT OTOMASI BARU (MODULAR) */}
      {/* ========================================================================= */}
      {isRuleModalOpen && (
        <InstagramRuleStudioModal
          isRuleModalOpen={isRuleModalOpen}
          setIsRuleModalOpen={setIsRuleModalOpen}
          editingRule={editingRule}
          ruleFormData={ruleFormData}
          setRuleFormData={setRuleFormData}
          handleSaveRule={handleSaveRule}
          isPending={isPending}
          isTargetDropdownOpen={isTargetDropdownOpen}
          setIsTargetDropdownOpen={setIsTargetDropdownOpen}
          isFrequencyDropdownOpen={isFrequencyDropdownOpen}
          setIsFrequencyDropdownOpen={setIsFrequencyDropdownOpen}
          isAccountLinked={isAccountLinked}
          isFeedLive={isFeedLive}
          isLoadingFeed={isLoadingFeed}
          feedPosts={feedPosts}
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          showAllPostsModal={showAllPostsModal}
          setShowAllPostsModal={setShowAllPostsModal}
          isStoriesLive={isStoriesLive}
          isLoadingStories={isLoadingStories}
          isValidatingStories={isValidatingStories}
          activeStories={activeStories}
          selectedStory={selectedStory}
          setSelectedStory={setSelectedStory}
          handleRefreshStories={handleRefreshStories}
          activePreviewTab={activePreviewTab}
          setActivePreviewTab={setActivePreviewTab}
          activeLiveContentIdx={activeLiveContentIdx}
          setActiveLiveContentIdx={setActiveLiveContentIdx}
          simulatedButtonId={simulatedButtonId}
          setSimulatedButtonId={setSimulatedButtonId}
          simulatedLiveQrId={simulatedLiveQrId}
          setSimulatedLiveQrId={setSimulatedLiveQrId}
          simulatedFollowStep={simulatedFollowStep}
          setSimulatedFollowStep={setSimulatedFollowStep}
          account={displayAccount || currentAgent || account}
          currentAgent={currentAgent || displayAccount || account}
          showToast={showToast}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL POPUP: DETAIL OTOMASI (MODULAR) */}
      {/* ========================================================================= */}
      {Boolean(detailRuleId) && (
        <InstagramRuleDetailModal
          detailRuleId={detailRuleId}
          setDetailRuleId={setDetailRuleId}
          rules={rules}
          feedPosts={feedPosts}
          accountUsername={displayAccount?.username || account?.username}
          logs={logs}
          handleOpenEditRuleModal={handleOpenEditRuleModal}
          isRetryingFailed={isRetryingFailed}
          setIsRetryingFailed={setIsRetryingFailed}
          isRewindingComments={isRewindingComments}
          setIsRewindingComments={setIsRewindingComments}
          retryFailedAutomationLogsAction={retryFailedAutomationLogsAction}
          rewindAutomationCommentsAction={rewindAutomationCommentsAction}
          showToast={showToast}
          mutateData={mutateData}
        />
      )}
    </div>
  );
}

