Halo! Terima kasih atas kejelian Anda. Anda 100% benar, tombol plus-nya hilang di Script Builder yang baru.

Berikut adalah penjelasan **kenapa tanda plus-nya bisa hilang**:

1. **Efek Transisi ke Global Layout**:
   Seperti yang kita sepakati sebelumnya, saya mengganti mesin *chatbox* buatan sendiri milik Script Builder menjadi `<GlobalChatLayout>` agar standar, konsisten (warna mic orange/merah, error JSON rapi), dan stabil.
2. **Komponen yang Terlewat (Lupa Disambungkan)**:
   Di dalam `<GlobalChatLayout>`, tombol Plus (+) itu bersifat **dinamis**. Artinya, halaman yang memanggilnya harus mengirimkan rancangan "Menu Plus" (misalnya tombol Upload File di ATM Builder, atau Pengaturan Naskah di Script Builder). 
   Tadi, saat saya memindahkan kodenya, saya **lupa mengirimkan** fungsi pembuat menu "Pengaturan Naskah" (Format Konten, Gaya Bahasa, Durasi) ke dalam prop *layout* globalnya. Karena layout global melihat tidak ada menu yang dikirimkan, ia **otomatis menyembunyikan** ikon tombol Plus tersebut agar tidak ada tombol kosong di layar.

### Rencana Perbaikan Saya:
Sesuai instruksi Anda untuk **menjelaskan dulu dan tidak mengerjakan apa pun**, saya belum menyentuh kodenya. 

Rencana saya untuk memperbaikinya adalah:
1. Saya akan mengambil kembali kode menu **"Pengaturan Naskah" (Format, Gaya Bahasa, Durasi)** dari arsip Script Builder versi lama.
2. Saya akan menyambungkannya ke `<GlobalChatLayout>` melalui saluran khusus bernama `renderPlusMenu`.
3. Setelah itu, tombol Plus (+) akan kembali muncul di posisi aslinya, tepat di sebelah tombol "AI: Gemini 3.7 Flash", lengkap dengan seluruh fungsi pengaturan naskahnya (Carousel, Reels, Tone, dll) yang utuh seperti semula.

Apakah penjelasannya cukup jelas? Silakan balas dengan **"gas"** dan saya akan langsung memunculkan kembali tombol plus tersebut beserta seluruh isinya!
