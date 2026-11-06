// src/app/(app)/ruang-automation/instagram/InstagramFlowRuleStudio.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FlowTopBar } from "./flow-nodes/FlowTopBar";
import { FlowCanvasControls } from "./flow-nodes/FlowCanvasControls";
import { FlowAddStepMenu } from "./flow-nodes/FlowAddStepMenu";
import { FlowStepInspectorDrawer } from "./flow-nodes/FlowStepInspectorDrawer";
import { FlowTriggerNode } from "./flow-nodes/FlowTriggerNode";
import { FlowWelcomeDmNode } from "./flow-nodes/FlowWelcomeDmNode";
import { FlowGatekeeperNode } from "./flow-nodes/FlowGatekeeperNode";
import { FlowMainMessageNode } from "./flow-nodes/FlowMainMessageNode";
import { FlowHelperNoteNode } from "./flow-nodes/FlowHelperNoteNode";
import {
  buildFlowGraphFromRule,
  compileFlowGraphToRulePayload,
  DEFAULT_FLOW_POSITIONS,
  FlowGraphState,
  FlowNodeData,
  FlowEdge,
} from "../utils/instagramFlowCompiler";
import { InstagramPhonePreview } from "./InstagramPhonePreview";
import { X, Eye } from "lucide-react";

interface InstagramFlowRuleStudioProps {
  initialRule?: any | null;
  agentAccount?: any;
  currentAgent?: any;
  feedPosts?: any[];
  activeStories?: any[];
  isAccountLinked: boolean;
  isLoadingFeed?: boolean;
  onSaveRule: (payload: any, isSetLive: boolean) => Promise<{ success: boolean; error?: string; rule?: any }>;
  onBackToAutomation: () => void;
  onGoToBasicBuilder?: (rule?: any) => void;
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export function InstagramFlowRuleStudio({
  initialRule,
  agentAccount,
  currentAgent,
  feedPosts = [],
  activeStories = [],
  isAccountLinked,
  isLoadingFeed = false,
  onSaveRule,
  onBackToAutomation,
  onGoToBasicBuilder,
  showToast,
}: InstagramFlowRuleStudioProps) {
  // 1. Initial Flow Graph State
  const defaultPost = feedPosts.length > 0 ? feedPosts[0] : null;
  const [graphState, setGraphState] = useState<FlowGraphState>(() =>
    buildFlowGraphFromRule(initialRule, { defaultPost })
  );

  // Undo / Redo History Stack
  const [history, setHistory] = useState<FlowGraphState[]>([graphState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushToHistory = useCallback((nextState: FlowGraphState) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, nextState].slice(-25); // retain last 25 steps
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 24));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setGraphState(history[nextIdx]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setGraphState(history[nextIdx]);
    }
  }, [historyIndex, history]);

  // 2. Canvas Navigation & Viewport State (Pan & Zoom)
  const [pan, setPan] = useState({ x: 80, y: 80 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; startPanX: number; startPanY: number } | null>(null);

  // 3. Selection & Inspector Drawer State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddStepMenuOpen, setIsAddStepMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"COMMENT" | "DM">("DM");
  const [simulatedFollowStep, setSimulatedFollowStep] = useState<"GATE" | "RETRY" | "VERIFIED">("GATE");
  const [simulatedButtonId, setSimulatedButtonId] = useState<string | null>(null);
  const [simulatedLiveQrId, setSimulatedLiveQrId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 4. Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{
    nodeId: string;
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
  } | null>(null);

  // 5. Port Connection Drawing State (Connecting an edge visually)
  const [connectingPort, setConnectingPort] = useState<{
    sourceNodeId: string;
    sourceHandle: string;
    cursorX: number;
    cursorY: number;
  } | null>(null);

  // Canvas Container Ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // Selected Node Reference
  const selectedNode = useMemo(
    () => graphState.nodes.find((n) => n.id === selectedNodeId) || null,
    [graphState.nodes, selectedNodeId]
  );

  // =========================================================================
  // Canvas Mouse & Gesture Handlers (Pan & Zoom)
  // =========================================================================
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom via trackpad pinch / Ctrl+Wheel
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setZoom((z) => Math.min(Math.max(z * zoomFactor, 0.4), 1.8));
    } else {
      // Pan via 2-finger trackpad scroll or mouse wheel
      setPan((p) => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY,
      }));
    }
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only pan if clicking canvas background (not clicking a node or port)
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === "svg") {
      setSelectedNodeId(null);
      setIsPanning(true);
      panStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
    }
  }, [pan]);

  const handleNodeMouseDownDrag = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      setSelectedNodeId(nodeId);
      const node = graphState.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setDraggingNodeId(nodeId);
      dragStartRef.current = {
        nodeId,
        mouseX: e.clientX,
        mouseY: e.clientY,
        startX: node.position.x,
        startY: node.position.y,
      };
    },
    [graphState.nodes]
  );

  const handlePortMouseDown = useCallback(
    (e: React.MouseEvent, sourceNodeId: string, sourceHandle: string) => {
      e.stopPropagation();
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const cursorX = (e.clientX - rect.left - pan.x) / zoom;
      const cursorY = (e.clientY - rect.top - pan.y) / zoom;

      setConnectingPort({
        sourceNodeId,
        sourceHandle,
        cursorX,
        cursorY,
      });
    },
    [pan, zoom]
  );

  // Global mousemove & mouseup while dragging or panning
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Handle Canvas Panning
      if (isPanning && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.mouseX;
        const dy = e.clientY - panStartRef.current.mouseY;
        setPan({
          x: panStartRef.current.startPanX + dx,
          y: panStartRef.current.startPanY + dy,
        });
      }

      // 2. Handle Node Dragging
      if (draggingNodeId && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        const nextX = Math.round(dragStartRef.current.startX + dx);
        const nextY = Math.round(dragStartRef.current.startY + dy);

        setGraphState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) =>
            n.id === draggingNodeId ? { ...n, position: { x: nextX, y: nextY } } : n
          ),
        }));
      }

      // 3. Handle Port Connection Dragging
      if (connectingPort && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const cursorX = (e.clientX - rect.left - pan.x) / zoom;
        const cursorY = (e.clientY - rect.top - pan.y) / zoom;
        setConnectingPort((prev) => (prev ? { ...prev, cursorX, cursorY } : null));
      }
    };

    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        panStartRef.current = null;
      }

      if (draggingNodeId) {
        setDraggingNodeId(null);
        dragStartRef.current = null;
        pushToHistory(graphState);
      }

      if (connectingPort) {
        setConnectingPort(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning, draggingNodeId, connectingPort, zoom, pan, graphState, pushToHistory]);

  // =========================================================================
  // Canvas Controls: Auto-Arrange, Zoom In/Out, Reset
  // =========================================================================
  const handleAutoArrange = useCallback(() => {
    setGraphState((prev) => {
      const hasWelcome = prev.nodes.some((n) => n.type === "WELCOME_DM");
      const hasFollow = prev.nodes.some((n) => n.type === "ASK_FOLLOW");
      const hasContact = prev.nodes.some((n) => n.type === "ASK_CONTACT");

      let currentX = 80;
      const updatedNodes = prev.nodes.map((n) => {
        if (n.type === "TRIGGER") {
          return { ...n, position: { x: 80, y: 180 } };
        }
        if (n.id === "note_trigger") {
          return { ...n, position: { x: 80, y: 440 } };
        }
        if (n.type === "WELCOME_DM") {
          return { ...n, position: { x: 440, y: 180 } };
        }
        if (n.id === "note_welcome") {
          return { ...n, position: { x: 440, y: 20 } };
        }
        if (n.type === "ASK_FOLLOW") {
          return { ...n, position: { x: hasWelcome ? 800 : 440, y: 180 } };
        }
        if (n.type === "ASK_CONTACT") {
          return { ...n, position: { x: hasWelcome ? 800 : 440, y: hasFollow ? 400 : 180 } };
        }
        if (n.type === "MAIN_DM") {
          const mainX = hasWelcome && (hasFollow || hasContact) ? 1160 : hasWelcome ? 800 : 440;
          return { ...n, position: { x: mainX, y: 180 } };
        }
        if (n.id === "note_main_top") {
          const mainX = hasWelcome && (hasFollow || hasContact) ? 1160 : hasWelcome ? 800 : 440;
          return { ...n, position: { x: mainX, y: 40 } };
        }
        if (n.id === "note_main_bottom") {
          const mainX = hasWelcome && (hasFollow || hasContact) ? 1160 : hasWelcome ? 800 : 440;
          return { ...n, position: { x: mainX, y: 520 } };
        }
        return n;
      });

      const nextState = { ...prev, nodes: updatedNodes };
      pushToHistory(nextState);
      return nextState;
    });

    setPan({ x: 80, y: 80 });
    setZoom(1);
    showToast("info", "Alur berhasil dirapikan otomatis!");
  }, [pushToHistory, showToast]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 1.8));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.4));
  const handleResetView = () => {
    setPan({ x: 80, y: 80 });
    setZoom(1);
  };

  // =========================================================================
  // Node Updates & Step Additions
  // =========================================================================
  const handleUpdateNodeData = useCallback(
    (nodeId: string, updatedData: Record<string, any>) => {
      setGraphState((prev) => {
        const nextState = {
          ...prev,
          nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, data: updatedData } : n)),
        };
        pushToHistory(nextState);
        return nextState;
      });
    },
    [pushToHistory]
  );

  const handleAddStep = useCallback(
    (stepType: "WELCOME_DM" | "ASK_FOLLOW" | "ASK_CONTACT" | "FOLLOW_UP" | "HELPER_NOTE") => {
      setGraphState((prev) => {
        const nodes = [...prev.nodes];
        const edges = [...prev.edges];

        if (stepType === "WELCOME_DM") {
          nodes.push({
            id: "node_welcome_dm",
            type: "WELCOME_DM",
            title: "Pesan Pembuka (DM)",
            position: { x: 440, y: 180 },
            data: {
              welcomeMessage: "Halo {first_name}! Akses yang kamu minta sudah kami siapkan nihh. Mau ambil sekarang? ✨",
              welcomeButtonLabel: "Lihat Produk 🤩",
              welcomeMessageType: "Template Tombol",
            },
          });
          edges.push({
            id: "edge_trigger_to_welcome",
            source: "node_trigger",
            sourceHandle: "then",
            target: "node_welcome_dm",
            targetHandle: "input",
          });
        } else if (stepType === "ASK_FOLLOW") {
          nodes.push({
            id: "node_ask_follow",
            type: "ASK_FOLLOW",
            title: "Cek Status Follower",
            position: { x: 800, y: 180 },
            data: {
              askForFollowMessage: 'Btw, kamu belum follow akun ini nih. Follow dulu ya lalu klik "Udah Follow" 🙌',
              askForFollowButtonLabel: "Udah follow 🙌",
              askForFollowHasRetry: false,
              askForFollowRetryMessage: "",
              askForFollowRetryButtonLabel: "Udah follow 🙌",
            },
          });
        } else if (stepType === "ASK_CONTACT") {
          nodes.push({
            id: "node_ask_contact",
            type: "ASK_CONTACT",
            title: "Minta Data Kontak",
            position: { x: 800, y: 380 },
            data: {
              askContactType: "Email Saja",
              askContactMessage: "Boleh ketik alamat Email aktif kamu di bawah ini ya 👇",
              askContactInvalidMessage: "Format emailnya belum pas kak 😅 Coba cek lagi ya!",
            },
          });
        } else if (stepType === "FOLLOW_UP") {
          // Enable follow-up in main node
          const mainNode = nodes.find((n) => n.type === "MAIN_DM");
          if (mainNode) {
            mainNode.data = {
              ...mainNode.data,
              featureFollowUp: true,
              followUpDelay: "1 Jam",
              followUpCondition: "Hanya yang Belum Klik Link",
              followUpMessage: "Halo {first_name}! Link materinya tadi udah sempat dibuka belum? 😉",
              followUpButtonLabel: "Buka Link Sekarang",
            };
          }
        } else if (stepType === "HELPER_NOTE") {
          const noteCount = nodes.filter((n) => n.type === "HELPER_NOTE").length + 1;
          nodes.push({
            id: `note_custom_${Date.now()}`,
            type: "HELPER_NOTE",
            position: { x: 300 + noteCount * 40, y: 80 },
            data: { text: "Ketik catatan panduan atau pengingat alur Anda di sini." },
          });
        }

        const nextState = { ...prev, nodes, edges };
        pushToHistory(nextState);
        return nextState;
      });

      showToast("success", "Langkah baru berhasil ditambahkan ke kanvas!");
    },
    [pushToHistory, showToast]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setGraphState((prev) => {
        const nextNodes = prev.nodes.filter((n) => n.id !== nodeId);
        const nextEdges = prev.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
        const nextState = { ...prev, nodes: nextNodes, edges: nextEdges };
        pushToHistory(nextState);
        return nextState;
      });
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
      showToast("info", "Kotak alur berhasil dihapus.");
    },
    [selectedNodeId, pushToHistory, showToast]
  );

  // =========================================================================
  // Save Draft & Set Live Handlers
  // =========================================================================
  const handleSave = useCallback(
    async (isLive: boolean) => {
      try {
        setIsSaving(true);
        const targetAccountId = agentAccount?.id || currentAgent?.id;
        const payload = compileFlowGraphToRulePayload(graphState, {
          ruleId: initialRule?.id,
          accountId: targetAccountId,
          setLive: isLive,
        });

        const res = await onSaveRule(payload, isLive);
        if (res.success) {
          setGraphState((prev) => ({ ...prev, isActive: isLive }));
          showToast(
            "success",
            isLive
              ? "Aturan berhasil diaktifkan secara LIVE!"
              : "Draf alur berhasil disimpan!"
          );
        } else {
          showToast("error", res.error || "Gagal menyimpan alur");
        }
      } catch (err: any) {
        showToast("error", err.message || "Terjadi kesalahan server");
      } finally {
        setIsSaving(false);
      }
    },
    [graphState, agentAccount, currentAgent, initialRule, onSaveRule, showToast]
  );

  // =========================================================================
  // Bezier Connector Curves Calculation
  // =========================================================================
  const computedEdges = useMemo(() => {
    return graphState.edges
      .map((edge) => {
        const sourceNode = graphState.nodes.find((n) => n.id === edge.source);
        const targetNode = graphState.nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;

        // Source port coordinates
        const isTrigger = sourceNode.type === "TRIGGER";
        const isWelcome = sourceNode.type === "WELCOME_DM";
        const isGate = sourceNode.type === "ASK_FOLLOW" || sourceNode.type === "ASK_CONTACT";

        const sourceWidth = isTrigger ? 320 : isWelcome ? 288 : isGate ? 288 : 320;
        const sourceX = sourceNode.position.x + sourceWidth;
        const sourceY = sourceNode.position.y + (isTrigger ? 190 : isWelcome ? 130 : 120);

        // Target handle coordinates
        const targetX = targetNode.position.x;
        const targetY = targetNode.position.y + 110;

        const dx = Math.max(Math.abs(targetX - sourceX) * 0.5, 40);
        const pathData = `M ${sourceX} ${sourceY} C ${sourceX + dx} ${sourceY}, ${targetX - dx} ${targetY}, ${targetX} ${targetY}`;

        return {
          id: edge.id,
          pathData,
          sourceX,
          sourceY,
          targetX,
          targetY,
        };
      })
      .filter(Boolean);
  }, [graphState.edges, graphState.nodes]);

  // Temporary connecting line while dragging port
  const connectingLinePath = useMemo(() => {
    if (!connectingPort) return null;
    const sourceNode = graphState.nodes.find((n) => n.id === connectingPort.sourceNodeId);
    if (!sourceNode) return null;

    const sourceWidth = sourceNode.type === "TRIGGER" ? 320 : 288;
    const x1 = sourceNode.position.x + sourceWidth;
    const y1 = sourceNode.position.y + 120;
    const x2 = connectingPort.cursorX;
    const y2 = connectingPort.cursorY;
    const dx = Math.max(Math.abs(x2 - x1) * 0.5, 40);

    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }, [connectingPort, graphState.nodes]);

  // Extract ruleFormData representation for live phone preview
  const previewFormData = useMemo(() => {
    return compileFlowGraphToRulePayload(graphState, {
      accountId: agentAccount?.id,
      setLive: graphState.isActive,
    });
  }, [graphState, agentAccount]);

  const existingNodeTypes = graphState.nodes.map((n) => n.type);

  return (
    <div className="relative w-full flex-1 h-full min-h-0 rounded-2xl border border-gray-200 dark:border-[#2C3246] shadow-sm flex flex-col bg-[#F8FAFC] dark:bg-[#0E1528] overflow-hidden select-none">
      {/* 1. TOP BAR */}
      <FlowTopBar
        ruleName={graphState.ruleName}
        setRuleName={(name) => setGraphState((prev) => ({ ...prev, ruleName: name }))}
        isActive={graphState.isActive}
        isSaving={isSaving}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenPreview={() => setIsPreviewOpen((prev) => !prev)}
        isPreviewOpen={isPreviewOpen}
        onSetLive={() => handleSave(true)}
        onSaveDraft={() => handleSave(false)}
        onBackToAutomation={onBackToAutomation}
        selectedStepTitle={selectedNode?.title || null}
      />

      {/* 2. INFINITE CANVAS WORKSPACE */}
      <div
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        className={`relative flex-1 w-full h-full overflow-hidden cursor-default ${
          isPanning ? "cursor-grabbing" : ""
        }`}
        style={{
          backgroundColor: "#FAFBFC",
          backgroundImage:
            "radial-gradient(circle, rgba(0, 0, 0, 0.12) 1px, transparent 1px)",
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Transform Layer for Pan & Zoom */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* SVG Connectors Layer */}
          <svg
            className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible"
            style={{ zIndex: 1 }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill="#64748B" />
              </marker>
              <marker
                id="arrowhead-connecting"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill="#f97316" />
              </marker>
            </defs>

            {/* Existing Bezier Curves */}
            {computedEdges.map(
              (edge) =>
                edge && (
                  <path
                    key={edge.id}
                    d={edge.pathData}
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                    className="transition-all"
                  />
                )
            )}

            {/* Live Dragging Connection Line */}
            {connectingLinePath && (
              <path
                d={connectingLinePath}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeDasharray="5,5"
                strokeLinecap="round"
                markerEnd="url(#arrowhead-connecting)"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Nodes Layer */}
          <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 2 }}>
            {graphState.nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: `${node.position.x}px`,
                    top: `${node.position.y}px`,
                  }}
                >
                  {node.type === "TRIGGER" && (
                    <FlowTriggerNode
                      id={node.id}
                      data={node.data as any}
                      isSelected={isSelected}
                      onSelect={() => setSelectedNodeId(node.id)}
                      onMouseDownDrag={(e) => handleNodeMouseDownDrag(e, node.id)}
                      onPortMouseDown={(e, port) => handlePortMouseDown(e, node.id, port)}
                    />
                  )}

                  {node.type === "WELCOME_DM" && (
                    <FlowWelcomeDmNode
                      id={node.id}
                      data={node.data as any}
                      isSelected={isSelected}
                      onSelect={() => setSelectedNodeId(node.id)}
                      onDelete={() => handleDeleteNode(node.id)}
                      onMouseDownDrag={(e) => handleNodeMouseDownDrag(e, node.id)}
                      onPortMouseDown={(e, port) => handlePortMouseDown(e, node.id, port)}
                    />
                  )}

                  {(node.type === "ASK_FOLLOW" || node.type === "ASK_CONTACT") && (
                    <FlowGatekeeperNode
                      id={node.id}
                      type={node.type}
                      data={node.data}
                      isSelected={isSelected}
                      onSelect={() => setSelectedNodeId(node.id)}
                      onDelete={() => handleDeleteNode(node.id)}
                      onMouseDownDrag={(e) => handleNodeMouseDownDrag(e, node.id)}
                      onPortMouseDown={(e, port) => handlePortMouseDown(e, node.id, port)}
                    />
                  )}

                  {node.type === "MAIN_DM" && (
                    <FlowMainMessageNode
                      id={node.id}
                      data={node.data as any}
                      isSelected={isSelected}
                      onSelect={() => setSelectedNodeId(node.id)}
                      onMouseDownDrag={(e) => handleNodeMouseDownDrag(e, node.id)}
                      onPortMouseDown={(e, port) => handlePortMouseDown(e, node.id, port)}
                    />
                  )}

                  {node.type === "HELPER_NOTE" && (
                    <FlowHelperNoteNode
                      id={node.id}
                      text={node.data.text || ""}
                      isSelected={isSelected}
                      onSelect={() => setSelectedNodeId(node.id)}
                      onDelete={() => handleDeleteNode(node.id)}
                      onMouseDownDrag={(e) => handleNodeMouseDownDrag(e, node.id)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CANVAS CONTROLS (FAB, Auto-Arrange, Zoom) */}
        <FlowCanvasControls
          onOpenAddStepMenu={() => setIsAddStepMenuOpen(true)}
          onAutoArrange={handleAutoArrange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          zoom={zoom}
        />
      </div>

      {/* 4. STEP INSPECTOR DRAWER (Right Sidebar) */}
      <FlowStepInspectorDrawer
        selectedNode={selectedNode}
        onClose={() => setSelectedNodeId(null)}
        onUpdateNodeData={handleUpdateNodeData}
        feedPosts={feedPosts}
        activeStories={activeStories}
        isAccountLinked={isAccountLinked}
        isLoadingFeed={isLoadingFeed}
      />

      {/* 5. ADD STEP DRAWER / MENU */}
      <FlowAddStepMenu
        isOpen={isAddStepMenuOpen}
        onClose={() => setIsAddStepMenuOpen(false)}
        onAddStep={handleAddStep}
        existingTypes={existingNodeTypes}
      />

      {/* 6. INSTAGRAM PHONE PREVIEW SIDE DRAWER */}
      {isPreviewOpen && (
        <div className="absolute top-14 bottom-0 right-0 z-40 w-full sm:w-[420px] md:w-[460px] bg-white dark:bg-[#141B31] border-l border-gray-200 dark:border-[#2C3246] shadow-xl flex flex-col animate-in slide-in-from-right duration-200 select-auto">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2C3246] flex items-center justify-between shrink-0 bg-white/90 dark:bg-[#141B31]/90 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Simulator Chat Instagram
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Pratinjau interaksi balasan komentar & DM
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Tutup simulator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body with interactive simulator */}
          <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start">
            <InstagramPhonePreview
              ruleFormData={previewFormData as any}
              setRuleFormData={() => {}}
              editingRule={null}
              isPending={false}
              setIsRuleModalOpen={() => setIsPreviewOpen(false)}
              handleSaveRule={() => handleSave(true)}
              activePreviewTab={previewTab}
              setActivePreviewTab={setPreviewTab}
              isStoryTarget={graphState.targetOtomasi.includes("Story")}
              isStoryMentionTarget={graphState.targetOtomasi === "Story Mention"}
              isLiveTarget={graphState.targetOtomasi === "Live Instagram"}
              isDmTarget={graphState.targetOtomasi === "Pesan Instagram"}
              isBasicInfoFilled={true}
              activeLiveContentIdx={0}
              setActiveLiveContentIdx={() => {}}
              activeLiveContent={null}
              account={agentAccount || currentAgent}
              currentAgent={currentAgent || agentAccount}
              selectedPost={defaultPost}
              selectedStory={activeStories[0] || null}
              feedPosts={feedPosts}
              simulatedFollowStep={simulatedFollowStep}
              setSimulatedFollowStep={setSimulatedFollowStep}
              simulatedButtonId={simulatedButtonId}
              setSimulatedButtonId={setSimulatedButtonId}
              simulatedLiveQrId={simulatedLiveQrId}
              setSimulatedLiveQrId={setSimulatedLiveQrId}
              hideHeader={true}
              className="w-full flex flex-col justify-start items-center"
            />
          </div>
        </div>
      )}
    </div>
  );
}
