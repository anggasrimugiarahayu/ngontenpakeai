"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  updateApiKey,
  deleteApiKey,
  updateGroqApiKey,
  deleteGroqApiKey,
} from "@/app/actions/pengaturan";
import { Key, Trash2, ExternalLink, Save, Loader2 } from "lucide-react";

import Swal from "sweetalert2";
const confirmSwal = async (text: string) => {
  const result = await Swal.fire({
    title: text,
    showCancelButton: true,
    confirmButtonText: "Ya, Lanjutkan",
    cancelButtonText: "Batal",
    width: "400px",
    padding: "1.5rem",
    buttonsStyling: false,
    customClass: {
      popup:
        "font-sans rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] shadow-xl",
      title:
        "!text-lg !font-semibold text-gray-900 dark:text-white !leading-snug !m-0",
      actions: "w-full flex gap-3 mt-6 mb-0 justify-end",
      confirmButton:
        "bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap outline-none border-none",
      cancelButton:
        "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap outline-none border-none",
    },
  });
  return result.isConfirmed;
};

interface ApiKeyFormProps {
  apiKey?: string | null;
  groqApiKey?: string | null;
}

export default function ApiKeyForm({ apiKey, groqApiKey }: ApiKeyFormProps) {
  // Google API Key State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleKeyValue, setGoogleKeyValue] = useState("");
  const [currentGoogleKey, setCurrentGoogleKey] = useState<string | null>(
    apiKey || null
  );

  // Groq API Key State
  const [isGroqLoading, setIsGroqLoading] = useState(false);
  const [groqKeyValue, setGroqKeyValue] = useState("");
  const [currentGroqKey, setCurrentGroqKey] = useState<string | null>(
    groqApiKey || null
  );

  useEffect(() => {
    if (apiKey !== undefined) {
      setCurrentGoogleKey(apiKey || null);
    }
  }, [apiKey]);

  useEffect(() => {
    if (groqApiKey !== undefined) {
      setCurrentGroqKey(groqApiKey || null);
    }
  }, [groqApiKey]);

  const maskKey = (key: string) => {
    if (key.length <= 10) return "**********";
    return (
      key.substring(0, 5) + "***********************" + key.substring(key.length - 4)
    );
  };

  // Google handlers
  const handleSaveGoogle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGoogleLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateApiKey(formData);

    if (result.success) {
      toast.success("Google API Key berhasil disimpan!");
      setCurrentGoogleKey(googleKeyValue);
      setGoogleKeyValue("");
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
    setIsGoogleLoading(false);
  };

  const handleDeleteGoogle = async () => {
    if (
      !(await confirmSwal(
        "Apakah kamu yakin ingin menghapus Google API Key ini? Fitur AI akan kembali menggunakan limit dari sistem ruangcreativemuslim."
      ))
    ) {
      return;
    }

    setIsGoogleLoading(true);
    const result = await deleteApiKey();
    if (result.success) {
      toast.success("Google API Key berhasil dihapus!");
      setCurrentGoogleKey(null);
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
    setIsGoogleLoading(false);
  };

  // Groq handlers
  const handleSaveGroq = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGroqLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateGroqApiKey(formData);

    if (result.success) {
      toast.success("Groq API Key berhasil disimpan!");
      setCurrentGroqKey(groqKeyValue);
      setGroqKeyValue("");
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
    setIsGroqLoading(false);
  };

  const handleDeleteGroq = async () => {
    if (
      !(await confirmSwal(
        "Apakah kamu yakin ingin menghapus Groq API Key ini? Fitur AI akan kembali menggunakan limit dari sistem ruangcreativemuslim."
      ))
    ) {
      return;
    }

    setIsGroqLoading(true);
    const result = await deleteGroqApiKey();
    if (result.success) {
      toast.success("Groq API Key berhasil dihapus!");
      setCurrentGroqKey(null);
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
    setIsGroqLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. GROQ API KEY CARD */}
      <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Key className="w-5 h-5 text-orange-500" /> Groq API Key
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Masukkan Groq API Key milik kamu sendiri untuk mendapatkan proses generate super cepat (Llama 3.3 / Llama 3.1) dan melewati batasan kuota sistem.
          </p>
        </div>

        <div className="mb-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
          <h3 className="text-sm font-bold text-orange-700 dark:text-orange-500 mb-2">
            Cara mendapatkan Groq API Key:
          </h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1.5 mb-4">
            <li>
              Buka{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 font-medium hover:underline"
              >
                Groq Console
              </a>{" "}
              dan login dengan akun Google atau GitHub.
            </li>
            <li>
              Klik tombol <strong>Create API Key</strong> (Buat API key).
            </li>
            <li>
              Salin (Copy) key yang diberikan, biasanya berawalan{" "}
              <code className="bg-orange-500/10 px-1 py-0.5 rounded text-orange-700 dark:text-orange-400">
                gsk_...
              </code>
            </li>
            <li>
              Tempelkan (Paste) di kolom bawah ini dan klik{" "}
              <strong>Simpan Perubahan</strong>.
            </li>
          </ol>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Dapatkan Groq API Key Gratis
          </a>
        </div>

        <form onSubmit={handleSaveGroq} className="space-y-4 mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Simpan / Perbarui Groq API Key
          </label>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="password"
              name="groqApiKey"
              autoComplete="new-password"
              placeholder="gsk_..."
              value={groqKeyValue}
              onChange={(e) => setGroqKeyValue(e.target.value)}
              required
              className="flex-1 w-full px-4 py-2.5 md:py-2 rounded-xl border border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isGroqLoading || !groqKeyValue.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 md:py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold transition-all disabled:opacity-50 shadow-sm shadow-orange-500/20 cursor-pointer"
            >
              {isGroqLoading ? (
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

          {currentGroqKey ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-[#2C3246]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Groq API Key
                  </p>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {maskKey(currentGroqKey)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteGroq}
                disabled={isGroqLoading}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                title="Hapus API Key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum ada Groq API key yang aktif. Kamu sedang menggunakan kuota sistem.
            </p>
          )}
        </div>
      </div>

      {/* 2. GOOGLE GEMINI API KEY CARD */}
      <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" /> Google API Key
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Masukkan Google API Key milik kamu sendiri (mis. Gemini API) untuk digunakan sebagai model cadangan. Key kamu disimpan dengan aman dan hanya kamu yang bisa menggunakannya.
          </p>
        </div>

        <div className="mb-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
          <h3 className="text-sm font-bold text-orange-700 dark:text-orange-500 mb-2">
            Cara mendapatkan Google API Key:
          </h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1.5 mb-4">
            <li>
              Buka{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 font-medium hover:underline"
              >
                Google AI Studio
              </a>{" "}
              dan login dengan akun Google.
            </li>
            <li>
              Klik tombol <strong>Create API key</strong> (Buat API key).
            </li>
            <li>
              Salin (Copy) key yang diberikan, biasanya berawalan{" "}
              <code className="bg-orange-500/10 px-1 py-0.5 rounded text-orange-700 dark:text-orange-400">
                AIzaSy...
              </code>
            </li>
            <li>
              Tempelkan (Paste) di kolom bawah ini dan klik{" "}
              <strong>Simpan Perubahan</strong>.
            </li>
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

        <form onSubmit={handleSaveGoogle} className="space-y-4 mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Simpan / Perbarui Google API Key
          </label>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="password"
              name="apiKey"
              autoComplete="new-password"
              placeholder="AIzaSy..."
              value={googleKeyValue}
              onChange={(e) => setGoogleKeyValue(e.target.value)}
              required
              className="flex-1 w-full px-4 py-2.5 md:py-2 rounded-xl border border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isGoogleLoading || !googleKeyValue.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 md:py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold transition-all disabled:opacity-50 shadow-sm shadow-orange-500/20 cursor-pointer"
            >
              {isGoogleLoading ? (
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

          {currentGoogleKey ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-[#2C3246]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Google API Key
                  </p>
                  <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {maskKey(currentGoogleKey)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteGoogle}
                disabled={isGoogleLoading}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                title="Hapus API Key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum ada API key yang aktif. Kamu sedang menggunakan kuota sistem.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
