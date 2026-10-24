import { promises as fs } from 'fs';
import path from 'path';
import { getDefaultAiModel } from "@/lib/get-ai-model";
import { getApiKey } from "@/lib/get-api-key";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { verifyFeatureAccess, incrementFeatureUsage } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

// Cache knowledge base files
async function fetchKnowledgeBase() {
  const kbDir = path.join(process.cwd(), 'public', 'knowledge_database');
  const [hooksRes, ctaRes, styleRes, briefRes, ideasRes] = await Promise.all([
    fs.readFile(path.join(kbDir, 'hooks.txt'), 'utf-8'),
    fs.readFile(path.join(kbDir, 'cta_ctv.txt'), 'utf-8'),
    fs.readFile(path.join(kbDir, 'writing_style.txt'), 'utf-8'),
    fs.readFile(path.join(kbDir, 'content_brief.txt'), 'utf-8'),
    fs.readFile(path.join(kbDir, 'ide_konten.txt'), 'utf-8'),
  ]);
  return {
    hooks: hooksRes,
    cta: ctaRes,
    style: styleRes,
    brief: briefRes,
    ideas: ideasRes,
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [accessCheck, body, userRecord, dbKnowledge] = await Promise.all([
      verifyFeatureAccess(session.user.id, "Idea Rooms", session.user.email),
      req.json(),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { googleApiKey: true }
      }),
      fetchKnowledgeBase()
    ]);

    if (!accessCheck.authorized) {
      return NextResponse.json({
        error: accessCheck.code === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : accessCheck.reason,
        code: accessCheck.code,
        message: accessCheck.reason
      }, { status: 403 });
    }

    const { promptText, isFunneling, blueprintData, chatHistory, model } = body;

    const apiKey = await getApiKey(userRecord?.googleApiKey);

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key tidak ditemukan baik dari pengguna maupun sistem." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    // TRANSLATION LAYER
    let actualPrompt = promptText;
    
    if (promptText === 'Ide Konten Funneling') {
      actualPrompt = "Tolong buatkan strategi Ide Konten Funneling secara komprehensif berdasarkan analisa mendalam KESELURUHAN Master Blueprint saya. Berikan total 30 ide konten yang dibagi menjadi 10 TOFU, 10 MOFU, dan 10 BOFU. INGAT: Topik/Pembahasan KESELURUHAN ide WAJIB 100% diambil dari Niche Blueprint saya.";
    } else if (promptText === 'Riset Topik & Trend') {
      actualPrompt = "Gunakan akses pencarian internet (Search Grounding) untuk meriset topik, keresahan, dan tren terbaru saat ini (Tahun 2026) yang sedang viral/ramai dibicarakan KHUSUS di dalam Niche/Topik Master Blueprint saya. Setelah itu, buatkan ide konten berdasarkan tren tersebut. INGAT HARGA MATI: Topik idenya adalah Niche saya, BUKAN membuat konten edukasi tentang 'bagaimana cara meriset tren'!";
    } else if (promptText === 'Ide Evergreen') {
      actualPrompt = "Buatkan ide konten yang bersifat Evergreen (solusi untuk masalah mendasar/fundamental yang selalu dicari orang kapanpun, tidak lekang oleh waktu) KHUSUS untuk Niche/Topik Master Blueprint saya. INGAT HARGA MATI: Topik idenya adalah Niche saya, BUKAN membuat konten edukasi tentang 'apa itu konten evergreen'!";
    } else if (promptText === 'Peluang Konten Viral') {
      actualPrompt = "Berikan ide konten dengan potensi viral tinggi (bisa berupa kontroversi ringan, opini *unpopular/contrarian*, atau keresahan massal yang sangat *relatable*) KHUSUS untuk Niche/Topik Master Blueprint saya.";
    } else if (promptText === 'Eksplor Angle') {
      actualPrompt = "Pilih satu masalah/topik utama dari Master Blueprint saya, lalu berikan ide konten dengan sudut pandang (*angle*) yang sangat *out-of-the-box*, *contrarian*, atau tidak biasa dipikirkan oleh kompetitor di niche saya.";
    }

    const userPrompt = `
[HISTORI DISKUSI SEBELUMNYA]
${chatHistory}

[PROMPT PENGGUNA TERBARU]
${actualPrompt}
`;

    const response = await ai.models.generateContent({
      model: model || await getDefaultAiModel("gemini-2.5-flash"),
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

    if (accessCheck.featureId) {
      await incrementFeatureUsage(session.user.id, accessCheck.featureId);
    }

    return NextResponse.json(aiResult);

  } catch (error: any) {
    console.error("Idea Rooms Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate ideas" }, { status: 500 });
  }
}
