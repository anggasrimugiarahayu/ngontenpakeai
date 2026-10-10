"use client";

import { useState } from "react";
import { mutate } from "swr";
import { Plus, Trash2, Edit, BookOpen, Tag, X, Star, Ticket, Key, ExternalLink } from "lucide-react";
import { PricingConfigSection } from "./PricingConfigSection";
import { 
  createAiModel, 
  setDefaultModel, 
  toggleModel, 
  deleteModel,
  saveAppSetting,
  deleteAppSetting,
  toggleFeatureStatus,
  toggleFeaturePro,
  createCategory,
  createProduct, 
  updateProduct,
  deleteCategory,
  deleteProduct,
  createVoucher,
  deleteVoucher
} from "./admin-actions";

export function AdminSettingsContent({ activeTab, adminData }: { activeTab: string, adminData: any }) {
  const { models, settings, features, categories, products } = adminData;
  const [loading, setLoading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({});

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetInputId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }
    
    const labelEl = document.getElementById("label-" + targetInputId);
    if (labelEl) labelEl.innerText = "Mengupload...";

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        const input = document.getElementById(targetInputId) as HTMLInputElement;
        if (input) {
          input.value = data.url;
        }
        setUploadedUrls(prev => ({ ...prev, [targetInputId]: data.url }));
        const img = document.getElementById("preview-" + targetInputId) as HTMLImageElement;
        if (img) {
          img.src = data.url;
          img.classList.remove('hidden');
          img.classList.add('ring-2', 'ring-green-500', 'opacity-100', 'z-10');
          img.classList.remove('opacity-50');
        }
        if (labelEl) {
          labelEl.innerText = "BERHASIL ✓";
          labelEl.classList.add("text-green-500");
        }
      } else {
        alert("Gagal upload gambar.");
        if (labelEl) labelEl.innerText = "GAGAL X";
      }
    } catch (err) {
      console.error(err);
      alert("Error upload gambar.");
      if (labelEl) labelEl.innerText = "GAGAL X";
    } finally {
      setLoading(false);
    }
  };

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addAccessLevel, setAddAccessLevel] = useState("FREE");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [managingVouchers, setManagingVouchers] = useState<any>(null);
  const [newVoucher, setNewVoucher] = useState({ code: "", discountType: "PERCENTAGE", discountValue: 0 });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showGlobalVoucherModal, setShowGlobalVoucherModal] = useState(false);
  
  // Aggregate all vouchers for the global view
  const allVouchers = products?.flatMap((p: any) => 
    (p.vouchers || []).map((v: any) => ({ ...v, productTitle: p.title }))
  ) || [];
  const [newModel, setNewModel] = useState({ name: "", modelId: "", provider: "google" });
  const initialApiKey = settings.find((s:any) => s.key === "DEFAULT_GEMINI_API_KEY")?.value || "";
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [savedKey, setSavedKey] = useState(initialApiKey);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    await saveAppSetting("DEFAULT_GEMINI_API_KEY", apiKey);
    setSavedKey(apiKey);
    alert("API Key berhasil disimpan!");
    setLoading(false);
  };

  const handleDeleteApiKey = async () => {
    if (!confirm("Yakin ingin menghapus API Key Global?")) return;
    setLoading(true);
    await deleteAppSetting("DEFAULT_GEMINI_API_KEY");
    setApiKey("");
    setSavedKey("");
    alert("API Key berhasil dihapus!");
    setLoading(false);
  };

  const getMaskedKey = (key: string) => {
    if (!key) return "";
    if (key.length < 10) return "••••••••••••••••";
    return key.substring(0, 6) + "••••••••••••••••" + key.substring(key.length - 4);
  };

  const handleAddModel = async () => {
    if (!newModel.name || !newModel.modelId) return;
    setLoading(true);
    await createAiModel(newModel);
    setNewModel({ name: "", modelId: "", provider: "google" });
    setLoading(false);
  };

  const ORDER = [
    "Master Blueprint",
    "Bio Builder",
    "Idea Rooms",
    "Script Builder",
    "Carousel Prompt Builder",
    "ATM Content Builder",
    "Ebook Prompt Builder",
    "Content Calendar"
  ];
  const sortedFeatures = [...features].sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));

  return (
    <>
      {/* Tab: API Key Global */}
      {activeTab === "api" && (
        <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Pengaturan API Key Global</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Atur Default API Key yang akan digunakan oleh sistem jika pengguna tidak memasukkan API Key mereka sendiri.</p>
          </div>
          
          <div className="space-y-4">
            {savedKey && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">API Key Terpasang & Aktif</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-mono mt-0.5">{getMaskedKey(savedKey)}</p>
                  </div>
                </div>
                <button 
                  onClick={handleDeleteApiKey}
                  disabled={loading}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
                >
                  Hapus API Key
                </button>
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {savedKey ? "Ganti API Key Global" : "Masukkan API Key Global Baru"}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Mulai dengan AIzaSy..." 
                  className="w-full flex-1 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                />
                <button 
                  onClick={handleSaveApiKey} 
                  disabled={loading || !apiKey.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
                >
                  {savedKey ? "Timpa (Overwrite)" : "Simpan API Key"}
                </button>
              </div>
              {savedKey && (
                <p className="text-xs text-gray-500 mt-2">
                  Memasukkan dan menyimpan kunci baru akan otomatis menghapus (menimpa) kunci yang lama.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Model AI */}
      {activeTab === "model" && (
        <div className="space-y-6">
<div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Model Baru</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                placeholder="Nama (ex: Gemini Flash)" 
                value={newModel.name}
                onChange={e => setNewModel({...newModel, name: e.target.value})}
                className="bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <input 
                placeholder="Model ID (ex: gemini-1.5-flash)" 
                value={newModel.modelId}
                onChange={e => setNewModel({...newModel, modelId: e.target.value})}
                className="bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <button 
                onClick={handleAddModel}
                disabled={loading || !newModel.name || !newModel.modelId}
                className="bg-rn-accent hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                Tambah
              </button>
            </div>
          </div>


          <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Daftar Model AI</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pilih model mana yang aktif, dan set model default sistem.</p>
            </div>
            <div className="space-y-3">
              {models.map((model: any) => (
                <div key={model.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-transparent rounded-xl border border-gray-200 dark:border-white/5 gap-4">
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{model.name}</span>
                      {model.isDefault && (
                        <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Default</span>
                      )}
                      {!model.isActive && (
                        <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Nonaktif</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-mono mt-1 break-all">{model.modelId}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 sm:gap-2">
                    <div className="flex items-center gap-2 mr-2 sm:mr-4">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Aktif</span>
                      <button 
                        onClick={() => toggleModel(model.id, !model.isActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${model.isActive ? 'bg-rn-accent' : 'bg-gray-200 dark:bg-white/10'}`}
                        role="switch"
                        aria-checked={model.isActive}
                      >
                        <span className="sr-only">Toggle Model</span>
                        <span 
                          aria-hidden="true" 
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${model.isActive ? 'translate-x-5' : 'translate-x-0'}`} 
                        />
                      </button>
                    </div>

                    {!model.isDefault && model.isActive && (
                      <button 
                        onClick={() => setDefaultModel(model.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (confirm("Hapus model ini?")) {
                          deleteModel(model.id);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>        </div>
      )}

      {/* Tab: Ruang Ngonten */}
      {activeTab === "fitur" && (
        <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manajemen Ruang Ngonten</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Atur ketersediaan alat dan status PRO untuk setiap fitur.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedFeatures.map((f: any) => (
              <div key={f.id} className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-transparent rounded-xl border border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">{f.name}</span>
                  <div className="flex gap-2">
                    {f.isProOnly && (
                      <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">PRO</span>
                    )}
                    {!f.isActive && (
                      <span className="bg-gray-500/10 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Hidden</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">
                  
                  {/* Toggle Aktif/Nonaktif */}
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Aktifkan</span>
                    <button 
                      onClick={() => toggleFeatureStatus(f.id, !f.isActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${f.isActive ? 'bg-rn-accent' : 'bg-gray-200 dark:bg-white/10'}`}
                      role="switch"
                      aria-checked={f.isActive}
                    >
                      <span className="sr-only">Toggle Status</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${f.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  <div className="w-px h-6 bg-gray-200 dark:bg-white/5 mx-1"></div>

                  {/* Toggle Pro/Gratis */}
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">PRO Mode</span>
                    <button 
                      onClick={() => toggleFeaturePro(f.id, !f.isProOnly)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${f.isProOnly ? 'bg-rn-accent' : 'bg-gray-200 dark:bg-white/10'}`}
                      role="switch"
                      aria-checked={f.isProOnly}
                    >
                      <span className="sr-only">Toggle PRO</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${f.isProOnly ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Pricing Paket */}
      {activeTab === "pricing" && (
        <PricingConfigSection products={products} settings={settings} />
      )}

      {/* Tab: Ruang Belajar */}
      {activeTab === "belajar" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
            <div className="mb-2 md:mb-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manajemen Ruang Belajar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kelola kategori dan e-book yang tersedia untuk member.</p>
            </div>
            <div className="grid grid-cols-2 md:flex md:items-center gap-2 mt-3 md:mt-0 w-full md:w-auto">
              <button 
                onClick={() => setShowAddCategory(true)}
                className="justify-center bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Tag className="w-4 h-4" /> Kategori
              </button>
              <button 
                onClick={() => setShowGlobalVoucherModal(true)}
                className="justify-center border border-rn-accent/30 hover:border-rn-accent/60 bg-white dark:bg-transparent text-rn-accent px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Ticket className="w-4 h-4" /> Voucher
              </button>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="col-span-2 md:col-span-1 justify-center bg-rn-accent hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-opacity flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Tambah E-Book
              </button>
            </div>
          </div>      {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {products.map((prod: any) => {
              const reviewCount = prod.reviews?.length || 0;
              const averageRating = reviewCount > 0 
                ? (prod.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) 
                : "0.0";
              const buyerCount = prod._count?.owners || 0;
              
              return (
              <div key={prod.id} className="flex flex-row items-start w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-[16px] sm:rounded-[20px] overflow-hidden relative p-3 sm:p-4 gap-3 sm:gap-4">
                
                <div className="w-[100px] sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-[10px] sm:rounded-xl shadow-sm">
                  <div className="aspect-[3/4] relative flex items-center justify-center">
                    {prod.coverUrl ? (
                      <>
                        <img src={prod.coverUrl} alt={prod.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 opacity-50" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 py-1 h-full min-h-[133px] sm:min-h-[160px]">
                  <div className="flex-1">
                    <h3 className="text-[17px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white group-hover:text-rn-accent transition-colors line-clamp-2" title={prod.title}>
                      {prod.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-1.5 mb-2">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{averageRating === "0.0" ? "0" : averageRating}</span>
                      <span className="text-gray-400 font-normal ml-0.5">
                        ({reviewCount === 0 ? "0 ulasan" : `${reviewCount} ulasan`})
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                      <span className="text-gray-500 font-medium">
                        {buyerCount} pembeli
                      </span>
                    </div>

                    {prod.description && (
                       <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                         {prod.description}
                       </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                      <div className={`font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${prod.accessLevel === 'FREE' ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300' : 'bg-rn-accent/10 text-rn-accent dark:bg-rn-accent/20 dark:text-rn-accent'}`}>
                        {prod.accessLevel === 'FREE' ? "Gratis" : (prod.accessLevel === 'PREMIUM' ? "Premium" : "PRO")}
                      </div>
                      <div className="font-bold rounded px-1.5 py-0.5 text-[9px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {prod.category?.name || 'PRODUK DIGITAL'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 flex items-end justify-between gap-x-2">
                    <div className="flex flex-col">
                        {(prod.accessLevel === "PREMIUM" || prod.accessLevel === "PRO") && prod.originalPrice && prod.originalPrice > prod.price ? (
                          <span className="text-[11px] sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1 whitespace-nowrap">
                            Rp {prod.originalPrice.toLocaleString('id-ID')}
                          </span>
                        ) : null}
                        <span className="text-[15px] sm:text-[17px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">
                          {(prod.accessLevel === "PREMIUM" || prod.accessLevel === "PRO") ? `Rp ${(prod.price || 0).toLocaleString("id-ID")}` : "Rp 0"}
                        </span>
                        {prod.accessLevel === "PRO" && (
                           <span className="text-[9px] sm:text-[10px] text-rn-accent font-bold mt-1.5 whitespace-nowrap">(Rp 0 khusus PRO)</span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
                      <button 
                        onClick={() => setEditingProduct(prod)} 
                        className="flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-[9px] sm:text-[10px] font-bold"
                      >
                        <Edit className="w-3 h-3" /> <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm('Yakin ingin menghapus E-book ini?')) {
                            setLoading(true);
                            await deleteProduct(prod.id);
                            mutate("pengaturan");
                            setLoading(false);
                          }
                        }} 
                        className="flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-[9px] sm:text-[10px] font-bold"
                      >
                        <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
            {products.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5">
                <BookOpen size={40} className="mb-3 opacity-20 text-gray-400" />
                <p className="font-medium text-gray-500 text-sm">Belum ada produk e-book yang ditambahkan.</p>
                <button onClick={() => setShowAddProduct(true)} className="mt-3 text-xs font-bold text-rn-accent hover:underline">
                  + Tambah E-Book Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* Modal Kategori Baru */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2"><Tag className="text-rn-accent" size={20}/> Kelola Kategori</h3>
              <button onClick={() => setShowAddCategory(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form action={async (formData) => {
              setLoading(true);
              await createCategory({ name: formData.get("name"), slug: formData.get("slug") });
              setLoading(false);
            }} className="flex flex-col gap-4 mb-4 pb-6 border-b border-gray-100 dark:border-white/10">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tambah Kategori Baru</label>
                <input name="name" placeholder="Contoh: Bisnis & Keuangan" required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug URL</label>
                <input name="slug" placeholder="Contoh: bisnis-keuangan" required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-rn-accent hover:bg-orange-600 text-white py-2.5 mt-2 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors mt-2">
                Simpan Kategori Baru
              </button>
            </form>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Daftar Kategori Tersimpan</label>
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {categories.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 pl-3 pr-1 py-1.5 rounded-lg text-sm group">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{c.name}</span>
                    <button onClick={async () => {
                      if (confirm('Yakin hapus kategori ini?')) {
                        setLoading(true);
                        await deleteCategory(c.id);
                        setLoading(false);
                      }
                    }} className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Hapus Kategori">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <span className="text-sm text-gray-500 italic">Belum ada kategori.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Product */}
      
      {showGlobalVoucherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/10 w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Ticket className="text-rn-accent" size={20} /> Bank Voucher Global
              </h3>
              <button onClick={() => setShowGlobalVoucherModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="shrink-0 bg-white dark:bg-[#121214] mt-2 mb-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buat Voucher Baru</h4>
              <div className="space-y-3">

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kode Promo</label>
                  <input type="text" placeholder="Kode Promo (ex: PROMO50)"  
                  value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.replace(/\s/g, '').toUpperCase()})} 
                   className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent" />
                </div>
                <div className="flex gap-2">
                  <div className="w-5/12 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe Diskon</label>
                    <select  
                    value={newVoucher.discountType} onChange={e => setNewVoucher({...newVoucher, discountType: e.target.value})}
                     className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent" 
                  >
                    <option value="PERCENTAGE">Persen (%)</option>
                    <option value="NOMINAL">Nominal (Rp)</option>
                  </select>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nilai Diskon</label>
                    <input type="number" placeholder="Nilai Diskon"  
                    value={newVoucher.discountValue || ""} onChange={e => setNewVoucher({...newVoucher, discountValue: Number(e.target.value)})}
                     className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent" />
                  </div>
                </div>
                
                {/* Target E-Book Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-Book Tujuan</label>
                  <select 
                  value={(newVoucher as any).digitalProductId || ""}
                  onChange={e => setNewVoucher({...newVoucher, digitalProductId: e.target.value} as any)}
                   className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent" 
                >
                  <option value="" disabled>-- Pilih E-Book Tujuan --</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                </div>

                <button 
                  onClick={async () => {
                    if (!newVoucher.code || !newVoucher.discountValue || !(newVoucher as any).digitalProductId) return alert("Lengkapi data dan pilih E-Book!");
                    setLoading(true);
                    await createVoucher({ 
                      code: newVoucher.code.toUpperCase(), 
                      discountType: newVoucher.discountType,
                      discountValue: newVoucher.discountValue,
                      digitalProductId: (newVoucher as any).digitalProductId 
                    });
                    setNewVoucher({ code: "", discountType: "PERCENTAGE", discountValue: 0, digitalProductId: "" } as any);
                    alert('Voucher dibuat! Harap refresh halaman.');
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="w-full bg-rn-accent text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Simpan Voucher Baru
                </button>
              
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-white/10 flex flex-col flex-1 min-h-[150px]">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">DAFTAR VOUCHER TERSIMPAN</h4>
              <div className="overflow-y-auto space-y-3 custom-scrollbar pr-2 flex-1">

              {allVouchers.length > 0 ? allVouchers.map((v: any) => (
                <div key={v.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white uppercase">{v.code}</span>
                      <span className="bg-rn-accent/10 text-rn-accent text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        {v.discountType === "PERCENTAGE" ? v.discountValue + "%" : "Rp " + v.discountValue.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      Berlaku untuk: <span className="font-medium">{v.productTitle}</span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => { 
                      if(!confirm('Hapus voucher ini?')) return;
                      setLoading(true); 
                      await deleteVoucher(v.id); 
                      alert('Voucher dihapus, harap refresh halaman.'); 
                      setLoading(false); 
                    }}
                    disabled={loading}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Ticket className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Belum ada voucher aktif.</p>
                </div>
              )}
            
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/10 w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2"><BookOpen className="text-rn-accent" size={20}/> Tambah E-Book / Produk</h3>
              <button onClick={() => { setShowAddProduct(false);
              setUploadedUrls({});  }} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form action={async (formData) => {
              setLoading(true);
                            await createProduct({
                title: formData.get("title") as string,
                slug: formData.get("slug") as string,
                categoryId: formData.get("categoryId") as string,
                description: formData.get("description") as string,
                coverUrl: uploadedUrls["coverUrlInput"] || formData.get("coverUrl") as string,
                coverUrl2: uploadedUrls["coverUrl2Input"] || formData.get("coverUrl2") as string,
                coverUrl3: uploadedUrls["coverUrl3Input"] || formData.get("coverUrl3") as string,
                fileUrl: formData.get("fileUrl") as string,
                accessLevel: formData.get("accessLevel") as string,
                isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",
                price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,
                isDownloadable: formData.get("isDownloadable") === "on",
                language: formData.get("language") as string,
                formatType: formData.get("formatType") as string,
                author: formData.get("author") as string,
                pageCount: formData.get("pageCount") ? parseInt(formData.get("pageCount") as string) : 0,
                originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0
              });
              mutate("pengaturan");
              setLoading(false);
              setShowAddProduct(false);
              setUploadedUrls({});
              
            }} className="flex flex-col gap-3">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Konten</label>
                  <input name="title" placeholder="Contoh: 100 Template Carousel" required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug URL</label>
                  <input name="slug" placeholder="template-carousel" required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman</label>
                  <input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue={0} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                  <select name="categoryId" required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all appearance-none">
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Galeri Gambar E-Book (Maks 3)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
        <span id="label-coverUrlInput" className="text-[10px] font-bold text-gray-400 block mb-1">1. COVER UTAMA</span>
        <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "coverUrlInput")} className="block w-full text-[10px] text-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
        <input type="hidden" name="coverUrl" id="coverUrlInput" />
      </div>
      <img id="preview-coverUrlInput" src={uploadedUrls["coverUrlInput"] || undefined} className={`\${uploadedUrls["coverUrlInput"] ? "" : "hidden"} w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300`} />
    </div>
                    <div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
        <span id="label-coverUrl2Input" className="text-[10px] font-bold text-gray-400 block mb-1">2. PREVIEW 1</span>
        <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "coverUrl2Input")} className="block w-full text-[10px] text-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
        <input type="hidden" name="coverUrl2" id="coverUrl2Input" />
      </div>
      <img id="preview-coverUrl2Input" src={uploadedUrls["coverUrl2Input"] || undefined} className={`\${uploadedUrls["coverUrl2Input"] ? "" : "hidden"} w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300`} />
    </div>
                    <div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
        <span id="label-coverUrl3Input" className="text-[10px] font-bold text-gray-400 block mb-1">3. PREVIEW 2</span>
        <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "coverUrl3Input")} className="block w-full text-[10px] text-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
        <input type="hidden" name="coverUrl3" id="coverUrl3Input" />
      </div>
      <img id="preview-coverUrl3Input" src={uploadedUrls["coverUrl3Input"] || undefined} className={`\${uploadedUrls["coverUrl3Input"] ? "" : "hidden"} w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300`} />
    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi Singkat (Opsional)</label>
                <textarea name="description" rows={2} placeholder="Penjelasan singkat mengenai produk ini..." className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all custom-scrollbar"></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Link Google Drive PDF (Opsional)</label>
                <input name="fileUrl" type="url" placeholder="https://drive.google.com/file/d/..." className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                <p className="text-[10px] text-gray-400 mt-1">Ganti &quot;view&quot; menjadi &quot;preview&quot; otomatis oleh sistem.</p>
              </div>

              
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Penulis</label>
                  <input name="author" defaultValue="Admin" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa</label>
                  <input name="language" defaultValue="Indonesia" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</label>
                  <input name="formatType" defaultValue="PDF / Digital" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL AKSES E-BOOK</label>
                <select name="accessLevel" value={addAccessLevel} onChange={(e) => setAddAccessLevel(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-rn-accent text-sm">
                  <option value="FREE">Free (Gratis untuk semua)</option>
                  <option value="PRO">Pro (Khusus Member Bundle)</option>
                  <option value="PREMIUM">Premium (Pembelian Eceran / Ala Carte)</option>
                </select>
              </div>
              
              {(addAccessLevel === "PREMIUM" || addAccessLevel === "PRO") && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA JUAL (Rp)</label>
                    <input name="price" type="number" min="0" placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA CORET (Rp)</label>
                    <input name="originalPrice" type="number" min="0" placeholder="Contoh: 99000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all line-through" />
                  </div>
                </div>
              )}

              <label className="mt-2 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                <input type="checkbox" name="isDownloadable" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-600 border-blue-300" />
                <div>
                  <div className="font-bold text-sm text-blue-900 dark:text-blue-300">Izinkan Download PDF</div>
                  <div className="text-xs text-blue-700/70 dark:text-blue-400/70">Pengguna dapat mengunduh file PDF secara langsung</div>
                </div>
              </label>

              
<div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => setShowAddProduct(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="bg-rn-accent hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:scale-105 transition-transform">Simpan E-Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Product */}
      
      {managingVouchers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/10 w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">Kelola Voucher</h3>
              <button onClick={() => setManagingVouchers(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 mb-4 space-y-3 custom-scrollbar pr-2">
              {managingVouchers.vouchers?.length > 0 ? managingVouchers.vouchers.map((v: any) => (
                <div key={v.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{v.code}</div>
                    <div className="text-xs font-medium text-rn-accent">Diskon: {v.discountType === "PERCENTAGE" ? v.discountValue + "%" : "Rp " + v.discountValue.toLocaleString('id-ID')}</div>
                  </div>
                  <button 
                    onClick={async () => { 
                      setLoading(true); 
                      await deleteVoucher(v.id); 
                      alert('Voucher dihapus, harap refresh halaman.'); 
                      setLoading(false); 
                    }}
                    disabled={loading}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada voucher untuk ebook ini.</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-white/10 shrink-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buat Voucher Baru</h4>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Kode Promo (ex: PROMO50)" 
                  value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                />
                <div className="flex gap-2">
                  <select 
                    value={newVoucher.discountType} onChange={e => setNewVoucher({...newVoucher, discountType: e.target.value})}
                    className="w-1/3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                  >
                    <option value="PERCENTAGE">Persen (%)</option>
                    <option value="NOMINAL">Nominal (Rp)</option>
                  </select>
                  <input 
                    type="number" placeholder="Nilai Diskon" 
                    value={newVoucher.discountValue || ""} onChange={e => setNewVoucher({...newVoucher, discountValue: Number(e.target.value)})}
                    className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                  />
                </div>
                <button 
                  onClick={async () => {
                    if (!newVoucher.code || !newVoucher.discountValue) return alert("Lengkapi data!");
                    setLoading(true);
                    await createVoucher({ ...newVoucher, code: newVoucher.code.toUpperCase(), digitalProductId: managingVouchers.id });
                    setNewVoucher({ code: "", discountType: "PERCENTAGE", discountValue: 0 });
                    alert('Voucher dibuat! Harap refresh halaman.');
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="w-full bg-rn-accent text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  Simpan Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/10 w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2"><BookOpen className="text-rn-accent" size={20}/> Edit E-Book</h3>
              <button onClick={() => setEditingProduct(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form action={async (formData) => {
              setLoading(true);
                            await updateProduct(editingProduct.id, {
                title: formData.get("title") as string,
                slug: formData.get("slug") as string,
                categoryId: formData.get("categoryId") as string,
                description: formData.get("description") as string,
                coverUrl: uploadedUrls["editCoverUrlInput"] || formData.get("coverUrl") as string,
                coverUrl2: uploadedUrls["editCoverUrl2Input"] || formData.get("coverUrl2") as string,
                coverUrl3: uploadedUrls["editCoverUrl3Input"] || formData.get("coverUrl3") as string,
                fileUrl: formData.get("fileUrl") as string,
                accessLevel: formData.get("accessLevel") as string,
                isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",
                price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,
                isDownloadable: formData.get("isDownloadable") === "on",
                language: formData.get("language") as string,
                formatType: formData.get("formatType") as string,
                author: formData.get("author") as string,
                pageCount: formData.get("pageCount") ? parseInt(formData.get("pageCount") as string) : 0,
                originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0
              });
              mutate("pengaturan");
              setLoading(false);
              setEditingProduct(null);
              setUploadedUrls({});
            }} className="flex flex-col gap-3">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Konten</label>
                  <input name="title" defaultValue={editingProduct.title} required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug URL</label>
                  <input name="slug" defaultValue={editingProduct.slug} required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Halaman</label>
                  <input name="pageCount" type="number" placeholder="Contoh: 120" defaultValue={editingProduct.pageCount || 0} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                  <select name="categoryId" defaultValue={editingProduct.categoryId} required className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all appearance-none">
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Galeri Gambar E-Book (Maks 3)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
        <span id="label-editCoverUrlInput" className="text-[10px] font-bold text-gray-400 block mb-1">1. COVER UTAMA</span>
        <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "editCoverUrlInput")} className="block w-full text-[10px] text-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
        <input type="hidden" name="coverUrl" id="editCoverUrlInput" defaultValue={editingProduct.coverUrl || ''} />
      </div>
      <img id="preview-editCoverUrlInput" src={uploadedUrls["editCoverUrlInput"] || editingProduct.coverUrl || undefined} className={`\${uploadedUrls["editCoverUrlInput"] || editingProduct.coverUrl ? "" : "hidden"} w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300`} />
    </div>
                    <div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
        <span id="label-editCoverUrl2Input" className="text-[10px] font-bold text-gray-400 block mb-1">2. PREVIEW 1</span>
        <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "editCoverUrl2Input")} className="block w-full text-[10px] text-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
        <input type="hidden" name="coverUrl2" id="editCoverUrl2Input" defaultValue={editingProduct.coverUrl2 || ''} />
      </div>
      <img id="preview-editCoverUrl2Input" src={uploadedUrls["editCoverUrl2Input"] || editingProduct.coverUrl2 || undefined} className={`\${uploadedUrls["editCoverUrl2Input"] || editingProduct.coverUrl2 ? "" : "hidden"} w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300`} />
    </div>
                    <div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
        <span id="label-editCoverUrl3Input" className="text-[10px] font-bold text-gray-400 block mb-1">3. PREVIEW 2</span>
        <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "editCoverUrl3Input")} className="block w-full text-[10px] text-transparent file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
        <input type="hidden" name="coverUrl3" id="editCoverUrl3Input" defaultValue={editingProduct.coverUrl3 || ''} />
      </div>
      <img id="preview-editCoverUrl3Input" src={uploadedUrls["editCoverUrl3Input"] || editingProduct.coverUrl3 || undefined} className={`\${uploadedUrls["editCoverUrl3Input"] || editingProduct.coverUrl3 ? "" : "hidden"} w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300`} />
    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi Singkat</label>
                <textarea name="description" defaultValue={editingProduct.description || ''} rows={2} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all custom-scrollbar"></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Link Google Drive PDF</label>
                <input name="fileUrl" type="url" defaultValue={editingProduct.fileUrl || ''} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
              </div>

              
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Penulis</label>
                  <input name="author" defaultValue={editingProduct.author || 'Admin'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bahasa</label>
                  <input name="language" defaultValue={editingProduct.language || 'Indonesia'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format</label>
                  <input name="formatType" defaultValue={editingProduct.formatType || 'PDF / Digital'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL AKSES E-BOOK</label>
                <select name="accessLevel" value={editingProduct.accessLevel || "FREE"} onChange={(e) => setEditingProduct({...editingProduct, accessLevel: e.target.value})} className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-rn-accent text-sm">
                  <option value="FREE">Free (Gratis untuk semua)</option>
                  <option value="PRO">Pro (Khusus Member Bundle)</option>
                  <option value="PREMIUM">Premium (Pembelian Eceran / Ala Carte)</option>
                </select>
              </div>
              
              {(editingProduct.accessLevel === "PREMIUM" || editingProduct.accessLevel === "PRO") && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA JUAL (Rp)</label>
                    <input name="price" type="number" min="0" defaultValue={editingProduct.price || 0} placeholder="Contoh: 49000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HARGA CORET (Rp)</label>
                    <input name="originalPrice" type="number" min="0" defaultValue={editingProduct.originalPrice || ""} placeholder="Contoh: 99000" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent transition-all line-through" />
                  </div>
                </div>
              )}

              <label className="mt-2 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                <input type="checkbox" name="isDownloadable" defaultChecked={editingProduct.isDownloadable} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-600 border-blue-300" />
                <div>
                  <div className="font-bold text-sm text-blue-900 dark:text-blue-300">Izinkan Download PDF</div>
                  <div className="text-xs text-blue-700/70 dark:text-blue-400/70">Pengguna dapat mengunduh file PDF secara langsung</div>
                </div>
              </label>


              
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="bg-rn-accent hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:scale-105 transition-transform">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
