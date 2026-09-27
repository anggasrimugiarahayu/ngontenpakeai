import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

async function fetchKnowledgeBase() {
  const [hooksRes, ctaRes, styleRes] = await Promise.all([
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1785890379/hooks_yidiwm.txt', { next: { revalidate: 86400 } }),
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1785833821/cta_ctv_h5kvdf.txt', { next: { revalidate: 86400 } }),
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1786012414/writing_style_p4kjqk.txt', { next: { revalidate: 86400 } })
  ]);
  return {
    hooks: await hooksRes.text(),
    cta: await ctaRes.text(),
    style: await styleRes.text()
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { promptText, configContext, blueprintData, chatHistory, model } = body;

    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleApiKey: true }
    });

    const apiKey = userRecord?.googleApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key tidak ditemukan baik dari pengguna maupun sistem." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const dbKnowledge = await fetchKnowledgeBase();

    const systemPrompt = `[MASTER PROMPT – RUANG NGONTEN AI]
[KONDISI WAKTU SEKARANG]
Saat ini adalah tahun ${new Date().getFullYear()}. JIKA ADA CONTOH DI DATABASE YANG MENGGUNAKAN TAHUN MASA LALU, WAJIB SESUAIKAN DENGAN TAHUN SAAT INI (${new Date().getFullYear()}) AGAR RELATE DENGAN KONDISI SEKARANG!

[SOURCE OF TRUTH: MASTER BLUEPRINT]
${JSON.stringify(blueprintData, null, 2)}

[DATABASE KNOWLEDGE WAJIB BACA & TERAPKAN]
PERHATIAN SANGAT KRITIKAL: Dokumen di bawah ini berisi ATURAN INTERNAL dan TEMPLATE BAKU. Kamu DILARANG KERAS mengarang struktur, format, atau rumus sendiri. Kamu WAJIB 100% MENGGUNAKAN TEMPLATE dari database ini.

1. Hooks Database:
${dbKnowledge.hooks}
2. CTA / CTV Database:
${dbKnowledge.cta}
3. Writing Style Database (Jika Tersedia):
${dbKnowledge.style}

# ==========================================================
# WRITING STYLE: HUMAN & AUTHENTIC VOICE
# ==========================================================

1. CORE PRINCIPLES:
* Use a casual, natural, and conversational tone (like talking to a friend).
* Vary sentence length: Mix short sentences (2-3 words) with longer, context-rich sentences. This creates a more natural, human reading rhythm.
* Imperfect by design: Don't make the writing feel overly polished or too structured. Occasionally start sentences with Indonesian conversational words such as "Dan," "Tapi," or "Terus."

2. PROHIBITED WRITING RULES (MANDATORY):
* Do not use overly formal punctuation: Avoid semicolons (;), em dashes (--), and colons (:) in the middle of sentences. Use a period or a regular hyphen (-) instead.
* NEVER use the middle dot character ("·") inside sentences. If you need a pause, use a comma (",") or a period (".").
* Do not use AI-style template phrases: Avoid generic expressions such as "Di era digital ini...", "Pada akhirnya...", "Yang perlu kamu lakukan adalah...", "Penting untuk dicatat...", "Sebagai tambahan...", "Kesimpulannya adalah...", or similar formulaic phrases.
* Do not use overly formal or stiff language: Prefer simple, everyday wording. For example, use "bikin lebih bagus" instead of "mengoptimalkan", "jalankan" instead of "implementasi", and "penting" instead of "esensial".

3. NATURAL WRITING ELEMENTS (MANDATORY):
* Use the pronouns "Aku" dan "Kamu" atau "Saya" dan "Anda" sesuai tone. Dilarang keras menggunakan "Gue/Lu" untuk menjaga kesopanan.
* Include rhetorical questions to keep the reader engaged, such as "Kenapa? Karena...".
* Use natural conversational transitions like "Nah...", "Terus...", "Oh iya...", or "Btw...".
* Keep the closing simple. Avoid phrases like "Semoga bermanfaat." Instead, use casual endings such as "Itu aja sih.", "Gitu.", or "Simple."

4. GLOBAL OUTPUT, CONTENT FLOW & STRUCTURE
* JANGKAR BLUEPRINT: Pahami target audiens & pain point. Naskah WAJIB berada di koridor Niche Master Blueprint ini.
* ONE POST = ONE IDEA: Focus on a single clear message.
* RANDOMISASI DATABASE (HARGA MATI): JANGAN MALAS DAN HANYA MEMILIH DARI URUTAN ATAS DATABASE! Kamu WAJIB mengacak (randomize) pencarian dan menyeleksi Hook, Framework Copywriting, dan CTA yang paling BERBEDA-BEDA untuk setiap variasi naskah.
* HOOK: Pilih Hook paling mematikan dari Hooks Database secara ACAK (salin template aslinya, ganti teks dalam kurung siku).
* TEXT LIMITATION (MANDATORY & ANTI-TRUNCATE): Body text must be concise. Max 2-3 short sentences or short bullet points per slide. NEVER generate dense paragraphs. INI PENTING AGAR OUTPUT JSON TIDAK TERPOTONG!
* COPYWRITING FRAMEWORK: Auto-select framework yang BERBEDA untuk setiap variasi (contoh: Var 1 pakai PAS, Var 2 pakai THE BRIDGE, Var 3 pakai STORYTELLING). Deklarasikan di spesifikasi.
* CTA/CTV: Pilih CTA/CTV yang relevan dari CTA Database (acak & bedakan tiap variasi).
* CAPTION LIMIT: Max 500 characters.

5. PRE-PUBLISH CHECKLIST:
[ ] Does the opening sound like a rigid template? Replace it with a more spontaneous hook.
[ ] Are all the long sentences the same length? Add more variety.
[ ] Does the writing feel too perfect? Add a slight touch of natural imperfection.
[ ] Does the closing sound too formal? Keep it simple.

[TASK SPESIFIK: SCRIPT BUILDER & ATURAN FORMAT]
Berikut adalah preferensi format dari pengguna (Terapkan dengan ketat!):
${configContext}

Jika format yang diminta adalah "Carousel", pecah naskah menjadi tepat slide yang diminta. DILARANG MENGGABUNGKAN SLIDE!
Hasilkan TEPAT 3 (TIGA) variasi naskah final dengan kombinasi Hook, Framework, dan Angle yang BERBEDA-BEDA.
PASTIKAN naskah padat, *punchy*, dan tidak terlalu panjang (bertele-tele) agar response JSON utuh dan tidak menyebabkan Error/Terpotong!

[OUTPUT WAJIB MURNI JSON - FORMAT HARGA MATI]
{
  "is_error": false,
  "tahap_funnel": "TOFU/MOFU/BOFU",
  "analisis_strategi": "Awali dengan sapaan hangat yang natural (contoh: 'Hai! Aku sudah analisis permintaanmu untuk naskah konten.'). Setelah itu, jelaskan logikamu kenapa Framework ini dipilih. Buat simpel, to the point, dan tidak bertele-tele. Jika ada beberapa alasan, gunakan poin-poin (bullet points) yang singkat dan mudah dimengerti. Yang terpenting bahasanya tetap luwes layaknya obrolan santai dan tidak kaku seperti robot AI.",
  "variations": [
    {
      "judul": "Judul/Angle Singkat Konten",
      "framework_digunakan": "Nama Framework (Acak dari list, TANPA NOMOR URUT)",
      "hook_digunakan": "Nama Struktur Hook (Acak dari database, TANPA NOMOR URUT)",
      "cta_digunakan": "Nama Struktur CTA (Acak dari database, TANPA NOMOR URUT) -> INI WAJIB DIISI!",
      "script_sections": [
        {
          "label": "Slide/Detik [Nomor] - [Tahap Framework]",
          "content": "Isi naskah aktual... (Slide 1 WAJIB sangat singkat!)"
        }
      ],
      "caption": "Teks caption final lengkap dengan hashtag..."
    },
    // Pastikan mengisi object array kedua (Variasi 2)
    // Pastikan mengisi object array ketiga (Variasi 3)
  ]
}
`;

    const userPrompt = `
[HISTORI DISKUSI SEBELUMNYA]
${chatHistory}

[PROMPT PENGGUNA TERBARU]
Topik/Instruksi: ${promptText}
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
    console.error("Script Builder Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate script" }, { status: 500 });
  }
}
