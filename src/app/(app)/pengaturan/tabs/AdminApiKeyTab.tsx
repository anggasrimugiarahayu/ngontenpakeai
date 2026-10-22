"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Key, ExternalLink, Trash2 } from "lucide-react";
import { saveAppSetting, deleteAppSetting } from "@/app/actions/adminSettings";
import { confirmSwal } from "./confirmSwal";

export function AdminApiKeyTab({ settings }: { settings: any[] }) {
  const initialApiKey =
    settings?.find((s: any) => s.key === "DEFAULT_GEMINI_API_KEY")?.value || "";
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState(initialApiKey);
  const [loading, setLoading] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    await saveAppSetting("DEFAULT_GEMINI_API_KEY", apiKey);
    setSavedKey(apiKey);
    setApiKey("");
    toast.success("API Key berhasil disimpan!");
    setLoading(false);
  };

  const handleDeleteApiKey = async () => {
    if (!(await confirmSwal("Yakin ingin menghapus API Key Global?"))) return;
    setLoading(true);
    await deleteAppSetting("DEFAULT_GEMINI_API_KEY");
    setApiKey("");
    setSavedKey("");
    toast.success("API Key berhasil dihapus!");
    setLoading(false);
  };

  const getMaskedKey = (key: string) => {
    if (!key) return "";
    if (key.length < 10) return "••••••••••••••••";
    return (
      key.substring(0, 6) +
      "••••••••••••••••" +
      key.substring(key.length - 4)
    );
  };

  return (
    <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          <Key className="w-5 h-5" /> Pengaturan API Key Global
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Atur Default API Key yang akan digunakan oleh sistem jika pengguna tidak memasukkan API Key mereka sendiri.
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
            Tempelkan (Paste) di kolom bawah ini dan klik <strong>Simpan</strong>.
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

      <div className="space-y-4 mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Simpan / Perbarui API Key
        </label>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            autoComplete="new-password"
            name="adminApiKey"
            className="flex-1 w-full px-4 py-2.5 md:py-2 rounded-xl border border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={handleSaveApiKey}
            disabled={loading || !apiKey.trim()}
            className="w-full md:w-auto px-6 py-2.5 md:py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold transition-all disabled:opacity-50 shadow-sm shadow-orange-500/20 cursor-pointer"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-[#2C3246] pb-2">
          Key Aktif
        </h3>

        {savedKey ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0A1128] rounded-xl border border-gray-200 dark:border-[#2C3246]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Google API Key Global
                </p>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {getMaskedKey(savedKey)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteApiKey}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Hapus API Key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Belum ada API key global yang aktif. Sistem mungkin sedang menggunakan kuota .env jika ada.
          </p>
        )}
      </div>
    </div>
  );
}
