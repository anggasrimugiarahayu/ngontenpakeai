"use client";

import React, { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

export interface DateRangePickerProps {
  value?: DateRange | undefined;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select Date..",
  className = "",
  align = "left",
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle select date
  const handleSelect = (newRange: DateRange | undefined) => {
    if (onChange) {
      onChange(newRange);
    }
    // Auto-close when both from and to are selected
    if (newRange?.from && newRange?.to) {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange(undefined);
    }
  };

  const formattedLabel = () => {
    if (!value?.from) return placeholder;
    if (value.from && value.to) {
      return `${format(value.from, "LLL dd, y")} - ${format(
        value.to,
        "LLL dd, y"
      )}`;
    }
    return format(value.from, "LLL dd, y");
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-50 text-sm font-medium"
      >
        <CalendarIcon size={16} className="text-gray-500 shrink-0" />
        <span className="truncate">{formattedLabel()}</span>
        {value?.from && (
          <span
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer ml-1"
            title="Reset Tanggal"
          >
            <X size={14} />
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 z-50 bg-white dark:bg-[#141B31] rounded-xl shadow-xl border border-gray-200 dark:border-[#2C3246] p-3 animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Scoped CSS: Solid Orange on Start/End, Reduced Opacity Orange Strip in Middle */}
          <style>{`
            .compact-date-picker {
              --rdp-cell-size: 32px !important;
              --rdp-accent-color: #f97316 !important;
              --rdp-background-color: #f97316 !important;
              --rdp-accent-color-dark: #f97316 !important;
              --rdp-background-color-dark: #ea580c !important;
              --rdp-outline: 2px solid var(--rdp-accent-color);
              --rdp-outline-selected: 2px solid var(--rdp-accent-color);
              margin: 0;
            }
            .compact-date-picker .rdp-day {
              border-radius: 6px;
              font-size: 13px;
              font-weight: 500;
              transition: background-color 0.15s ease, color 0.15s ease;
            }
            .compact-date-picker .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_range_middle) {
              background-color: rgba(249, 115, 22, 0.1) !important;
              color: #f97316 !important;
            }

            /* Range Start: Solid Orange Penuh + White Text */
            .compact-date-picker .rdp-day_range_start {
              background-color: #f97316 !important;
              color: #ffffff !important;
              border-top-left-radius: 8px !important;
              border-bottom-left-radius: 8px !important;
              border-top-right-radius: 0px !important;
              border-bottom-right-radius: 0px !important;
              font-weight: 700 !important;
            }

            /* Range End: Solid Orange Penuh + White Text */
            .compact-date-picker .rdp-day_range_end {
              background-color: #f97316 !important;
              color: #ffffff !important;
              border-top-right-radius: 8px !important;
              border-bottom-right-radius: 8px !important;
              border-top-left-radius: 0px !important;
              border-bottom-left-radius: 0px !important;
              font-weight: 700 !important;
            }

            /* Single Day Selected (Start & End on same day) */
            .compact-date-picker .rdp-day_range_start.rdp-day_range_end {
              border-radius: 8px !important;
            }

            /* Range Middle: Opasitas Diturunkan (Soft Orange Transparent Strip) */
            .compact-date-picker .rdp-day_range_middle {
              background-color: rgba(249, 115, 22, 0.2) !important;
              color: #ea580c !important;
              border-radius: 0px !important;
              font-weight: 600 !important;
            }
            .dark .compact-date-picker .rdp-day_range_middle {
              background-color: rgba(249, 115, 22, 0.3) !important;
              color: #fdba74 !important;
            }

            /* Standalone Selected Fallback */
            .compact-date-picker .rdp-day_selected:not(.rdp-day_range_middle) {
              background-color: #f97316 !important;
              color: #ffffff !important;
              font-weight: 700 !important;
            }
            .dark .compact-date-picker .rdp-day_selected:not(.rdp-day_range_middle) {
              background-color: #ea580c !important;
              color: #ffffff !important;
            }
          `}</style>

          {/* Calendar DayPicker */}
          <DayPicker
            className="compact-date-picker"
            mode="range"
            defaultMonth={value?.from || new Date()}
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={1}
            disabled={(d) => d > new Date()}
          />
        </div>
      )}
    </div>
  );
}
