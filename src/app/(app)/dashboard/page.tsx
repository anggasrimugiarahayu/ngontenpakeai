import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getDashboardDataAction } from "@/app/actions/dashboard";

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

  const initialData = await getDashboardDataAction();

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0f0f11] pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <DashboardClient user={session.user} initialData={initialData} />
      </div>
    </div>
  );
}
