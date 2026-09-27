import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

// Cache knowledge base files
async function fetchKnowledgeBase() {
  const [hooksRes, ctaRes, styleRes, briefRes, ideasRes] = await Promise.all([
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1785890379/hooks_yidiwm.txt', { next: { revalidate: 86400 } }),
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1785833821/cta_ctv_h5kvdf.txt', { next: { revalidate: 86400 } }),
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1786012414/writing_style_p4kjqk.txt', { next: { revalidate: 86400 } }),
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1785890400/content_brief_relv9m.txt', { next: { revalidate: 86400 } }),
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1785891433/ide_konten_d48itf.txt', { next: { revalidate: 86400 } }),
  ]);
  return {
    hooks: await hooksRes.text(),
    cta: await ctaRes.text(),
    style: await styleRes.text(),
    brief: await briefRes.text(),
    ideas: await ideasRes.text(),
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { promptText, isFunneling, blueprintData, chatHistory, model } = body;

    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleApiKey: true }
    });

    if (!userRecord?.googleApiKey) {
      return NextResponse.json({ error: "Gemini API Key belum dikonfigurasi. Silakan isi di pengaturan profil." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: userRecord.googleApiKey });
    const dbKnowledge = await fetchKnowledgeBase();

    const ideaCountRule = isFunneling 
      ? "JIKA Anda memutuskan untuk membuahkan ide, Anda WAJIB MENGHASILKAN TEPAT 30 IDE KONTEN (10 TOFU, 10 MOFU, 10 BOFU). Tulis setiap field secara sangat singkat dan padat (maksimal 1 kalimat) agar JSON tidak terpotong."
      : "JIKA Anda memutuskan untuk membuahkan ide, Anda WAJIB MUTLAK MENGHASILKAN TEPAT 3 IDE (tidak boleh 2, tidak boleh 4).";

    const systemPrompt = `[MASTER PROMPT – RUANG NGONTEN AI]
[KONDISI WAKTU]
Saat ini adalah tahun ${new Date().getFullYear()}. Seluruh riset, tren, dan referensi harus disesuaikan dengan kondisi terkini.

[SOURCE OF TRUTH: MASTER BLUEPRINT]
${JSON.stringify(blueprintData, null, 2)}

[DATABASE KNOWLEDGE WAJIB BACA]
1. Content Idea Database (ATURAN UTAMA IDEA ROOM):
${dbKnowledge.ideas}
2. Content Brief Database:
${dbKnowledge.brief}
3. Hooks Database:
${dbKnowledge.hooks}
4. CTA / CTV Database:
${dbKnowledge.cta}
5. Writing Style Database:
${dbKnowledge.style}

[URUTAN BERPIKIR & ATURAN MUTLAK IDEA ROOM]
1. JANGKAR BLUEPRINT (HARGA MATI): Pahami target audiens & pain point dari Master Blueprint. Topik/Isi dari ide konten WAJIB 100% berada di koridor Niche ini. (Jika pengguna meminta 'Riset Trend' atau 'Ide Evergreen', artinya carikan trend/evergreen DI DALAM NICHE MEREKA, bukan malah bikin konten yang mengajarkan cara riset trend!).
2. EKSEKUSI ACAK DARI DATABASE IDE BERSINERGI (HARGA MATI): Buka file "Content Idea Database". Kamu WAJIB MEMILIH TEMPLATE SECARA ACAK (RANDOM) DARI SELURUH BAGIAN FILE, JANGAN HANYA MENGAMBIL DARI URUTAN TERATAS! Pilihlah format yang paling memiliki SINERGI MEMATIKAN dengan Pain Point / Frustrasi / Aspirasi audiens di Master Blueprint. DILARANG KERAS MENGARANG ATAU MEMBUAT NAMA FORMAT SENDIRI!
3. GUNAKAN TEMPLATE JUDUL: Pada bagian "nama_ide", kamu WAJIB menggunakan pola "Template" kalimat yang sudah disediakan di database ide konten. Pertahankan struktur psikologis kalimatnya, dan HANYA UBAH kata di dalam kurung siku "[ ]" agar sesuai dengan Blueprint pengguna. (Contoh: Jika template "Step by step: cara [capai hasil spesifik] dari nol", maka hasilmu HARUS persis mengikuti itu, misal: "Step by step: cara dapat 100 klien pertama dari nol").
4. FILTER GAYA BAHASA: Pastikan gaya penyampaian selaras dengan Writing Style Database. DILARANG KERAS menggunakan kata "Gue/Lu". WAJIB menggunakan "Saya/Aku" dan "Kamu/Anda". Seluruh penjelasan atau analisis WAJIB menggunakan format poin-poin (bullet points), paragraf yang sangat pendek (1-2 baris), dan bahasa awam yang simpel to-the-point. Hindari "wall of text" dan jargon teknis yang membingungkan.
5. ANTI-HALU: Ide harus membumi, realistis, dan berasal dari masalah nyata.

[TASK SPESIFIK: IDEA ROOM]
Anda adalah AI Content Strategist tingkat Elite.
Tugas Anda: Menghasilkan ide konten strategis berdasarkan input pengguna dengan TUNDUK MUTLAK pada kerangka di Content Idea Database.

[VALIDASI INPUT ACAK]
Jika teks input tidak bermakna (contoh: "asdas"): Balas HANYA dengan JSON error:
{"is_error": true, "error_message": "Waduh, sepertinya kamu lagi ngetes mesin ya? Silakan masukkan topik yang lebih jelas!"}

[OUTPUT FORMAT KETAT - WAJIB MURNI JSON]
{
  "is_error": false,
  "conversation_reply": "Tuliskan analisa santai Anda (gaya 'aku-kamu', Markdown).",
  "proposed_ideas": [
    {
      "tahap_funnel": "TOFU, MOFU, atau BOFU",
      "template_ide_digunakan": "NAMA FORMAT PERSIS SEPERTI DI DATABASE (Dilarang mengarang sendiri!)",
      "nama_ide": "Judul Ide (WAJIB MENGGUNAKAN TEMPLATE POLA KALIMAT DARI DATABASE)",
      "angle": "Sudut Pandang (Unique Angle) spesifik & unik",
      "insight_utama": "Satu temuan menarik/miskonsepsi untuk audiens",
      "masalah_audiens": "Pain point nyata yang diselesaikan",
      "dream_outcome": "Transformasi yang diharapkan audiens",
      "alternative_angles": "Sebutkan 3 variasi angle lain (dipisah koma)"
    }
  ]
}

*CATATAN PENTING MUTLAK*: 
1. ${ideaCountRule}
2. PASTIKAN key "tahap_funnel" TERISI.
`;

    const userPrompt = `
[HISTORI DISKUSI SEBELUMNYA]
${chatHistory}

[PROMPT PENGGUNA TERBARU]
${promptText}
`;

    const response = await ai.models.generateContent({
      model: model || "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error("AI returned empty response");
    }

    const aiResult = JSON.parse(response.text);
    return NextResponse.json(aiResult);

  } catch (error: any) {
    console.error("Idea Rooms Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate ideas" }, { status: 500 });
  }
}
