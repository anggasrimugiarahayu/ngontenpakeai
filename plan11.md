Ah, saya paham 100% maksud Anda! Terima kasih atas tangkapan *bug* yang sangat jeli ini.

### Pemahaman Saya Atas Maksud Anda:
Anda mendapati bahwa ketika mengklik tombol pintas/otomatis dari Menu Plus (+) seperti **"Cari Ide Konten"** (yang panjangnya cuma 15 huruf) atau **"Eksplor Angle"** (13 huruf), sistem tiba-tiba menolaknya dengan *error* *"minimal 20 karakter"*. 

Ini terjadi karena sistem keamanan global kita terlalu galak. Sistem menyamakan teks dari tombol otomatis dengan ketikan manual pengguna.
Keinginan Anda adalah:
1. **Ketikan Manual (Textarea)**: HARUS tetap dicegat jika kurang dari 20 huruf atau berisi teks asal-asalan.
2. **Tombol Pintas (Menu Plus)**: HARUS diberi "Jalur VIP" atau pengecualian (Bypass), karena teks tersebut adalah instruksi valid dari sistem, bukan ketikan iseng pengguna.

### Rencana Solusi Saya (Belum Saya Kerjakan):
1. **Memberikan Stempel VIP**: Saya akan memodifikasi logika di `IdeaRoomsClient.tsx` sehingga ketika tombol dari Menu Plus diklik, pesan tersebut akan dikirimkan ke mesin dengan stempel rahasia `isShortcut: true`. (Jika diketik manual dari tombol enter/send, stempel ini tidak ada).
2. **Membuat Pengecualian di Mesin (`useAIChat.ts`)**: Saya akan mengajari mesin keamanan kita untuk membiarkan pesan lewat (meskipun kurang dari 20 huruf) **ASALKAN** pesan tersebut membawa stempel `isShortcut: true`.

Dengan cara ini, ketikan manual akan tetap aman dan terkunci minimal 20 huruf, tapi semua tombol pintasan Anda akan berfungsi mulus seperti sedia kala!

Apakah pemahaman dan rencana solusi ini sudah tepat sasaran? Jika iya, ketik **"gas"** dan akan langsung saya perbaiki!
