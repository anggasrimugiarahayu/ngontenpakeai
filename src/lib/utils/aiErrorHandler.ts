export function getFriendlyErrorMessage(error: any): string {
  if (!error) return "Maaf, terjadi kesalahan yang tidak diketahui.";

  let errorMsg = typeof error === 'string' ? error : (error.message || String(error));
  
  // Try to parse JSON inside the string (e.g., raw Gemini error strings)
  try {
    const jsonMatch = errorMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error && parsed.error.message) {
        errorMsg = parsed.error.message;
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  const lowerMsg = errorMsg.toLowerCase();

  if (lowerMsg.includes('high demand') || lowerMsg.includes('503') || lowerMsg.includes('unavailable')) {
    return 'Server AI sedang sangat sibuk (High Demand). Mohon tunggu sejenak lalu coba lagi, atau silakan ganti dengan pilihan Model AI yang lain! 🔄';
  }
  
  if (lowerMsg.includes('quota') || lowerMsg.includes('429') || lowerMsg.includes('exhausted')) {
    return 'Limit API Key Anda sudah habis atau terlalu banyak permintaan (Quota Exceeded). Coba gunakan API Key lain atau tunggu sejenak. 🔑';
  }

  if (lowerMsg.includes('fetch failed') || lowerMsg.includes('network error') || lowerMsg.includes('failed to fetch')) {
    return 'Gagal terhubung ke jaringan. Pastikan koneksi internet Anda stabil dan coba lagi. 🌐';
  }

  if (lowerMsg.includes('api key not valid') || lowerMsg.includes('400') || lowerMsg.includes('api_key') || lowerMsg.includes('invalid api key')) {
    return 'API Key yang dimasukkan tidak valid. Silakan periksa kembali pengaturan API Key Anda. ⚙️';
  }

  if (lowerMsg.includes('safety') || lowerMsg.includes('blocked')) {
    return 'Permintaan diblokir oleh sistem keamanan AI. Coba hindari kata-kata sensitif dan ulangi lagi. 🛡️';
  }

  if (lowerMsg.includes('abort') || lowerMsg.includes('dibatalkan')) {
    return 'Proses dibatalkan oleh pengguna. 🛑';
  }

  return `Maaf, sistem gagal memproses permintaan. (Info: ${errorMsg.substring(0, 80)}...). Silakan coba lagi. ⚠️`;
}
