"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginContent() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";
  const error = searchParams.get("error") || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 -mt-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Sign in
          </h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center font-medium animate-in fade-in">
            {error === "Configuration"
              ? "Koneksi login sedang diperbarui. Silakan klik tombol di bawah untuk mencoba kembali."
              : `Terjadi kendala autentikasi (${error}). Silakan coba klik login kembali.`}
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: redirectUrl || "/" })}
          className={`w-full inline-flex items-center justify-center gap-2.5 h-10 px-4 py-2 rounded-lg text-sm font-medium transition-colors border cursor-pointer
            ${isDark 
              ? "border-[#2C3246] bg-[#141B31] text-gray-200 hover:bg-[#1C2442]" 
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
            }`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <path
              d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86 8.87028 4.75 12.0003 4.75Z"
              fill="#EA4335"
            />
            <path
              d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
              fill="#4285F4"
            />
            <path
              d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
              fill="#FBBC05"
            />
            <path
              d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
              fill="#34A853"
            />
          </svg>
          Sign in with Google
        </button>

        <p className={`text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Don't have an account?{" "}
          <Link href={`/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`} className="text-rn-accent hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
