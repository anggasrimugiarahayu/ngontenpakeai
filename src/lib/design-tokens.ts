/**
 * Centralized Design Tokens for RuangCreativeMuslim (Ngonten Pakai AI)
 * Single Source of Truth for Colors, Cards, Inputs, Buttons, Badges, Modals, etc.
 */

// Simple, reliable className merger (no external dependency needed)
export function cn(...inputs: any[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      if (Array.isArray(input)) {
        classes.push(cn(...input));
      } else {
        for (const [key, val] of Object.entries(input)) {
          if (val) classes.push(key);
        }
      }
    }
  }
  
  return classes.join(" ").trim();
}

export const tokens = {
  // Brand & Accent Colors
  colors: {
    primary: "#f97316",
    primaryHover: "#ea580c",
    primaryDarkHover: "#fb923c",
    cardLight: "#ffffff",
    cardDark: "#141B31",
    borderLight: "#e5e7eb",
    borderDark: "#2C3246",
    hoverLight: "#f9fafb",
    hoverDark: "#1f2947",
    bgDark: "#0A1128",
  },

  // Card & Container System
  card: {
    base: "bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-xs transition-colors",
    hoverable: "bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-xs hover:shadow-md hover:border-gray-300 dark:hover:border-[#3b435e] transition-all cursor-pointer",
    subtle: "bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] rounded-xl transition-colors",
    modal: "bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl",
  },

  // Button Variants & Sizes
  button: {
    base: "inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
    variants: {
      primary: "bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white shadow-xs shadow-orange-500/20",
      secondary: "bg-white hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:bg-[#141B31] dark:hover:bg-[#1f2947] dark:hover:border-[#3b435e] dark:hover:text-white border border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-200 shadow-xs",
      ghost: "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white shadow-xs shadow-red-500/20",
      success: "bg-green-600 hover:bg-green-700 text-white shadow-xs shadow-green-600/20",
    },
    sizes: {
      sm: "text-xs px-3 py-1.5 rounded-xl gap-1.5",
      md: "text-xs sm:text-sm px-4 py-2.5 rounded-xl gap-2",
      lg: "text-sm sm:text-base px-6 py-3 rounded-xl gap-2.5",
      icon: "w-9 h-9 rounded-xl p-0 flex items-center justify-center",
    },
  },

  // Back Button Minimalist Token
  backButton: "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all cursor-pointer active:scale-95 shrink-0",

  // Input & Form Fields
  input: {
    base: "w-full rounded-xl bg-white dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm",
    sm: "w-full rounded-xl bg-white dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-xs px-3 py-2",
    md: "w-full rounded-xl bg-white dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm px-4 py-2.5",
  },

  // Badge & Status Pills
  badge: {
    base: "inline-flex items-center font-bold uppercase tracking-wider rounded-lg",
    variants: {
      primary: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
      success: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
      warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
      danger: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
      info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      neutral: "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10",
      pro: "bg-orange-500 text-white shadow-2xs shadow-orange-500/30",
    },
    sizes: {
      xs: "text-[9px] px-1.5 py-0.5",
      sm: "text-[10px] px-2 py-0.5",
      md: "text-xs px-2.5 py-1",
    },
  },

  // Modal Dialogs
  modal: {
    backdrop: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200",
    dialog: "relative w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden",
    closeBtn: "absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer",
  },
};
