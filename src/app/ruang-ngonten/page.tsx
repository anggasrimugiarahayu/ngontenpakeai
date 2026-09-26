import { auth } from "@/auth";
import { redirect } from "next/navigation";

import Link from "next/link";
import prisma from "@/lib/prisma";
import ToolGrid from "./ToolGrid";


export const metadata = {
  title: "Ruang Ngonten - ruangcreativemuslim",
};



export default async function RuangNgontenPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const blueprint = await prisma.masterBlueprint.findFirst({
    where: { userId: session.user.id }
  });
  const hasBlueprint = !!blueprint;


  return (
    <div className="flex-1 relative w-full max-w-7xl mx-auto p-4 md:p-6 py-8 md:py-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="text-center mb-8 md:mb-10 mt-2 md:mt-0">
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-2 text-gray-900 dark:text-white">
          Mau mulai dari mana?
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          Pilih tools AI di bawah ini untuk membantu <br className="hidden sm:block" />
          mempercepat proses pembuatan konten kamu hari ini.
        </p>
      </div>

      {/* Grid Cards */}
      <ToolGrid hasBlueprint={hasBlueprint} />

    </div>
  );
}
