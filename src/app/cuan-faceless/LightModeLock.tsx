"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function LightModeLock() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const originalHtmlClass = document.documentElement.className;
    const originalColorScheme = document.documentElement.style.colorScheme;

    // Force Light Mode on this Landing Page
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";

    return () => {
      // Restore previous theme state when navigating away
      document.documentElement.className = originalHtmlClass;
      document.documentElement.style.colorScheme = originalColorScheme;
    };
  }, []);

  return null;
}
