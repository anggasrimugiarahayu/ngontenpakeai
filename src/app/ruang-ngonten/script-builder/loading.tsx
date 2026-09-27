import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] z-50">
      <Loader2 className="w-8 h-8 text-rn-accent animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Menyiapkan Script Builder...</p>
    </div>
  );
}
