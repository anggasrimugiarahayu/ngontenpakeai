import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import AuthProvider from "@/components/layout/AuthProvider";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Ruang Ngonten - Strategi Faceless Creator",
  description: "Panduan ngonten untuk bangun akun sosmed dari nol tanpa harus nunjukin wajah.",
};

export const viewport = {
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let memberCount = 0;
  try {
    memberCount = await prisma.user.count();
  } catch (error) {
    console.error("Error fetching member count:", error);
  }

  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`bg-gray-50 text-gray-800 dark:bg-rn-dark-bg dark:text-gray-200 font-sans selection:bg-rn-accent selection:text-black antialiased relative min-h-screen`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="w-full min-h-screen flex flex-col relative">
              <Suspense>
                <Navbar memberCount={memberCount.toString()} />
              </Suspense>
              <main className="flex-1 flex flex-col pt-16 md:pt-20">
                {children}
              </main>
              <Footer />
            </div>

          </ThemeProvider>

        </AuthProvider>
      </body>
    </html>
  );
}
