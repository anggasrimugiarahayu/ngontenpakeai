"use client";

import toast from "react-hot-toast";
import { useState } from "react";
import { saveAppSetting } from "./admin-actions";
import { Save, CheckCircle2, Edit, Package, Wrench, Gem, Check, X, Plus, BookOpen } from "lucide-react";

export function PricingConfigSection({ products, settings }: { products: any[], settings: any[] }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [editingPackage, setEditingPackage] = useState<string | null>(null);

  const settingRaw = settings.find((s) => s.key === "PRICING_PACKAGES")?.value;
  
  let initialConfig = {
    PRO_BOOK: { 
      name: "Paket PRO BOOK", 
      desc: "Cocok buat yang mau fokus belajar teori faceless creator.",
      price: 99000, 
      originalPrice: 2419000,
      discountLabel: "95% OFF",
      highlightText: "",
      features: [
        "Ebook Ngonten Pakai AI (Personal Use)",
        "Ebook 30 Day Creator Challenge (Personal Use)",
        "Bimbingan Private 1-on-1 WhatsApp (6 Bulan)",
        "6+ Bonus Strategi & Template Lainnya"
      ],
      bundledProductIds: [] 
    },
    PRO_TOOLS: { 
      name: "Paket Sistem Tools", 
      desc: "Cocok buat yang butuh bantuan AI untuk eksekusi ngonten.",
      price: 99000, 
      originalPrice: 666000,
      discountLabel: "85% OFF",
      highlightText: "",
      features: [
        "Akses 8 Sistem AI Ngonten Pakai AI",
        "Ebook Ngonten Pakai AI (Included)",
        "Bonus 4 Resource Ekstra (Footage, Hook, Tools)",
        "Akses Selama 30 Hari"
      ],
      bundledProductIds: [] 
    },
    PRO_PLUS: { 
      name: "Paket Lengkap (Ebook)", 
      desc: "Bonus terbanyak, akses jualan (PLR) dan Lifetime support.",
      price: 149000, 
      originalPrice: 2419000,
      discountLabel: "94% OFF",
      highlightText: "PALING WORTH",
      features: [
        "Semua isi Paket Basic",
        "Hak Jual Ulang (PLR) untuk berbagai materi",
        "Bimbingan Private 1-on-1 (Lifetime)",
        "Tools Text to Voice Over",
        "Video Footage Siap Pakai"
      ],
      bundledProductIds: [] 
    },
  };

  try {
    if (settingRaw) {
      initialConfig = { ...initialConfig, ...JSON.parse(settingRaw) };
    }
  } catch (e) {}

  const [config, setConfig] = useState<any>(initialConfig);

  const formatK = (price: number) => {
    if (price >= 1000) return (price / 1000) + 'k';
    return price.toString();
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setSuccessMsg("");
    try {
      await saveAppSetting("PRICING_PACKAGES", JSON.stringify(config));
      setSuccessMsg("Konfigurasi pricing berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      toast.error("Gagal menyimpan");
    }
    setLoading(false);
  };

  const renderModal = () => {
    if (!editingPackage) return null;
    const pkg = config[editingPackage];
    
    const updateField = (field: string, val: any) => {
      setConfig((prev: any) => ({
        ...prev,
        [editingPackage]: { ...prev[editingPackage], [field]: val }
      }));
    };

    const updateFeature = (index: number, val: string) => {
      const newFeatures = [...pkg.features];
      newFeatures[index] = val;
      updateField("features", newFeatures);
    };

    const removeFeature = (index: number) => {
      const newFeatures = pkg.features.filter((_: any, i: number) => i !== index);
      updateField("features", newFeatures);
    };

    const addFeature = () => {
      updateField("features", [...pkg.features, ""]);
    };

    const toggleProduct = (pid: string) => {
      let newIds = [...pkg.bundledProductIds];
      if (newIds.includes(pid)) {
        newIds = newIds.filter(id => id !== pid);
      } else {
        newIds.push(pid);
      }
      updateField("bundledProductIds", newIds);
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-[#121214] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col">
          <div className="sticky top-0 bg-white dark:bg-[#121214] border-b border-gray-200 dark:border-white/10 p-5 flex items-center justify-between z-10">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-rn-accent" />
              Edit {pkg.name}
            </h2>
            <button onClick={() => setEditingPackage(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nama Paket</label>
                <input type="text" value={pkg.name} onChange={e => updateField("name", e.target.value)} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rn-accent focus:ring-1 focus:ring-rn-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Label Pita Atas (Opsional)</label>
                <input type="text" value={pkg.highlightText} onChange={e => updateField("highlightText", e.target.value)} placeholder="Contoh: PALING WORTH" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rn-accent focus:ring-1 focus:ring-rn-accent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Deskripsi Pendek</label>
              <input type="text" value={pkg.desc} onChange={e => updateField("desc", e.target.value)} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rn-accent focus:ring-1 focus:ring-rn-accent outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Harga Jual (Rp)</label>
                <input type="number" value={pkg.price} onChange={e => updateField("price", parseInt(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rn-accent focus:ring-1 focus:ring-rn-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Harga Coret (Rp)</label>
                <input type="number" value={pkg.originalPrice} onChange={e => updateField("originalPrice", parseInt(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rn-accent focus:ring-1 focus:ring-rn-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Label Diskon</label>
                <input type="text" value={pkg.discountLabel} onChange={e => updateField("discountLabel", e.target.value)} placeholder="Misal: 95% OFF" className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rn-accent focus:ring-1 focus:ring-rn-accent outline-none" />
              </div>
            </div>

            <hr className="border-gray-200 dark:border-white/10" />

            <div>
               <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">Daftar Fitur / Benefit (Checklist)</label>
               <div className="space-y-2">
                 {pkg.features.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                       <Check className="w-4 h-4 text-orange-500 shrink-0" />
                       <input type="text" value={f} onChange={e => updateFeature(i, e.target.value)} className="flex-1 bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-rn-accent" />
                       <button onClick={() => removeFeature(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
                 <button onClick={addFeature} className="flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600 mt-2 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
                   <Plus className="w-4 h-4" /> Tambah Fitur Baru
                 </button>
               </div>
            </div>

            <hr className="border-gray-200 dark:border-white/10" />

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                 <Package className="w-4 h-4 text-rn-accent" /> E-Book Bundling Otomatis (Database Unlock)
              </label>
              <p className="text-xs text-gray-500 mb-3">Centang e-book di bawah ini yang akan otomatis dimiliki oleh user setelah pembayaran berhasil.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                {products.map(p => (
                  <label key={p.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={pkg.bundledProductIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="mt-0.5 rounded text-rn-accent focus:ring-rn-accent border-gray-300 dark:border-gray-700 bg-transparent w-4 h-4"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight">{p.title}</span>
                      <span className="text-[10px] text-gray-500 mt-0.5 font-medium">{p.accessLevel}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-gray-50 dark:bg-[#18181b] p-5 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3">
             <button onClick={() => setEditingPackage(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
               Batal
             </button>
             <button onClick={async () => { await handleSaveAll(); setEditingPackage(null); }} disabled={loading} className="flex items-center gap-2 bg-rn-accent text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-rn-accent/20 hover:bg-orange-600 transition-colors disabled:opacity-50">
               {loading ? <LoadingSpinnerSmall /> : <Save className="w-4 h-4" />}
               Simpan Perubahan
             </button>
          </div>
        </div>
      </div>
    );
  };

  const PreviewCard = ({ pkgKey }: { pkgKey: string }) => {
    const pkg = config[pkgKey];
    const isSpecial = pkg.highlightText && pkg.highlightText.length > 0;
    
    return (
      <div className={`bg-white dark:bg-[#121214] border ${isSpecial ? 'border-orange-500' : 'border-gray-200 dark:border-white/10'} rounded-2xl p-5 relative flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow`}>
        {isSpecial && (
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-full tracking-widest border-[3px] border-white dark:border-[#121214] whitespace-nowrap shadow-sm">
             {pkg.highlightText}
           </div>
        )}
        
        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1.5 leading-tight">{pkg.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-4 leading-relaxed line-clamp-2">{pkg.desc}</p>
        
        <div className="text-gray-900 dark:text-white font-black text-2xl mb-1 tracking-tight">Rp {formatK(pkg.price)}</div>
        <div className="text-gray-400 text-[11px] font-medium mb-1.5 line-through">Total Rp {pkg.originalPrice.toLocaleString('id-ID')}</div>
        {pkg.discountLabel && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 text-[9px] font-black px-1.5 py-0.5 rounded w-max mb-5 tracking-wider">
            {pkg.discountLabel}
          </div>
        )}
        
        <ul className="space-y-2.5 mb-6 flex-1">
          {pkg.features.map((f: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
               <Check className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
               <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        <button className={`w-full py-2.5 rounded-xl font-black text-xs transition-all duration-300 ${isSpecial ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white'}`}>
          {pkg.name.includes("Basic") ? "Pilih Paket Basic" : pkg.name.includes("Tools") ? "Pilih Sistem Tools" : "Pilih Paket Lengkap"}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {renderModal()}
      
      {/* Header & Control Panel */}
      <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#121214] flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manajemen Pricing Paket</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola pricing paket untuk setiap paket langanan member anda.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0 w-full xl:w-auto">
          <button onClick={() => setEditingPackage("PRO_BOOK")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
            <BookOpen className="w-4 h-4" /> Paket Ebook
          </button>
          <button onClick={() => setEditingPackage("PRO_TOOLS")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
            <Wrench className="w-4 h-4" /> Paket Tools
          </button>
          <button onClick={() => setEditingPackage("PRO_PLUS")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-rn-accent hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rn-accent/20 whitespace-nowrap">
            <Gem className="w-4 h-4" /> Paket Lengkap
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {/* Live Preview Section */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-2 h-6 bg-rn-accent rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-7xl mx-auto">
            <PreviewCard pkgKey="PRO_BOOK" />
            <PreviewCard pkgKey="PRO_TOOLS" />
            <PreviewCard pkgKey="PRO_PLUS" />
        </div>
      </div>

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
