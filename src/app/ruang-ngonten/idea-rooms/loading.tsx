import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-rn-accent animate-spin mb-4" />
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Menyiapkan ruang kerja...</p>
    </div>
  );
}
