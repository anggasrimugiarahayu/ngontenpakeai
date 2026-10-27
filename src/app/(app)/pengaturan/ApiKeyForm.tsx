"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateApiKey, deleteApiKey } from "@/app/actions/pengaturan";
import { Key, Trash2, ExternalLink, Save, Loader2 } from "lucide-react";

import Swal from 'sweetalert2';
const confirmSwal = async (text: string) => {
  const result = await Swal.fire({
    title: text,
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    width: '400px',
    padding: '1.5rem',
    buttonsStyling: false,
    customClass: {
      popup: 'font-sans rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] shadow-xl',
      title: '!text-lg !font-semibold text-gray-900 dark:text-white !leading-snug !m-0',
      actions: 'w-full flex gap-3 mt-6 mb-0 justify-end',
      confirmButton: 'bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap outline-none border-none',
      cancelButton: 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap outline-none border-none',
    }
  });
  return result.isConfirmed;
};


interface ApiKeyFormProps {
  apiKey?: string | null;
}

export default function ApiKeyForm({ apiKey }: ApiKeyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [currentKey, setCurrentKey] = useState<string | null>(apiKey || null);

  useEffect(() => {
    if (apiKey !== undefined) {
      setCurrentKey(apiKey || null);
    }
  }, [apiKey]);

  const maskKey = (key: string) => {
    if (key.length <= 10) return "**********";
    return key.substring(0, 5) + "***********************" + key.substring(key.length - 4);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateApiKey(formData);

    if (result.success) {
      toast.success("API Key berhasil disimpan!");
      setCurrentKey(keyValue);
      setKeyValue("");
      
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!await confirmSwal("Apakah kamu yakin ingin menghapus API Key ini? Fitur AI akan kembali menggunakan limit dari sistem ruangcreativemuslim.")) {
      return;
    }

    setIsLoading(true);

    const result = await deleteApiKey();
    if (result.success) {
      toast.success("API Key berhasil dihapus!");
      setCurrentKey(null);
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
    setIsLoading(false);
  };

  return (
    <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
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
            autoComplete="new-password"
            placeholder="AIzaSy..."
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            required
            className="flex-1 w-full px-4 py-2.5 md:py-2 rounded-xl border border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !keyValue.trim()}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 md:py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold transition-all disabled:opacity-50 shadow-sm shadow-orange-500/20 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>

      
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-[#2C3246] pb-2">
          Key Aktif
        </h3>
        
        {currentKey ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-[#2C3246]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Google API Key</p>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{maskKey(currentKey)}</p>
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
