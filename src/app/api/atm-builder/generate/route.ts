import { getDefaultAiModel } from "@/lib/get-ai-model";
import { getApiKey, getGroqApiKey } from "@/lib/get-api-key";
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from "@/auth";
import { verifyFeatureAccess, incrementFeatureUsage } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { generateStructuredAiContent, isGroqModel } from "@/lib/ai/geminiClient";
import { transcribeWithGroqWhisper } from "@/lib/ai/groqWhisper";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [accessCheck, body, userRecord] = await Promise.all([
      verifyFeatureAccess(session.user.id, "ATM Content Builder", session.user.email),
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

    const { chatHistory, currentInput, fileData, fileType, blueprint, model } = body;

    const systemPrompt = `[MASTER PROMPT – ATM CONTENT BUILDER]
[KONDISI WAKTU SEKARANG: ${new Date().getFullYear()}]

[SOURCE OF TRUTH: MASTER BLUEPRINT PENGGUNA]
${JSON.stringify(blueprint || {}, null, 2)}

[PERAN ANDA]
Anda adalah Elite AI Reverse Content Engineer & Master Copywriter. 
Tugas Anda: Membedah konten referensi viral dari pengguna, mengekstrak "Persuasion DNA" (arsitektur psikologis, emosi, metafora, pacing, dan mekanismenya), lalu merakit ulang (Rebuild) menjadi 3 variasi naskah konten baru yang 100% orisinal, bernyawa, dan siap viral, yang dijahit sempurna dengan Master Blueprint pengguna.

# ==========================================================
# HUKUM EMAS ATM BUILDER : PERSUASION DNA REBUILD ENGINE
# ==========================================================

1. CLONE THE EXACT FORMAT (STRUKTUR IDENTIK - HARGA MATI)
Bentuk/wadah konten hasil ATM WAJIB 100% MENIRU FORMAT & JUMLAH BAGIAN ASLINYA:
- Jika konten referensi berupa CAROUSEL (misal 8 slide), maka ketiga variasi output WAJIB dipecah menjadi Slide 1 s/d Slide 8 dengan pembagian beban pesan dan alur emosi yang identik.
- Jika konten referensi berbentuk LISTICLE (misal 5 tips), maka output wajib berupa Listicle 5 poin.
- Jika konten referensi berupa naskah REELS / VIDEO PENDEK, maka output wajib dipecah menjadi Hook, Bridge/Foreshadow, Body Points, dan CTA.

2. ATURAN HOOK BARU (REPLIKASI POLA PSIKOLOGIS, BUKAN KALIMAT KLISE)
- Anda DILARANG MENJIPLAK kata-kata hook asli, tapi Anda WAJIB MEREPLIKASI KEKUATAN PSIKOLOGISNYA:
  * Jika hook asli menggunakan TARGET NOMINAL KONKRET (misal: "Cari uang sampingan 100 ribu/hari dari Instagram"), maka Hook variasi baru WAJIB MEMASUKKAN ANGKA/TARGET KONKRET yang relevan dengan Blueprint (misal: "Target realistis: ngumpulin Rp100 ribu/hari cuma dari 1 file spreadsheet simpel").
  * JANGAN PERNAH men-downgrade hook angka konkret menjadi pertanyaan retoris pasaran yang klise (misal: "Pernah ngerasa gaji cepat habis?"). Ciptakan Hook baru yang sama tajamnya dan menghentikan scroll!

3. SOUL ANCHOR PRESERVATION (JAGA JIWA & KLIMAKS EMOSIONAL KONTEN - HARGA MATI)
- Jika konten referensi memiliki slide/bagian yang menyentuh ranah SPIRITUAL, MORAL, NILAI AMAL, atau SENTUHAN KELUARGA (seperti 'Niatkan sebagai jariyah, mudahkan urusan orang lain'):
  * DILARANG KERAS MENGGANTINYA dengan kata-kata motivator generik yang hambar (seperti: "Mulai dari langkah kecil yang konsisten", "Ambil langkah awal"). Itu membunuh jiwa konten!
  * WAJIB REPLIKASI KEDALAMAN RASA TERSEBUT sesuai niche Blueprint pengguna. Tunjukkan bahwa karya/solusi ini bernilai ibadah, menolong sesama yang sedang pusing, dan membawa keberkahan nyata.

4. VISUAL METAPHORS & SENSORY DETAILS (METAFORA KASAT MATA)
- DILARANG menggunakan kata-kata korporat dingin atau klise abstrak (seperti "bangun fondasinya", "optimalkan sistemnya").
- WAJIB gunakan metafora kasat mata yang menghidupkan imajinasi audiens:
  * Gunakan analogi konkret seperti "keran air yang mengalir", "ban serep", "pos cadangan", "bocor halus", atau "toko otomatis di saat kita tidur".
  * Sebutkan beban biaya riil (misal: cicilan motor, token listrik, uang belanja dapur, susu anak), bukan cuma kata abstrak "kebutuhan finansial".

5. TONE OF VOICE & PERSONA CONSISTENCY LOCK (ANTI-PERSONA DRIFT)
- Kunci persona dari Slide 1 sampai Slide terakhir agar konsisten:
  * DILARANG KERAS menyelipkan panggilan tongkrongan yang tidak sinkron seperti "bro!", "guys", "coy", atau "sis" jika gayanya bernada empati hangat/edukatif!
  * Pertahankan kata ganti yang konsisten (jika menyapa "kamu", gunakan "kamu" sampai akhir. Jangan slide awal santai, tengah-tengah "bro", lalu penutup mendadak "saya").

6. SINGLE OFFER DISCIPLINE (SATU TAWARAN JELAS DI PENUTUP)
- Slide penutup (CTA) WAJIB FOKUS PADA 1 TAWARAN TUNGGAL yang selaras dengan seluruh isi konten.
- DILARANG "Dual Offer Confusion" (misal: "Mau dibantu cara atur keuangan sekaligus bangun aset digital?"). 
- Tentukan 1 janji utama yang jelas (misal: "Mau panduan step-by-step bikin template digital pertamamu sampai laku? Komen 'PANDUAN'").

7. INTEGRASI MASTER BLUEPRINT PENGGUNA
- Niche, audience avatar, problem, dan solusi yang di-build dalam 3 variasi WAJIB disesuaikan 100% dengan Master Blueprint pengguna yang terlampir.

[FORMAT OUTPUT WAJIB JSON]
PENTING: Format output WAJIB berupa JSON yang valid. 
- DILARANG menggunakan tanda kutip ganda (") tanpa escape (\\") di dalam value string. Gunakan tanda kutip tunggal (') di dalam teks.
- DILARANG menggunakan baris baru (Enter/Newline) secara langsung di dalam string. Selalu gunakan simbol (\\n) untuk baris baru.
- Buat tepat 3 Versi ("versions") dengan angle adaptasi yang berbeda dan kualitas copywriting yang matang.

{
  "is_error": false,
  "response_type": "atm_result",
  "transkrip_sumber": "Tuliskan hasil transkrip dari referensi. Gunakan simbol newline (\\n) untuk memberi jarak antar paragraf.",
  "opening_text": "Awali dengan sapaan hangat yang natural. Berikan analisis singkat bedah Persuasion DNA konten referensi (kenapa konten ini berhasil secara emosi dan psikologi). Bahasa santai, luwes, dan to the point.",
  "blueprint_match": {
    "alignment": "Penjelasan bagaimana pola viral konten referensi ini dijahit secara tepat dengan niche dan audiens di Blueprint pengguna."
  },
  "viral_dna": {
    "hook_type": "Tipe Hook referensi (misal: Specific Metric + Low Barrier Challenge)",
    "emotional_trigger": "Emosi dominan (misal: Hope, Relief, Spiritual Purpose, Feasibility)",
    "framework": "Format Asli (Contoh: Carousel 8 Slide / Reels / Listicle)",
    "why_it_works": "Alasan psikologis mengapa struktur ini sangat ampuh"
  },
  "versions": [
    {
      "judul_internal": "Versi 1: [Angle Adaptasi 1]",
      "sections": [
        {"label": "Slide 1 / Hook", "content": "Teks naskah Slide 1..."},
        {"label": "Slide 2", "content": "Teks naskah Slide 2..."}
      ],
      "caption": "Teks caption sosmed yang menarik lengkap dengan ajakan interaksi dan hashtag relevan."
    },
    {
      "judul_internal": "Versi 2: [Angle Adaptasi 2]",
      "sections": [
        {"label": "Slide 1 / Hook", "content": "Teks naskah Slide 1..."},
        {"label": "Slide 2", "content": "Teks naskah Slide 2..."}
      ],
      "caption": "Teks caption sosmed versi 2..."
    },
    {
      "judul_internal": "Versi 3: [Angle Adaptasi 3]",
      "sections": [
        {"label": "Slide 1 / Hook", "content": "Teks naskah Slide 1..."},
        {"label": "Slide 2", "content": "Teks naskah Slide 2..."}
      ],
      "caption": "Teks caption sosmed versi 3..."
    }
  ],
  "strategic_recommendation": "Saran strategis taktis saat memposting konten ini (waktu posting, cara follow up DM, optimasi visual)."
}
`;

    let userParts: any[] = [];
    if (currentInput && currentInput.trim()) {
      userParts.push({ text: currentInput });
    }

    let data: any;

    if (fileData) {
      const base64Data = fileData.split(',')[1] || fileData;

      // 1. FAST-PATH: Transkripsi Kilat Audio/Video menggunakan Groq Whisper
      if (fileType.startsWith('video/') || fileType.startsWith('audio/')) {
        const activeGroqKey = await getGroqApiKey(userRecord?.groqApiKey);
        if (activeGroqKey) {
          try {
            const transcript = await transcribeWithGroqWhisper({
              base64Data,
              mimeType: fileType,
              apiKey: activeGroqKey,
            });

            if (transcript && transcript.trim().length > 5) {
              const combinedPrompt = `[TRANSKRIP ASLI DARI MEDIA REFERENSI (AUDIO/VIDEO)]:\n${transcript}\n\n${currentInput && currentInput.trim() ? `[CATATAN TAMBAHAN USER]:\n${currentInput.trim()}\n\n` : ''}[INSTRUKSI]: Tolong analisis dan bedah transkrip naskah di atas dengan metode ATM (Amati, Tiru, Modifikasi) sesuai Master Blueprint. Tuliskan transkrip aslinya di field 'transkrip_sumber' dan ciptakan 3 variasi naskah konten baru yang mematikan.`;

              data = await generateStructuredAiContent({
                apiKey: userRecord?.googleApiKey || undefined,
                groqApiKey: userRecord?.groqApiKey || undefined,
                model,
                userPrompt: combinedPrompt,
                systemPrompt,
                responseMimeType: 'application/json',
              });

              if (accessCheck.featureId) {
                await incrementFeatureUsage(session.user.id, accessCheck.featureId);
              }

              return NextResponse.json(data);
            }
          } catch (whisperErr: any) {
            console.warn('[ATM Builder] Groq Whisper fallback ke Google Multimodal:', whisperErr?.message || whisperErr);
          }
        }
      }

      // 2. FALLBACK: Multimodal Google Gen AI (untuk Gambar atau Video tanpa suara)
      const apiKey = await getApiKey(userRecord?.googleApiKey);
      if (!apiKey) {
        return NextResponse.json({ error: "Google Gemini API Key diperlukan untuk menganalisis file gambar/video/audio." }, { status: 400 });
      }
      const googleAiClient = new GoogleGenAI({ apiKey });

      if (fileType.startsWith('video/') || fileType.startsWith('audio/')) {
        const os = require('os');
        const path = require('path');
        const fs = require('fs');
        
        const ext = fileType.split('/')[1] || 'mp4';
        const tempFilePath = path.join(os.tmpdir(), `gemini-upload-${Date.now()}.${ext}`);
        fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));
        
        try {
          const uploadResult = await (googleAiClient.files.upload as any)({
             file: tempFilePath,
             mimeType: fileType,
          });
          const uploadedFileName: string = uploadResult.name || "";
          
          if (fileType.startsWith('video/') && uploadedFileName) {
             let fileInfo = await googleAiClient.files.get({ name: uploadedFileName });
             while (fileInfo.state === 'PROCESSING') {
                await new Promise(r => setTimeout(r, 2000));
                fileInfo = await googleAiClient.files.get({ name: uploadedFileName });
             }
             if (fileInfo.state === 'FAILED') {
                throw new Error("Pemrosesan video gagal di server Google.");
             }
          }
          
          userParts.push({
            fileData: {
              fileUri: uploadResult.uri || "",
              mimeType: uploadResult.mimeType || fileType
            }
          });
          userParts.push({ text: "\n\n[Tolong analisis referensi file video/audio di atas untuk di-ATM dengan mempertahankan Hook/Judul pembuka dan struktur aslinya]" });
        } finally {
          if (fs.existsSync(tempFilePath)) {
             fs.unlinkSync(tempFilePath);
          }
        }
      } else {
        // Gambar
        userParts.push({
          inlineData: {
            mimeType: fileType,
            data: base64Data
          }
        });
        userParts.push({ text: "\n\n[Tolong analisis referensi file gambar di atas untuk di-ATM dengan mempertahankan Hook/Judul pembuka dan struktur aslinya]" });
      }

      // Gunakan model Gemini aktif (gemini-3.7-flash atau gemini-3.5-flash-lite), hindari gemini-2.5-flash yang sudah ditutup Google
      const targetModel = model && !isGroqModel(model) && !model.includes("2.5-flash") ? model : "gemini-3.7-flash";
      const response = await googleAiClient.models.generateContent({
        model: targetModel,
        contents: [{ role: 'user', parts: userParts }],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json'
        }
      });

      const textResult = response.text;
      if (!textResult) {
        return NextResponse.json({ error: 'Respon kosong dari layanan AI' });
      }

      let aiText = textResult.replace(/\s*·\s*/g, ', ');
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Format JSON dari AI tidak valid' });
      }
      data = JSON.parse(jsonMatch[0]);
    } else {
      const userPrompt = userParts.map(p => p.text).filter(Boolean).join('\n\n');
      data = await generateStructuredAiContent({
        apiKey: userRecord?.googleApiKey || undefined,
        groqApiKey: userRecord?.groqApiKey || undefined,
        model,
        userPrompt,
        systemPrompt,
        responseMimeType: 'application/json',
      });
    }

    if (accessCheck.featureId) {
      await incrementFeatureUsage(session.user.id, accessCheck.featureId);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in ATM generation:', error);
    return NextResponse.json({ error: 'Gagal menghasilkan konten ATM: ' + error.message }, { status: 500 });
  }
}
