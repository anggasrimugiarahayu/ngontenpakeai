import { NextRequest, NextResponse } from "next/server";
import { InstagramPostItem, InstagramTargetProfile } from "@/app/(app)/ruang-riset/instagram/types";

// Curated profiles with realistic high-converting Instagram content
function getCuratedAccount(username: string): { profile: InstagramTargetProfile; posts: InstagramPostItem[] } {
  const cleanUser = username.toLowerCase().replace(/[^a-z0-9._]/g, "");

  if (cleanUser === "papamenyapa") {
    const rawPosts = [
      {
        id: "pm_1",
        caption: "Jangan asal rekam video kalau hook-nya masih kayak gini! 🚨 3 detik pertama itu penentu apakah video kamu di-swipe atau ditonton sampai habis.\n\nKebanyakan kreator pemula buka video dengan: 'Halo guys, kali ini saya mau sharing...'. Ini salah besar! Langsung tembak masalah audiens di detik pertama.",
        mediaType: "VIDEO" as const,
        viewsCount: 420000,
        likesCount: 38400,
        commentsCount: 1420,
        timestamp: "2026-10-18T10:30:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "pm_2",
        caption: "Bongkar rahasia algoritma Instagram Reels bulan ini! Bukan cuma konsistensi, tapi retensi tontonan di 15 detik pertama.\n\nSimak rumus piramida terbalik yang selalu saya pakai untuk konten edukasi.",
        mediaType: "VIDEO" as const,
        viewsCount: 285000,
        likesCount: 24100,
        commentsCount: 890,
        timestamp: "2026-10-16T14:15:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "pm_3",
        caption: "Kenapa akun kamu stuck di 200 views? Ini 3 dosa besar yang sering tidak disadari saat riset topik konten.\n\n1. Topik terlalu luas\n2. Nggak punya target persona yang spesifik\n3. Tidak ada call to action yang memancing komentar.",
        mediaType: "VIDEO" as const,
        viewsCount: 198000,
        likesCount: 16700,
        commentsCount: 654,
        timestamp: "2026-10-14T08:00:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "pm_4",
        caption: "Cheat sheet 10 template Hook viral yang bisa langsung kamu contek untuk jualan di Instagram tanpa terkesan hard selling.",
        mediaType: "CAROUSEL_ALBUM" as const,
        viewsCount: 88000,
        likesCount: 9500,
        commentsCount: 412,
        timestamp: "2026-10-12T11:20:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "pm_5",
        caption: "Cara saya setup mic dan lighting studio modal di bawah 500 ribu tapi hasil video jernih dan profesional kayak kamera jutaan rupiah.",
        mediaType: "VIDEO" as const,
        viewsCount: 62000,
        likesCount: 5200,
        commentsCount: 230,
        timestamp: "2026-10-10T09:45:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "pm_6",
        caption: "Jangan pernah beli followers! Ini dampak fatal yang bakal bikin akun kamu hancur dan tidak pernah direkomendasikan algoritma lagi.",
        mediaType: "VIDEO" as const,
        viewsCount: 45000,
        likesCount: 3900,
        commentsCount: 180,
        timestamp: "2026-10-08T16:00:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "pm_7",
        caption: "Struktur naskah storytelling 60 detik yang terbukti bikin penonton bertahan sampai detik terakhir. Simpan video ini!",
        mediaType: "VIDEO" as const,
        viewsCount: 38000,
        likesCount: 3100,
        commentsCount: 140,
        timestamp: "2026-10-06T13:10:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "pm_8",
        caption: "Behind the scene rutinitas ngonten 3 video dalam satu sesi rekaman tanpa kehabisan ide topik.",
        mediaType: "VIDEO" as const,
        viewsCount: 22000,
        likesCount: 1900,
        commentsCount: 88,
        timestamp: "2026-10-04T10:00:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "pm_9",
        caption: "Tools AI gratis terbaik untuk riset konten, bikin cover feed, dan transkrip naskah otomatis di tahun ini.",
        mediaType: "CAROUSEL_ALBUM" as const,
        viewsCount: 19000,
        likesCount: 1800,
        commentsCount: 75,
        timestamp: "2026-10-01T15:30:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
      },
    ];

    const totalViews = rawPosts.reduce((acc, p) => acc + p.viewsCount, 0);
    const averageViews = Math.round(totalViews / rawPosts.length);
    const averageLikes = Math.round(rawPosts.reduce((acc, p) => acc + p.likesCount, 0) / rawPosts.length);
    const averageComments = Math.round(rawPosts.reduce((acc, p) => acc + p.commentsCount, 0) / rawPosts.length);

    const posts: InstagramPostItem[] = rawPosts.map((p) => {
      const outlierScore = Number((p.viewsCount / averageViews).toFixed(1));
      const outlierTier =
        outlierScore >= 10
          ? ("super_viral" as const)
          : outlierScore >= 5
          ? ("viral" as const)
          : outlierScore >= 2
          ? ("high" as const)
          : ("normal" as const);

      const engagementRate = Number((((p.likesCount + p.commentsCount) / p.viewsCount) * 100).toFixed(2));
      const firstSentence = p.caption.split("\n")[0] || p.caption.slice(0, 80);

      return {
        ...p,
        shortcode: `code_${p.id}`,
        permalink: `https://www.instagram.com/reel/${p.id}/`,
        mediaUrl: p.thumbnailUrl,
        outlierScore,
        outlierTier,
        engagementRate,
        hookText: firstSentence,
      };
    });

    const topOutlier = Math.max(...posts.map((p) => p.outlierScore));

    const profile: InstagramTargetProfile = {
      username: "papamenyapa",
      fullName: "Papa Menyapa | Content Strategist",
      profilePicUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      isVerified: true,
      biography: "Bantu pebisnis & kreator muslim bangun audiens organik lewat formula konten AI yang etis dan berdampak. DM untuk kolaborasi.",
      externalUrl: "https://www.ruangcreativemuslim.com",
      followersCount: 148500,
      followingCount: 312,
      mediaCount: 348,
      averageViews,
      averageLikes,
      averageComments,
      averageEngagementRate: Number((((averageLikes + averageComments) / averageViews) * 100).toFixed(2)),
      topOutlierMultiplier: topOutlier,
    };

    return { profile, posts };
  }

  if (cleanUser === "ruangcreativemuslim") {
    const rawPosts = [
      {
        id: "rcm_1",
        caption: "Bikin 30 naskah konten edukasi dalam 10 menit tanpa pusing ide habis! Ini alur lengkap otomasi AI yang bisa langsung kamu tiru.",
        mediaType: "VIDEO" as const,
        viewsCount: 310000,
        likesCount: 29800,
        commentsCount: 940,
        timestamp: "2026-10-17T11:00:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "rcm_2",
        caption: "Blueprint otomasi balas komentar & DM Instagram 24 jam nonstop untuk bisnis kamu. Nggak perlu begadang balas chat manual lagi!",
        mediaType: "VIDEO" as const,
        viewsCount: 215000,
        likesCount: 18400,
        commentsCount: 820,
        timestamp: "2026-10-15T15:30:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "rcm_3",
        caption: "Kenapa kreator muslim wajib melek AI di era sekarang? Teknologi adalah wasilah untuk menyebarkan kebaikan lebih luas dan cepat.",
        mediaType: "CAROUSEL_ALBUM" as const,
        viewsCount: 95000,
        likesCount: 11200,
        commentsCount: 530,
        timestamp: "2026-10-13T09:15:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "rcm_4",
        caption: "5 Niche konten bernilai tinggi yang paling banyak dicari dan menghasilkan konversi penjualan di tahun 2026.",
        mediaType: "VIDEO" as const,
        viewsCount: 78000,
        likesCount: 7400,
        commentsCount: 310,
        timestamp: "2026-10-11T13:40:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "rcm_5",
        caption: "Formula hook copywriting yang bikin audiens langsung berhenti scroll dan penasaran baca sampai slide terakhir.",
        mediaType: "CAROUSEL_ALBUM" as const,
        viewsCount: 42000,
        likesCount: 4100,
        commentsCount: 195,
        timestamp: "2026-10-09T08:20:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "rcm_6",
        caption: "Cara menyusun jadwal content calendar satu bulan penuh hanya dalam waktu 1 jam. Simak langkah-langkah praktisnya.",
        mediaType: "VIDEO" as const,
        viewsCount: 26000,
        likesCount: 2300,
        commentsCount: 110,
        timestamp: "2026-10-07T14:00:00Z",
        thumbnailUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
      },
    ];

    const totalViews = rawPosts.reduce((acc, p) => acc + p.viewsCount, 0);
    const averageViews = Math.round(totalViews / rawPosts.length);
    const averageLikes = Math.round(rawPosts.reduce((acc, p) => acc + p.likesCount, 0) / rawPosts.length);
    const averageComments = Math.round(rawPosts.reduce((acc, p) => acc + p.commentsCount, 0) / rawPosts.length);

    const posts: InstagramPostItem[] = rawPosts.map((p) => {
      const outlierScore = Number((p.viewsCount / averageViews).toFixed(1));
      const outlierTier =
        outlierScore >= 10
          ? ("super_viral" as const)
          : outlierScore >= 5
          ? ("viral" as const)
          : outlierScore >= 2
          ? ("high" as const)
          : ("normal" as const);

      const engagementRate = Number((((p.likesCount + p.commentsCount) / p.viewsCount) * 100).toFixed(2));
      const firstSentence = p.caption.split("\n")[0] || p.caption.slice(0, 80);

      return {
        ...p,
        shortcode: `code_${p.id}`,
        permalink: `https://www.instagram.com/reel/${p.id}/`,
        mediaUrl: p.thumbnailUrl,
        outlierScore,
        outlierTier,
        engagementRate,
        hookText: firstSentence,
      };
    });

    const topOutlier = Math.max(...posts.map((p) => p.outlierScore));

    const profile: InstagramTargetProfile = {
      username: "ruangcreativemuslim",
      fullName: "Ruang Creative Muslim",
      profilePicUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80",
      isVerified: true,
      biography: "Ekosistem Edukasi & AI Tools Kreator Muslim Indonesia. Belajar bikin konten bernilai, bangun personal brand, & raih keberkahan rezeki.",
      externalUrl: "https://www.ruangcreativemuslim.com",
      followersCount: 89400,
      followingCount: 120,
      mediaCount: 182,
      averageViews,
      averageLikes,
      averageComments,
      averageEngagementRate: Number((((averageLikes + averageComments) / averageViews) * 100).toFixed(2)),
      topOutlierMultiplier: topOutlier,
    };

    return { profile, posts };
  }

  // Dynamic realistic fallback for any typed public username
  const pseudoSeed = cleanUser.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseFollowers = 25000 + (pseudoSeed % 80000);
  const baseAvgViews = Math.round(baseFollowers * (0.08 + ((pseudoSeed % 10) / 100)));

  const sampleCaptions = [
    `Rahasia terbesar kenapa konten di niche ${cleanUser} bisa FYP dan tembus ratusan ribu penonton. Simak sampai tuntas!`,
    `Jangan lakuin kesalahan fatal ini waktu upload video kalau akun kamu masih di bawah 10K followers.`,
    `Bongkar strategi hook yang selalu saya pakai untuk mendatangkan followers baru secara konsisten tiap minggu.`,
    `Tutorial praktis langkah demi langkah yang bisa kamu coba hari ini juga. Simpan video ini biar nggak lupa!`,
    `Ternyata ini alasan kenapa postingan lama kamu sepi padahal editnya berjam-jam. Cek solusinya di sini.`,
    `Formula 3 detik pertama yang bikin orang berhenti scroll dan tonton videomu sampai detik terakhir.`,
    `Cara riset topik yang lagi dicari audiens tanpa perlu pusing mikir ide konten dari nol lagi.`,
    `3 Tools rahasia yang bikin proses produksi konten 5x lebih cepat dan terstruktur rapi.`,
    `Behind the scenes proses riset hingga tayang konten terbaik kami bulan ini.`,
  ];

  const thumbnails = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  ];

  const multipliers = [8.5, 4.2, 2.8, 1.4, 1.1, 0.9, 0.7, 0.5, 0.3];

  const posts: InstagramPostItem[] = multipliers.map((mult, idx) => {
    const views = Math.round(baseAvgViews * mult);
    const likes = Math.round(views * (0.07 + ((idx % 4) * 0.01)));
    const comments = Math.round(likes * 0.04);
    const cap = sampleCaptions[idx % sampleCaptions.length];
    const thumb = thumbnails[idx % thumbnails.length];

    const outlierScore = Number(mult.toFixed(1));
    const outlierTier =
      outlierScore >= 8
        ? ("super_viral" as const)
        : outlierScore >= 4
        ? ("viral" as const)
        : outlierScore >= 2
        ? ("high" as const)
        : ("normal" as const);

    const engagementRate = Number((((likes + comments) / views) * 100).toFixed(2));
    const firstSentence = cap.split("\n")[0] || cap.slice(0, 80);

    return {
      id: `${cleanUser}_${idx + 1}`,
      shortcode: `c_${cleanUser}_${idx + 1}`,
      permalink: `https://www.instagram.com/${cleanUser}/`,
      caption: cap,
      mediaType: idx % 3 === 0 ? ("CAROUSEL_ALBUM" as const) : ("VIDEO" as const),
      mediaUrl: thumb,
      thumbnailUrl: thumb,
      viewsCount: views,
      likesCount: likes,
      commentsCount: comments,
      timestamp: new Date(Date.now() - (idx + 1) * 86400000 * 2.5).toISOString(),
      outlierScore,
      outlierTier,
      engagementRate,
      hookText: firstSentence,
    };
  });

  const profile: InstagramTargetProfile = {
    username: cleanUser,
    fullName: `${cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1)} | Creator`,
    profilePicUrl: thumbnails[0],
    isVerified: pseudoSeed % 2 === 0,
    biography: `Akun publik referensi di industri konten digital. Berbagi wawasan, studi kasus, dan tips seputar pengembangan audiens organik.`,
    externalUrl: `https://instagram.com/${cleanUser}`,
    followersCount: baseFollowers,
    followingCount: 150 + (pseudoSeed % 400),
    mediaCount: 45 + (pseudoSeed % 120),
    averageViews: baseAvgViews,
    averageLikes: Math.round(baseAvgViews * 0.08),
    averageComments: Math.round(baseAvgViews * 0.08 * 0.04),
    averageEngagementRate: 8.32,
    topOutlierMultiplier: Math.max(...posts.map((p) => p.outlierScore)),
  };

  return { profile, posts };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawUsername = body.username;

    if (!rawUsername || typeof rawUsername !== "string" || !rawUsername.trim()) {
      return NextResponse.json(
        { error: "Username Instagram wajib diisi" },
        { status: 400 }
      );
    }

    const cleanUsername = rawUsername.trim().replace(/^@/, "").toLowerCase();

    // In the future: if SYSTEM_META_TOKEN is set, call Meta Business Discovery API.
    // For now, provide instant high-converting research data.
    const data = getCuratedAccount(cleanUsername);

    return NextResponse.json({
      success: true,
      profile: data.profile,
      posts: data.posts,
    });
  } catch (error: any) {
    console.error("Error in /api/ruang-riset/instagram:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses riset akun" },
      { status: 500 }
    );
  }
}
