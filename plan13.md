Siap, saya menangkap 100% kegelisahan Anda tentang pengalaman penggunaan (UX) ini!

### Pemahaman Saya Atas Maksud Anda:
1. **Masalah (Ribet/Bolak-Balik)**: Saat ini, halaman utama (`/ruang-ngonten`) berisi 8 kartu raksasa (Master Blueprint, Idea Rooms, Script Builder, dll). Masalah utamanya adalah navigasi yang "terputus". Jika Anda sedang asyik menggunakan *Idea Room* dan ingin pindah ke *Script Builder*, Anda harus menekan tombol *Back* (kembali) ke halaman utama dulu, baru memilih kartu yang lain. Ini tentu sangat merepotkan alur kerja Anda.
2. **Keinginan Anda (Pindah ke Sidebar)**: Anda ingin menghancurkan desain 8 kartu besar di tengah layar tersebut dan mengubahnya menjadi **Menu Samping (Sidebar) permanen**. Dengan begitu, di mana pun Anda berada, daftar kedelapan *tools* AI tersebut akan selalu menempel di layar sebelah kiri. Anda jadi bisa melompat dari satu *tool* ke *tool* lainnya cukup dengan 1 kali klik!

### Rencana Eksekusi Saya (Sesuai perintah, belum ada kode yang disentuh):
1. **Membuat Sistem Layout Baru**: Saya akan membuat file `layout.tsx` khusus untuk area *workspace* Anda. Layar Desktop akan dibagi dua: sisi kiri untuk **Sidebar Navigasi**, dan sisi kanan (area luas) untuk **Ruang Kerja (Chatbox)**.
2. **Menyulap Kartu Menjadi Menu**: Kedelapan kartu besar tadi akan saya ubah desainnya menjadi daftar menu vertikal yang cantik, minimalis, dan elegan di dalam Sidebar, lengkap dengan ikon khas masing-masing *tool*.
3. **Respon untuk HP (Mobile)**: Karena layar HP tidak muat untuk Sidebar permanen, saya akan buatkan menu ini menjadi tombol *Hamburger* modern di pojok atau menu laci (*Drawer*) yang bisa digeser/diklik kapan saja tanpa menutupi layar utama.
4. **Halaman Kosong Dashboard**: Halaman utama "Mau mulai dari mana?" akan menjadi jauh lebih bersih, atau bahkan otomatis langsung membuka *Master Blueprint* agar Anda bisa langsung bekerja tanpa hambatan.

Apakah tangkapan saya tentang **Sidebar Navigasi** ini sudah persis seperti yang ada di kepala Anda? Jika setuju, silakan balas **"gas"** dan saya akan langsung merombak struktur total aplikasi Anda!
