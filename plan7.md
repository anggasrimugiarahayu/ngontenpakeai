Pertanyaan yang sangat bagus! Memang betul, penanganan *error* juga merupakan bagian krusial dari ekosistem global kita.

Berikut adalah penjelasan lengkap tentang **Penanganan Error** dan **Fungsi-Fungsi yang tergabung ke dalam ekosistem Chatbox Global** kita:

### 1. Sistem Penanganan Error Global (Terpusat)
Penanganan *error* di sistem kita ditangani oleh kerangka belakang layar bernama `useAIChat` dan divisualisasikan oleh `GlobalChatBubble`. Ini yang dilakukannya:

*   **Penerjemah Error Otomatis (*Friendly Error*)**: Jika AI atau *server* Google mengalami masalah teknis (misalnya: *Quota Exceeded / Limit API Key habis*, *Server 500 Down*, atau *Network Timeout*), sistem kita tidak akan memuntahkan kode komputer yang jelek. Sistem akan menangkapnya dan menerjemahkannya ke kalimat bahasa Indonesia yang ramah (contoh: *"Limit API Key Anda sudah habis..."*).
*   **Filter Anti-Sampah (*Gibberish Handler*)**: Mencegat teks ketikan asal (seperti *"dadsdsad"*) agar tidak menghabiskan kuota API Anda.
*   **Pencegahan Tekan Berkali-kali (*Double-Submit*)**: Menolak pengiriman pesan baru jika proses AI sebelumnya masih berstatus *loading*.
*   **Pembatalan (*Abort Control*)**: Jika tombol *Stop* ditekan, proses koneksi ke AI langsung diputus secara paksa dan memunculkan notifikasi "Proses dibatalkan."
*   **Tampilan Error Visual (*Error Bubble UI*)**: Pesan-pesan gagal di atas tidak akan ditampilkan dengan balon obrolan (*bubble chat*) biasa. Sistem secara cerdas akan mendeteksinya (`is_error: true`) dan menampilkannya sebagai **kotak peringatan berwarna merah** lengkap dengan ikon *Warning*, agar Anda tahu itu bukan hasil jawaban AI, melainkan notifikasi kendala.

---

### 2. Kesimpulan: Apa Saja yang Tergabung di Ekosistem Chatbox Global?
Secara keseluruhan, jika kita membicarakan "Global Chatbox Layout", kita sebenarnya membicarakan **3 fondasi utama** yang bekerja sama:

1.  **Cangkang Input (`GlobalChatbox`)**: Area Anda mengetik. Mengatur desain membulat, warna fokus *orange*, tombol Mikrofon, batas tinggi *auto-resize*, tombol *Stop* (merah), dan daftar pilihan Model AI.
2.  **Balon Obrolan (`GlobalChatBubble`)**: Area hasil. Mengubah teks mentah dari AI menjadi tulisan rapi (*Markdown*), memberikan *styling* pada teks tebal/miring, menampilkan animasi transisi saat pesan baru muncul, dan membedakan mana balasan normal (abu-abu/hitam) dan mana *error* (merah).
3.  **Otak Penghubung (`useAIChat`)**: Mesin di belakang layar yang menangani lalu lintas datanya. Mengirimkan pesan Anda ke API, menerjemahkan *error*, menahan *gibberish*, dan memberitahu UI bahwa AI sedang dalam mode *loading*.

Semua fungsi krusial di atas bersifat **global**. Artinya, cukup diprogram satu kali, dan fitur ATM Builder, Carousel Builder, Script Builder, maupun eBook Prompt Builder langsung menikmati seluruh fitur dan keamanannya secara otomatis.

Apakah penjabaran sistem error dan ekosistem global ini cukup memperjelas bagaimana canggihnya fondasi aplikasi Anda dibangun? Jika sudah paham, silakan balas **"gas"** dan saya akan langsung merombak *style badge* di Script Builder menjadi bergaya transparan elegan seperti Carousel!
