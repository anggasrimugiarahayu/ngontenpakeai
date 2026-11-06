// src/app/(app)/ruang-automation/utils/instagramFlowCompiler.ts
// Two-way compiler between visual flow nodes & InstagramAutomationRule DB JSON schema

export interface FlowNodePosition {
  x: number;
  y: number;
}

export interface FlowNodeData {
  id: string;
  type:
    | "TRIGGER"
    | "WELCOME_DM"
    | "ASK_FOLLOW"
    | "ASK_CONTACT"
    | "MAIN_DM"
    | "HELPER_NOTE"
    | "ACTIONS"
    | "START_AUTOMATION"
    | "CONDITION"
    | "SMART_DELAY"
    | "RANDOMIZER";
  title?: string;
  position: FlowNodePosition;
  data: Record<string, any>;
}

export interface FlowEdge {
  id: string;
  source: string; // source node id
  sourceHandle?: string; // port id e.g. "then", "button_click", "already_follow", "need_follow"
  target: string; // target node id
  targetHandle?: string;
}

export interface FlowGraphState {
  nodes: FlowNodeData[];
  edges: FlowEdge[];
  ruleName: string;
  isActive: boolean;
  targetOtomasi: string;
  postType: string;
  postId?: string;
  postCoverUrl?: string;
  postPermalink?: string;
  // Full extended config fields
  rawConfig: Record<string, any>;
}

/**
 * Default positions for clean ManyChat-style 3-column / 4-column flow layout
 */
export const DEFAULT_FLOW_POSITIONS: Record<string, FlowNodePosition> = {
  trigger: { x: 80, y: 180 },
  trigger_note: { x: 80, y: 380 },
  welcome_dm: { x: 440, y: 180 },
  welcome_note: { x: 440, y: -40 },
  ask_follow: { x: 800, y: 140 },
  ask_contact: { x: 800, y: 440 },
  main_dm: { x: 820, y: 180 },
  main_note_top: { x: 820, y: 40 },
  main_note_bottom: { x: 820, y: 530 },
};

/**
 * Generate default nodes & edges for a new flow or an existing rule
 */
export function buildFlowGraphFromRule(
  rule?: any | null,
  options?: {
    defaultPost?: any;
    targetOtomasi?: string;
  }
): FlowGraphState {
  const isEditing = Boolean(rule && rule.id);
  let parsedConfig: Record<string, any> = {};

  if (rule?.dmMessage) {
    try {
      if (rule.dmMessage.trim().startsWith("{") || rule.dmMessage.includes('"mainMessage"')) {
        parsedConfig = JSON.parse(rule.dmMessage);
      }
    } catch {
      parsedConfig = {};
    }
  }

  const savedPositions = parsedConfig.flowMeta?.nodePositions || {};

  const targetOtomasi =
    parsedConfig.targetOtomasi ||
    (rule?.triggerType === "SPECIFIC_POST"
      ? "Postingan Tertentu"
      : rule?.triggerType === "NEXT_POST"
      ? "Postingan Berikutnya"
      : rule?.triggerType === "ALL_STORIES"
      ? "Semua Story"
      : rule?.triggerType === "SPECIFIC_STORY"
      ? "Story Tertentu"
      : rule?.triggerType === "STORY_MENTION"
      ? "Story Mention"
      : rule?.triggerType === "LIVE" || rule?.triggerType === "INSTAGRAM_LIVE"
      ? "Live Instagram"
      : rule?.triggerType === "DM"
      ? "Pesan Instagram"
      : options?.targetOtomasi || "Postingan Tertentu");

  const postType =
    targetOtomasi === "Postingan Tertentu"
      ? "SPECIFIC"
      : targetOtomasi === "Postingan Berikutnya"
      ? "NEXT"
      : targetOtomasi === "Semua Story"
      ? "ALL_STORIES"
      : targetOtomasi === "Story Tertentu"
      ? "SPECIFIC_STORY"
      : targetOtomasi === "Story Mention"
      ? "STORY_MENTION"
      : targetOtomasi === "Live Instagram"
      ? "LIVE"
      : targetOtomasi === "Pesan Instagram"
      ? "DM"
      : "ALL";

  const postId = rule?.specificPostId || options?.defaultPost?.id || "";
  const postCoverUrl = parsedConfig.postCoverUrl || options?.defaultPost?.image || options?.defaultPost?.thumb || "";
  const postPermalink = parsedConfig.postPermalink || options?.defaultPost?.permalink || "";

  const keywordsStr = Array.isArray(rule?.keywords)
    ? rule.keywords.join(", ")
    : typeof rule?.keywords === "string"
    ? rule.keywords
    : "mau, link, spill";

  const commentRepliesArray =
    Array.isArray(rule?.commentReplies) && rule.commentReplies.length > 0
      ? rule.commentReplies
      : Array.isArray(rule?.replyCommentTemplates) && rule.replyCommentTemplates.length > 0
      ? rule.replyCommentTemplates
      : [
          "Pesan terkirim! 🚀",
          "Halo @{username}, cek DMnya ya! 📬",
          "{kak|bro|sis}, linknya udah dikirim ke DM ya! 💌",
        ];

  // Features flags
  const featureWelcomeMessage =
    parsedConfig.featureWelcomeMessage !== undefined
      ? Boolean(parsedConfig.featureWelcomeMessage)
      : true; // Default True in Flow Builder for ManyChat experience

  const featureAskForFollow = Boolean(parsedConfig.featureAskForFollow);
  const featureAskForContact = Boolean(parsedConfig.featureAskForContact);
  const featureFollowUp = Boolean(parsedConfig.featureFollowUp);

  const mainButtons =
    Array.isArray(parsedConfig.buttons) && parsedConfig.buttons.length > 0
      ? parsedConfig.buttons
      : [
          {
            id: "btn_1",
            labelType: "Kustom",
            label: "Buka Link Akses",
            action: "Buka Website",
            url: rule?.buttonUrl || "https://ruangcreativemuslim.com",
            text: "Terima kasih sudah tertarik! Ini info detail balasan dari kami.",
          },
        ];

  const mainDmMessage =
    parsedConfig.mainMessage ||
    rule?.dmMessage ||
    "Halo {first_name}! Terima kasih sudah tertarik. Ini link akses yang kamu minta:\nhttps://ruangcreativemuslim.com";

  // Build Nodes array
  const nodes: FlowNodeData[] = [];
  const edges: FlowEdge[] = [];

  // 1. TRIGGER NODE
  nodes.push({
    id: "node_trigger",
    type: "TRIGGER",
    title: "⚡ Ketika...",
    position: savedPositions.node_trigger || DEFAULT_FLOW_POSITIONS.trigger,
    data: {
      targetOtomasi,
      postType,
      postId,
      postCoverUrl,
      postPermalink,
      triggerCommentType: parsedConfig.triggerCommentType || "KEYWORDS",
      keywords: keywordsStr,
      keywordRule: parsedConfig.keywordRule || "Contains",
      featureReplyComment: parsedConfig.featureReplyComment ?? true,
      commentReplies: commentRepliesArray,
      storyMentionFrequency: parsedConfig.storyMentionFrequency || "24 jam sekali",
      liveContents: parsedConfig.liveContents || [],
    },
  });

  // Helper note below trigger
  nodes.push({
    id: "note_trigger",
    type: "HELPER_NOTE",
    position: savedPositions.note_trigger || DEFAULT_FLOW_POSITIONS.trigger_note,
    data: {
      text:
        targetOtomasi === "Pesan Instagram"
          ? 'Trigger ini aktif saat user mengirim DM langsung berisi kata kunci.'
          : targetOtomasi.includes("Story")
          ? 'Trigger ini mendeteksi interaksi atau balasan pada Story Instagram Anda.'
          : 'Trigger pemicu: User memberikan komentar di postingan Feed atau Reels Anda.',
    },
  });

  // 2. WELCOME DM NODE (Opening DM)
  if (featureWelcomeMessage) {
    nodes.push({
      id: "node_welcome_dm",
      type: "WELCOME_DM",
      title: "Instagram Send Message",
      position: savedPositions.node_welcome_dm || DEFAULT_FLOW_POSITIONS.welcome_dm,
      data: {
        welcomeMessage:
          parsedConfig.welcomeMessage ||
          "Halo {first_name}! Akses yang kamu minta sudah kami siapkan nihh. Mau ambil sekarang? ✨",
        welcomeButtonLabel: parsedConfig.welcomeButtonLabel || "Lihat Produk 🤩",
        welcomeMessageType: parsedConfig.welcomeMessageType || "Template Tombol",
      },
    });

    // Helper note above welcome DM
    nodes.push({
      id: "note_welcome",
      type: "HELPER_NOTE",
      position: savedPositions.note_welcome || DEFAULT_FLOW_POSITIONS.welcome_note,
      data: {
        text:
          "Ini adalah pesan pertama yang diterima follower di DM. Meta mewajibkan pesan balasan komentar berupa teks + tombol agar pesan utama berikutnya tidak terpotong.",
      },
    });

    // Edge: Trigger -> Welcome DM
    edges.push({
      id: "edge_trigger_to_welcome",
      source: "node_trigger",
      sourceHandle: "then",
      target: "node_welcome_dm",
      targetHandle: "input",
    });
  }

  // 3. ASK FOR FOLLOW NODE (if enabled)
  if (featureAskForFollow) {
    nodes.push({
      id: "node_ask_follow",
      type: "ASK_FOLLOW",
      title: "Cek Status Follower",
      position: savedPositions.node_ask_follow || DEFAULT_FLOW_POSITIONS.ask_follow,
      data: {
        askForFollowMessage:
          parsedConfig.askForFollowMessage ||
          'Btw, kayaknya kamu belum follow akun ini nih. Sistem kami otomatis mengunci akses khusus untuk followers.\n\nYuk follow dulu ya, lalu klik tombol "Udah Follow" di bawah 🙌',
        askForFollowButtonLabel: parsedConfig.askForFollowButtonLabel || "Udah follow 🙌",
        askForFollowHasRetry: parsedConfig.askForFollowHasRetry ?? false,
        askForFollowRetryMessage:
          parsedConfig.askForFollowRetryMessage ||
          'Masih belum terdeteksi follow nih kak 😅\n\nCoba buka profil kami, klik Ikuti/Follow, lalu tap lagi tombol di bawah ya!',
        askForFollowRetryButtonLabel: parsedConfig.askForFollowRetryButtonLabel || "Udah follow 🙌",
      },
    });

    // Connect edge to Ask Follow
    const sourceNodeId = featureWelcomeMessage ? "node_welcome_dm" : "node_trigger";
    const sourceHandle = featureWelcomeMessage ? "welcome_btn_click" : "then";
    edges.push({
      id: `edge_${sourceNodeId}_to_ask_follow`,
      source: sourceNodeId,
      sourceHandle,
      target: "node_ask_follow",
      targetHandle: "input",
    });
  }

  // 4. ASK CONTACT NODE (if enabled)
  if (featureAskForContact) {
    nodes.push({
      id: "node_ask_contact",
      type: "ASK_CONTACT",
      title: "Minta Data Kontak (Lead)",
      position: savedPositions.node_ask_contact || DEFAULT_FLOW_POSITIONS.ask_contact,
      data: {
        askContactType: parsedConfig.askContactType || "Email Saja",
        askContactMessage:
          parsedConfig.askContactMessage ||
          "Sip! Biar link akses tersimpan rapi & aman di inbox kamu, boleh ketik alamat Email aktif kamu di bawah ini ya 👇",
        askContactInvalidMessage:
          parsedConfig.askContactInvalidMessage ||
          "Format emailnya sepertinya belum pas kak 😅 Ketik ulang email aktif kamu ya 🙏",
      },
    });

    if (!featureAskForFollow) {
      const sourceNodeId = featureWelcomeMessage ? "node_welcome_dm" : "node_trigger";
      const sourceHandle = featureWelcomeMessage ? "welcome_btn_click" : "then";
      edges.push({
        id: `edge_${sourceNodeId}_to_ask_contact`,
        source: sourceNodeId,
        sourceHandle,
        target: "node_ask_contact",
        targetHandle: "input",
      });
    }
  }

  // 5. MAIN DM & SMART DELAY / FOLLOW-UP NODE
  // Determine position offset if preceding steps exist
  let mainDmPosX = 820;
  if (featureWelcomeMessage && (featureAskForFollow || featureAskForContact)) {
    mainDmPosX = 1180;
  } else if (!featureWelcomeMessage && !featureAskForFollow && !featureAskForContact) {
    mainDmPosX = 480;
  }

  const mainDmPos = savedPositions.node_main_dm || { x: mainDmPosX, y: 180 };

  nodes.push({
    id: "node_main_dm",
    type: "MAIN_DM",
    title: "Instagram Send Message (Main Offer)",
    position: mainDmPos,
    data: {
      messageType: parsedConfig.messageType || "BUTTON_TEMPLATE",
      dmMessage: mainDmMessage,
      buttons: mainButtons,
      carouselSlides: parsedConfig.carouselSlides || [],
      quickReplies: parsedConfig.quickReplies || [],
      featureFollowUp,
      followUpDelay: parsedConfig.followUpDelay || "1 Jam",
      followUpCondition: parsedConfig.followUpCondition || "Hanya yang Belum Klik Link",
      followUpMessageType: parsedConfig.followUpMessageType || "BUTTON_TEMPLATE",
      followUpMessage:
        parsedConfig.followUpMessage ||
        "Halo {first_name}! Link materinya tadi udah sempat kamu buka belum? Kalau ada kendala bilang ya 😉",
      followUpButtonLabel: parsedConfig.followUpButtonLabel || "Buka Link Sekarang",
      followUpButtons: parsedConfig.followUpButtons || [
        {
          id: "followup_btn_1",
          labelType: "Kustom",
          label: "Buka Link Sekarang",
          action: "Buka Website",
          url: rule?.buttonUrl || "https://ruangcreativemuslim.com",
        },
      ],
      followUpCarouselSlides: parsedConfig.followUpCarouselSlides || [],
      followUpQuickReplies: parsedConfig.followUpQuickReplies || [],
    },
  });

  // Helper note above main DM
  nodes.push({
    id: "note_main_top",
    type: "HELPER_NOTE",
    position: savedPositions.note_main_top || { x: mainDmPos.x, y: mainDmPos.y - 120 },
    data: {
      text: "Pastikan URL tombol mengarah ke halaman produk, landing page, atau grup WhatsApp Anda!",
    },
  });

  if (featureFollowUp) {
    // Helper note below follow up
    nodes.push({
      id: "note_main_bottom",
      type: "HELPER_NOTE",
      position: savedPositions.note_main_bottom || { x: mainDmPos.x, y: mainDmPos.y + 350 },
      data: {
        text: "Pesan follow-up akan dikirim otomatis oleh server jika penerima belum mengklik tautan dalam waktu yang ditentukan.",
      },
    });
  }

  // Connect edge to Main DM
  let mainSourceId = "node_trigger";
  let mainSourceHandle = "then";

  if (featureAskForContact) {
    mainSourceId = "node_ask_contact";
    mainSourceHandle = "contact_submitted";
  } else if (featureAskForFollow) {
    mainSourceId = "node_ask_follow";
    mainSourceHandle = "already_followed";
  } else if (featureWelcomeMessage) {
    mainSourceId = "node_welcome_dm";
    mainSourceHandle = "welcome_btn_click";
  }

  edges.push({
    id: `edge_${mainSourceId}_to_main_dm`,
    source: mainSourceId,
    sourceHandle: mainSourceHandle,
    target: "node_main_dm",
    targetHandle: "input",
  });

  // Restore any saved logic nodes (ACTIONS, START_AUTOMATION, CONDITION, SMART_DELAY, RANDOMIZER)
  if (Array.isArray(parsedConfig.flowMeta?.logicNodes)) {
    for (const logicNode of parsedConfig.flowMeta.logicNodes) {
      if (!nodes.some((n) => n.id === logicNode.id)) {
        nodes.push(logicNode);
      }
    }
  }

  // Restore custom edges if present
  if (Array.isArray(parsedConfig.flowMeta?.edges) && parsedConfig.flowMeta.edges.length > 0) {
    for (const savedEdge of parsedConfig.flowMeta.edges) {
      if (!edges.some((e) => e.id === savedEdge.id)) {
        edges.push(savedEdge);
      }
    }
  }

  return {
    nodes,
    edges,
    ruleName: rule?.name || "Otomasi Komentar ke DM",
    isActive: rule?.isActive !== undefined ? Boolean(rule.isActive) : false,
    targetOtomasi,
    postType,
    postId,
    postCoverUrl,
    postPermalink,
    rawConfig: parsedConfig,
  };
}

/**
 * Compile current visual graph state into saveAutomationRuleAction payload
 */
export function compileFlowGraphToRulePayload(
  graphState: FlowGraphState,
  options: {
    ruleId?: string;
    accountId?: string;
    setLive?: boolean;
  }
) {
  const triggerNode = graphState.nodes.find((n) => n.type === "TRIGGER");
  const welcomeNode = graphState.nodes.find((n) => n.type === "WELCOME_DM");
  const askFollowNode = graphState.nodes.find((n) => n.type === "ASK_FOLLOW");
  const askContactNode = graphState.nodes.find((n) => n.type === "ASK_CONTACT");
  const mainNode = graphState.nodes.find((n) => n.type === "MAIN_DM");

  const triggerData = triggerNode?.data || {};
  const welcomeData = welcomeNode?.data || {};
  const askFollowData = askFollowNode?.data || {};
  const askContactData = askContactNode?.data || {};
  const mainData = mainNode?.data || {};

  // Preserve all node positions for future flow restores
  const nodePositions: Record<string, FlowNodePosition> = {};
  for (const n of graphState.nodes) {
    nodePositions[n.id] = { x: n.position.x, y: n.position.y };
  }

  const isLiveRule =
    triggerData.targetOtomasi === "Live Instagram" || triggerData.postType === "LIVE";
  const isDmRule =
    triggerData.targetOtomasi === "Pesan Instagram" || triggerData.postType === "DM";
  const isStoryMention =
    triggerData.targetOtomasi === "Story Mention" || triggerData.postType === "STORY_MENTION";

  const firstButton = mainData.buttons?.[0];
  const buttonText = firstButton?.label ? String(firstButton.label).trim() : null;
  const buttonUrl = firstButton?.url ? String(firstButton.url).trim() : null;

  // Extract all custom logic nodes (ACTIONS, START_AUTOMATION, CONDITION, SMART_DELAY, RANDOMIZER)
  const logicNodes = graphState.nodes.filter((n) =>
    ["ACTIONS", "START_AUTOMATION", "CONDITION", "SMART_DELAY", "RANDOMIZER"].includes(n.type)
  );

  const extendedConfig: Record<string, any> = {
    builderMode: "FLOW",
    targetOtomasi: triggerData.targetOtomasi || "Postingan Tertentu",
    triggerCommentType: isStoryMention ? "ALL" : isDmRule ? "KEYWORDS" : triggerData.triggerCommentType || "KEYWORDS",
    keywordRule: triggerData.keywordRule || "Contains",
    storyMentionFrequency: triggerData.storyMentionFrequency || "24 jam sekali",
    postPermalink: triggerData.postPermalink || null,
    postCoverUrl: triggerData.postCoverUrl || null,
    featureReplyComment: triggerData.featureReplyComment ?? true,
    replyCommentTemplates: triggerData.commentReplies?.[0] || "Pesan terkirim! 🚀",

    // Welcome DM
    featureWelcomeMessage: Boolean(welcomeNode),
    welcomeMessageType: welcomeData.welcomeMessageType || "Template Tombol",
    welcomeMessage: welcomeData.welcomeMessage || "Akses nya udah kita buatin nihh!!\n\nMau? ✨",
    welcomeButtonLabel: welcomeData.welcomeButtonLabel || "Lihat Produk 🤩",

    // Ask For Follow
    featureAskForFollow: Boolean(askFollowNode),
    askForFollowMessageType: "Template Tombol",
    askForFollowMessage: askFollowData.askForFollowMessage || "",
    askForFollowButtonLabel: askFollowData.askForFollowButtonLabel || "Udah follow 🙌",
    askForFollowHasRetry: askFollowData.askForFollowHasRetry || false,
    askForFollowRetryMessage: askFollowData.askForFollowRetryMessage || "",
    askForFollowRetryButtonLabel: askFollowData.askForFollowRetryButtonLabel || "Udah follow 🙌",

    // Ask For Contact
    featureAskForContact: Boolean(askContactNode),
    askContactType: askContactData.askContactType || "Email Saja",
    askContactMessage: askContactData.askContactMessage || "",
    askContactInvalidMessage: askContactData.askContactInvalidMessage || "",

    // Main DM
    mainMessage: mainData.dmMessage || "Halo {first_name}! Terima kasih sudah tertarik.",
    messageType: mainData.messageType || "BUTTON_TEMPLATE",
    buttons: mainData.buttons || [],
    carouselSlides: mainData.carouselSlides || [],
    quickReplies: mainData.quickReplies || [],

    // Smart Delay & Follow-Up
    featureFollowUp: Boolean(mainData.featureFollowUp),
    followUpDelay: mainData.followUpDelay || "1 Jam",
    followUpCondition: mainData.followUpCondition || "Hanya yang Belum Klik Link",
    followUpMessageType: mainData.followUpMessageType || "BUTTON_TEMPLATE",
    followUpMessage: mainData.followUpMessage || "",
    followUpButtonLabel: mainData.followUpButtonLabel || "Buka Link Sekarang",
    followUpButtons: mainData.followUpButtons || [],
    followUpCarouselSlides: mainData.followUpCarouselSlides || [],
    followUpQuickReplies: mainData.followUpQuickReplies || [],

    featureLinkTracking: true,
    replyHeartReaction: false,

    // Flow visual metadata
    flowMeta: {
      builderMode: "FLOW",
      version: 1,
      nodePositions,
      edges: graphState.edges,
      logicNodes,
      lastSavedAt: new Date().toISOString(),
    },
  };

  const cleanKeywords = isStoryMention
    ? []
    : String(triggerData.keywords || "mau")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

  const cleanCommentReplies = Array.isArray(triggerData.commentReplies)
    ? triggerData.commentReplies
    : [triggerData.replyCommentTemplates || "Pesan terkirim! 🚀"];

  return {
    id: options.ruleId,
    ruleId: options.ruleId,
    accountId: options.accountId,
    name: graphState.ruleName.trim() || "Otomasi Flow Baru",
    postType: triggerData.postType || "SPECIFIC",
    postId: triggerData.postId || undefined,
    triggerType:
      triggerData.postType === "SPECIFIC"
        ? "SPECIFIC_POST"
        : triggerData.postType === "NEXT"
        ? "NEXT_POST"
        : triggerData.postType === "ALL_STORIES"
        ? "ALL_STORIES"
        : triggerData.postType === "SPECIFIC_STORY"
        ? "SPECIFIC_STORY"
        : triggerData.postType === "STORY_MENTION"
        ? "STORY_MENTION"
        : triggerData.postType === "LIVE"
        ? "LIVE"
        : triggerData.postType === "DM"
        ? "DM"
        : "ALL_POSTS",
    keywords: cleanKeywords,
    isReplyComment: Boolean(triggerData.featureReplyComment),
    replyCommentTemplates: cleanCommentReplies,
    commentReplies: cleanCommentReplies,
    isSendDm: true,
    dmMessage: JSON.stringify(extendedConfig),
    buttonText: buttonText || undefined,
    buttonUrl: buttonUrl || undefined,
    isActive: options.setLive !== undefined ? options.setLive : graphState.isActive,
  };
}
