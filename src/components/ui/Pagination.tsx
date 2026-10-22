"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tokens, cn } from "@/lib/design-tokens";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-[#2C3246]/60 text-xs text-gray-500 dark:text-gray-400 select-none",
        className
      )}
    >
      {/* Item info */}
      {totalItems !== undefined ? (
        <div>
          Menampilkan <span className="font-bold text-gray-900 dark:text-white">{startItem}</span>–
          <span className="font-bold text-gray-900 dark:text-white">{endItem}</span> dari{" "}
          <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> data
        </div>
      ) : (
        <div>
          Halaman <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> dari{" "}
          <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
        </div>
      )}

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="h-8 px-2.5 sm:px-3 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((page, idx, arr) => {
              const prevPage = arr[idx - 1];
              const hasGap = prevPage && page - prevPage > 1;

              return (
                <React.Fragment key={page}>
                  {hasGap && (
                    <span className="w-6 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                      ...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={cn(
                      "w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer",
                      currentPage === page
                        ? "bg-[#f97316] text-white shadow-xs shadow-orange-500/20"
                        : "border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="h-8 px-2.5 sm:px-3 rounded-lg border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] hover:bg-gray-50 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
          title="Selanjutnya"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
