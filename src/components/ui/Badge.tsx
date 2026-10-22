"use client";

import React, { forwardRef } from "react";
import { tokens, cn } from "@/lib/design-tokens";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral" | "pro";
  size?: "xs" | "sm" | "md";
  icon?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "neutral",
      size = "sm",
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyle = tokens.badge.variants[variant] || tokens.badge.variants.neutral;
    const sizeStyle = tokens.badge.sizes[size] || tokens.badge.sizes.sm;

    return (
      <span
        ref={ref}
        className={cn(tokens.badge.base, variantStyle, sizeStyle, "gap-1", className)}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
export default Badge;
