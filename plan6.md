Baik, saya sangat mengerti.

Berikut adalah pemahaman saya atas dua poin permintaan Anda (saya belum mengubah kodenya):

### 1. Penyesuaian Style Badge (Label)
Saat ini *badge* pilihan Format dan Gaya Bahasa di *Script Builder* menggunakan blok warna solid (oranye dan biru) berbentuk kotak. Anda ingin ini diubah agar **senada dengan Carousel Builder**, yaitu menggunakan desain kapsul transparan yang elegan (warna dasar transparan dengan corak oranye tipis, teks oranye, garis tepi tipis, dan pinggiran bulat sempurna / *rounded-full*). Saya akan mengeksekusi ini.

### 2. Penjelasan Singkat: Apa Saja yang Diatur oleh "Global Chatbox"?
Komponen `GlobalChatbox` (serta `GlobalChatLayout`) yang sering kita bahas itu bertindak sebagai **"Cangkang Induk"**. Tujuannya agar semua *tools* di Ruang Ngonten punya seragam dan rasa yang sama persis. Hal-hal yang diatur secara sentral oleh sistem Global ini meliputi:

*   **Desain Rangka Input**: Warna *background*, lengkungan sudut, serta efek menyala (garis *orange*) saat Anda mengklik kolom teks untuk mulai mengetik.
*   **Kolom Ketikan Pintar**: Logika area teks yang bisa meninggi otomatis (*auto-resize*), serta mendeteksi tombol *keyboard* (Enter untuk kirim, Shift+Enter untuk baris baru).
*   **Logika Tombol Voice / Mic**: Mengatur tombol mikrofon berkedip dan berwarna *orange* saat mendengarkan suara Anda.
*   **Tombol Kirim & Stop**: Tombol pesawat kertas yang berubah aktif (*orange*) saat teks terisi, serta **tombol kotak warna merah** untuk menyetop atau membatalkan respon AI yang sedang berjalan.
*   **Menu Pilihan Model AI**: Tombol *dropdown* (Gemini 3.5 Flash, 2.5 Pro, dll) yang posisinya terkunci rapi di dekat area ketikan.
*   **Lubang Injeksi (Titik Sisip)**: Cangkang global ini dengan cerdas menyediakan "lubang kustom" (*props*) agar fitur seperti *Script Builder* bisa menyisipkan bagian khususnya sendiri. Contohnya:
    *   `renderPlusMenu`: Lubang untuk menyisipkan tombol Plus beserta isi pop-upnya.
    *   `modeBadge`: Lubang untuk menampilkan *badge* setelan di atas atau di dalam chatbox.
    *   `renderAttachmentPreview`: Lubang tempat munculnya gambar/video sebelum dikirim.

Dengan memakai "Cangkang Induk" ini, jika besok-besok kita ingin mengubah bentuk tombol mikrofon, kita cukup ubah di satu tempat, dan *semua* fitur (ATM, Carousel, Script, eBook) akan otomatis ikut berubah!

Apakah penjelasan ini cukup membantu dan rencana perbaikan *badge*-nya sudah bisa saya eksekusi sekarang? Silakan ketik **"gas"**!
