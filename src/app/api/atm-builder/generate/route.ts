import { getDefaultAiModel } from "@/lib/get-ai-model";
import { getApiKey } from "@/lib/get-api-key";
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from "@/auth";
import { verifyFeatureAccess, incrementFeatureUsage } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

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
        select: { googleApiKey: true }
      })
    ]);

    if (!accessCheck.authorized) {
      return NextResponse.json({
        error: accessCheck.code === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : accessCheck.reason,
        code: accessCheck.code,
        message: accessCheck.reason
      }, { status: 403 });
    }

    const apiKey = await getApiKey(userRecord?.googleApiKey);
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key tidak ditemukan baik dari pengguna maupun sistem." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { chatHistory, currentInput, fileData, fileType, blueprint, model } = body;

    const systemPrompt = `[MASTER PROMPT – ATM CONTENT BUILDER]
[KONDISI WAKTU SEKARANG: ${new Date().getFullYear()}]

[SOURCE OF TRUTH: MASTER BLUEPRINT]
${JSON.stringify(blueprint || {}, null, 2)}

[PERAN ANDA]
Anda adalah AI Reverse Content Engineer tingkat Elite. 
Tugas Anda: Membedah konten referensi viral dari pengguna, mengekstrak "Persuasion DNA", lalu merakit ulang (Rebuild) menjadi 3 variasi konten berbeda yang bisa diposting ulang tanpa terlihat seperti menyalin, tetapi TETAP MEMPERTAHANKAN FORMAT, EMOSI, dan POTENSI VIRAL yang sama.

# ==========================================================
# ATM CONTENT BUILDER : PERSUASION DNA REBUILD ENGINE
# ==========================================================

1. CLONE THE EXACT FORMAT (HARGA MATI)
Bentuk/wadah konten hasil ATM WAJIB 100% MENIRU FORMAT ASLINYA. 
- Jika konten referensi berbentuk LISTICLE (poin 1, 2, 3), maka 3 variasi output WAJIB berbentuk Listicle.
- Jika konten referensi berbentuk CAROUSEL, maka 3 variasi output WAJIB dipecah menjadi Slide 1, Slide 2, Slide 3, dst pada label sections-nya.
- Jika konten referensi berbentuk naskah REELS / VIDEO PENDEK, maka 3 variasi output WAJIB dipecah menjadi bagian-bagian naskah Reels (Hook, Body, CTA).
Variasi tersebut harus memiliki struktur dan tujuan yang mirip dengan aslinya.

2. JUDUL, KALIMAT & SUDUT PANDANG BARU (DILARANG COPAS HOOK!)
Anda DILARANG KERAS menyalin, menjiplak, atau menggunakan ulang Judul/Hook dari referensi asli! 
Ketiga variasi tersebut WAJIB menggunakan JUDUL, KALIMAT, dan SUDUT PANDANG (Angle) yang 100% BERBEDA dari aslinya. Ciptakan Hook baru yang sama kuatnya tapi beda kata-katanya.

3. VIRAL & EMOTION PRESERVATION (MANDATORY)
Pertahankan rasa penasaran, kemudahan dipahami, dan daya tarik yang membuat orang ingin membaca atau menonton sampai selesai. 
Gunakan gaya bahasa yang sama seperti postingan asli: sederhana, langsung, dan mendorong interaksi audiens.

4. CORE MISSION & ORIGINALITY
Tugas Anda BUKAN menulis ulang kalimat per kalimat (paraphrase). Tugas Anda adalah mengekstrak kerangka psikologisnya, lalu merakit naskah dari nol (blank page). Konten akhir harus terdengar sangat orisinal dan independen. Jangan meniru joke spesifik atau analogi pribadi pembuat aslinya.

5. INTEGRASI MASTER BLUEPRINT (HARGA MATI)
Masalah, Solusi, dan Outcome yang ditawarkan dalam naskah modifikasi WAJIB 100% menggunakan data dari Master Blueprint pengguna yang telah di lampirkan di atas.

6. VALUE UPGRADE RULE
Konten hasil ATM harus selalu memberikan value yang lebih baik dari aslinya. Buat Hook lebih kuat, penjelasan lebih jernih, dan CTA lebih persuasif.

7. TRANSKRIP YANG SANGAT RAPI
Di field "transkrip_sumber", Anda WAJIB merapikan teks aslinya dengan format paragraf atau poin-poin yang diberi jarak (newline/enter) agar sangat nyaman dibaca manusia.

[FORMAT OUTPUT WAJIB JSON]
PENTING: Format output WAJIB berupa JSON yang valid. 
- DILARANG menggunakan tanda kutip ganda (") tanpa escape (\\") di dalam value string. Gunakan tanda kutip tunggal (') di dalam teks.
- DILARANG menggunakan baris baru (Enter/Newline) secara langsung di dalam string. Selalu gunakan simbol (\\n) untuk baris baru.

{
  "is_error": false,
  "response_type": "atm_result",
  "transkrip_sumber": "Tuliskan hasil transkrip dari referensi. Gunakan simbol newline (\\n) untuk memberi jarak antar paragraf.",
  "opening_text": "Awali dengan sapaan hangat yang natural (contoh: 'Halo! Aku sudah menganalisis referensi kontenmu...'). Setelah itu berikan sedikit analisis singkat kenapa konten ini bagus. Buat kalimatnya simpel, to the point, dan tidak bertele-tele. Jika perlu dijabarkan, gunakan poin-poin singkat yang mudah dimengerti. Yang terpenting bahasanya tetap luwes layaknya obrolan santai dan tidak kaku seperti robot AI.",
  "blueprint_match": {
    "alignment": "Penjelasan bagaimana bingkai pola konten ini dijahit dengan pain point/niche di Blueprint pengguna."
  },
  "viral_dna": {
    "hook_type": "Tipe Hook yang dipakai referensi",
    "emotional_trigger": "Emosi dominan",
    "framework": "Format Asli (Contoh: Listicle / Carousel / Reels)",
    "why_it_works": "Alasan psikologis mengapa struktur/pola ini sangat ampuh"
  },
  "versions": [
    {
      "judul_internal": "Versi 1: [Angle Adaptasi Baru 2.0]",
      "sections": [
        {"label": "Hook Baru / Slide 1", "content": "Hasil Rebuild 2.0 untuk Hook / Slide... (WAJIB KATA-KATA BARU, DILARANG COPAS ASLI)"},
        {"label": "Isi 1 / Slide 2", "content": "Hasil Rebuild 2.0... (Kalimat & sudut pandang beda)"},
        {"label": "CTA Baru / Slide Terakhir", "content": "Hasil Rebuild 2.0 untuk CTA..."}
      ],
      "caption": "Teks caption sosmed"
    }
  ],
  "strategic_recommendation": "Saran strategis saat mengeksekusi konten ini."
}
`;

    let userParts: any[] = [];
    if (currentInput && currentInput.trim()) {
      userParts.push({ text: currentInput });
    }
    
    if (fileData) {
      const base64Data = fileData.split(',')[1];
      
      if (fileType.startsWith('video/') || fileType.startsWith('audio/')) {
        const os = require('os');
        const path = require('path');
        const fs = require('fs');
        
        // Write to a temporary file
        const ext = fileType.split('/')[1] || 'mp4';
        const tempFilePath = path.join(os.tmpdir(), `gemini-upload-${Date.now()}.${ext}`);
        fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));
        
        try {
          // Upload to Gemini File API
          const uploadResult = await (ai.files.upload as any)({
             file: tempFilePath,
             mimeType: fileType,
          });
          const uploadedFileName: string = uploadResult.name || "";
          
          // If video, we must wait for processing to complete
          if (fileType.startsWith('video/') && uploadedFileName) {
             let fileInfo = await ai.files.get({ name: uploadedFileName });
             while (fileInfo.state === 'PROCESSING') {
                await new Promise(r => setTimeout(r, 2000));
                fileInfo = await ai.files.get({ name: uploadedFileName });
             }
             if (fileInfo.state === 'FAILED') {
                throw new Error("Video processing failed on Google Gemini servers.");
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
          // Always clean up temp file
          if (fs.existsSync(tempFilePath)) {
             fs.unlinkSync(tempFilePath);
          }
        }
      } else {
        // Images can still use inlineData
        userParts.push({
          inlineData: {
            mimeType: fileType,
            data: base64Data
          }
        });
        userParts.push({ text: "\n\n[Tolong analisis referensi file gambar di atas untuk di-ATM dengan mempertahankan Hook/Judul pembuka dan struktur aslinya]" });
      }
    }

    const response = await ai.models.generateContent({
      model: model || await getDefaultAiModel("gemini-2.5-flash"),
      contents: [{ role: 'user', parts: userParts }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json'
      }
    });

    const textResult = response.text;
    if (!textResult) {
      return NextResponse.json({ error: 'Empty response from AI' });
    }

    let aiText = textResult.replace(/\s*·\s*/g, ', ');
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid JSON format from AI' });
    }

    const data = JSON.parse(jsonMatch[0]);

    if (accessCheck.featureId) {
      await incrementFeatureUsage(session.user.id, accessCheck.featureId);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in ATM generation:', error);
    return NextResponse.json({ error: 'Gagal menghasilkan konten ATM: ' + error.message }, { status: 500 });
  }
}
