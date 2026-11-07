import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { verifyFeatureAccess, incrementFeatureUsage } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { generateStructuredAiContent } from "@/lib/ai/geminiClient";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [accessCheck, body, userRecord] = await Promise.all([
      verifyFeatureAccess(session.user.id, "Ebook Prompt Builder", session.user.email),
      req.json(),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { googleApiKey: true, groqApiKey: true }
      })
    ]);

    if (!accessCheck.authorized) {
      return NextResponse.json({
        error: accessCheck.code === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : accessCheck.reason,
        code: accessCheck.code,
        message: accessCheck.reason
      }, { status: 403 });
    }

    const { 
      prompt,
      history = [],
      blueprint = {},
      model,
      apiKey,
      groqApiKey
    } = body;
    
    // 1. Safety fallback: If blueprint is not provided or empty in body, load user's latest blueprint from DB
    let activeBlueprint = blueprint;
    if (!activeBlueprint || (typeof activeBlueprint === "object" && Object.keys(activeBlueprint).length === 0)) {
      const dbBlueprint = await prisma.masterBlueprint.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" }
      });
      activeBlueprint = dbBlueprint?.aiResult || null;
    }

    const bp = (activeBlueprint && typeof activeBlueprint === "object") ? activeBlueprint : {};

    // 2. Synthesize real persona & positioning details for Best-Seller Prompting
    const authorContext = bp.positioning_identity || bp.niche_statement || bp.value_statement || (bp.knowledge_skills ? (Array.isArray(bp.knowledge_skills) ? bp.knowledge_skills.join(", ") : bp.knowledge_skills) : "") || "Praktisi & Kreator Ahli di bidang ini";
    const targetAudience = (Array.isArray(bp.target_audiences) ? bp.target_audiences.join(', ') : bp.target_audiences) || (Array.isArray(bp.pain_points) ? bp.pain_points.join(', ') : bp.pain_points) || "Pemilik bisnis, UMKM, dan profesional yang ingin bertumbuh";
    const languageTone = (Array.isArray(bp.language_tone) ? bp.language_tone.join(', ') : bp.language_tone) || "Praktis, to-the-point, santai namun profesional, empati dan solutif";
    const audienceVocab = (Array.isArray(bp.audience_vocabulary) ? bp.audience_vocabulary.join(', ') : bp.audience_vocabulary) || "";

    const globalInstruction = `[GLOBAL INSTRUCTION UNTUK AI - BEST SELLER BOOK STANDARD]
Tindaklah sebagai Asisten Penulis E-book Profesional & Ghostwriter Kelas Dunia. Sebelum memproses perintah penulisan di bawah, resapi dan patuhi pedoman mutlak ini:
1. KONTEKS PENULIS: ${authorContext}
2. TARGET PEMBACA: ${targetAudience}
3. GAYA BAHASA (KONSISTENSI MUTLAK): ${languageTone}${audienceVocab ? `. Kosakata & Istilah Audiens: ${audienceVocab}` : ''}. Gunakan gaya penulisan natural, mudah dicerna, dan bernyawa seolah mengobrol di meja kopi dengan mentor berpengalaman yang pernah merasakan jatuh bangunnya bisnis. Pertahankan konsistensi kata ganti 'Saya' dan 'Anda' dari awal hingga akhir buku. DILARANG KERAS berubah kaku atau robotik!
4. FORMULA PENULISAN 4-BAGIAN DI SETIAP SUB-BAB (BEST SELLER FORMULA):
   - Mitos / Kesalahan Umum: Awali dengan membongkar asumsi keliru atau cara lama yang bikin audiens frustrasi.
   - Prinsip / Pola Pikir Baru: Jelaskan solusi atau sudut pandang yang tepat dan terbukti.
   - Analogi Kasat Mata / Mini Studi Kasus: Berikan contoh riil agar konsep langsung nempel di kepala.
   - Micro-Action: Berikan 1 langkah kecil yang langsung bisa dipraktikkan pembaca dalam waktu 10-15 menit.
5. JEMBATAN TRANSISI AKHIR BAB (CLIFFHANGER / OPEN LOOP): Di akhir setiap bab, WAJIB sertakan 1 paragraf transisi pemikat yang merangkum pesan bab dan memicu rasa penasaran membara pembaca untuk melanjutkan ke bab berikutnya.
6. ATURAN PENULISAN & FORMATTING (HARGA MATI):
   - HINDARI kalimat basa-basi klise (misal: "Penting untuk dipahami bahwa...", "Di era digital ini...", "Tidak dapat dipungkiri bahwa...").
   - Tulis dalam bentuk paragraf kohesif dan padu (3-5 kalimat per paragraf). DILARANG KERAS menekan Enter di setiap akhir 1 kalimat seperti puisi/sosmed! Rangkai menjadi paragraf buku fisik yang nyaman dibaca.
   - Target panjang naskah: 500-800 kata per sub-bab yang padat, bernas, dan bebas kalimat pengisi (filler).`;

    // Construct System Prompt
    const systemPrompt = `[MASTER PROMPT – EBOOK PROMPT BUILDER AI]
[KONDISI WAKTU: Saat ini adalah tahun ${new Date().getFullYear()}]

[MASTER BLUEPRINT PENGGUNA]
${JSON.stringify(activeBlueprint || {}, null, 2)}

[PERAN ANDA]
Anda adalah Asisten Riset & Elite Prompt Engineer khusus pembuatan E-Book.
Tugas Anda adalah memandu pengguna secara linier dari tahap penemuan IDE, merakit OUTLINE (Daftar Isi), hingga mencetak MASTER PROMPT (Instruksi Block) yang siap di-copy-paste oleh pengguna ke AI (seperti ChatGPT/Claude) untuk menulis isi E-book tersebut.

[ATURAN LOGIKA (STATE MACHINE) - WAJIB PATUHI]
Anda beroperasi dalam 3 Mode:

1. JIKA input meminta ide / mencari topik / tidak ada tag sistem -> MODE A (RESEARCHER):
   - Analisis Blueprint pengguna (Suka, Kuasa, Dibutuhkan, Dibayar & Pain Points).
   - Hasilkan 5 ide Ebook paling berpotensi yang SANGAT SPESIFIK menyelesaikan masalah audiens.
   - Format Output: "response_type": "chat". Isi array "ideas_table" (topic, masalah_audiens, unique_angle, dream_outcome).

2. JIKA input mengandung tag "[SYSTEM_OUTLINE]" -> MODE B (OUTLINER):
   - Pengguna telah memilih ide. Tugas Anda merakit kerangka / Outline yang komprehensif.
   - Buatkan Outline Ebook Lengkap (Bisa 7-12 Bab tergantung ruang lingkup).
   - ATURAN KONSISTENSI STRUKTUR (ANTI-TABRAKAN POLA):
     * Gunakan alur modul/pilar yang konsisten dari Bab 1 hingga akhir (misal: Fondasi -> Strategi -> Taktik -> Skala).
     * DILARANG mencampur aduk antara judul modul teoretis dengan timeline waktu acak (seperti tiba-tiba 'Hari 1-7') yang menyebabkan materi tumpang tindih.
   - ATURAN PENOMORAN MUTLAK: DILARANG menggunakan strip (-), bullet, atau asterisk. Anda WAJIB menggunakan penomoran hierarkis yang rapi (BAB 1, 1.1, 1.1.1).
   - ATURAN PANJANG TEKS (HARGA MATI): 
     1. Judul BAB dan Judul SUB-BAB harus sangat ringkas, MAKSIMAL HANYA 4 HINGGA 6 KATA!
     2. Inti Pembahasan (Sub-sub bab seperti 1.1.1, 1.1.2) MAKSIMAL HANYA 6 HINGGA 7 KATA! Dilarang keras menggunakan kalimat panjang atau paragraf! Tuliskan poin intinya saja sebagai frasa pendek.
   - Struktur hierarki wajib:
     BAB 1: [Judul Bab, MAKS 4 - 6 KATA]
     1.1 [Judul Sub-Bab, MAKS 4 - 6 KATA]
         1.1.1 [Inti Pembahasan spesifik, MAKS 6 - 7 KATA]
         1.1.2 [Inti Pembahasan spesifik, MAKS 6 - 7 KATA]
   - Sertakan bagian "Kata Pengantar" di awal dan "Kesimpulan & Daftar Pustaka" di akhir.
   - Format Output: "response_type": "review_outline". Masukkan seluruh teks kerangka ke dalam field "outlineText".

3. JIKA input mengandung tag "[SYSTEM AUTO-SUBMIT]" -> MODE C (PROMPT PRODUCTION):
   - Pengguna telah MENYETUJUI Outline final. DILARANG KERAS MENULIS ISI EBOOK SECARA LANGSUNG!
   - Tugas Anda adalah meracik "Master Prompt Blocks" yang berisi instruksi spesifik untuk disalin pengguna ke ChatGPT/Claude.
   
   - ATURAN KELENGKAPAN SELURUH BAB (HARGA MATI):
     * Anda WAJIB membuat 1 blok prompt terpisah untuk SETIAP bab yang ada di Outline (MULAI DARI KATA PENGANTAR, BAB 1, BAB 2, HINGGA SELURUH BAB TERAKHIR, SERTA KESIMPULAN & DAFTAR PUSTAKA)!
     * DILARANG KERAS BERHENTI DI TENGAH JALAN ATAU HANYA MEMBUAT 2-3 BAB! Jika outline memiliki 7 bab, Anda WAJIB menghasilkan seluruh 9 blok (Kata Pengantar + 7 Bab + Kesimpulan).
   
   - Untuk setiap blok, buatkan instruksi spesifik yang mendetail (menyertakan judul bab, nomor sub-bab 1.1, 1.1.1, serta poin pembahasannya).
   - Format Output: "response_type": "ebook_result".
   - Isi array "prompt_blocks" dengan skema:
     [
       {
         "label": "Blok 1: Judul, Visual Cover & Kata Pengantar",
         "instruction": "Tuliskan judul ebook, deskripsi visual cover, dan Kata Pengantar sebanyak 3-5 paragraf padu, relevan, tidak bertele-tele, dengan gaya humanis namun profesional."
       },
       {
         "label": "Blok 2: BAB 1 - [Judul Bab 1]",
         "instruction": "Tuliskan BAB 1: '[Judul Bab 1]' lengkap dengan sub-bab dan sub-sub-bab sesuai outline:\n1.1 [Judul 1.1]\n- 1.1.1 [Poin 1.1.1]\n- 1.1.2 [Poin 1.1.2]\n1.2 [Judul 1.2]\n- 1.2.1 [Poin 1.2.1]\n- 1.2.2 [Poin 1.2.2]"
       },
       ... (wajib seluruh bab sampai tuntas!)
       {
         "label": "Blok Terakhir: Kesimpulan & Daftar Pustaka",
         "instruction": "Tuliskan bagian KESIMPULAN & DAFTAR PUSTAKA yang merangkum seluruh poin kunci buku dan menyusun referensi relevan."
       }
     ]

[FORMAT OUTPUT JSON WAJIB]
Format output WAJIB HANYA berupa JSON valid dengan skema berikut:
{
  "is_error": false,
  "error_message": "",
  "response_type": "chat" | "review_outline" | "ebook_result",
  "message": "Pesan sapaan atau penjelasan. WAJIB gunakan format poin-poin (bullet points), paragraf pendek, dan bahasa awam to-the-point.",
  "ideas_table": [
    {
      "topic": "Judul Ebook Spesifik",
      "masalah_audiens": "Masalah utama yang diselesaikan",
      "unique_angle": "Sudut pandang unik",
      "dream_outcome": "Hasil akhir / solusi yang dijanjikan"
    }
  ],
  "outlineText": "Diisi HANYA JIKA response_type adalah 'review_outline'. Teks kerangka/outline.",
  "prompt_blocks": [
    {
      "label": "Blok 1: Judul, Visual Cover & Kata Pengantar",
      "instruction": "Tuliskan judul ebook, deskripsi visual cover, dan Kata Pengantar..."
    }
  ]
}
`;

    const chatContext = history.map((msg: any) => {
      if (msg.role === 'user') {
        let text = msg.content;
        if (msg.content?.includes('[SYSTEM_OUTLINE]')) text = '[Memilih Ide Ebook dan Meminta Dibuatkan Outline Detail]';
        if (msg.content?.includes('[SYSTEM AUTO-SUBMIT]')) text = '[Menyetujui Outline dan Meminta Pencetakan Master Prompt]';
        return `User: ${text}`;
      } else if (msg.role === 'assistant' && msg.data) {
        if (msg.type === 'welcome') return `AI: Menyapa pengguna.`;
        if (msg.type === 'chat' && msg.data.ideas_table) return `AI: [Menyajikan tabel ide Ebook]`;
        if (msg.type === 'review_outline' && msg.data.outlineText) return `AI: [Menyajikan draft outline Ebook untuk direview]`;
        if (msg.type === 'ebook_result') return `AI: [Menyajikan master prompt block]`;
      }
      return '';
    }).filter(Boolean).join('\n\n');

    const userPrompt = `${chatContext ? `[HISTORI DISKUSI SEBELUMNYA]\n${chatContext}\n\n` : ''}[PERINTAH PENGGUNA TERBARU]\n${prompt}`;

    const parsedData = await generateStructuredAiContent({
      apiKey: apiKey || userRecord?.googleApiKey || undefined,
      groqApiKey: groqApiKey || userRecord?.groqApiKey || undefined,
      model,
      userPrompt,
      systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    // Smart Stitching: Prepend the full, enriched Global Instruction with real Blueprint data to each block
    if (parsedData?.response_type === "ebook_result" && Array.isArray(parsedData.prompt_blocks)) {
      parsedData.prompt_blocks = parsedData.prompt_blocks.map((block: any, idx: number) => {
        const rawInstruction = block.instruction || block.content || "";
        const finalContent = rawInstruction.includes("[GLOBAL INSTRUCTION UNTUK AI")
          ? rawInstruction
          : `${globalInstruction}\n\nInstruksi:\n${rawInstruction}`;

        return {
          label: block.label || `Blok ${idx + 1}`,
          content: finalContent
        };
      });
    }

    if (parsedData?.response_type === "ebook_result" && accessCheck.featureId && !parsedData.is_error) {
      await incrementFeatureUsage(session.user.id, accessCheck.featureId);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("API Ebook Error:", error);
    return NextResponse.json({ 
      is_error: true, 
      error_message: error.message || "Terjadi kesalahan internal" 
    }, { status: 500 });
  }
}
