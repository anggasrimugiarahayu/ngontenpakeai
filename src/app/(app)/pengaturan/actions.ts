"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        image: image || undefined,
      },
    });

    revalidatePath("/pengaturan");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Gagal memperbarui profil." };
  }
}

export async function updateApiKey(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const apiKey = formData.get("apiKey") as string;

  if (!apiKey || apiKey.trim() === "") {
    return { success: false, error: "API Key tidak boleh kosong." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleApiKey: apiKey.trim(),
      },
    });

    revalidatePath("/pengaturan");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update API Key:", error);
    return { success: false, error: "Gagal menyimpan API Key." };
  }
}

export async function deleteApiKey() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleApiKey: null,
      },
    });

    revalidatePath("/pengaturan");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete API Key:", error);
    return { success: false, error: "Gagal menghapus API Key." };
  }
}
