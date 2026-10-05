import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ContentCalendarClient from "./ContentCalendarClient";

export const metadata = {
  title: "",
  description: "",
};

export default async function ContentCalendarPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  return <ContentCalendarClient />;
}
