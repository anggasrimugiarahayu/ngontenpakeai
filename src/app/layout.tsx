import { auth } from "@/auth";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import AuthProvider from "@/components/layout/AuthProvider";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

import { getCachedMemberCount, getCachedAppUser, getCachedUserOrders } from "@/lib/cache";
import { computeUserSubscriptionStatus } from "@/lib/subscription-utils";
import SWRProvider from "@/components/layout/SWRProvider";
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ruangcreativemuslim.com"),
  title: "ruangcreativemuslim - Strategi Faceless Creator & Automasi AI",
  description: "Platform produktivitas ngonten & automasi cerdas dari nol tanpa harus nunjukin wajah.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icon.png"],
  },
};

export const viewport = {
  colorScheme: "light dark",
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
    const [fetchedMemberCount, session] = await Promise.all([
      getCachedMemberCount(),
      auth()
    ]);
    memberCount = fetchedMemberCount;
    if (session?.user?.id) {
      const [dbUser, userOrders] = await Promise.all([
        getCachedAppUser(session.user.id),
        getCachedUserOrders(session.user.id)
      ]);
      if (dbUser) {
        const subStatus = computeUserSubscriptionStatus(dbUser, userOrders);
        userRole = subStatus.isAdmin ? "ADMIN" : subStatus.isPro ? "PRO" : "USER";
        badgeName = subStatus.badgeName;
      }
    }
  } catch (error) {
    console.log("Error fetching data (Supabase cold start)");
  }

  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`bg-gray-50 text-gray-800 dark:bg-rn-dark-bg dark:text-gray-200 font-sans selection:bg-rn-accent selection:text-black antialiased relative min-h-screen overscroll-none`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <SWRProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <Suspense>
                <NavigationProgressBar />
              </Suspense>
              <div className="w-full min-h-screen flex flex-col relative overscroll-none">
                <Suspense>
                  <Navbar memberCount={memberCount.toString()} userRole={userRole} badgeName={badgeName} />
                </Suspense>
                <main className="flex-1 flex flex-col pt-16 md:pt-16 pb-1 overscroll-none">
                  {children}
                </main>
                <Footer />
              </div>

            <Toaster 
              position="bottom-right" 
              toastOptions={{ 
                className: "!bg-white dark:!bg-[#141B31] !text-gray-900 dark:!text-white !border !border-gray-200 dark:!border-[#2C3246] !shadow-xl !rounded-xl !text-xs !font-bold",
              }} 
            />
            </ThemeProvider>
          </SWRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
