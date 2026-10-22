"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string | number;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  options: (CustomSelectOption | string | number)[];
  value: string | number | undefined | null;
  onChange: (value: any) => void;
  placeholder?: string;
  label?: React.ReactNode;
  required?: boolean;
  name?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  menuClassName?: string;
  variant?: "default" | "subtle";
  size?: "sm" | "md";
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  label,
  required,
  name,
  disabled = false,
  className = "",
  containerClassName = "",
  menuClassName = "",
  variant = "default",
  size = "md",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to CustomSelectOption[]
  const normalizedOptions: CustomSelectOption[] = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return opt as CustomSelectOption;
    }
    return {
      value: opt,
      label: String(opt),
    };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Group options if applicable
  const hasGroups = normalizedOptions.some((opt) => !!opt.group);
  const groups: { [key: string]: CustomSelectOption[] } = {};
  if (hasGroups) {
    normalizedOptions.forEach((opt) => {
      const g = opt.group || "";
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    });
  }

  // Sizing styles
  const sizeStyles =
    size === "sm"
      ? "px-3 py-2 text-xs sm:text-sm rounded-xl"
      : "px-4 py-2.5 text-sm rounded-xl";

  // Variant styles
  const variantStyles =
    variant === "subtle"
      ? "bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-[#2C3246]"
      : "bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246]";

  return (
    <div
      ref={containerRef}
      className={`relative ${containerClassName}`}
    >
      {/* Hidden input for HTML form FormData compatibility */}
      {name && <input type="hidden" name={name} value={value ?? ""} />}

      {/* Label */}
      {label && (
        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full ${sizeStyles} ${variantStyles} text-gray-900 dark:text-white flex items-center justify-between transition-all cursor-pointer ${
          isOpen
            ? "border-orange-500 ring-2 ring-orange-500/20"
            : "hover:border-gray-300 dark:hover:border-orange-500/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      >
        <span
          className={`font-medium truncate mr-2 ${
            !selectedOption ? "text-gray-400 dark:text-gray-500" : ""
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover List */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl py-2 z-50 max-h-64 sm:max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 custom-scrollbar ${menuClassName}`}
        >
          {hasGroups ? (
            Object.entries(groups).map(([grpName, items]) => (
              <div key={grpName} className="py-1">
                {grpName && (
                  <div className="px-4 py-1 text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {grpName}
                  </div>
                )}
                {items.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
                      } ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <span className="truncate mr-2">{opt.label}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 stroke-[2.5] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  } ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span className="truncate mr-2">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 stroke-[2.5] shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
export default CustomSelect;
