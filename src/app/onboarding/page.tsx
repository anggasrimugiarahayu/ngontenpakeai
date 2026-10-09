import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import OnboardingClient from "./OnboardingClient";

export const metadata = {
  title: "Personalisasi Akun - Ngonten Pakai AI",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if they already completed it
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (user?.onboardingCompleted) {
    redirect("/");
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 w-full">
      <OnboardingClient />
    </div>
  );
}
