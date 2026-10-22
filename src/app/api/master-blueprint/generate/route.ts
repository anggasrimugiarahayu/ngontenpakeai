import { getDefaultAiModel, getFallbackAiModel } from "@/lib/get-ai-model";
import { getApiKey } from "@/lib/get-api-key";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { verifyFeatureAccess, incrementFeatureUsage } from "@/lib/auth-checks";
import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessCheck = await verifyFeatureAccess(session.user.id, "Master Blueprint", session.user.email);
    if (!accessCheck.authorized) {
      return NextResponse.json({
        error: accessCheck.code === "QUOTA_EXCEEDED" ? "QUOTA_EXCEEDED" : accessCheck.reason,
        code: accessCheck.code,
        message: accessCheck.reason
      }, { status: 403 });
    }

    const formData = await req.json();

    // Get User's API Key
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { googleApiKey: true }
    });

    const apiKey = await getApiKey(dbUser?.googleApiKey);
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
5. ANTI-HALU & DILARANG MENDONGENG: Jangan pernah merangkai cerita fiksi yang dramatis. CONTOH WAJIB PERSONA: "[Nama], [Usia], [Pekerjaan] di [Lokasi]. Penghasilan [Penghasilan]. Lagi mau [Tujuan] karena ngerasa [Pain point]. Punya waktu luang [Jam aktif]. Aktif di [Platform]. Mau bayar [Willingness to pay] untuk hal yang langsung bisa dipakai · alergi sama [Frustrasi]. Cari sesuatu yang spesifik dan praktis."
6. ATURAN KATA GANTI MUTLAK: DILARANG KERAS menggunakan kata "Gue", "Gw", "Lo", "Lu", "Bro", atau "Sis" di seluruh teks. WAJIB gunakan "Saya", "Aku", "Kamu", atau "Anda" agar konsisten dan sejajar.

[TASK]
Buat "Master Blueprint Personal Branding" yang komprehensif berdasarkan data input. Output HARUS murni JSON. Ikuti kerangka instruksi yang diminta.

    JSON Schema:
{
  "canvas_blueprint": {
    "positioning_identity": "Identitas kreator yang sangat santai, nyata, dan anti-overclaim. WAJIB diawali dengan nama kreator. Cukup 2 kalimat sederhana yang menjelaskan dia siapa dan fokus ngebantu apa tanpa embel-embel gelar aneh. (Contoh yang BENAR: 'Angga adalah kreator yang fokus bantu karyawan ngatur gaji UMR biar nggak numpang lewat doang. Dia sharing rumus Excel simpel biar tabungan bisa pelan-pelan keisi tanpa harus nyiksa diri.')",
    
    "niche_statement": "Nama niche yang sangat spesifik, clear, dan langsung ke sasaran tanpa bahasa ribet atau menggantung. (CONTOH BENAR: 'Content strategy untuk pemilik bisnis kecil yang aktif di sosmed').",
    "value_statement": "Pernyataan inti (1-2 kalimat) yang sangat jelas, tidak menggantung, dan fokus pada solusi praktis. (CONTOH BENAR: 'Bantu pemilik bisnis kecil bikin konten yang convert tanpa harus jago editing atau punya tim').",
    "core_message": "Pesan utama yang akan selalu jadi benang merah di semua konten (Sangat Simpel, Jelas, & Relatable).",
    "mission_statement": "Saya membantu [Target Audiens] untuk [Solusi] melalui [Keahlian/Niche].",
    "vision_goals": ["Target jangka pendek 1", "Target jangka panjang 2"],
    "core_values": ["Nilai/prinsip utama 1", "Prinsip 2", "Prinsip 3"],
    "strengths": ["Kekuatan utama 1", "Kekuatan 2"],
    "knowledge_skills": ["Skill utama 1", "Skill 2"],
    "purpose_motivation": ["Alasan kuat 1", "Alasan 2"],
    "areas_of_expertise": ["Topik spesifik 1", "Topik 2"],
    "key_messages": ["Pesan utama 1", "Pesan 2"],
    "language_tone": ["Gaya bahasa 1", "Gaya bahasa 2"],
    "brand_personality": ["Karakter brand 1", "Karakter 2"],
    "brand_promise": ["Janji ke audiens 1", "Janji 2"],
    
    "target_audiences": ["Detail audiens 1", "Detail 2"],
    "market_potential": "Analisis singkat tentang ukuran pasar, apakah pasarnya ramai, dan kata kunci apa yang sering mereka cari.",
    "competitor_landscape": "Analisis jujur soal kompetitor. Apa yang umumnya mereka lakukan, dan apa yang sering mereka lewatkan.",
    "content_gap": "Celah pasar: Sudut pandang atau format yang belum banyak dibahas orang lain di niche ini.",
    "pain_points": ["Masalah nyata sehari-hari 1", "Masalah nyata 2"],
    "audience_transformation": ["Kondisi Before -> After 1", "Before -> After 2"],
    "solutions_benefits": ["Solusi praktis 1", "Solusi 2"],
    "content_pillars": ["Pilar konten 1", "Pilar konten 2"],
    "content_strategy": ["Taktik distribusi 1", "Taktik 2"],
    "platform_strategy": ["Fokus platform 1", "Fokus 2"],
    "monetization_strategy": ["Cara dapat uang yang masuk akal 1", "Estimasi waktu", "Produk/Jasa potensial"],
    "cta_strategy": ["Jenis CTA 1", "CTA 2"],

    "persona_narrative": "WAJIB FAKTUAL & PADAT! DILARANG KERAS membuat cerita dramatis/halu (seperti 'Dia duduk di kasur jam 9 malam...'). Rangkum profil dengan logis. CONTOH FORMAT WAJIB: '[Nama], [Usia], [Pekerjaan] di [Lokasi]. Penghasilan [Penghasilan]. Lagi mau [Tujuan] karena ngerasa [Pain point]. Punya waktu luang [Jam aktif]. Aktif di [Platform]. Mau bayar [Willingness to pay] untuk hal yang langsung bisa dipakai · alergi sama [Frustrasi]. Cari sesuatu yang spesifik dan praktis.'",
    "trigger_points": ["Situasi spesifik 1 (cth: 'Rabu malam, pusing mikirin cicilan paylater...')", "Situasi spesifik 2", "Situasi spesifik 3"],
    "buying_psychology": ["Apa yang bikin mereka ragu ngeluarin uang", "Apa yang bikin mereka akhirnya yakin beli", "Harga yang terasa 'worth it' buat mereka"],
    "stress_blockers": ["Hambatan audiens 1", "Hambatan 2"],
    "dream_outcome": ["Impian audiens 1", "Impian 2"],
    "biggest_fears": ["Ketakutan terdalam audiens 1", "Ketakutan 2"],
    "daily_frustrations": ["Frustasi harian audiens 1", "Frustasi 2"],
    "false_beliefs": ["Asumsi keliru audiens 1", "Asumsi keliru 2"],
    "internal_problems": ["Hambatan dari dalam diri 1", "Hambatan 2"],
    "external_problems": ["Hambatan dari luar (lingkungan/sistem) 1", "Hambatan 2"],
    "biggest_objections": ["Alasan nggak mau dengerin/beli 1", "Keberatan 2"],
    "emotional_triggers": ["Emosi pemicu (marah/sedih/takut) 1", "Emosi 2"],
    "audience_vocabulary": ["Bahasa sehari-hari audiens 1", "Istilah audiens 2", "Kata yang bikin mereka langsung skip konten"],
    "common_enemies": ["Musuh bersama 1", "Musuh bersama 2"],
    "brand_content_rules": ["Aturan bikin konten 1", "Aturan 2"],
    "deep_audience_questions": ["Pertanyaan Dasar 1", "Pertanyaan Frustrasi 1", "Pertanyaan Aspirasi 1", "Pertanyaan Tabu/Rahasia 1"]
  }
}
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

Gaya Komunikasi: ${formData.gaya_komunikasi ? (Array.isArray(formData.gaya_komunikasi) ? formData.gaya_komunikasi.join(', ') : formData.gaya_komunikasi) : ''}
Platform Dipilih: ${formData.platform ? (Array.isArray(formData.platform) ? formData.platform.join(', ') : formData.platform) : ''}

[INSTRUKSI]: Evaluasi data di atas. Hasilkan Master Blueprint yang presisi, mendalam, membongkar celah pasar, dan memberikan narasi ICP (Persona) yang terasa hidup.
`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: await getDefaultAiModel("gemini-2.5-flash"),
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        }
      });
    } catch (error: any) {
      const errStr = String(error?.message || "");
      if (error?.status === 503 || error?.status >= 500 || errStr.toLowerCase().includes('high demand') || errStr.toLowerCase().includes('overloaded') || errStr.toLowerCase().includes('internal')) {
        console.warn("[Fallback] Master Blueprint server overloaded. Retrying with fallback model...");
        response = await ai.models.generateContent({
          model: await getFallbackAiModel(),
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          }
        });
      } else {
        throw error;
      }
    }

    const aiText = response.text;
    if (!aiText) throw new Error("Kosong dari AI");
    
    // Bersihkan output dari markdown jika model masih ngeyel
    const cleanedText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedText);

    let blueprintId = formData.id;
    
    if (blueprintId) {
      // Update existing
      await prisma.masterBlueprint.update({
        where: { id: blueprintId, userId: session.user.id },
        data: {
          title: result.canvas_blueprint?.niche_statement || "Master Blueprint",
          inputData: formData,
          aiResult: result
        }
      });
    } else {
      // Create new
      const blueprint = await prisma.masterBlueprint.create({
        data: {
          userId: session.user.id,
          title: result.canvas_blueprint?.niche_statement || "Master Blueprint",
          inputData: formData,
          aiResult: result
        }
      });
      blueprintId = blueprint.id;
    }

    try {
      revalidateTag("blueprint", "default");
    } catch (e) {}

    if (accessCheck.featureId) {
      await incrementFeatureUsage(session.user.id, accessCheck.featureId);
    }

    return NextResponse.json({ result, id: blueprintId });

  } catch (error: any) {
    console.error("Error generate blueprint:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
