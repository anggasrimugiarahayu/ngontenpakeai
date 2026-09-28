import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/prisma';

async function fetchKnowledgeBase() {
  const [hooksRes, ctaRes] = await Promise.all([
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1785890379/hooks_yidiwm.txt', { next: { revalidate: 86400 } }),
    fetch('https://res.cloudinary.com/dlevfqbc/raw/upload/v1785833821/cta_ctv_h5kvdf.txt', { next: { revalidate: 86400 } })
  ]);
  return {
    hooks: await hooksRes.text(),
    cta: await ctaRes.text()
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { promptText, configContext, blueprintData, model } = body;

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

    // 100% IDENTIK DENGAN REFERENSI LAMA
    const systemPrompt = `[MASTER PROMPT – RUANG NGONTEN AI]
[KONDISI WAKTU SEKARANG]
Saat ini adalah tahun ${new Date().getFullYear()}. JIKA ADA CONTOH DI DATABASE YANG MENGGUNAKAN TAHUN MASA LALU (seperti 2024 atau 2025), WAJIB SESUAIKAN DENGAN TAHUN SAAT INI (${new Date().getFullYear()}) AGAR RELATE DENGAN KONDISI SEKARANG!

[SOURCE OF TRUTH: MASTER BLUEPRINT]
${JSON.stringify(blueprintData, null, 2)}

[DATABASE KNOWLEDGE WAJIB BACA & TERAPKAN]
PERHATIAN SANGAT KRITIKAL: Dokumen di bawah ini berisi ATURAN INTERNAL dan TEMPLATE BAKU. Kamu DILARANG KERAS mengarang struktur, format, atau rumus sendiri. Kamu WAJIB 100% MENGGUNAKAN TEMPLATE dari database ini.

1. Hooks Database:
${dbKnowledge.hooks}
2. CTA / CTV Database:
${dbKnowledge.cta}

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
* Use the pronouns "Aku" and "Kamu". Do not use "Gue" or "Lu" to maintain the polite tone of the Feynman Muslim persona.
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
${configContext}
Jika format yang diminta adalah "Carousel", pecah naskah menjadi tepat slide yang diminta. DILARANG MENGGABUNGKAN SLIDE!
Hasilkan TEPAT 3 (TIGA) variasi naskah final dengan kombinasi Hook, Framework, dan Angle yang BERBEDA-BEDA.
PASTIKAN naskah padat, *punchy*, dan tidak terlalu panjang (bertele-tele) agar response JSON utuh dan tidak menyebabkan Error/Terpotong!

[OUTPUT WAJIB MURNI JSON - FORMAT HARGA MATI]
{
  "is_error": false,
  "tahap_funnel": "TOFU/MOFU/BOFU",
  "analisis_strategi": "Awali dengan sapaan hangat yang natural (contoh: 'Hai Papa! Aku sudah analisis permintaanmu untuk ide konten.'). Setelah itu, jelaskan logikamu kenapa Framework ini dipilih. Buat simpel, to the point, dan tidak bertele-tele. Jika ada beberapa alasan, gunakan poin-poin (bullet points) yang singkat dan mudah dimengerti. Yang terpenting bahasanya tetap luwes layaknya obrolan santai dan tidak kaku seperti robot AI.",
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
    }
  ]
}
`;

    // 100% IDENTIK DENGAN REFERENSI LAMA (Tanpa Histori Chat)
    const userPrompt = `Ide Konten: ${promptText}`;

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
    
    // JSON Truncate Recovery Logic (Identik dari Referensi Lama)
    let aiText = response.text;
    let parsedData;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      const cleanJsonStr = jsonMatch ? jsonMatch[0] : aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJsonStr);
    } catch(truncateErr) {
      console.warn("Mencoba memperbaiki JSON yang terpotong...");
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      const cleanJsonStr = jsonMatch ? jsonMatch[0] : aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const partialClean = cleanJsonStr.replace(/,\s*([\]}])/g, '$1'); 
      try {
        parsedData = JSON.parse(partialClean + (cleanJsonStr.endsWith('}') ? '' : ']}'));
      } catch (fallbackErr) {
        throw new Error("Failed to parse AI output. Try again with shorter request.");
      }
    }

    if (!parsedData.is_error) {
      // Normalisasi & Sanitasi (Identik dari Referensi Lama)
      if (!parsedData.variations && parsedData.script_sections) {
        parsedData.variations = [parsedData];
      } else if (!parsedData.variations || parsedData.variations.length === 0) {
        parsedData.variations = [{
          judul: promptText,
          framework_digunakan: "Auto-Selected",
          hook_digunakan: "Custom",
          cta_digunakan: "Custom",
          script_sections: [{ label: "Naskah Konten", content: aiText }],
          caption: ""
        }];
      }

      parsedData.variations.forEach((ver: any) => {
        if (!ver.framework_digunakan) ver.framework_digunakan = "Storytelling";
        if (!ver.hook_digunakan) ver.hook_digunakan = "Curiosity Hook";
        if (!ver.cta_digunakan) ver.cta_digunakan = "Engagement CTA";

        if (ver.script_sections) {
          ver.script_sections.forEach((sec: any) => {
            if (sec.content) sec.content = sec.content.replace(/\s*·\s*/g, ', ');
          });
        }
        if (ver.caption) {
          ver.caption = ver.caption.replace(/\s*·\s*/g, ', ');
        }
      });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Script Builder Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate script" }, { status: 500 });
  }
}
