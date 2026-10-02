Siap! Saya sudah mempelajari referensi *Script Builder* neo-brutalist lama Anda dan membandingkannya dengan komponen *ATM Content Builder* yang baru.

Berikut adalah pemahaman saya atas permintaan Anda (saya belum mengubah kode apa pun):

1. **Untuk Isian Tombol Plus (Sesuai Referensi Lama)**:
   Saya menyadari bahwa opsi *Gaya Bahasa* yang saya masukkan tadi salah. Saya harus mengembalikannya ke daftar asli dari neo-brutalist lama: `['Storytelling', 'Edukatif', 'Profesional', 'Santai', 'Humor', 'Inspiratif', 'Motivasi', 'Blak-blakan & Kritis']`. Format *Carousel* dan *Reels* juga akan disesuaikan. Estimasi Durasi akan saya hilangkan dari menu utama jika memang di versi lama tidak ada. Semuanya akan disajikan dengan desain modern kita, bukan *neo-brutalist*.

2. **Untuk Otak, Flow, dan Prompting**:
   Kabar baiknya, API *backend* `/api/script-builder/generate` yang saat ini kita gunakan **sudah 100% identik** dengan referensi lama. Ia sudah memuat *System Prompt* yang persis sama (menggunakan injeksi *Hooks Database*, *CTA Database*, dan *JSON truncate recovery*). Yang perlu saya pastikan hanyalah `ScriptBuilderClient.tsx` mengirimkan *payload* yang persis sama saat `generateScript` dipanggil.

3. **Untuk Tampilan Card/Table Variasi Naskah**:
   Saya paham maksud Anda. Saat ini kartu hasil variasi di Script Builder menggunakan kotak-kotak abu-abu solid. Anda ingin tampilannya **senada dengan ATM Content Builder**, di mana setiap bagian naskah (seperti *Hook, Body, CTA*) dipisahkan dengan garis putus-putus elegan (*dashed border*) dan tulisan label kecil (*uppercase tracking-wider*), serta penempatan tombol "Jadwalkan" dan "Salin" yang persis sama di bagian atas kartu.

### Rencana Eksekusi Saya:
1. Menyesuaikan daftar *Gaya Bahasa* dan opsi di dalam tombol Plus persis seperti versi lama (tapi dengan desain modern).
2. Merombak UI kartu *output* naskah agar 100% identik (tabel garis putus-putus) dengan *ATM Content Builder*.
3. Memastikan variabel yang dikirim ke AI *prompting* selaras dengan sistem lama.

Apakah pemahaman dan rencana saya ini sudah 100% tepat sesuai dengan visi Anda? Silakan balas **"gas"** dan saya akan langsung mengeksekusinya!
