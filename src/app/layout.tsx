import { auth } from "@/auth";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import AuthProvider from "@/components/layout/AuthProvider";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

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
  let userRole = "USER";
  let badgeName = "FREE";
  try {
    memberCount = await prisma.user.count();
    const session = await auth();
    if (session?.user?.id) {
      const dbUser = await prisma.user.findUnique({ 
        where: { id: session.user.id }, 
        select: { role: true, proToolsExpiredAt: true, email: true } 
      });
      if (dbUser) {
        userRole = dbUser.role || "USER";
        
        // Calculate badge dynamically
        const hasTools = dbUser.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date();
        const isAdmin = dbUser.email === "anggasrimugiarahayu@gmail.com" || userRole === "ADMIN";
        
        // Check if they ever bought PRO_BOOK or PRO_PLUS
        const bookOrders = await prisma.order.findFirst({
          where: {
            userId: session.user.id,
            status: "SUCCESS",
            orderType: { in: ["PRO_BOOK", "PRO_PLUS"] }
          }
        });
        const hasBook = !!bookOrders || isAdmin;
        
        if (isAdmin) badgeName = "ADMIN";
        else if (hasBook && hasTools) badgeName = "PRO PLUS";
        else if (hasTools) badgeName = "PRO TOOLS";
        else if (hasBook) badgeName = "PRO BOOK";
      }
    }
  } catch (error) {
    console.log("Error fetching data (Supabase cold start)");
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
                <Navbar memberCount={memberCount.toString()} userRole={userRole} badgeName={badgeName} />
              </Suspense>
              <main className="flex-1 flex flex-col pt-16 md:pt-20 pb-2">
                {children}
              </main>
              <Footer />
            </div>

          <Toaster position="bottom-right" toastOptions={{ style: { background: "#333", color: "#fff" } }} />
          </ThemeProvider>

        </AuthProvider>
      </body>
    </html>
  );
}
