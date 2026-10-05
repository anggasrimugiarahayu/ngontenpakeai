import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EbookBuilderClient from "./EbookBuilderClient";

export const metadata = {
  title: "",
  description: "",
};

export default async function EbookBuilderPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  return <EbookBuilderClient />;
}
