"use client";

import { useState } from "react";
import { updateApiKey, deleteApiKey } from "./actions";
import { Key, Trash2, ExternalLink } from "lucide-react";

interface ApiKeyFormProps {
  apiKey?: string | null;
}

export default function ApiKeyForm({ apiKey }: ApiKeyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const maskKey = (key: string) => {
    if (key.length <= 10) return "**********";
    return key.substring(0, 5) + "***********************" + key.substring(key.length - 4);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateApiKey(formData);

    if (result.success) {
      setMessage({ type: "success", text: "API Key berhasil disimpan!" });
    } else {
      setMessage({ type: "error", text: result.error || "Terjadi kesalahan" });
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Apakah kamu yakin ingin menghapus API Key ini? Fitur AI akan kembali menggunakan limit dari sistem Ngonten Pakai AI.")) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await deleteApiKey();
    if (result.success) {
      setMessage({ type: "success", text: "API Key berhasil dihapus!" });
    } else {
      setMessage({ type: "error", text: result.error || "Terjadi kesalahan" });
    }
    setIsLoading(false);
  };

  return (
    <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Key className="w-5 h-5" /> Google API Key
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Masukkan Google API Key milik kamu sendiri (mis. Gemini API) untuk melewati batasan kuota sistem. Key kamu disimpan dengan aman dan hanya kamu yang bisa menggunakannya.
        </p>
      </div>

      <div className="mb-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
        <h3 className="text-sm font-bold text-orange-700 dark:text-orange-500 mb-2">Cara mendapatkan Google API Key:</h3>
        <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1.5 mb-4">
          <li>Buka <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 font-medium hover:underline">Google AI Studio</a> dan login dengan akun Google.</li>
          <li>Klik tombol <strong>Create API key</strong> (Buat API key).</li>
          <li>Salin (Copy) key yang diberikan, biasanya berawalan <code className="bg-orange-500/10 px-1 py-0.5 rounded text-orange-700 dark:text-orange-400">AIzaSy...</code></li>
          <li>Tempelkan (Paste) di kolom bawah ini dan klik <strong>Simpan</strong>.</li>
        </ol>
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Dapatkan API Key Gratis
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-4 mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Simpan / Perbarui API Key
        </label>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <input
            type="password"
            name="apiKey"
            placeholder="AIzaSy..."
            required
            className="flex-1 w-full px-4 py-2.5 md:py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-6 py-2.5 md:py-2 rounded-lg bg-orange-700/80 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      {message && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-white/5 pb-2">
          Key Aktif
        </h3>
        
        {apiKey ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Google API Key</p>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{maskKey(apiKey)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Hapus API Key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada API key yang aktif. Kamu sedang menggunakan kuota sistem.</p>
        )}
      </div>
    </div>
  );
}
