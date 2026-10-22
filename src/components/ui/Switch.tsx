"use client";

import React from "react";
import { cn } from "@/lib/design-tokens";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className,
  id,
}: SwitchProps) {
  const isSm = size === "sm";

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 transition-colors duration-200 ease-in-out rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500/50",
          isSm ? "h-5 w-9" : "h-6 w-11",
          checked
            ? "bg-[#f97316]"
            : "bg-gray-200 dark:bg-[#2C3246]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow-md transform ring-0 transition duration-200 ease-in-out",
            isSm ? "h-4 w-4" : "h-5 w-5",
            checked
              ? isSm
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0"
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}

export default Switch;
