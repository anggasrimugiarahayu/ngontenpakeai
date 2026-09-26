import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.json();

    // Get User's API Key
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleApiKey: true }
    });

    const apiKey = dbUser?.googleApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak ditemukan. Silakan tambahkan di Pengaturan." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
[ROLE]
Anda adalah Partner Diskusi Bisnis dan Content Strategist yang sangat membumi, logis, dan praktis. Posisi Anda SEJAJAR dengan audiens (seperti teman ngopi yang pintar), BUKAN sebagai guru atau dewa yang menggurui.

[ATURAN NADA & GAYA BAHASA (ANTI-OVERCLAIM & ANTI-CRINGE) - WAJIB PATUHI MUTLAK!]
1. DILARANG KERAS OVERCLAIM: Jangan pernah menggunakan metafora, julukan, atau kiasan yang dramatis/cringe seperti "Arsitek Bisnis", "Dokter Dompet", "Ninja", "Penyelamat", "Dewa", dll.
2. BAHASA SEJAJAR: Gunakan bahasa yang santai, to-the-point, dan berempati. Tulis seolah-olah Anda sedang menjelaskan ke teman sendiri. Jangan menggurui.
3. PRAKTIS & NYATA: Fokus pada apa yang BENAR-BENAR dilakukan oleh kreator dan hasil NYATA yang didapat audiens, bukan jargon korporat atau omong kosong motivasi.
4. KEJELASAN MUTLAK (CLEAR & MUDAH DIPAHAMI): Semua bahasa yang dihasilkan harus SANGAT JELAS, padat, tidak menggantung, dan langsung bisa dimengerti. Jika bisa dijelaskan dengan 5 kata simpel, jangan gunakan 10 kata rumit.
5. ANTI-HALU & DILARANG MENDONGENG: Jangan pernah merangkai cerita fiksi yang dramatis. 
6. ATURAN KATA GANTI MUTLAK: DILARANG KERAS menggunakan kata "Gue", "Gw", "Lo", "Lu", "Bro", atau "Sis" di seluruh teks. WAJIB gunakan "Saya", "Aku", "Kamu", atau "Anda" agar konsisten dan sejajar.

[TASK]
Buat "Master Blueprint Personal Branding" yang komprehensif berdasarkan data input. Output HARUS murni JSON tanpa markdown atau teks lainnya. Ikuti kerangka instruksi yang diminta.
`;

    const userPrompt = `
Nama Kreator: ${formData.nama || 'Kreator'}

[4 PILAR IKIGAI KREATOR]
1. SUKA (Passion): ${formData.ikigai_suka}
2. BISA (Keahlian): ${formData.ikigai_kuasa}
3. DIBUTUHKAN (Masalah/Demand): ${formData.ikigai_dibutuhkan}
4. DIBAYAR (Monetisasi): ${formData.ikigai_dibayar}

[PROFIL AUDIENS: DEMOGRAFIS]
Nama Persona: ${formData.demo_nama_persona}
Usia: ${formData.demo_usia} | Gender: ${formData.demo_gender} | Lokasi: ${formData.demo_lokasi}
Pekerjaan: ${formData.demo_pekerjaan} | Penghasilan: ${formData.demo_penghasilan}
Pendidikan: ${formData.demo_pendidikan} | Status: ${formData.demo_status_personal}
Platform Utama: ${formData.demo_platform} | Jam Aktif: ${formData.demo_jam_aktif}

[PROFIL AUDIENS: PSIKOGRAFIS]
Pain Point: ${formData.psiko_pain_point}
Tujuan: ${formData.psiko_tujuan} | Ketakutan: ${formData.psiko_ketakutan}
Aspirasi: ${formData.psiko_aspirasi} | Frustrasi: ${formData.psiko_frustrasi}
Pertanyaan di Kepala: ${formData.psiko_pertanyaan}
Konsumsi Media: ${formData.psiko_konsumsi} | Sosok Diikuti: ${formData.psiko_sosok}
Bahasa: ${formData.psiko_bahasa} | Mau Bayar Untuk: ${formData.psiko_mau_bayar}

Gaya Komunikasi: ${formData.gaya_komunikasi}
Platform Dipilih: ${formData.platform}

[INSTRUKSI]: Evaluasi data di atas. Hasilkan Master Blueprint yang presisi, mendalam, dan membongkar celah pasar.
PENTING: Output wajib JSON dengan struktur ini:
{
  "positioning_identity": "string",
  "niche_statement": "string",
  "core_message": "string",
  "mission_statement": "string",
  "persona_narrative": "string",
  "pain_points": ["string"],
  "dream_outcome": ["string"],
  "content_pillars": ["string"],
  "content_gap": "string",
  "monetization_strategy": ["string"],
  "platform_strategy": ["string"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const aiText = response.text;
    if (!aiText) throw new Error("Kosong dari AI");
    const result = JSON.parse(aiText);

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error("Error generate blueprint:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
