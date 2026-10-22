"use client";

import React, { forwardRef } from "react";
import { tokens, cn } from "@/lib/design-tokens";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "base" | "hoverable" | "subtle" | "modal";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "base", className, ...props }, ref) => {
    const variantStyle = tokens.card[variant] || tokens.card.base;

    return (
      <div ref={ref} className={cn(variantStyle, className)} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 sm:p-6 pb-3 sm:pb-4", className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base sm:text-lg font-bold font-heading text-gray-900 dark:text-white tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 sm:p-6 pt-0 sm:pt-0", className)} {...props}>
      {children}
    </div>
  )
);
CardBody.displayName = "CardBody";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 sm:p-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-[#2C3246]/60 flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

export default Card;
