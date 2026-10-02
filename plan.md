Halo! Saya sudah mempelajari secara mendalam semua error yang Anda laporkan dan membandingkan strukturnya dengan ATM Content Builder sesuai gambar yang Anda berikan. Anda benar, semuanya terasa tidak sinkron karena kegagalan penggabungan kode.

Berikut adalah analisa saya terhadap masalahnya:

1. **Error `isListening` & `setIsLoading` is not defined**: 
   Ini terjadi karena pada perbaikan sebelumnya, deklarasi variabel *state* (seperti `const [isLoading, setIsLoading] = useState(false)`) tidak sengaja terhapus, tetapi fungsinya masih dipanggil saat Anda menekan Enter/Send. Akibatnya aplikasi langsung crash.
2. **Pemilihan Model AI ada 2 & Posisinya Aneh**:
   Script Builder versi lama tidak menggunakan `GlobalChatbox`. Saat kemarin mencoba dipaksakan masuk, kode chatbox lamanya tidak terhapus bersih. Inilah yang menyebabkan style tombolnya berbeda, posisinya salah, dan sampai muncul 2 pilihan AI. 
3. **Warna Tombol Mic/Stop yang Berubah-ubah**:
   Karena masih menggunakan chatbox versi lama yang tumpang tindih, style dari `GlobalChatLayout` (yang seharusnya orange saat aktif dan merah saat stop) tidak teraplikasikan dengan sempurna.
4. **Kalender & Notifikasi Simpan Beda dengan ATM Builder**:
   Form kalender di Script Builder masih menggunakan desain lama. Padahal di ATM Builder, kalendernya lebih minimalis, form simpannya tidak memiliki tombol "Batal" di bawah, dan saat berhasil disimpan akan muncul layar hijau besar bertuliskan "Jadwal Tersimpan!".

### Rencana Eksekusi Saya (Sesuai Instruksi Anda)

Saya **tidak akan menyentuh kode dulu** sebelum Anda setuju. Jika Anda bilang "gas", saya akan melakukan:
- **Membersihkan File**: Merombak `ScriptBuilderClient.tsx` agar 100% menggunakan `<GlobalChatLayout>` yang sama dengan ATM Builder & Idea Rooms.
- **Sinkronisasi Style**: Tombol pemilihan model AI akan menggunakan style custom kotak melengkung (rounded-lg) seperti yang Anda sukai, dan letaknya akan rapi di dekat tombol plus. Warna Mic & Stop akan kembali sesuai pakem (orange & merah).
- **Menghapus Error**: Menggunakan *hook* `useAIChat()` dengan benar agar tidak ada lagi error `setIsLoading is not defined` atau `isListening is not defined`.
- **Copy-Paste Form Kalender**: Saya akan mencangkok persis form Kalender dan form Agenda Publikasi dari ATM Builder ke Script Builder agar visual dan efek notifikasi simpannya 100% sama (termasuk ikon check hijau besar).

Apakah analisanya sudah sesuai dengan yang Anda maksudkan? Silakan balas **"gas"** atau koreksi jika ada yang kurang, dan saya akan langsung rakit kodenya dengan sangat hati-hati!
