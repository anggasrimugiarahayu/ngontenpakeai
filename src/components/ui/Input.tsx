"use client";

import React, { forwardRef } from "react";
import { tokens, cn } from "@/lib/design-tokens";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputSize = "md",
      leftIcon,
      rightIcon,
      label,
      error,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const sizeStyle = tokens.input[inputSize] || tokens.input.md;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            disabled={disabled}
            className={cn(
              sizeStyle,
              Boolean(leftIcon) && "pl-10",
              Boolean(rightIcon) && "pr-10",
              Boolean(error) && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
              Boolean(disabled) && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, disabled, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          disabled={disabled}
          className={cn(
            tokens.input.base,
            "px-4 py-3 min-h-[90px] resize-y custom-scrollbar leading-relaxed",
            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export default Input;
