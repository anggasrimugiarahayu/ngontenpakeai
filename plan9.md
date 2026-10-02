Siap! Ide Anda ini brilian sekali, sangat elegan untuk memaksa pengguna (user) memberikan konteks yang jelas alih-alih cuma mengetik kalimat seadanya. 

Sesuai instruksi Anda (saya belum menyentuh kodenya sama sekali), berikut adalah **Rangkuman Permintaan Anda beserta Rencana Teknisnya**:

### Rangkuman Permintaan Anda
1. **Syarat Minimal**: User wajib mengetik minimal **20 karakter** agar bisa memproses AI.
2. **Indikator Visual**: Harus ada fitur *Character Counter* (penghitung huruf) yang terlihat langsung oleh user di dalam *chatbox*.
3. **Sistem Terpusat (Global)**: Aturan dan fitur visual ini harus dipasang di "Cangkang Induk" sehingga otomatis berlaku serentak untuk Script Builder, ATM Builder, Carousel Builder, dan eBook Builder.

### Rencana Eksekusi Saya (Jika Anda Setuju)
Untuk mewujudkannya, saya akan melakukan modifikasi pada kerangka global kita dengan 3 langkah berikut:

1. **Memasang Penghitung Karakter di UI (`GlobalChatbox.tsx`)**:
   Saya akan menambahkan teks kecil yang rapi (misal: `12 / 20`) di bagian bawah *chatbox* (di dekat tombol kirim). Teks ini akan berwarna merah jika karakter masih kurang, dan berubah normal jika sudah memenuhi syarat.
2. **Mematikan Tombol Kirim Secara Otomatis**:
   Tombol *Kirim* (pesawat kertas) akan tetap terkunci (berwarna abu-abu/disabled) jika ketikan user masih di bawah 20 karakter. 
   *(Catatan Khusus: Khusus untuk ATM Builder, jika user sudah mengunggah video/gambar, saya akan membuat sistemnya mentoleransi aturan ini, sehingga mereka tetap bisa menekan Kirim tanpa harus mengetik panjang).*
3. **Lapis Keamanan Ganda di Mesin (`useAIChat.ts`)**:
   Selain mengubah rumusan *Gibberish* (Anti-Teks Asal) yang kita bahas di sesi sebelumnya, saya juga akan menambahkan aturan "Minimal 20 Karakter" di otak *backend* ini. Jadi, kalaupun ada user yang mencoba mengakali tombol kirim, sistem akan memblokirnya dengan notifikasi merah: *"Pesan terlalu pendek. Mohon jelaskan lebih detail (minimal 20 karakter)."*

Apakah rangkuman dan rencana eksekusi (termasuk *Gibberish Filter* yang tadi) sudah 100% sesuai dengan yang Anda bayangkan di kepala? Jika "YA", silakan balas **"gas"** dan saya akan merombak semuanya sekarang!
