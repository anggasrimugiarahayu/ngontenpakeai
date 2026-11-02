"use client";

import React, { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar as CalendarIcon, X, Check } from "lucide-react";

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
  placeholder = "Choose Date",
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
    // Auto-close if full range is selected and start != end
    if (newRange?.from && newRange?.to && newRange.from.getTime() !== newRange.to.getTime()) {
      setTimeout(() => {
        setIsOpen(false);
      }, 250);
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
      return `${format(value.from, "dd MMM yyyy", { locale: localeId })} - ${format(
        value.to,
        "dd MMM yyyy",
        { locale: localeId }
      )}`;
    }
    return format(value.from, "dd MMM yyyy", { locale: localeId });
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-50 text-sm font-medium"
      >
        <CalendarIcon size={16} className="text-gray-400 shrink-0" />
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
          className={`absolute top-full mt-2 z-50 bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2C3246] p-4 animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Header Status */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-[#2C3246] text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {value?.from && value?.to
                ? "Rentang Tanggal Terpilih:"
                : value?.from
                ? "Pilih Tanggal Selesai:"
                : "Klik tanggal awal dan tanggal akhir:"}
            </span>
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {value?.from ? formattedLabel() : "Belum dipilih"}
            </span>
          </div>

          {/* Scoped CSS for Continuous Highlight Strip */}
          <style>{`
            .custom-date-picker {
              --rdp-cell-size: 36px !important;
              --rdp-accent-color: #f97316 !important;
              --rdp-background-color: #f97316 !important;
              margin: 0;
            }
            .custom-date-picker .rdp-day {
              border-radius: 8px;
              font-size: 13px;
              font-weight: 500;
              transition: background-color 0.15s ease, color 0.15s ease;
            }
            .custom-date-picker .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_range_middle) {
              background-color: rgba(249, 115, 22, 0.12) !important;
              color: #f97316 !important;
            }

            /* Range Start */
            .custom-date-picker .rdp-day_range_start {
              background-color: #f97316 !important;
              color: #ffffff !important;
              border-top-left-radius: 10px !important;
              border-bottom-left-radius: 10px !important;
              border-top-right-radius: 0px !important;
              border-bottom-right-radius: 0px !important;
              font-weight: 700 !important;
            }

            /* Range End */
            .custom-date-picker .rdp-day_range_end {
              background-color: #f97316 !important;
              color: #ffffff !important;
              border-top-right-radius: 10px !important;
              border-bottom-right-radius: 10px !important;
              border-top-left-radius: 0px !important;
              border-bottom-left-radius: 0px !important;
              font-weight: 700 !important;
            }

            /* Single Day Selected */
            .custom-date-picker .rdp-day_range_start.rdp-day_range_end {
              border-radius: 10px !important;
            }

            /* Range Middle - The Continuous Connected Block */
            .custom-date-picker .rdp-day_range_middle {
              background-color: rgba(249, 115, 22, 0.18) !important;
              color: #ea580c !important;
              border-radius: 0px !important;
              font-weight: 600 !important;
            }
            .dark .custom-date-picker .rdp-day_range_middle {
              background-color: rgba(249, 115, 22, 0.3) !important;
              color: #fdba74 !important;
            }

            /* Default Selected Fallback */
            .custom-date-picker .rdp-day_selected:not(.rdp-day_range_middle) {
              background-color: #f97316 !important;
              color: #ffffff !important;
              font-weight: 700 !important;
            }
          `}</style>

          {/* Calendar Picker */}
          <DayPicker
            className="custom-date-picker"
            mode="range"
            defaultMonth={value?.from || new Date()}
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={1}
            disabled={(d) => d > new Date()}
          />

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-[#2C3246]">
            <button
              type="button"
              onClick={() => {
                if (onChange) onChange(undefined);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-orange-500/20"
            >
              <Check size={13} />
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
