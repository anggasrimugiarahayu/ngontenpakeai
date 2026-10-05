import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AtmBuilderClient from "./AtmBuilderClient";

export const metadata = {
  title: "",
  description: "",
};

export default async function AtmBuilderPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  return <AtmBuilderClient />;
}
