import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CarouselBuilderClient from "./CarouselBuilderClient";

export const metadata = {
  title: "",
  description: "",
};

export default async function CarouselBuilderPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  return <CarouselBuilderClient />;
}
