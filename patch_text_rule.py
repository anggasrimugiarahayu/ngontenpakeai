with open("src/app/api/carousel-builder/generate/route.ts", "r") as f:
    content = f.read()

rule_block = """[ATURAN TEKS PADA OBJEK (TEXT AVOIDANCE) - HARGA MATI]
Di dalam field "GEN AI PROMPT", Anda WAJIB menyematkan instruksi bahasa Inggris ini di SETIAP SLIDE untuk mencegah munculnya tulisan/huruf acak (halusinasi teks) pada benda di dalam gambar:
"Do not add any text to the objects in the image other than what is explicitly instructed by the prompt."

[ATURAN POV"""

# Inject before [ATURAN POV & PERSPEKTIF OBYEK - HARGA MATI]
content = content.replace("[ATURAN POV", rule_block)

# Update GEN AI PROMPT line 1
content = content.replace(
    '* GEN AI PROMPT: [Prompt visual komprehensif BAHASA INGGRIS. Masukkan SELURUH Base Anchor Visual (Konsep Style Art, Deskripsi Gaya Typography, Karakter) secara LENGKAP PANJANG di sini. Harus ada "Make the aspect ratio 3:4"]',
    '* GEN AI PROMPT: [Prompt visual komprehensif BAHASA INGGRIS. Masukkan SELURUH Base Anchor Visual secara LENGKAP. Harus ada "Make the aspect ratio 3:4". WAJIB TAMBAHKAN KALIMAT: "Do not add any text to the objects in the image other than what is explicitly instructed by the prompt."]'
)

# Update GEN AI PROMPT line 2
content = content.replace(
    '* GEN AI PROMPT: [Prompt komprehensif INGGRIS. WAJIB COPY-PASTE Base Anchor Visual secara 100% IDENTIK dari slide 1 + Ubah Aksi/Pose khusus slide ini. Harus ada "Make the aspect ratio 3:4"]',
    '* GEN AI PROMPT: [Prompt komprehensif INGGRIS. WAJIB COPY-PASTE Base Anchor Visual secara 100% IDENTIK dari slide 1 + Ubah Aksi/Pose khusus slide ini. Harus ada "Make the aspect ratio 3:4". WAJIB TAMBAHKAN KALIMAT: "Do not add any text to the objects in the image other than what is explicitly instructed by the prompt."]'
)

with open("src/app/api/carousel-builder/generate/route.ts", "w") as f:
    f.write(content)
