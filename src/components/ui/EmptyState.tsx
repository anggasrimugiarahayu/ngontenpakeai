"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/design-tokens";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full min-h-[260px] flex flex-col items-center justify-center p-8 bg-white dark:bg-[#141B31] rounded-2xl border border-gray-200 dark:border-[#2C3246] text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-3.5 shadow-2xs">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
        {title}
      </h4>
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
