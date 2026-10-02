Siap! Tantangan ini sangat menarik karena ini adalah "puzzle terakhir" untuk menyatukan Idea Room ke dalam ekosistem rapi yang sudah kita bangun.

Sesuai instruksi Anda (saya belum mengubah kodenya), berikut adalah **Rangkuman Permintaan Anda beserta Rencana Teknisnya**:

### Rangkuman Permintaan Anda
1. **Migrasi Ekosistem Global**: Memasukkan fitur Idea Room ke dalam keluarga "Cangkang Induk" (`GlobalChatbox`, `GlobalChatBubble`, `GlobalChatLayout`, `useAIChat`).
2. **Pemindahan "Otak Lama"**: Menyedot seluruh *logic*, terjemahan *prompt*, *flow*, serta daftar opsi di tombol Plus (+) (seperti *Ide Konten Funneling, Eksplor Angle, Riset Trend, dll*) dari kode aplikasi lama Anda ke sistem modern ini.
3. **Pembersihan Gaya Neo-Brutalism**: Anda tidak ingin lagi melihat tabel/kartu dengan gaya bayangan tebal, kotak-kotak ngejreng, atau garis hitam tebal. Tampilan hasil idenya harus diubah menjadi elegan, bersih, dan senada dengan desain fitur ATM & Script Builder kita saat ini.

### Rencana Eksekusi Saya (Langkah demi Langkah)

1. **Memindahkan Otak ke *Backend* (`api/idea-rooms/generate/route.ts`)**:
   Saya akan membongkar *file* API Idea Room dan memindahkan logika pintarnya. Misalnya, jika Anda memencet *"Ide Konten Funneling"*, API akan otomatis menerjemahkannya di belakang layar menjadi *"Tolong berikan rekomendasi 30 Ide (10 TOFU, 10 MOFU, 10 BOFU)..."* agar AI Gemini langsung paham, persis seperti kehebatan aplikasi lama Anda.
2. **Merakit Menu Plus (+) (`IdeaRoomsClient.tsx`)**:
   Saya akan mengembalikan kesembilan (9) tombol sakti dari aplikasi lama ke dalam colokan `renderPlusMenu`.
3. **Merombak Total Tampilan Hasil (Anti Neo-Brutalism)**:
   Saya akan membuang tampilan tabel raksasa dan kartu bergaya neo-brutalism lama Anda. Sebagai gantinya, saya akan merancang fungsi `renderCustomMessage` yang menghasilkan tumpukan **Kartu Ide (Idea Cards)**. 
   Kartu ini akan menggunakan gaya minimalis dengan garis putus-putus (*dashed border*), label huruf kapital kecil (*uppercase tracking-wide*), dan tombol aksi (Salin) yang modern—sama persis dengan gaya kartu di ATM Content Builder dan Script Builder.

Apakah peta rencana migrasi Idea Room ini sudah 100% cocok dengan keinginan Anda? Silakan berikan lampu hijau dengan membalas **"gas"** dan saya akan langsung merombaknya!
