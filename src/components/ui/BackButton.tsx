"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { tokens, cn } from "@/lib/design-tokens";

export interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  title?: string;
  className?: string;
  prefetch?: boolean;
}

export function BackButton({
  href,
  onClick,
  title = "Kembali",
  className,
  prefetch = true,
}: BackButtonProps) {
  const router = useRouter();

  const baseClasses = cn(tokens.backButton, "relative z-10 pointer-events-auto", className);

  // If href is passed, use Next.js Link
  if (href) {
    return (
      <Link
        href={href}
        prefetch={prefetch}
        onClick={onClick}
        title={title}
        aria-label={title}
        className={baseClasses}
      >
        <ArrowLeft className="w-5 h-5 pointer-events-none" />
      </Link>
    );
  }

  // Otherwise, use button with custom onClick or router.back()
  return (
    <button
      type="button"
      onClick={onClick || (() => router.back())}
      title={title}
      aria-label={title}
      className={baseClasses}
    >
      <ArrowLeft className="w-5 h-5 pointer-events-none" />
    </button>
  );
}

export default BackButton;
