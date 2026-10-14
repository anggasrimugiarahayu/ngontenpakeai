import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Caching aman: revalidasi setiap 7200 detik (2 jam).
// Dalam 24 jam, server hanya memanggil Meta maksimal 12 kali.
// Sangat jauh di bawah limit resmi Meta (200 req/jam) sehingga 100% aman dari deteksi bot/ban.
export const revalidate = 7200;

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  
  if (!token) {
    return NextResponse.json({ followers: 154940, formatted: "154K" });
  }

  try {
    const url = `https://graph.instagram.com/me?fields=id,username,followers_count,media_count&access_token=${token}`;
    const response = await fetch(url, {
      next: { revalidate: 7200 }
    });

    if (!response.ok) {
      throw new Error(`Instagram API responded with status ${response.status}`);
    }

    const data = await response.json();
    const count = data.followers_count || 154940;

    // Simpan backup jumlah follower terbaru ke database secara asynchronous
    prisma.appSetting.upsert({
      where: { key: "INSTAGRAM_FOLLOWER_COUNT" },
      update: { value: count.toString() },
      create: { key: "INSTAGRAM_FOLLOWER_COUNT", value: count.toString() }
    }).catch(() => {});

    return NextResponse.json({ 
      followers: count,
      formatted: Math.floor(count / 1000) + "K",
      username: data.username || "ruangcreativemuslim"
    });
  } catch (error) {
    console.error("Error fetching Instagram followers from Meta Graph API:", error);

    // Ambil dari backup AppSetting jika ada kegagalan jaringan
    try {
      const backup = await prisma.appSetting.findUnique({
        where: { key: "INSTAGRAM_FOLLOWER_COUNT" }
      });
      if (backup?.value) {
        const count = parseInt(backup.value, 10);
        return NextResponse.json({ 
          followers: count,
          formatted: Math.floor(count / 1000) + "K"
        });
      }
    } catch (e) {}

    return NextResponse.json({ followers: 154940, formatted: "154K" });
  }
}
