"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, updateTag, revalidateTag } from "next/cache";

export async function saveOnboardingData(data: {
  niche: string;
  struggle: string;
  platform: string;
  goal: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        preferences: data,
      },
    });

    try {
      updateTag("user-session");
    } catch {}
    try {
      (revalidateTag as any)("user-session");
    } catch {}

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    return { success: false, error: "Gagal menyimpan data onboarding." };
  }
}
