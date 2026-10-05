import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ScriptBuilderClient from "./ScriptBuilderClient";

export const metadata = {
  title: "Script Builder - Ruang Ngonten",
  description: "Buat naskah video pendek yang engaging dan menahan penonton sampai akhir.",
};

export default async function ScriptBuilderPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  return <ScriptBuilderClient />;
}
