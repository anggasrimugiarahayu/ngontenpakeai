import { auth } from "@/auth";
import { redirect } from "next/navigation";
import IdeaRoomsClient from "./IdeaRoomsClient";

export const metadata = {
  title: "Idea Rooms - Ruang Ngonten",
  description: "Ubah Ide kamu menjadi rencana konten.",
};

export default async function IdeaRoomsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  return <IdeaRoomsClient />;
}
