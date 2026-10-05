"use client";
import React from "react";

export default function LoadingSpinner({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="flex-1 w-full flex justify-center py-12 px-4 items-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">{message}</p>
      </div>
    </div>
  );
}
