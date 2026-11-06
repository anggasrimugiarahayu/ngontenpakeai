// src/app/(app)/ruang-automation/instagram/flow-nodes/FlowLogicNode.tsx
"use client";

import React from "react";
import {
  Zap,
  CornerDownRight,
  Filter,
  Clock,
  GitFork,
  Trash2,
} from "lucide-react";

export type LogicNodeType =
  | "ACTIONS"
  | "START_AUTOMATION"
  | "CONDITION"
  | "SMART_DELAY"
  | "RANDOMIZER";

interface FlowLogicNodeProps {
  id: string;
  type: LogicNodeType;
  title?: string;
  data: Record<string, any>;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMouseDownDrag: (e: React.MouseEvent) => void;
  onPortMouseDown: (e: React.MouseEvent, portName: string) => void;
}

export function FlowLogicNode({
  id,
  type,
  data,
  isSelected,
  onSelect,
  onDelete,
  onMouseDownDrag,
  onPortMouseDown,
}: FlowLogicNodeProps) {
  // Config per logic node type matching ManyChat reference
  const config = React.useMemo(() => {
    switch (type) {
      case "ACTIONS":
        return {
          title: "Actions",
          headerBg: "bg-[#FFF0B3] dark:bg-[#3D3012]",
          headerText: "text-[#7A4B04] dark:text-[#FFE380]",
          icon: <Zap className="w-4 h-4 fill-current text-[#7A4B04] dark:text-[#FFE380]" />,
          dashedPlaceholder: "Click to add an action",
          activeLabel: data.actionLabel || data.actionType || null,
        };
      case "START_AUTOMATION":
        return {
          title: "Start Automation",
          headerBg: "bg-[#E3FCEF] dark:bg-[#143625]",
          headerText: "text-[#006644] dark:text-[#79F2C0]",
          icon: <CornerDownRight className="w-4 h-4 stroke-[2.2] text-[#006644] dark:text-[#79F2C0]" />,
          dashedPlaceholder: "Click to Select Automation",
          activeLabel: data.automationName || null,
        };
      case "CONDITION":
        return {
          title: "Condition",
          headerBg: "bg-[#E6FCFF] dark:bg-[#0B353D]",
          headerText: "text-[#006575] dark:text-[#7EE2B8]",
          icon: <Filter className="w-4 h-4 text-[#006575] dark:text-[#7EE2B8]" />,
          dashedPlaceholder: "Click to add a condition",
          activeLabel: data.conditionLabel || data.conditionType || null,
        };
      case "SMART_DELAY":
        return {
          title: "Smart Delay",
          headerBg: "bg-[#FFEBE6] dark:bg-[#451912]",
          headerText: "text-[#BF2600] dark:text-[#FF8F73]",
          icon: <Clock className="w-4 h-4 text-[#BF2600] dark:text-[#FF8F73]" />,
          delayText: data.delay || "23 Hours",
        };
      case "RANDOMIZER":
        return {
          title: "Randomizer",
          headerBg: "bg-[#EAE6FF] dark:bg-[#251A4D]",
          headerText: "text-[#403294] dark:text-[#B8ACF6]",
          icon: <GitFork className="w-4 h-4 rotate-90 text-[#403294] dark:text-[#B8ACF6]" />,
          splitA: data.splitA ?? 50,
          splitB: data.splitB ?? 50,
        };
      default:
        return {
          title: "Logic Step",
          headerBg: "bg-gray-100 dark:bg-gray-800",
          headerText: "text-gray-800 dark:text-gray-200",
          icon: <Zap className="w-4 h-4" />,
          dashedPlaceholder: "Click to configure",
          activeLabel: null,
        };
    }
  }, [type, data]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative w-[280px] bg-white dark:bg-[#151C33] rounded-2xl border transition-all duration-150 select-none group cursor-pointer ${
        isSelected
          ? "border-orange-500 ring-2 ring-orange-500/30 shadow-xl shadow-orange-500/10"
          : "border-gray-200/90 dark:border-[#2C3246] shadow-md hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      {/* Input Port (Left Center) */}
      <div
        title="Input Handle"
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-[#151C33] hover:border-orange-500 hover:scale-125 transition-transform cursor-crosshair z-20"
      />

      {/* Header Bar */}
      <div
        onMouseDown={onMouseDownDrag}
        className={`px-4 py-2.5 rounded-t-2xl flex items-center justify-between cursor-grab active:cursor-grabbing ${config.headerBg}`}
      >
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`text-xs sm:text-[13px] font-bold ${config.headerText}`}>
            {config.title}
          </span>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-500/70 hover:text-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
          title="Hapus Blok"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Node Body Content */}
      <div className="p-4 space-y-3">
        {/* Type: SMART DELAY */}
        {type === "SMART_DELAY" ? (
          <div className="py-2 text-xs sm:text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
            Wait for{" "}
            <strong className="font-bold text-gray-900 dark:text-white">
              {config.delayText}
            </strong>{" "}
            and then continue
          </div>
        ) : type === "RANDOMIZER" ? (
          /* Type: RANDOMIZER (A/B Test Splits with dual colored output ports) */
          <div className="space-y-2 py-0.5">
            {/* Split A */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                A
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {config.splitA}%
                </span>
                <div
                  onMouseDown={(e) => onPortMouseDown(e, "split_a")}
                  title="Jalur A (Port Ungu)"
                  className="w-3.5 h-3.5 rounded-full border-2 border-purple-500 bg-white dark:bg-[#151C33] hover:scale-125 hover:border-purple-600 transition-transform cursor-crosshair"
                />
              </div>
            </div>

            {/* Split B */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                B
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {config.splitB}%
                </span>
                <div
                  onMouseDown={(e) => onPortMouseDown(e, "split_b")}
                  title="Jalur B (Port Oranye)"
                  className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 bg-white dark:bg-[#151C33] hover:scale-125 hover:border-amber-600 transition-transform cursor-crosshair"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Type: ACTIONS / START_AUTOMATION / CONDITION (Dashed Box) */
          <div className="w-full py-4 px-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-500/70 hover:bg-orange-50/20 dark:hover:bg-white/5 text-center transition-colors">
            {config.activeLabel ? (
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {config.activeLabel}
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {config.dashedPlaceholder}
              </span>
            )}
          </div>
        )}

        {/* Footer: Next Step Output Port (For ACTIONS, START_AUTOMATION, SMART_DELAY, CONDITION) */}
        {type !== "RANDOMIZER" && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
              Next Step
            </span>
            <div
              onMouseDown={(e) => onPortMouseDown(e, "next_step")}
              title="Next Step Handle"
              className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-[#151C33] hover:border-orange-500 hover:scale-125 transition-transform cursor-crosshair"
            />
          </div>
        )}
      </div>
    </div>
  );
}
