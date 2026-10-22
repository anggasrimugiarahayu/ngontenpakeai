"use client";

import React from "react";
import { tokens, cn } from "@/lib/design-tokens";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number | string;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}

export function Tabs({
  items,
  activeId,
  onChange,
  size = "md",
  fullWidth = false,
  className,
}: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        tokens.tabs.container,
        fullWidth && "w-full justify-between",
        className
      )}
    >
      {items.map((tab) => {
        const isActive = activeId === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              tokens.tabs.button,
              size === "sm" ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-xs sm:text-sm",
              isActive ? tokens.tabs.active : tokens.tabs.inactive,
              tab.disabled && "opacity-40 cursor-not-allowed",
              fullWidth && "flex-1 text-center justify-center",
              "flex items-center gap-2 font-bold"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5",
                  isActive
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                )}
              >
                {tab.count}
              </span>
            )}
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
