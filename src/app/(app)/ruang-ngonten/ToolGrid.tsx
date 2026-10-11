"use client";

import { 
  Images,
  Compass, 
  UserCircle, 
  Lightbulb, 
  FileText, 
  Copy, 
  RefreshCw, 
  BookOpen, 
  Calendar
} from "lucide-react";
import ToolCard from "./ToolCard";

const features = [
  {
    title: "Master Blueprint",
    description: "Rancang fondasi dan strategi dasar kontenmu dari nol hingga siap eksekusi.",
    points: ["Isi Kuesioner", "Proses AI", "Hasil Blueprint"],
    icon: Compass,
    href: "/ruang-ngonten/master-blueprint"
  },
  {
    title: "Bio Builder",
    description: "Optimalkan bio profil sosial mediamu agar menarik perhatian audiens baru.",
    points: ["Isi Profil", "Generate Bio", "Hasil Bio"],
    icon: UserCircle,
    href: "/ruang-ngonten/bio-builder"
  },
  {
    title: "Idea Rooms",
    description: "Temukan ratusan ide konten segar dan viral untuk update setiap hari.",
    points: ["Ketikkan Ide", "Generate Ide", "Bank Ide"],
    icon: Lightbulb,
    href: "/ruang-ngonten/idea-rooms"
  },
  {
    title: "Script Builder",
    description: "Buat naskah video pendek yang engaging dan menahan penonton sampai akhir.",
    points: ["Pilih Topik", "Generate Script", "Hasil Script"],
    icon: FileText,
    href: "/ruang-ngonten/script-builder"
  },
  {
    title: "Carousel Prompt Builder",
    description: "Desain alur cerita slide carousel yang edukatif, rapi, dan mudah dipahami.",
    points: ["Isi Topik", "Generate Slide", "Prompt Visual"],
    icon: Images,
    href: "/ruang-ngonten/carousel-builder"
  },
  {
    title: "ATM Content Builder",
    description: "Strategi Amati, Tiru, dan Modifikasi konten yang sudah terbukti sukses.",
    points: ["Masukkan Referensi", "Analisis Konten", "Hasil Adaptasi"],
    icon: RefreshCw,
    href: "/ruang-ngonten/atm-builder"
  },
  {
    title: "Ebook Prompt Builder",
    description: "Susun kerangka dan draft Ebook secara instan untuk kebutuhan Lead Magnet.",
    points: ["Isi Topik", "Generate Draft", "Hasil Ebook"],
    icon: BookOpen,
    href: "/ruang-ngonten/ebook-builder"
  },
  {
    title: "Content Calendar",
    description: "Jadwalkan dan kelola publikasi konten harianmu agar selalu konsisten.",
    points: ["Atur Jadwal", "Susun Kalender", "Jadwal Konten"],
    icon: Calendar,
    href: "/ruang-ngonten/content-calendar"
  }
];

export default function ToolGrid({ hasBlueprint, dbFeatures = [], isPro = false, isLoggedIn = true }: { hasBlueprint: boolean, dbFeatures?: any[], isPro?: boolean, isLoggedIn?: boolean }) {
  
  // Map hardcoded features with DB features
  const mappedFeatures = features.map(f => {
    const dbMatch = dbFeatures.find(db => db.name === f.title);
    return {
      ...f,
      isActive: dbMatch ? dbMatch.isActive : true,
      isProOnly: dbMatch ? dbMatch.isProOnly : false
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
      {mappedFeatures.filter(f => f.isActive).map((feature, idx) => (
        <ToolCard key={idx} feature={feature} hasBlueprint={hasBlueprint} isPro={isPro} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}
