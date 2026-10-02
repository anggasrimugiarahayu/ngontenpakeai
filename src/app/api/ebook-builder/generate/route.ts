import { getApiKey } from "@/lib/get-api-key";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { 
      prompt,
      history = [],
      blueprint = {},
      model = "gemini-2.5-flash",
      apiKey
    } = await req.json();

    const currentKey = apiKey || process.env.GEMINI_API_KEY;
    if (!currentKey) {
      return NextResponse.json({ 
        is_error: true, 
        error_message: "API Key tidak ditemukan" 
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: currentKey });
    
    // Construct System Prompt
    const systemPrompt = `[MASTER PROMPT – EBOOK PROMPT BUILDER AI]
[KONDISI WAKTU: Saat ini adalah tahun ${new Date().getFullYear()}]

[MASTER BLUEPRINT PENGGUNA]
${JSON.stringify(blueprint, null, 2)}

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
   - ATURAN PENOMORAN MUTLAK: DILARANG menggunakan strip (-), bullet, atau asterisk. Anda WAJIB menggunakan penomoran hierarkis yang rapi (BAB 1, 1.1, 1.1.1).
   - ATURAN PANJANG TEKS (HARGA MATI): 
     1. Judul BAB dan Judul SUB-BAB harus sangat ringkas, MAKSIMAL HANYA 4 HINGGA 6 KATA!
     2. Inti Pembahasan (Sub-sub bab seperti 1.1.1, 1.1.2) MAKSIMAL HANYA 6 HINGGA 7 KATA! Dilarang keras menggunakan kalimat panjang atau paragraf! Tuliskan poin intinya saja sebagai frasa pendek.
   - Struktur hierarki wajib:
     BAB 1: [Judul Bab, MAKS 4 - 6 KATA]
     1.1 [Judul Sub-Bab, MAKS 4 - 6 KATA]
         1.1.1 [Inti Pembahasan spesifik, MAKS 6 - 7 KATA]
         1.1.2 [Inti Pembahasan spesifik, MAKS 6 - 7 KATA]
   - Jangan lupa sertakan bagian "Kata Pengantar" di awal dan "Kesimpulan & Daftar Pustaka" di akhir.
   - Format Output: "response_type": "review_outline". Masukkan seluruh teks kerangka ke dalam field "outlineText".

3. JIKA input mengandung tag "[SYSTEM AUTO-SUBMIT]" -> MODE C (PROMPT PRODUCTION):
   - Pengguna telah MENYETUJUI Outline final. DILARANG KERAS MENULIS ISI EBOOK SECARA LANGSUNG!
   - Tugas Anda adalah meracik "Master Prompt Blocks" yang berisi instruksi super detail untuk disalin pengguna ke ChatGPT/Claude.
   
   - HARGA MATI (GLOBAL INSTRUCTION): Untuk mencegah AI (ChatGPT/Claude) amnesia, berubah gaya penulisan, atau memotong paragraf secara serampangan antar bab, Anda WAJIB MUTLAK menyematkan teks "[GLOBAL INSTRUCTION UNTUK AI]" SECARA LENGKAP KATA PER KATA di awal/atas SETIAP blok prompt.
   
   - DILARANG KERAS MALAS ATAU MENYINGKAT TEKS! JANGAN PERNAH menulis "[Sama seperti blok 1]" atau "[Global Instruction di atas]". Anda WAJIB MENG-COPY-PASTE seluruh teks pedoman di bawah ini secara UTUH 100% ke DALAM SETIAP BLOK PROMPT (Blok 1, Blok 2, Blok 3, dst).
   
   - Format dan Teks [GLOBAL INSTRUCTION UNTUK AI] yang WAJIB Anda cetak UTUH di setiap awal blok prompt (Sesuaikan isi variabel di dalam kurung siku dengan Master Blueprint pengguna):
     """
     [GLOBAL INSTRUCTION UNTUK AI]
     Tindaklah sebagai Asisten Penulis E-book Profesional. Sebelum memproses perintah penulisan di bawah, resapi dan patuhi pedoman utama ini:
     1. KONTEKS PENULIS: [Sebutkan Positioning & Keahlian dari Master Blueprint]
     2. TARGET PEMBACA: [Sebutkan Target Audiens, Masalah & Tingkat Pemahaman dari Master Blueprint]
     3. GAYA BAHASA (KONSISTENSI MUTLAK): [Sebutkan Language Tone & Audience Vocabulary dari Blueprint]. Gunakan gaya penulisan natural, mudah dicerna, dan ringan (seolah ngobrol tapi tetap profesional dan berbobot). Jaga konsistensi emosi, penggunaan kata ganti (seperti 'Saya' dan 'Anda'), dan gaya bahasa ini dari awal sampai akhir buku. JANGAN PERNAH berubah gaya menjadi kaku atau robotik di pertengahan bab!
     4. ATURAN MENULIS (HARGA MATI): Kembangkan inti pembahasan dengan contoh praktis, analogi sederhana, atau mini-studi kasus nyata. HINDARI jargon teknis yang membingungkan. JANGAN PERNAH menggunakan kalimat basa-basi (contoh: "Penting untuk dipahami bahwa...", "Di era digital ini..."). 
     5. ATURAN FORMATTING PARAGRAF (SANGAT KRITIKAL): Tulis naskah dalam bentuk paragraf yang kohesif dan padu (satu paragraf idealnya terdiri dari 3-5 kalimat). DILARANG KERAS menekan 'Enter' atau membuat baris baru (line break) di setiap akhir 1 kalimat. JANGAN membuat tulisan yang patah-patah seperti puisi atau postingan media sosial. Rangkai menjadi paragraf buku profesional yang nyaman dibaca dan format sub-judul menggunakan penomoran hierarkis yang rapi (Bab 1, 1.1, 1.1.1, dst).
     """
   
   - HARGA MATI PEMISAHAN BLOK (1 BLOK = 1 BAB): Anda WAJIB memecah instruksi penulisan menjadi blok-blok terpisah. DILARANG KERAS menggabungkan 2 bab atau lebih ke dalam 1 blok! Ini agar ChatGPT/Claude tidak memotong tulisannya.
   - Struktur pencetakan blok WAJIB seperti ini:
     - Blok 1: [CETAK SELURUH Teks GLOBAL INSTRUCTION secara utuh di sini] + Instruksi penulisan Judul, Cover, dan Kata Pengantar (Buat 3-5 paragraf padu, relevan, tidak bertele-tele, gaya humanis).
     - Blok 2: [CETAK SELURUH Teks GLOBAL INSTRUCTION secara utuh di sini] + Instruksi spesifik meminta AI menulis HANYA BAB 1 (Sertakan daftar Sub-bab & Inti Pembahasannya secara detail beserta nomor urutnya 1.1, 1.1.1. Perintahkan AI untuk menulis 800-1000 kata per sub-bab).
     - Blok 3: [CETAK SELURUH Teks GLOBAL INSTRUCTION secara utuh di sini] + Instruksi spesifik meminta AI menulis HANYA BAB 2 (beserta sub-bab & intinya).
     - Blok 4, 5, dst: Lanjutkan pola "1 Blok untuk 1 Bab" ini secara terpisah untuk seluruh bab yang ada di Outline. Pastikan GLOBAL INSTRUCTION dicetak utuh kata per kata di setiap blok.
     - Blok Terakhir: [CETAK SELURUH Teks GLOBAL INSTRUCTION secara utuh di sini] + Instruksi spesifik meminta AI merangkum Kesimpulan & merapikan Daftar Pustaka.`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        is_error: { type: Type.BOOLEAN },
        error_message: { type: Type.STRING },
        response_type: { 
          type: Type.STRING,
          description: "Wajib salah satu dari: 'chat', 'review_outline', atau 'ebook_result'"
        },
        message: { 
          type: Type.STRING,
          description: "Pesan sapaan atau penjelasan. WAJIB gunakan format poin-poin (bullet points), paragraf pendek, dan bahasa awam to-the-point."
        },
        ideas_table: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING, description: "Judul Ebook Spesifik" },
              masalah_audiens: { type: Type.STRING, description: "Masalah utama yang diselesaikan" },
              unique_angle: { type: Type.STRING, description: "Sudut pandang unik" },
              dream_outcome: { type: Type.STRING, description: "Hasil akhir / solusi yang dijanjikan" }
            },
            required: ["topic", "masalah_audiens", "unique_angle", "dream_outcome"]
          }
        },
        outlineText: {
          type: Type.STRING,
          description: "Diisi HANYA JIKA response_type adalah 'review_outline'. Berisi seluruh teks kerangka/outline yang komprehensif."
        },
        prompt_blocks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, description: "Contoh: 'Blok Prompt 1: Penulisan Bab 1'" },
              content: { type: Type.STRING, description: "Teks instruksi prompt aktual" }
            }
          },
          description: "Diisi HANYA JIKA response_type adalah 'ebook_result'. Berisi array instruksi blok-blok."
        }
      },
      required: ["is_error", "response_type", "message"]
    };

    let contents = [];
    
    for (const msg of history) {
      if (msg.role === 'user') {
        let text = `User: ${msg.content}`;
        if(msg.content.includes('[SYSTEM_OUTLINE]')) text = `User: [Memilih Ide Ebook dan Meminta Dibuatkan Outline Detail]`;
        if(msg.content.includes('[SYSTEM AUTO-SUBMIT]')) text = `User: [Menyetujui Outline dan Meminta Pencetakan Master Prompt]`;
        contents.push({ role: 'user', parts: [{ text }] });
      } else if (msg.role === 'assistant' && msg.data) {
        let text = '';
        if(msg.type === 'welcome') text = `AI: Menyapa pengguna.`;
        if(msg.type === 'chat' && msg.data.ideas_table) text = `AI: [Menyajikan tabel ide Ebook]`;
        if(msg.type === 'review_outline' && msg.data.outlineText) text = `AI: [Menyajikan draft outline Ebook untuk direview]`;
        if(msg.type === 'ebook_result') text = `AI: [Menyajikan master prompt block]`;
        if (text) contents.push({ role: 'model', parts: [{ text }] });
      }
    }

    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Kosong dari AI");
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      parsedData = { is_error: true, error_message: "Format JSON tidak valid dari AI." };
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
