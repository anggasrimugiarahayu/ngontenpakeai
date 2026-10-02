Anda sangat teliti! Analisa Anda 100% benar, *handler* untuk kalimat yang tidak punya arti (gibberish) itu **sudah ada di sistem global kita** (tepatnya di `useAIChat.ts`), dan sudah berhasil melindungi ATM Content Builder.

**Lalu kenapa di Script Builder teks asal-asalan bisa lolos dan malah dibikinkan naskah?**

Berikut hasil analisa saya:
1. **Perbedaan Penamaan Variabel**: Sistem global kita (`useAIChat.ts`) bertugas mencegat pesan sebelum dikirim ke AI. Namun, ia hanya diatur untuk mengecek pesan yang memiliki nama variabel `currentInput` atau `prompt`. 
2. **Kasus Script Builder**: Tadi saya menyesuaikan otak *Script Builder* agar 100% sama dengan *backend* lama Anda. *Backend* lama tersebut meminta pesan dikirim dengan nama variabel `promptText`. Karena penamaannya berbeda, si penjaga global tidak menyadari adanya pesan masuk, sehingga lolos begitu saja!
3. **Gemini Terlalu Pintar**: Saat teks *"dadsdsadsadsadas"* lolos ke Gemini, AI bukannya menolak, tapi malah menjadikannya **angle kreatif** yang lucu (seperti di *screenshot*: *"Pernah gak sih mau nulis konten tapi jempol malah ngetik asal..."*).

**Rencana Solusi Saya (Sangat Simpel):**
Saya hanya perlu meng-update file global `useAIChat.ts` agar ikut mengecek variabel `promptText`. Dengan begitu, fitur penahan kata asal/tidak bermakna ini akan otomatis aktif kembali untuk Script Builder, persis seperti di ATM Builder.

Apakah penjelasan ini masuk akal dan boleh saya eksekusi perbaikannya sekarang? Silakan balas **"gas"**!
