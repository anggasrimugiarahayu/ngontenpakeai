"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <footer className="w-full py-2 flex flex-col items-center justify-center mt-auto">
      <div className="text-gray-500 text-xs flex items-center gap-2">
        Product by
        <a
          href="https://www.instagram.com/ruangcreativemuslim/"
          target="_blank"
          rel="noopener noreferrer"
          className={`font-bold flex items-center gap-1.5 hover:text-rn-accent transition-colors ml-1 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>{" "}
          ruangcreativemuslim
        </a>
      </div>
    </footer>
  );
}
