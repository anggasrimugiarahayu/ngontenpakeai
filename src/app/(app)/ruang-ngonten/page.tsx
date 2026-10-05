import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ToolGrid from "./ToolGrid";

export const metadata = {
  title: "Ruang Ngonten Workspace - ruangcreativemuslim",
};

export default async function RuangNgontenPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if blueprint exists
  const blueprint = await prisma.masterBlueprint.findFirst({
    where: { userId: session.user.id },
    select: { id: true }
  });
  const hasBlueprint = !!blueprint;
  const dbFeatures = await prisma.feature.findMany();
  const isPro = session?.user?.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com"; // Add real logic here later

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 py-4 md:py-6 animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-4 md:mb-8">
        <div className="space-y-3 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mau mulai dari mana?
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-balance leading-relaxed">
            Pilih asisten AI andalanmu di bawah ini untuk mulai meracik ide, menulis skrip, hingga menyusun strategi konten.
          </p>
        </div>
      </div>
      
      <ToolGrid hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} />
    </div>
  );
}
