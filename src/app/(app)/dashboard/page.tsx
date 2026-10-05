import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Admin Dashboard - Ngonten Pakai AI",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0f0f11] pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <DashboardClient user={session.user} />
      </div>
    </div>
  );
}
