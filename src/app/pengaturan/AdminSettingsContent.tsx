"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, BookOpen, Tag, X, Star } from "lucide-react";
import { 
  createAiModel, 
  setDefaultModel, 
  toggleModel, 
  deleteModel,
  saveAppSetting,
  toggleFeatureStatus,
  toggleFeaturePro,
  createCategory,
  createProduct, 
  updateProduct,
  deleteCategory,
  deleteProduct
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
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newModel, setNewModel] = useState({ name: "", modelId: "", provider: "google" });
  const [apiKey, setApiKey] = useState(settings.find((s:any) => s.key === "DEFAULT_GEMINI_API_KEY")?.value || "");

  const handleSaveApiKey = async () => {
    setLoading(true);
    await saveAppSetting("DEFAULT_GEMINI_API_KEY", apiKey);
    alert("API Key berhasil disimpan!");
    setLoading(false);
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Gemini API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..." 
                className="w-full bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
              />
            </div>
            <button 
              onClick={handleSaveApiKey} 
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Simpan API Key
            </button>
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

      {/* Tab: Ruang Belajar */}
      {activeTab === "belajar" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header & Actions */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
            <div className="mb-2 md:mb-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manajemen Ruang Belajar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kelola kategori dan e-book yang tersedia untuk member.</p>
            </div>
            <div className="flex items-stretch md:items-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
              <button 
                onClick={() => setShowAddCategory(true)}
                className="flex-1 md:flex-none justify-center bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Kategori
              </button>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="flex-1 md:flex-none justify-center bg-rn-accent hover:opacity-90 text-white px-2 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-opacity flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Tambah E-Book
              </button>
            </div>
          </div>      {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {products.map((prod: any) => (
              <div key={prod.id} className="group flex flex-row items-start bg-white dark:bg-[#121214] rounded-[16px] sm:rounded-[20px] border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300 p-3 sm:p-3.5 gap-3 sm:gap-4">
                
                {/* Image Area - COMPACT & RESPONSIVE */}
                <div className="w-[80px] sm:w-[95px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#18181b] border border-gray-200 dark:border-white/5 rounded-[10px] sm:rounded-[12px]">
                  <div className="aspect-[3/4] relative flex items-center justify-center">
                    {prod.coverUrl ? (
                      <img src={prod.coverUrl} alt={prod.title} className="absolute inset-0 object-cover w-full h-full" />
                    ) : (
                      <BookOpen size={24} className="text-gray-400 dark:text-gray-500 absolute" />
                    )}
                  </div>
                </div>
                
                {/* Content Area - COMPACT & RESPONSIVE */}
                <div className="flex flex-col flex-1 w-full min-w-0 py-0.5 h-full">
                   <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 leading-tight truncate" title={prod.title}>
                     {prod.title}
                   </h3>
                   
                   <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                     <Star className="text-yellow-500 w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" />
                     <span className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium">5.0 <span className="text-gray-400 dark:text-gray-500 font-normal hidden sm:inline">(Banyak ulasan)</span></span>
                   </div>

                   {prod.description && (
                     <p className="text-[10px] sm:text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-2.5">
                       {prod.description}
                     </p>
                   )}
                   
                   <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3 mt-auto">
                      {prod.isProOnly && (
                        <span className="text-[8px] sm:text-[9px] font-bold text-orange-700 dark:text-gray-300 bg-orange-100 dark:bg-[#222225] px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-200 dark:border-white/5 whitespace-nowrap">
                          PREMIUM
                        </span>
                      )}
                      <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#222225] px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-200 dark:border-white/5 whitespace-nowrap truncate max-w-[80px] sm:max-w-[100px]">
                        {prod.category?.name?.toUpperCase() || 'PRODUK DIGITAL'}
                      </span>
                   </div>

                   <div className="border-t border-gray-100 dark:border-white/5 pt-2 sm:pt-3 flex items-center justify-between gap-1.5">
                     <span className="text-orange-600 dark:text-orange-400 font-bold text-[10px] sm:text-xs whitespace-nowrap truncate">
                       {prod.accessLevel}
                     </span>
                     
                     {/* Action Buttons - COMPACT & RESPONSIVE */}
                     <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        <button 
                          onClick={() => setEditingProduct(prod)} 
                          className="flex items-center justify-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-transparent dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-lg transition-colors text-[9px] sm:text-[10px] font-bold"
                        >
                          <Edit className="w-3 h-3" /> <span className="hidden min-[400px]:inline">Edit</span>
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('Yakin ingin menghapus E-book ini?')) {
                              setLoading(true);
                              await deleteProduct(prod.id);
                              setLoading(false);
                            }
                          }}
                          className="flex items-center justify-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 bg-red-50 hover:bg-red-100 dark:bg-transparent dark:hover:bg-red-500/10 border border-red-100 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 text-red-600 dark:text-gray-300 dark:hover:text-red-400 rounded-lg transition-colors text-[9px] sm:text-[10px] font-bold"
                        >
                          <Trash2 className="w-3 h-3" /> <span className="hidden min-[400px]:inline">Hapus</span>
                        </button>
                     </div>
                   </div>
                </div>
              </div>
            ))}
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
                title: formData.get("title"),
                slug: formData.get("slug"),
                categoryId: formData.get("categoryId"),
                description: formData.get("description"),
                coverUrl: uploadedUrls["coverUrlInput"] || formData.get("coverUrl"),
                coverUrl2: uploadedUrls["coverUrl2Input"] || formData.get("coverUrl2"),
                coverUrl3: uploadedUrls["coverUrl3Input"] || formData.get("coverUrl3"),
                fileUrl: formData.get("fileUrl"),
                accessLevel: formData.get("accessLevel") as string,
                isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",
                isDownloadable: formData.get("isDownloadable") === "on",
              });
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

              <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative">
                      <span id="label-coverUrlInput" className="text-[10px] font-bold text-gray-400 block mb-1">1. COVER UTAMA</span>
                      <img id="preview-coverUrlInput" src={undefined} className="hidden w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300" />
                      <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "coverUrlInput")} className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
                      <input type="hidden" name="coverUrl" id="coverUrlInput" />
                    </div>
                    <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative">
                      <span id="label-coverUrl2Input" className="text-[10px] font-bold text-gray-400 block mb-1">2. PREVIEW 1</span>
                      <img id="preview-coverUrl2Input" src={undefined} className="hidden w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300" />
                      <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "coverUrl2Input")} className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
                      <input type="hidden" name="coverUrl2" id="coverUrl2Input" />
                    </div>
                    <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative">
                      <span id="label-coverUrl3Input" className="text-[10px] font-bold text-gray-400 block mb-1">3. PREVIEW 2</span>
                      <img id="preview-coverUrl3Input" src={undefined} className="hidden w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300" />
                      <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "coverUrl3Input")} className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
                      <input type="hidden" name="coverUrl3" id="coverUrl3Input" />
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
                <p className="text-[10px] text-gray-400 mt-1">Ganti "view" menjadi "preview" otomatis oleh sistem.</p>
              </div>

              
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL AKSES E-BOOK</label>
                <select name="accessLevel" defaultValue="FREE" className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-rn-accent text-sm">
                  <option value="FREE">Free (Gratis untuk semua)</option>
                  <option value="PRO">Pro (Khusus Member Bundle)</option>
                  <option value="PREMIUM">Premium (Pembelian Eceran / Ala Carte)</option>
                </select>
              </div>


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
                title: formData.get("title"),
                slug: formData.get("slug"),
                categoryId: formData.get("categoryId"),
                description: formData.get("description"),
                coverUrl: uploadedUrls["editCoverUrlInput"] || formData.get("coverUrl"),
                coverUrl2: uploadedUrls["editCoverUrl2Input"] || formData.get("coverUrl2"),
                coverUrl3: uploadedUrls["editCoverUrl3Input"] || formData.get("coverUrl3"),
                fileUrl: formData.get("fileUrl"),
                accessLevel: formData.get("accessLevel") as string,
                isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",
                isDownloadable: formData.get("isDownloadable") === "on",
              });
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

              <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative">
                      <span id="label-editCoverUrlInput" className="text-[10px] font-bold text-gray-400 block mb-1">1. COVER UTAMA</span>
                      <img id="preview-editCoverUrlInput" src={editingProduct.coverUrl || undefined} className={`w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300 ${editingProduct.coverUrl ? '' : 'hidden'}`} />
                      <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "editCoverUrlInput")} className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
                      <input type="hidden" name="coverUrl" id="editCoverUrlInput" defaultValue={editingProduct.coverUrl || ''} />
                    </div>
                    <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative">
                      <span id="label-editCoverUrl2Input" className="text-[10px] font-bold text-gray-400 block mb-1">2. PREVIEW 1</span>
                      <img id="preview-editCoverUrl2Input" src={editingProduct.coverUrl2 || undefined} className={`w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300 ${editingProduct.coverUrl2 ? '' : 'hidden'}`} />
                      <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "editCoverUrl2Input")} className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
                      <input type="hidden" name="coverUrl2" id="editCoverUrl2Input" defaultValue={editingProduct.coverUrl2 || ''} />
                    </div>
                    <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative">
                      <span id="label-editCoverUrl3Input" className="text-[10px] font-bold text-gray-400 block mb-1">3. PREVIEW 2</span>
                      <img id="preview-editCoverUrl3Input" src={editingProduct.coverUrl3 || undefined} className={`w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300 ${editingProduct.coverUrl3 ? '' : 'hidden'}`} />
                      <input type="file" accept="image/*" onChange={(e) => handleCoverUpload(e, "editCoverUrl3Input")} className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
                      <input type="hidden" name="coverUrl3" id="editCoverUrl3Input" defaultValue={editingProduct.coverUrl3 || ''} />
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

              
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL AKSES E-BOOK</label>
                <select name="accessLevel" defaultValue={editingProduct.accessLevel || 'FREE'} className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-rn-accent text-sm">
                  <option value="FREE">Free (Gratis untuk semua)</option>
                  <option value="PRO">Pro (Khusus Member Bundle)</option>
                  <option value="PREMIUM">Premium (Pembelian Eceran / Ala Carte)</option>
                </select>
              </div>


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
