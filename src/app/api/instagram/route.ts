import { NextResponse } from 'next/server';

export const revalidate = 10800; // 3 hours

export async function GET() {
  try {
    // URL ini akan kita ganti dengan endpoint yang benar dari user
    // Untuk saat ini saya letakkan URL dummy agar tidak error
    const url = 'https://instagram-scraper-stable-api.p.rapidapi.com/ig_get_fb_profile_v3.php';
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '8ec28a7a3amsh5ce4ff083c100d6p17869fjsn8b0909d83935',
        'x-rapidapi-host': 'instagram-scraper-stable-api.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // Body URLSearchParams string format
      body: 'username_or_url=ruangcreativemuslim',
      // Menggunakan ISR: cache akan direvalidasi setiap 10800 detik (3 jam)
      next: { revalidate: 10800 }
    };

    const response = await fetch(url, options);
    const result = await response.json();
    
    // Ambil jumlah follower dari result
    const followerCount = result.follower_count || 144000;
    
    return NextResponse.json({ followers: followerCount });
  } catch (error) {
    console.error('Error fetching Instagram followers:', error);
    return NextResponse.json({ followers: 144000 }, { status: 500 });
  }
}
