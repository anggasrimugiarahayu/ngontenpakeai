import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BioBuilderClient from "./BioBuilderClient";

export const metadata = {
  title: "Bio Builder - Ruang Ngonten",
  description: "Rakit profil Instagram yang optimasi konversi.",
};

export default async function BioBuilderPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  return <BioBuilderClient />;
}
