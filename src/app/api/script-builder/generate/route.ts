import { promises as fs } from 'fs';
import path from 'path';
import { getApiKey } from "@/lib/get-api-key";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { verifyFeatureAccess, incrementFeatureUsage } from "@/lib/auth-checks";
import prisma from '@/lib/prisma';
import { generateStructuredAiContent, isGroqModel } from "@/lib/ai/geminiClient";
import { getDefaultAiModel } from "@/lib/get-ai-model";

async function fetchKnowledgeBase() {
  const kbDir = path.join(process.cwd(), 'src', 'data', 'knowledge_database');
  const [hooksRes, ctaRes] = await Promise.all([
    fs.readFile(path.join(kbDir, 'hooks.txt'), 'utf-8'),
    fs.readFile(path.join(kbDir, 'cta_ctv.txt'), 'utf-8')
  ]);
  return {
    hooks: hooksRes,
    cta: ctaRes
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [accessCheck, body, userRecord, dbKnowledge] = await Promise.all([
      verifyFeatureAccess(session.user.id, "Script Builder", session.user.email),
      req.json(),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { googleApiKey: true, groqApiKey: true }
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

    const { promptText, configContext, blueprintData, model, format, slides, duration, tone } = body;

    // Safety fallback: If blueprintData is not provided in body, load the user's latest blueprint from DB
    let activeBlueprint = blueprintData;
    if (!activeBlueprint) {
      const dbBlueprint = await prisma.masterBlueprint.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" }
      });
      activeBlueprint = dbBlueprint?.aiResult || null;
    }

    // Determine target format, slides, duration, and tone
    let targetFormat = format || (configContext?.includes("Carousel") ? "Carousel" : configContext?.includes("Reels") ? "Reels" : "Carousel");
    let targetSlides = slides || 5;
    let targetDuration = duration || 60;
    
    if (configContext) {
      const slideMatch = configContext.match(/(\d+)\s*Slide/i);
      if (slideMatch) targetSlides = parseInt(slideMatch[1], 10);
      const durMatch = configContext.match(/(\d+)s/i);
      if (durMatch) targetDuration = parseInt(durMatch[1], 10);
    }

    let targetTone = tone || "";
    if (!targetTone && configContext) {
      const toneMatch = configContext.match(/Tone:\s*([^\n\r]+)/i);
      if (toneMatch) targetTone = toneMatch[1].trim();
    }

    // Dynamic Tone Engine
    let toneInstruction = "";
    const lowerTone = targetTone.toLowerCase();
    if (lowerTone.includes("blak-blakan") || lowerTone.includes("kritis")) {
      toneInstruction = `GAYA BAHASA: BLAK-BLAKAN, TEGAS & MENUSUK (BRUTAL HONESTY).
- Nada bicara seorang mentor blak-blakan yang anti-sugarcoating dan benci basa-basi.
- Bongkar realita pahit, kebiasaan keliru, dan alasan kenapa audiens masih stuck/gagal.
- Gunakan diksi menampar kesadaran ("Sadar nggak?", "Stop bohongin diri sendiri", "Ini alasan kenapa kamu boncos", "Jangan heran kalau...").
- Berikan solusi nyata tanpa retorika manis, langsung pada inti tindakan konkret.`;
    } else if (lowerTone.includes("storytelling")) {
      toneInstruction = `GAYA BAHASA: STORYTELLING & PERSONAL NARRATIVE (INTIM & MENYENTUH).
- Buka langsung di tengah momen kejadian (in media res) dengan kerentanan personal ("Waktu awal coba...", "Tabunganku pernah nol besar gara-gara...").
- Bangun tensi: ceritakan rasa frustrasi/kesalahan masa lalu yang sangat manusiawi.
- Hadirkan titik balik (the epiphany / turning point) saat menemukan sistem/metode baru.
- Tutup dengan transformasi nyata yang membuat pembaca merasa: "Kalau dia bisa, aku juga pasti bisa."`;
    } else if (lowerTone.includes("santai")) {
      toneInstruction = `GAYA BAHASA: SANTAI, LUWES & NONGKRONG (WARKOP VIBES).
- Gaya bicara seperti teman akrab lagi ngobrol santai di coffee shop.
- Gunakan partikel dan transisi kasual khas percakapan natural ("Nah...", "Terus...", "Padahal ya...", "Kebayang nggak?", "Gini lho...").
- Hindari bahasa kaku atau ilmiah, buat mengalir ringan dan sangat mudah dipahami bahkan oleh orang awam.`;
    } else if (lowerTone.includes("edukatif")) {
      toneInstruction = `GAYA BAHASA: EDUKATIF PRAKTIS & LOGICAL REASONING.
- Berbasis logika sebab-akibat yang kuat dan analogi dunia nyata yang langsung "klik" di kepala.
- Sederhanakan konsep rumit menjadi 1 kalimat analogi yang gamblang.
- Paparkan langkah-langkah implementasi 1-2-3 yang sistematis, runtut, dan langsung bisa dieksekusi hari ini juga.`;
    } else if (lowerTone.includes("humor")) {
      toneInstruction = `GAYA BAHASA: HUMOR, WITTY & RELATABLE SATIRE.
- Selipkan sindiran jenaka dan observasi lucu tentang kelakuan absurd sehari-hari audiens.
- Gunakan ironi dan analogi kocak yang bikin audiens tertawa sekaligus meringis karena merasa tersindir telak ("Siapa yang relate?").
- Pembahasan tetap berbobot dan berisi solusi cerdas di balik kemasan humor yang segar.`;
    } else if (lowerTone.includes("inspiratif")) {
      toneInstruction = `GAYA BAHASA: INSPIRATIF, EMPOWERING & MEMBUKA PIKIRAN.
- Ubah sudut pandang audiens (reframing mindset) dari rasa tidak berdaya menjadi penuh harapan dan keyakinan.
- Gunakan nada bicara hangat, berempati tinggi, dan memvalidasi perjuangan mereka sebelum memberikan wawasan pencerahan.`;
    } else if (lowerTone.includes("motivasi")) {
      toneInstruction = `GAYA BAHASA: HIGH ENERGY & URGENT MOTIVASI.
- Bakar semangat juang audiens untuk bergerak SEKARANG JUGA (sense of urgency tinggi).
- Pukul telak alasan-alasan klise ("nanti aja", "nggak ada waktu") dengan bantahan logis dan tegas. Fokus pada disiplin dan aksi nyata.`;
    } else if (lowerTone.includes("profesional")) {
      toneInstruction = `GAYA BAHASA: PROFESIONAL, OTORITATIF & KREDIBEL.
- Nada bicara praktisi/konsultan senior yang matang dan berpengalaman.
- Lugas, berwibawa, berorientasi pada hasil (ROI/efisiensi), menggunakan struktur pemikiran strategis tanpa kata-kata berlebihan.`;
    } else {
      toneInstruction = `GAYA BAHASA: NATURAL CONVERSATIONAL, PUNCHY & HUMAN.
- Lugas, to-the-point, bersahabat, bertenaga, dan sangat mengalir enak dibaca.
- Seimbangkan antara empati yang hangat dan dorongan aksi yang tegas.`;
    }

    // Dynamic Format Instruction
    let formatInstruction = "";
    if (targetFormat === "Reels" || targetFormat === "TikTok") {
      formatInstruction = `[PANDUAN STRUKTUR FORMAT: REELS / SHORT VIDEO (${targetDuration} DETIK)]
Setiap variasi naskah WAJIB dipecah menjadi segmen waktu video yang dinamis, lengkap dengan arahan aksi visual dan teks di layar:

WAJIB FORMAT script_sections untuk Reels:
- Segmen 1 (00:00 - 00:03) [Label: "00:00 - 00:03 | The Hook"]
  Content WAJIB berisi:
  Naskah Ucap: [1 kalimat pembuka tajam yang memancing rasa penasaran / menghentikan scroll]
  [Visual Action]: [Arahan kamera / ekspresi / gestur tubuh kreator yang dinamis]
  [On-Screen Text]: [Teks singkat 3-5 kata yang menempel di layar untuk penonton mode bisu]

- Segmen 2 (00:03 - ${Math.round(targetDuration * 0.35)}s) [Label: "00:03 - ${Math.round(targetDuration * 0.35)}s | The Conflict & Reality"]
  Content WAJIB berisi:
  Naskah Ucap: [Bahas masalah/keresahan utama dengan ritme cepat dan detail sensorik konkret]
  [Visual Action]: [Arahan transisi / b-roll / ekspresi kreator]

- Segmen 3 (${Math.round(targetDuration * 0.35)}s - ${Math.round(targetDuration * 0.85)}s) [Label: "${Math.round(targetDuration * 0.35)}s - ${Math.round(targetDuration * 0.85)}s | The Core Solution"]
  Content WAJIB berisi:
  Naskah Ucap: [Daging materi: langkah konkret 1-2-3 / hacks sistematis yang padat tanpa basa-basi]
  [Visual Action]: [Arahan peragaan / demonstrasi visual di layar]

- Segmen 4 (${Math.round(targetDuration * 0.85)}s - ${targetDuration}s) [Label: "${Math.round(targetDuration * 0.85)}s - ${targetDuration}s | The Punchline CTA"]
  Content WAJIB berisi:
  Naskah Ucap: [Call to action verbal yang mengalir natural mengajak audiens berinteraksi]
  [On-Screen Text]: [Teks CTA tebal di layar]`;
    } else {
      formatInstruction = `[PANDUAN STRUKTUR FORMAT: CAROUSEL (${targetSlides} SLIDE)]
Setiap variasi naskah WAJIB dipecah menjadi TEPAT ${targetSlides} Slide:

WAJIB FORMAT script_sections untuk Carousel:
- Slide 1 [Label: "Slide 1 | The Hook"]
  Content: 1-2 baris kalimat pembuka ultra-mematikan (maksimal 15 kata). Ciptakan 'Pattern Interrupt' yang menghentikan jempol pembaca seketika. DILARANG bertele-tele!
- Slide 2 [Label: "Slide 2 | Realita & Agitasi"]
  Content: Buka realita nyata dengan detail sensorik konkret (sebutkan situasi sehari-hari, nominal, atau kebiasaan nyata audiens). Bikin audiens merasa "Ini gue banget!".
${Array.from({ length: Math.max(1, targetSlides - 3) }, (_, i) => {
  const slideNum = i + 3;
  return `- Slide ${slideNum} [Label: "Slide ${slideNum} | Daging & Sistem Solusi"]
  Content: Poin daging materi konkret. Berikan hacks sistematis, cara pandang baru yang mematahkan mitos, atau panduan langkah-demi-langkah praktis.`;
}).join('\n')}
- Slide ${targetSlides} [Label: "Slide ${targetSlides} | Call to Action"]
  Content: CTA yang sangat relevan dan beralasan kuat (contoh: ajak Save sekarang sebelum gajian, atau Share ke teman yang gajinya numpang lewat).`;
    }

    const defaultModel = await getDefaultAiModel("openai/gpt-oss-120b");
    const activeModel = model || defaultModel;
    const isGroq = isGroqModel(activeModel);

    const hooksKnowledge = isGroq
      ? dbKnowledge.hooks.split('\n').slice(0, 100).join('\n')
      : dbKnowledge.hooks;

    const ctaKnowledge = isGroq
      ? dbKnowledge.cta.split('\n').slice(0, 60).join('\n')
      : dbKnowledge.cta;

    const systemPrompt = `[MASTER PROMPT – ELITE VIRAL SCRIPT ARCHITECT]
Saat ini adalah tahun ${new Date().getFullYear()}. Anda adalah Direktur Copywriting & Storyteller Viral Kelas Dunia.
Tugas Anda adalah memproduksi 3 (TIGA) variasi naskah konten berdaya ledak tinggi (High-Converting & Highly Shareable) yang siap viral ketika diposting.

[SOURCE OF TRUTH: MASTER BLUEPRINT PENGGUNA]
${JSON.stringify(activeBlueprint, null, 2)}
Gunakan data target audiens, pain point, bahasa percakapan, dan positioning di atas sebagai nyawa naskah Anda!

[DATABASE KNOWLEDGE UNTUK INSPIRASI (HOOK & CTA)]
1. Inspirasi Hook:
${hooksKnowledge}
2. Inspirasi CTA / CTV:
${ctaKnowledge}

# ==========================================================
# ATURAN EMAS COPYWRITING VIRAL (ANTI-ROBOT & ANTI-KLISE)
# ==========================================================

1. BLACKLIST TOTAL KLISE MEDSOS (HARGA MATI):
   - DILARANG KERAS menggunakan frasa pembuka usang seperti:
     * "Unpopular opinion:"
     * "Tahukah kamu?"
     * "Di era digital saat ini..."
     * "Kenapa? Karena..."
     * "Nggak seefektif yang kamu kira"
     * "Penting untuk dipahami bahwa..."
     * "Pada akhirnya..."
     * "Semoga bermanfaat"
   - Sebagai gantinya, buka dengan PERNYATAAN POLARISASI yang berani, PENGAKUAN KEGAGALAN NYATA, ATAU KONFRONTASI REALITA yang langsung menusuk rasa ingin tahu audiens dalam 0.5 detik pertama!

2. ATURAN DETAIL MIKRO SENSORIK (ANTI-ABSTRAK):
   - DILARANG menggunakan kata-kata abstrak umum seperti "beli ini itu", "banyak belanja", "kebutuhan harian", "masalah hidup", "keuangan kacau".
   - WAJIB gunakan detail spesifik yang bisa divisualisasikan panca indra:
     * BUKAN: "Sering boros belanja" -> TAPI: "Kopi susu 25 ribu tiap siang, checkout keranjang oranye jam 12 malem, sama biaya admin transfer 2.500".
     * BUKAN: "Gaji cepat habis" -> TAPI: "Baru tanggal 5 notif m-banking udah sisa 87 ribu".
     * BUKAN: "Nabung di rekening lain" -> TAPI: "Bikin Rekening Mati (bank tanpa kartu ATM & jangan install m-bankingnya di HP)".

3. KETENTUAN GAYA BAHASA:
${toneInstruction}

4. KETENTUAN FORMAT KONTEN:
${formatInstruction}

5. RUMUS CAPTION (DWELL TIME BOOSTER & SEO):
   Caption BUKAN hanya 1 baris kalimat malas. Rancang caption yang kaya dengan format:
   - Baris 1: Hook caption pembuka (pemancing klik '...selengkapnya').
   - Baris 2-4: Micro-story atau elaborasi ringkas yang memberi insight ekstra.
   - Baris 5: Call to Conversation (pertanyaan memancing debat / curhat di kolom komentar).
   - Baris 6: 3-5 hashtag tertarget yang relevan dengan niche (BUKAN hashtag umum seperti #viral #fyp).

6. TIGA VARIASI NASKAH DENGAN FRAMEWORK BERBEDA:
   Hasilkan TEPAT 3 variasi naskah dengan kombinasi angle dan framework yang BERBEDA-BEDA:
   - Variasi 1: Framework PAS (Problem - Agitate - Solution) atau THE BRIDGE (Before - After - Bridge).
   - Variasi 2: Framework CONTRARIAN (Bongkar Mitos - Fakta Keras - Solusi Baru) atau OPEN LOOP.
   - Variasi 3: Framework STORYTELLING (Personal Failure - Epiphany - New Habit).

[OUTPUT WAJIB MURNI JSON - FORMAT HARGA MATI]
{
  "is_error": false,
  "tahap_funnel": "TOFU/MOFU/BOFU",
  "analisis_strategi": "Analisis singkat & hangat (2-3 kalimat) mengenai strategi kenapa 3 variasi ini dirancang dengan sudut pandang tersebut.",
  "variations": [
    {
      "judul": "Judul/Angle Singkat Konten",
      "framework_digunakan": "Nama Framework (contoh: 'Problem - Agitate - Solution')",
      "hook_digunakan": "Nama Tipe Hook yang dipakai",
      "cta_digunakan": "Tipe CTA yang dipakai",
      "script_sections": [
        {
          "label": "Slide/Detik [Nomor] - [Tahap]",
          "content": "Isi naskah aktual sesuai instruksi format..."
        }
      ],
      "caption": "Teks caption lengkap berbobot dengan hashtag..."
    }
  ]
}
`;

    const userPrompt = `[PERMINTAAN KONTEN]
Topik/Ide Konten: ${promptText}
Format: ${targetFormat === 'Reels' || targetFormat === 'TikTok' ? `Reels / Short Video (${targetDuration} Detik)` : `Carousel (${targetSlides} Slide)`}${targetTone ? `\nGaya Bahasa (Tone): ${targetTone}` : ''}

Tolong racik 3 (tiga) variasi naskah konten viral berbobot tinggi sesuai aturan emas di atas sekarang.`;

    let parsedData = await generateStructuredAiContent({
      apiKey: userRecord?.googleApiKey || undefined,
      groqApiKey: userRecord?.groqApiKey || undefined,
      model,
      userPrompt,
      systemPrompt,
      fallbackModelDefault: "gemini-3.5-flash-lite",
    });

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
          script_sections: [{ label: "Naskah Konten", content: promptText }],
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

    if (accessCheck.featureId) {
      await incrementFeatureUsage(session.user.id, accessCheck.featureId);
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Script Builder Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate script" }, { status: 500 });
  }
}
