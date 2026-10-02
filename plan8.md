Astaga, Anda benar sekali! Ini memang sangat menjengkelkan. Saya mengerti kenapa Anda protes. 

Berikut adalah hasil analisa teknis saya (saya belum mengubah apa pun di kode):

### Kenapa Ketikan Asal Bisa Lolos Terus?
Setelah saya bedah kode di dalam `useAIChat.ts`, ternyata **salurannya memang sudah benar, TETAPI "otak" penjaganya (fungsi `isGibberish`) yang terlalu bodoh/lemah.**

Ini rincian kelemahan aturan penjaga keamanan kita saat ini:
1. **Kenapa huruf "A" atau angka "1" lolos?**
   Saat ini, sistem hanya akan memblokir jika Anda mengetik huruf yang sama persis sebanyak minimal **5 kali berurutan** (contoh: "aaaaa"). Jadi, kalau Anda hanya mengetik "A", "1", "haii", atau "oke", penjaga menganggap itu sah-sah saja dan meloloskannya ke AI.
2. **Kenapa kalimat "dadadasd" lolos?**
   Aturan *anti-keyboard mashing* (cegah ketik asal) saat ini mengharuskan ada pola baku berjejer (seperti "asd" atau "das") yang diketik **minimal 2 kali berturut-turut** tanpa jeda (seperti "asdasd"). Ketika Anda mengetik "dadadasd", polanya tidak dikenali oleh rumus tersebut, sehingga sistem mengira itu adalah singkatan gaul atau nama merk, lalu meloloskannya.
3. **Akibatnya di AI**:
   Karena penjaga di pintu depan tertipu dan meloloskan teks "dadadasd" atau "A", teks itu sampai ke AI Gemini. Karena AI Gemini sudah di-setting sangat kreatif untuk Script Builder, ia akhirnya "memaksa" mencari-cari celah untuk membuat naskah dari karakter aneh tersebut.

### Rencana Solusi (Perombakan Filter)
Sistem *Gibberish Filter* ini harus dirombak total agar jauh lebih pintar. Saya berencana memperbarui rumusnya menjadi seperti ini:
1.  **Blokir Teks Terlalu Pendek**: Blokir otomatis semua input yang panjangnya di bawah 4 karakter (seperti "A", "1", "ok", "tes") kecuali kita buat pengecualian khusus. Tapi untuk amannya, kita paksa user mengetik minimal 4 huruf (misal: "ide konten").
2.  **Blokir Minim Vokal**: Jika sebuah kata tidak punya huruf vokal (a,i,u,e,o) sama sekali, langsung blokir (contoh: "qwrtp", "dfghj").
3.  **Blokir Pengulangan Konsonan**: Jika ada huruf mati (konsonan) berjejer lebih dari 4 kali (contoh: "nggkkl"), langsung blokir.
4.  **Perketat Pola Asal**: Memblokir variasi ketikan *keyboard* ngawur ("dada", "sada", "asdf") dengan rumus yang jauh lebih sensitif dari sebelumnya.

Jika semua *rules* di atas saya suntikkan ke `useAIChat.ts`, maka **seluruh fitur** (Script, ATM, Carousel, eBook) akan otomatis menjadi kebal terhadap huruf "A", "1", atau "dadadasd". 

Apakah analisa ini menjelaskan teka-teki kenapa "dadadasd" bisa lolos? Jika Anda setuju dengan rumusan filter baru saya, silakan ketik **"gas"** dan saya akan langsung merombak filternya!
