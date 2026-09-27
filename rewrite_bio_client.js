const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';

// I will just write a completely new file content because the changes (Timeline + Mockup redesign) affect almost the entire render method.
const newCode = `"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, AlertCircle, Loader2, UserCircle, Type, AlignLeft, 
  RefreshCw, Camera, ChevronDown, Trash2, ArrowRight, ArrowLeft, Check
} from "lucide-react";

interface BioState {
  username: string;
  name: string;
  bioText: string;
}

interface BioSuggestions {
  usernames: string[] | null;
  names: string[] | null;
  bios: any[] | null;
}

export default function BioBuilderClient({ initialData, blueprintId }: { initialData: any, blueprintId: string }) {
  const { data: session } = useSession();
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  const router = useRouter();

  const [id, setId] = useState<string | null>(initialData?.id || null);
  const [selectedBio, setSelectedBio] = useState<BioState>({
    username: initialData?.username || "",
    name: initialData?.profileName || "",
    bioText: initialData?.bioText || ""
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatarUrl || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");
  const [suggestions, setSuggestions] = useState<BioSuggestions>({
    usernames: initialData?.suggestions?.usernames || null,
    names: initialData?.suggestions?.names || null,
    bios: initialData?.suggestions?.bios || null
  });

  // Timeline Step (1: Username, 2: Name, 3: BioText)
  const [step, setStep] = useState(1);

  const [loadingStep, setLoadingStep] = useState<"username" | "name" | "bio" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const autoSave = async (updatedId: string | null, updatedSelected: BioState, updatedSugg: BioSuggestions, updatedAvatar: string) => {
    try {
      const res = await fetch("/api/bio-builder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedId,
          username: updatedSelected.username,
          profileName: updatedSelected.name,
          bioText: updatedSelected.bioText,
          avatarUrl: updatedAvatar,
          suggestions: updatedSugg
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id && !updatedId) {
          setId(data.id);
        }
      }
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  };

  const generateUsernames = async () => {
    setLoadingStep("username");
    try {
      const res = await fetch("/api/bio-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-usernames", payload: {}, blueprintId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const newSugg = { ...suggestions, usernames: data.data.usernames, names: null, bios: null };
      setSuggestions(newSugg);
      autoSave(id, selectedBio, newSugg, avatarUrl);
    } catch (err: any) {
      showToast(err.message || "Gagal generate username", "error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateNames = async (unameToUse: string, currentSelected: BioState) => {
    if (!unameToUse) return;
    setLoadingStep("name");
    try {
      const res = await fetch("/api/bio-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-names", payload: { unameToUse }, blueprintId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const newSugg = { ...suggestions, names: data.data.names, bios: null };
      setSuggestions(newSugg);
      autoSave(id, currentSelected, newSugg, avatarUrl);
    } catch (err: any) {
      showToast(err.message || "Gagal generate nama profil", "error");
    } finally {
      setLoadingStep(null);
    }
  };

  const generateBios = async (pnameToUse: string, currentSelected: BioState) => {
    if (!pnameToUse) return;
    setLoadingStep("bio");
    try {
      const res = await fetch("/api/bio-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-bios", payload: { pnameToUse }, blueprintId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const newSugg = { ...suggestions, bios: data.data.bios };
      setSuggestions(newSugg);
      autoSave(id, currentSelected, newSugg, avatarUrl);
    } catch (err: any) {
      showToast(err.message || "Gagal generate teks bio", "error");
    } finally {
      setLoadingStep(null);
    }
  };

  const handleSelectUsername = (uname: string) => {
    const formattedUname = uname.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    const newSelected = { ...selectedBio, username: formattedUname, name: '', bioText: '' };
    setSelectedBio(newSelected);
    autoSave(id, newSelected, suggestions, avatarUrl);
  };

  const handleSelectName = (pname: string) => {
    const newSelected = { ...selectedBio, name: pname, bioText: '' };
    setSelectedBio(newSelected);
    autoSave(id, newSelected, suggestions, avatarUrl);
  };

  const handleSelectBio = (bioObj: any) => {
    const fullBioStr = \`\${bioObj.line1}\\n\${bioObj.line2}\\n\${bioObj.line3}\`;
    const newSelected = { ...selectedBio, bioText: fullBioStr };
    setSelectedBio(newSelected);
    autoSave(id, newSelected, suggestions, avatarUrl);
  };

  const handleAvatarUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const resStr = ev.target.result as string;
          setAvatarUrl(resStr);
          autoSave(id, selectedBio, suggestions, resStr);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteBio = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/bio-builder", { method: "DELETE" });
      if (res.ok) {
        showToast("Bio berhasil direset!");
        setSuggestions({ usernames: null, names: null, bios: null });
        setSelectedBio({ username: "", name: "", bioText: "" });
        setAvatarUrl("https://placehold.co/150x150/e2e8f0/475569?text=Photo");
        setId(null);
        setIsDeleteModalOpen(false);
        setStep(1);
        router.refresh();
      } else {
        showToast("Gagal mereset", "error");
      }
    } catch (err) {
      showToast("Kesalahan koneksi", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const goToNextStep = () => {
    if (step === 1 && selectedBio.username) {
      setStep(2);
      if (!suggestions.names) {
        generateNames(selectedBio.username, selectedBio);
      }
    } else if (step === 2 && selectedBio.name) {
      setStep(3);
      if (!suggestions.bios) {
        generateBios(selectedBio.name, selectedBio);
      }
    }
  };

  const goToPrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderTimeline = () => {
    const steps = [
      { num: 1, label: "Pilih Username" },
      { num: 2, label: "Headline Profil" },
      { num: 3, label: "Isi Bio" }
    ];

    return (
      <div className="flex items-center justify-between w-full mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200 dark:bg-white/10 z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-rn-accent z-0 transition-all duration-300"
          style={{ width: \`\${((step - 1) / (steps.length - 1)) * 100}%\` }}
        ></div>
        
        {steps.map((s) => {
          const isActive = step >= s.num;
          const isCurrent = step === s.num;
          return (
            <div key={s.num} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => s.num < step ? setStep(s.num) : null}>
              <div className={\`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 \${isActive ? 'bg-rn-accent border-rn-accent text-white shadow-lg shadow-rn-accent/20' : 'bg-gray-100 border-gray-200 text-gray-400 dark:bg-[#18181b] dark:border-white/10 dark:text-gray-500'}\`}>
                {isActive && !isCurrent ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : s.num}
              </div>
              <span className={\`text-[10px] md:text-xs font-bold \${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}\`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Mockup Component based on Reference Image
  const Mockup = () => (
    <div className={\`w-full max-w-[340px] mx-auto rounded-[32px] border-[6px] overflow-hidden shadow-2xl \${isDark ? "bg-[#0b0c10] border-[#1e293b]" : "bg-white border-gray-300"}\`}>
      {/* Header IG */}
      <div className={\`px-4 pt-8 pb-3 flex items-center justify-between border-b \${isDark ? "border-white/10" : "border-gray-100"}\`}>
        <div className={\`flex items-center gap-1 font-bold text-[15px] \${isDark ? "text-white" : "text-black"}\`}>
          {selectedBio.username || "username_kamu"}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between mb-5">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-white/10 bg-[#f1f5f9]" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex flex-1 justify-around text-center ml-4">
            <div>
              <div className={\`font-bold text-[17px] \${isDark ? "text-white" : "text-black"}\`}>0</div>
              <div className="text-[11px] text-gray-500">Posts</div>
            </div>
            <div>
              <div className={\`font-bold text-[17px] \${isDark ? "text-white" : "text-black"}\`}>10K</div>
              <div className="text-[11px] text-gray-500">Followers</div>
            </div>
            <div>
              <div className={\`font-bold text-[17px] \${isDark ? "text-white" : "text-black"}\`}>0</div>
              <div className="text-[11px] text-gray-500">Following</div>
            </div>
          </div>
        </div>
        
        {/* Bio Section */}
        <div className="text-[13px]">
          <div className={\`font-bold mb-1 \${isDark ? "text-white" : "text-black"}\`}>{selectedBio.name || "Nama Profil Kreator"}</div>
          {selectedBio.bioText ? (
            <div className={\`whitespace-pre-wrap leading-[1.4] \${isDark ? "text-gray-200" : "text-gray-800"}\`}>{selectedBio.bioText}</div>
          ) : (
            <div className="text-gray-500 italic">Bio kamu akan muncul di sini...</div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-5">
          <button className={\`flex-1 py-1.5 font-semibold rounded-lg text-[13px] transition-colors \${isDark ? "bg-[#1e293b] text-white hover:bg-slate-700" : "bg-gray-100 text-black hover:bg-gray-200"}\`}>Edit profile</button>
          <button className={\`flex-1 py-1.5 font-semibold rounded-lg text-[13px] transition-colors \${isDark ? "bg-[#1e293b] text-white hover:bg-slate-700" : "bg-gray-100 text-black hover:bg-gray-200"}\`}>Share profile</button>
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 py-8 md:py-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 font-heading text-gray-900 dark:text-white">
            Bio Builder
            <div className="p-1.5 rounded-lg bg-rn-accent/10 text-rn-accent shrink-0">
              <UserCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Rakit profil Instagram yang optimasi konversi dari Master Blueprint.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDeleteModalOpen(true)} className={\`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all \${isDark ? "bg-white/5 text-gray-300 hover:bg-red-500/20 hover:text-red-400" : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"}\`}>
            <Trash2 className="w-4 h-4" /> Reset Bio
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Panel: Builder Steps */}
        <div className="flex-1 flex flex-col min-w-0">
          {renderTimeline()}
          
          <div className={\`p-5 md:p-8 rounded-3xl border shadow-sm \${isDark ? "bg-[#18181b] border-white/10" : "bg-white border-gray-200"}\`}>
            
            {/* STEP 1: USERNAME */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-2">Pilih Username</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Username yang mudah diingat, diketik, dan mencerminkan brand Anda.</p>
                
                {!suggestions.usernames ? (
                  <div className="text-center py-10">
                    <button onClick={generateUsernames} disabled={loadingStep !== null} className="px-6 py-3 bg-rn-accent hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-50">
                      {loadingStep === "username" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCircle className="w-4 h-4" />}
                      Generate Username dengan AI
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold">Rekomendasi AI</span>
                      <button onClick={generateUsernames} disabled={loadingStep !== null} className="text-xs font-bold text-rn-accent flex items-center gap-1 hover:underline">
                        <RefreshCw className={\`w-3 h-3 \${loadingStep === "username" ? "animate-spin" : ""}\`} /> Regenerate
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {suggestions.usernames.map((uname, idx) => (
                        <button key={idx} onClick={() => handleSelectUsername(uname)} className={\`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all \${selectedBio.username === uname.toLowerCase().replace(/[^a-z0-9_.]/g, '') ? "border-rn-accent bg-rn-accent/10 shadow-[0_0_0_1px_rgba(249,115,22,1)]" : "border-gray-200 dark:border-white/10 hover:border-rn-accent/50 dark:hover:border-rn-accent/50"}\`}>
                          <span className={\`font-medium text-sm \${isDark ? "text-gray-200" : "text-gray-800"}\`}>@{uname}</span>
                          {selectedBio.username === uname.toLowerCase().replace(/[^a-z0-9_.]/g, '') && <CheckCircle2 className="w-5 h-5 text-rn-accent" />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-white/10 pt-6 mb-2">
                      <label className="text-sm font-bold mb-2 block">Atau ketik sendiri:</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                        <input 
                          type="text" 
                          placeholder="username_kamu"
                          value={selectedBio.username}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
                            setSelectedBio(prev => ({...prev, username: val}));
                          }}
                          onBlur={() => autoSave(id, selectedBio, suggestions, avatarUrl)}
                          className={\`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rn-accent \${isDark ? "bg-black/50 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}\`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PROFILE NAME */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-2">Headline Profil (Nama)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Nama tebal di bawah foto profil yang bisa di-search oleh orang di Instagram. (Maksimal 30 huruf)</p>
                
                {!suggestions.names ? (
                  <div className="text-center py-10">
                    <button onClick={() => generateNames(selectedBio.username, selectedBio)} disabled={loadingStep !== null} className="px-6 py-3 bg-rn-accent hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-50">
                      {loadingStep === "name" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
                      Generate Headline dengan AI
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold">Rekomendasi AI</span>
                      <button onClick={() => generateNames(selectedBio.username, selectedBio)} disabled={loadingStep !== null} className="text-xs font-bold text-rn-accent flex items-center gap-1 hover:underline">
                        <RefreshCw className={\`w-3 h-3 \${loadingStep === "name" ? "animate-spin" : ""}\`} /> Regenerate
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 mb-6">
                      {suggestions.names.map((pname, idx) => (
                        <button key={idx} onClick={() => handleSelectName(pname)} className={\`p-4 rounded-xl border text-left flex items-center justify-between transition-all \${selectedBio.name === pname ? "border-rn-accent bg-rn-accent/10 shadow-[0_0_0_1px_rgba(249,115,22,1)]" : "border-gray-200 dark:border-white/10 hover:border-rn-accent/50 dark:hover:border-rn-accent/50"}\`}>
                          <span className={\`font-medium text-sm \${isDark ? "text-gray-200" : "text-gray-800"}\`}>{pname}</span>
                          {selectedBio.name === pname && <CheckCircle2 className="w-5 h-5 text-rn-accent" />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-white/10 pt-6 mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold">Atau ketik sendiri:</label>
                        <span className={\`text-xs \${selectedBio.name.length > 30 ? "text-red-500 font-bold" : "text-gray-500"}\`}>{selectedBio.name.length} / 30</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Nama | Strategi/Niche"
                        value={selectedBio.name}
                        onChange={(e) => setSelectedBio(prev => ({...prev, name: e.target.value}))}
                        onBlur={() => autoSave(id, selectedBio, suggestions, avatarUrl)}
                        className={\`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rn-accent \${isDark ? "bg-black/50 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}\`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: BIO TEXT */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-2">Isi Bio (3 Baris)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Teks deskripsi profil yang memuat benefit, kredibilitas, dan Call to Action. (Maksimal 150 huruf)</p>
                
                {!suggestions.bios ? (
                  <div className="text-center py-10">
                    <button onClick={() => generateBios(selectedBio.name, selectedBio)} disabled={loadingStep !== null} className="px-6 py-3 bg-rn-accent hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-50">
                      {loadingStep === "bio" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlignLeft className="w-4 h-4" />}
                      Generate Bio dengan AI
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold">Rekomendasi AI</span>
                      <button onClick={() => generateBios(selectedBio.name, selectedBio)} disabled={loadingStep !== null} className="text-xs font-bold text-rn-accent flex items-center gap-1 hover:underline">
                        <RefreshCw className={\`w-3 h-3 \${loadingStep === "bio" ? "animate-spin" : ""}\`} /> Regenerate
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      {suggestions.bios.map((bioObj, idx) => {
                        const fullStr = \`\${bioObj.line1}\\n\${bioObj.line2}\\n\${bioObj.line3}\`;
                        const isSelected = selectedBio.bioText === fullStr;
                        return (
                          <button key={idx} onClick={() => handleSelectBio(bioObj)} className={\`p-4 rounded-xl border text-left flex items-start justify-between gap-4 transition-all \${isSelected ? "border-rn-accent bg-rn-accent/10 shadow-[0_0_0_1px_rgba(249,115,22,1)]" : "border-gray-200 dark:border-white/10 hover:border-rn-accent/50 dark:hover:border-rn-accent/50"}\`}>
                            <div className={\`text-sm whitespace-pre-wrap leading-relaxed \${isDark ? "text-gray-200" : "text-gray-800"}\`}>
                              {fullStr}
                            </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-rn-accent shrink-0 mt-1" />}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-white/10 pt-6 mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold">Atau edit kustom:</label>
                        <span className={\`text-xs \${selectedBio.bioText.length > 150 ? "text-red-500 font-bold" : "text-gray-500"}\`}>{selectedBio.bioText.length} / 150</span>
                      </div>
                      <textarea 
                        rows={3}
                        value={selectedBio.bioText}
                        onChange={(e) => setSelectedBio(prev => ({...prev, bioText: e.target.value}))}
                        onBlur={() => autoSave(id, selectedBio, suggestions, avatarUrl)}
                        className={\`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-rn-accent resize-none \${isDark ? "bg-black/50 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}\`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
              {step > 1 ? (
                <button onClick={goToPrevStep} className={\`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors \${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}\`}>
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
              ) : (
                <div></div> // Empty div for flex layout
              )}
              
              {step < 3 ? (
                <button 
                  onClick={goToNextStep} 
                  disabled={(step === 1 && !selectedBio.username) || (step === 2 && !selectedBio.name)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-rn-accent hover:bg-orange-600 text-white flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjut <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link href="/ruang-ngonten">
                  <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-rn-accent hover:bg-orange-600 text-white flex items-center gap-2 transition-colors shadow-lg shadow-rn-accent/20">
                    Selesai & Simpan <CheckCircle2 className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Right Panel: Live Mockup */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="sticky top-24">
            <h3 className={\`font-bold text-center mb-4 uppercase tracking-widest text-[11px] \${isDark ? "text-gray-500" : "text-gray-400"}\`}>LIVE MOCKUP</h3>
            <Mockup />
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={\`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border \${isDark ? "bg-[#18181b] border-white/10" : "bg-white border-gray-200"}\`}>
            {toast.type === "success" ? (
              <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            <p className={\`text-sm font-bold \${isDark ? "text-white" : "text-gray-900"}\`}>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={\`w-full max-w-md p-6 rounded-2xl shadow-2xl border \${isDark ? "bg-[#18181b] border-white/10" : "bg-white border-gray-200"} animate-in zoom-in-95 duration-200\`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className={\`text-lg font-bold \${isDark ? "text-white" : "text-gray-900"}\`}>Reset Bio Builder?</h3>
                <p className={\`text-sm mt-1 \${isDark ? "text-gray-400" : "text-gray-500"}\`}>
                  Seluruh history username, headline, dan bio akan dihapus permanen. Anda akan mulai dari awal.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className={\`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors \${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}\`}
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteBio}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-red-600 text-white hover:bg-red-700 shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Ya, Reset Bio
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
`;

fs.writeFileSync(file, newCode);
