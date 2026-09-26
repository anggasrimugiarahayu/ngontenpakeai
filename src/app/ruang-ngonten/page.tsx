import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  Compass, 
  UserCircle, 
  Lightbulb, 
  FileText, 
  Copy, 
  RefreshCw, 
  BookOpen, 
  Calendar,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Ruang Ngonten - ruangcreativemuslim",
};

const features = [
  {
    title: "Master Blueprint",
    description: "Rancang fondasi dan strategi dasar kontenmu dari nol hingga siap eksekusi.",
    points: ["Target Audience", "Content Pillar", "Tone of Voice"],
    icon: Compass,
    href: "/ruang-ngonten/master-blueprint"
  },
  {
    title: "Bio Builder",
    description: "Optimalkan bio profil sosial mediamu agar menarik perhatian audiens baru.",
    points: ["Headline Profile", "Call to Action", "Link Setup"],
    icon: UserCircle,
    href: "/ruang-ngonten/bio-builder"
  },
  {
    title: "Idea Rooms",
    description: "Temukan ratusan ide konten segar dan viral untuk update setiap hari.",
    points: ["Trending Topics", "Niche Ideas", "Q&A Hooks"],
    icon: Lightbulb,
    href: "/ruang-ngonten/idea-rooms"
  },
  {
    title: "Script Builder",
    description: "Buat naskah video pendek yang engaging dan menahan penonton sampai akhir.",
    points: ["Hook Kuat", "Isi Materi / Story", "Strong CTA"],
    icon: FileText,
    href: "/ruang-ngonten/script-builder"
  },
  {
    title: "Carousel Prompt Builder",
    description: "Desain alur cerita slide carousel yang edukatif, rapi, dan mudah dipahami.",
    points: ["Cover Slide", "Core Value", "Closing Slide"],
    icon: Copy,
    href: "/ruang-ngonten/carousel-builder"
  },
  {
    title: "ATM Content Builder",
    description: "Strategi Amati, Tiru, dan Modifikasi konten yang sudah terbukti sukses.",
    points: ["Analyze Viral", "Extract Format", "Re-create"],
    icon: RefreshCw,
    href: "/ruang-ngonten/atm-builder"
  },
  {
    title: "Ebook Prompt Builder",
    description: "Susun kerangka dan draft Ebook secara instan untuk kebutuhan Lead Magnet.",
    points: ["Chapter Outline", "Content Draft", "Formatting"],
    icon: BookOpen,
    href: "/ruang-ngonten/ebook-builder"
  },
  {
    title: "Content Calendar",
    description: "Jadwalkan dan kelola publikasi konten harianmu agar selalu konsisten.",
    points: ["Weekly Plan", "Platform Sync", "Reminder Setup"],
    icon: Calendar,
    href: "/ruang-ngonten/content-calendar"
  }
];

export default async function RuangNgontenPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 relative w-full max-w-7xl mx-auto p-4 md:p-6 py-8 md:py-10 animate-in fade-in duration-300">
      
      {/* Back Button */}
      <div className="mb-4 md:mb-0 md:absolute md:left-6 lg:left-8 top-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-rn-accent dark:text-gray-400 dark:hover:text-rn-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8 md:mb-10 mt-2 md:mt-0">
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-2 text-gray-900 dark:text-white">
          Mau mulai dari mana?
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          Pilih tools AI di bawah ini untuk membantu <br className="hidden sm:block" />
          mempercepat proses pembuatan konten kamu hari ini.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Link 
              key={idx} 
              href={feature.href}
              className="group relative flex flex-col justify-start rounded-xl border-2 p-5 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer z-0 overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 hover:border-rn-accent dark:hover:border-rn-accent/50 shadow-gray-200 dark:shadow-black/50"
            >
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-rn-accent/10 group-hover:text-rn-accent transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-rn-accent transition-colors leading-tight">
                  {feature.title}
                </h3>
              </div>
              
              {/* Description */}
              <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">
                {feature.description}
              </p>

              {/* Timeline List */}
              <div className="relative ml-1.5 space-y-3">
                {/* Vertical Line */}
                <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-white/5" />
                
                {feature.points.map((point, pIdx) => (
                  <div key={pIdx} className="relative flex items-center gap-3">
                    {/* Dot */}
                    <div className={`w-2 h-2 rounded-full z-10 transition-colors ${
                      pIdx === 0 
                        ? "bg-rn-accent ring-4 ring-rn-accent/20" 
                        : "bg-gray-300 dark:bg-gray-600 group-hover:bg-rn-accent/50"
                    }`} />
                    {/* Text */}
                    <span className={`text-[11px] font-medium transition-colors ${
                      pIdx === 0 
                        ? "text-gray-900 dark:text-white" 
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-400 dark:group-hover:text-gray-300"
                    }`}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
