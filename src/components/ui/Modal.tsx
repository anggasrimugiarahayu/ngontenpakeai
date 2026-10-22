"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { tokens, cn } from "@/lib/design-tokens";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  showCloseButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  maxWidth = "md",
  showCloseButton = true,
  children,
  footer,
  className,
}: ModalProps) {
  // Close on Escape key and prevent background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  return (
    <div className={tokens.modal.backdrop}>
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Window */}
      <div
        className={cn(
          tokens.modal.dialog,
          maxWidthClasses,
          className
        )}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className={tokens.modal.closeBtn}
            title="Tutup"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Modal Header */}
        {(title || icon) && (
          <div className="p-5 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-[#2C3246]/60 flex items-start gap-3">
            {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
            <div>
              {title && (
                <h3 className="text-base sm:text-lg font-bold font-heading text-gray-900 dark:text-white leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(85vh-120px)] custom-scrollbar">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="p-4 sm:p-5 bg-gray-50/70 dark:bg-[#0A1128]/40 border-t border-gray-100 dark:border-[#2C3246]/60 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
