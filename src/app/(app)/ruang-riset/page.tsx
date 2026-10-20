import { auth } from "@/auth";
import RuangRisetClient from "./RuangRisetClient";

export const metadata = {
  title: "Ruang Riset - Riset Tren Konten, Audiens & Kompetitor AI",
  description: "Riset ide konten viral, analisis pola audiens, dan bedah strategi kompetitor dengan kekuatan AI.",
};

export default async function RuangRisetPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.email?.toLowerCase() === "anggasrimugiarahayu@gmail.com";

  return (
    <RuangRisetClient
      isLoggedIn={isLoggedIn}
      isAdmin={isAdmin}
    />
  );
}
