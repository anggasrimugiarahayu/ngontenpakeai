"use client";
import React from "react";
import { ClawdPageVisual } from "./ClawdLoadingVisuals";

export default function LoadingSpinner({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="flex-1 w-full flex justify-center py-12 px-4 items-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-2 text-center animate-in fade-in duration-200">
        <ClawdPageVisual />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-tight">
          {message}
        </p>
      </div>
    </div>
  );
}
export { LoadingSpinner };
