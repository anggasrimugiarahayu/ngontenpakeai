"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { tokens, cn } from "@/lib/design-tokens";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      icon,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const variantStyle = tokens.button.variants[variant] || tokens.button.variants.primary;
    const sizeStyle = tokens.button.sizes[size] || tokens.button.sizes.md;
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(tokens.button.base, variantStyle, sizeStyle, className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
