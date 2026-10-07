"use client";

import { useState } from "react";
import { saveAppSetting } from "./admin-actions";
import { Save, CheckCircle2 } from "lucide-react";

export function PricingConfigSection({ products, settings }: { products: any[], settings: any[] }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const settingRaw = settings.find((s) => s.key === "PRICING_PACKAGES")?.value;
  let initialConfig = {
    PRO_BASIC: { name: "Paket E-Book", price: 99000, desc: "Akses E-Book Premium", bundledProductIds: [] },
    PRO_TOOLS: { name: "Paket Ruang Ngonten", price: 149000, desc: "Akses Semua Tools 30 Hari", bundledProductIds: [] },
    PRO_LENGKAP: { name: "Paket Lengkap", price: 199000, desc: "Akses Tools + E-Book Lengkap", bundledProductIds: [] },
  };

  try {
    if (settingRaw) {
      initialConfig = JSON.parse(settingRaw);
    }
  } catch (e) {}

  const [config, setConfig] = useState<any>(initialConfig);

  const handleCheckbox = (paketKey: string, productId: string) => {
    setConfig((prev: any) => {
      const isChecked = prev[paketKey].bundledProductIds.includes(productId);
      let newIds = [...prev[paketKey].bundledProductIds];
      if (isChecked) {
        newIds = newIds.filter((id: string) => id !== productId);
      } else {
        newIds.push(productId);
      }
      return {
        ...prev,
        [paketKey]: { ...prev[paketKey], bundledProductIds: newIds }
      };
    });
  };

  const handleTextChange = (paketKey: string, field: string, val: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [paketKey]: { ...prev[paketKey], [field]: val }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg("");
    try {
      await saveAppSetting("PRICING_PACKAGES", JSON.stringify(config));
      setSuccessMsg("Berhasil menyimpan konfigurasi pricing!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      alert("Gagal menyimpan");
    }
    setLoading(false);
  };

  const renderPaketConfig = (paketKey: string, title: string) => {
    return (
      <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214] mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nama Paket</label>
            <input 
              type="text" 
              value={config[paketKey].name} 
              onChange={(e) => handleTextChange(paketKey, "name", e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Harga (Rp)</label>
            <input 
              type="number" 
              value={config[paketKey].price} 
              onChange={(e) => handleTextChange(paketKey, "price", parseInt(e.target.value) || 0)}
              className="w-full bg-gray-50 dark:bg-[#18181b] border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
            />
          </div>
        </div>

        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Pilih E-Book yang Otomatis Didapat (Bundling)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((p) => (
                <label key={p.id} className="flex items-start gap-2 p-3 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config[paketKey].bundledProductIds.includes(p.id)}
                    onChange={() => handleCheckbox(paketKey, p.id)}
                    className="mt-0.5 rounded text-rn-accent focus:ring-rn-accent border-gray-300 dark:border-gray-700 dark:bg-[#121214]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{p.title}</span>
                    <span className="text-[10px] text-gray-500">{p.accessLevel}</span>
                  </div>
                </label>
              ))}
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Pricing Paket</h2>
          <p className="text-sm text-gray-500 mt-1">Atur harga dan E-book yang otomatis didapatkan saat pembelian paket.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-rn-accent hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {loading ? <LoadingSpinnerSmall /> : <Save className="w-4 h-4" />}
          Simpan Semua
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {renderPaketConfig("PRO_BASIC", "1. Konfigurasi Paket E-Book (Basic)")}
      {renderPaketConfig("PRO_TOOLS", "2. Konfigurasi Paket Ruang Ngonten (Tools 30 Hari)")}
      {renderPaketConfig("PRO_LENGKAP", "3. Konfigurasi Paket Lengkap (Tools 30 Hari + E-Book)")}

    </div>
  );
}

function LoadingSpinnerSmall() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
