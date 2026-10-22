"use client";

import useSWR from "swr";
import { getBlueprintAction } from "@/app/actions/blueprint";
import { getBioBuilderAction } from "@/app/actions/toolsData";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Copy, CheckCircle2, AlertCircle, Loader2, UserCircle, Type, AlignLeft, 
  RefreshCw, Camera, ChevronDown, Trash2, ArrowRight, ArrowLeft, Check, ChevronLeft, Menu, Home, Search, PlusSquare, Video } from "lucide-react";
import Link from "next/link";

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

export default function BioBuilderClient() {
  const { data: initialData } = useSWR("bioBuilder", getBioBuilderAction);
  const { data: blueprint } = useSWR("blueprint", getBlueprintAction);
  const blueprintId = blueprint?.id;
  const blueprintData = blueprint?.aiResult;

  const { data: session } = useSession();
  const userImage = session?.user?.image;
  const router = useRouter();

  const [id, setId] = useState<string | null>(initialData?.id || null);
  const [selectedBio, setSelectedBio] = useState<BioState>({
    username: initialData?.username || "",
    name: initialData?.profileName || "",
    bioText: initialData?.bioText || ""
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatarUrl || userImage || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");
  const [suggestions, setSuggestions] = useState<BioSuggestions>({
    usernames: initialData?.suggestions?.usernames || null,
    names: initialData?.suggestions?.names || null,
    bios: initialData?.suggestions?.bios || null
  });

  const [step, setStep] = useState(() => {
    if (initialData?.profileName) return 3;
    if (initialData?.username) return 2;
    return 1;
  });

  
  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setSelectedBio({
        username: initialData.username || "",
        name: initialData.profileName || "",
        bioText: initialData.bioText || ""
      });
      setAvatarUrl((initialData.avatarUrl && !initialData.avatarUrl.includes("placehold.co")) ? initialData.avatarUrl : (userImage || "https://placehold.co/150x150/e2e8f0/475569?text=Photo"));
      setSuggestions({
        usernames: initialData.suggestions?.usernames || null,
        names: initialData.suggestions?.names || null,
        bios: initialData.suggestions?.bios || null
      });
      if (initialData.profileName) setStep(3);
      else if (initialData.username) setStep(2);
      else setStep(1);
    }
  }, [initialData]);


  // Sync session userImage to avatarUrl when session loads (if still placeholder)
  useEffect(() => {
    if (userImage && avatarUrl.includes('placehold.co')) {
      setAvatarUrl(userImage);
    }
  }, [userImage, avatarUrl]);

  const [loadingStep, setLoadingStep] = useState<"username" | "name" | "bio" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditingMockup, setIsEditingMockup] = useState(false);
  const [mockupBtnState, setMockupBtnState] = useState<'edit' | 'share' | null>(null);



  const copyProfile = () => {
    const profileText = `Username: @${selectedBio.username || 'username'}\nName: ${selectedBio.name || 'Nama Profil'}\nBio:\n${selectedBio.bioText || ''}`;
    navigator.clipboard.writeText(profileText);
    showToast("Profil IG disalin ke clipboard!");
  };


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
    const fullBioStr = `${bioObj.line1}\n${bioObj.line2}\n${bioObj.line3}`;
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
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            // Set max dimensions
            const MAX_WIDTH = 250;
            const MAX_HEIGHT = 250;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height *= MAX_WIDTH / width));
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width *= MAX_HEIGHT / height));
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Compress heavily
            const resStr = canvas.toDataURL("image/jpeg", 0.6);
            setAvatarUrl(resStr);
            autoSave(id, selectedBio, suggestions, resStr);
          };
          img.src = ev.target.result as string;
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
    return (
      <>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">
            Langkah {step}/3
          </div>
        </div>
        <div className="shrink-0 w-full h-1.5 rounded-full mb-6 bg-gray-200 dark:bg-white/10">
          <div 
            className="h-1.5 rounded-full bg-orange-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </>
    );
  };

  
  const Mockup = () => (
    <div className="w-full max-w-[350px] lg:h-full mx-auto rounded-[12px] border border-gray-300 dark:border-[#2C3246] overflow-hidden flex flex-col aspect-[9/19] bg-white dark:bg-[#141B31] font-sans relative shadow-xl">
      {/* Nav Mockup */}
      <div className="px-4 pt-10 md:pt-12 pb-3 flex items-center justify-between bg-white dark:bg-[#141B31] z-10 sticky top-0 border-b border-gray-100 dark:border-[#2C3246] shrink-0 transition-colors">
        <ChevronLeft size={24} className="text-gray-900 dark:text-white shrink-0" />
        <div className="flex items-center gap-1 font-bold text-[15px] md:text-[17px] tracking-tight text-gray-900 dark:text-white truncate px-2">
          {isEditingMockup ? (
            <span>Edit Profile</span>
          ) : (
            <><span>@{selectedBio.username || 'username'}</span><ChevronDown size={14} className="text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" /></>
          )}
        </div>
        <Menu size={24} className="text-gray-900 dark:text-white shrink-0" />
      </div>

      {/* Content Mockup */}
      <div className="p-4 flex-1 bg-white dark:bg-[#141B31] overflow-y-auto scrollbar-hide transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="relative group shrink-0 ml-1">
            <div className="w-[70px] h-[70px] md:w-[84px] md:h-[84px] rounded-full p-[2px] border border-gray-200 dark:border-[#2C3246] overflow-hidden bg-white dark:bg-[#0A1128]">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 border-2 border-white dark:border-black shadow-sm z-10"><Camera size={14} /></button>
            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" />
          </div>
          {!isEditingMockup && (
            <div className="flex-1 flex justify-around text-center ml-2 md:ml-4">
              <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">12</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">posts</p></div>
              <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">1,204</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">followers</p></div>
              <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">432</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">following</p></div>
            </div>
          )}
        </div>

        <div className="mb-4 px-1">
          {isEditingMockup ? (
            <div className="space-y-4 mt-2 animate-in fade-in duration-200">
              <div>
                <label className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Username</label>
                <div className="flex items-center bg-white dark:bg-[#0A1128] rounded-xl border border-gray-300 dark:border-[#2C3246] shadow-none hover:border-gray-900 dark:hover:border-white  dark: hover:bg-[#141B31] focus-within:border-gray-900 dark:focus-within:border-white focus-within:bg-indigo-50 dark:focus-within:bg-[#0A1128]  dark:  px-3 py-2 transition-all duration-200">
                  <span className="text-gray-900 dark:text-white font-bold mr-1 text-[16px] md:text-[14px]">@</span>
                  <input 
                    type="text" value={selectedBio.username} 
                    onChange={(e) => { const val = e.target.value.toLowerCase().replace(/[^a-z]/g, ''); setSelectedBio(prev => ({...prev, username: val})); }}
                    className="outline-none bg-transparent text-[16px] md:text-[14px] font-bold text-gray-900 dark:text-white w-full placeholder-gray-400 dark:placeholder-gray-500" 
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Profile Name</label>
                <input 
                  type="text" maxLength={30} value={selectedBio.name} 
                  onChange={(e) => setSelectedBio(prev => ({...prev, name: e.target.value}))}
                  className="text-[16px] md:text-[14px] font-bold text-gray-900 dark:text-white tracking-tight w-full outline-none bg-white dark:bg-[#0A1128] px-3 py-2 rounded-xl border border-gray-300 dark:border-[#2C3246] shadow-none hover:border-gray-900 dark:hover:border-white  dark: hover:bg-[#141B31] focus:border-gray-900 dark:focus:border-white  dark:  focus:bg-indigo-50 dark:focus:bg-[#0A1128] transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" placeholder="Profil Name IG"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Bio</label>
                  <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border ${selectedBio.bioText.length > 150 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800' : 'bg-gray-100 dark:bg-[#0A1128] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-[#2C3246]'}`}>{selectedBio.bioText.length}/150</span>
                </div>
                <textarea 
                  rows={4} value={selectedBio.bioText}
                  onChange={(e) => setSelectedBio(prev => ({...prev, bioText: e.target.value}))}
                  className={`text-[13px] md:text-[14px] text-gray-900 dark:text-white font-bold w-full outline-none bg-white dark:bg-[#0A1128] px-3 py-2 rounded-xl resize-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${selectedBio.bioText.length > 150 ? 'border border-red-300 dark:border-red-500 focus:border-red-500 focus:bg-red-50 dark:focus:bg-red-900/20  dark: ' : 'border border-gray-300 dark:border-[#2C3246] hover:border-gray-900 dark:hover:border-white  dark: hover:bg-[#141B31] focus:border-gray-900 dark:focus:border-white  dark:  focus:bg-indigo-50 dark:focus:bg-[#0A1128] shadow-none'}`} placeholder="Teks Bio IG"
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-[13px] md:text-[14px] font-bold text-gray-900 dark:text-white tracking-tight mb-0.5">{selectedBio.name || 'Nama Profil'}</p>
              <div className="text-[13px] md:text-[14px] text-gray-900 dark:text-white leading-[1.3] font-normal whitespace-pre-wrap">{selectedBio.bioText || 'Teks bio 3 baris yang mewakili nilai keunikan personal branding Anda akan dimuat di sini...'}</div>
            </>
          )}
        </div>

        <div className="flex gap-2 mb-5 px-1">
          <div 
            onClick={() => { 
              setMockupBtnState('edit');
              setTimeout(() => {
                if (isEditingMockup) autoSave(id, selectedBio, suggestions, avatarUrl); 
                setIsEditingMockup(!isEditingMockup); 
                setMockupBtnState(null);
              }, 200);
            }}
            className={`flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] cursor-pointer transition-all duration-200 border ${mockupBtnState === 'edit' ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white border-rn-accent' : 'border-gray-300 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-gray-700 dark:text-white shadow-none hover:border-gray-900 dark:hover:border-white hover:bg-white dark:hover:bg-[#0A1128] hover:text-gray-900 dark:hover:text-white active:scale-95'}`}
          >{isEditingMockup ? 'Save profile' : 'Edit profile'}</div>
          <div 
            onClick={() => {
              setMockupBtnState('share');
              setTimeout(() => {
                setMockupBtnState(null);
                showToast('Fitur Bagikan Profil akan segera hadir!', 'success');
              }, 200);
            }}
            className={`flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] cursor-pointer transition-all duration-200 border ${mockupBtnState === 'share' ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white border-rn-accent' : 'border-gray-300 dark:border-[#2C3246] bg-white dark:bg-[#141B31] text-gray-700 dark:text-white shadow-none hover:border-gray-900 dark:hover:border-white hover:bg-white dark:hover:bg-[#0A1128] hover:text-gray-900 dark:hover:text-white active:scale-95'}`}
          >Share profile</div>
        </div>

        <div className="flex gap-3 md:gap-4 pb-2 px-1 overflow-hidden">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-full border border-gray-300 dark:border-[#2C3246] p-0.5 flex items-center justify-center"><div className="w-full h-full rounded-full bg-gray-100 dark:bg-[#0A1128]"></div></div>
                <span className="text-[10px] md:text-[11px] text-gray-800 dark:text-gray-400 font-medium">Highlight</span>
              </div>
            ))}
        </div>
      </div>
      {/* Footer Mockup */}
      <div className="bg-white dark:bg-[#141B31] border-t border-gray-200 dark:border-[#2C3246] px-6 pt-3 pb-6 md:pb-8 flex justify-between items-center text-gray-900 dark:text-white mt-auto sticky bottom-0 shrink-0 transition-colors">
          <Home size={22} className="md:w-[26px] md:h-[26px]" />
          <Search size={22} className="md:w-[26px] md:h-[26px]" />
          <PlusSquare size={22} className="md:w-[26px] md:h-[26px]" />
          <Video size={22} className="md:w-[26px] md:h-[26px]" />
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden border border-gray-300 dark:border-white/40"><img src={avatarUrl} className="w-full h-full object-cover" alt="nav" /></div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 pt-2 md:pt-4 flex flex-col min-h-[calc(100dvh-150px)] lg:h-[calc(100vh-180px)] animate-in fade-in duration-300">
      
      <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-0">
        {/* Left Panel: Builder Steps */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-start">
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-1">
                  <h1 className="text-xl md:text-3xl font-bold font-heading whitespace-nowrap text-gray-900 dark:text-white">
                    Bio Builder
                  </h1>
                  <div className="w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                    <UserCircle className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Rakit profil Instagram yang optimasi konversi dari Master Blueprint.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDeleteModalOpen(true)} className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap">
                <Trash2 className="w-4 h-4" /> <span>Reset Bio</span>
              </button>
            </div>
          </div>

          {renderTimeline()}
          
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* STEP 1: USERNAME */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Pilih Username</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Username yang mudah diingat, diketik, dan mencerminkan brand Anda.</p>
                
                {!suggestions.usernames ? (
                  <div className="text-center py-10">
                    <button onClick={generateUsernames} disabled={loadingStep !== null} className="px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-orange-500/20 flex items-center gap-2 mx-auto disabled:opacity-50">
                      {loadingStep === "username" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCircle className="w-4 h-4" />}
                      Generate Username dengan AI
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Rekomendasi AI</span>
                      <button onClick={generateUsernames} disabled={loadingStep !== null} className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline">
                        <RefreshCw className={`w-3 h-3 ${loadingStep === "username" ? "animate-spin" : ""}`} /> Regenerate
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {suggestions.usernames.map((uname, idx) => (
                        <button key={idx} onClick={() => handleSelectUsername(uname)} className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${selectedBio.username === uname.toLowerCase().replace(/[^a-z0-9_.]/g, '') ? "border-orange-500 bg-orange-500/10 dark:border-orange-500/50 shadow-sm" : "border-gray-200 hover:border-orange-500/50 dark:border-[#2C3246] dark:hover:border-orange-500/50 bg-white dark:bg-[#141B31]"}`}>
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">@{uname}</span>
                          {selectedBio.username === uname.toLowerCase().replace(/[^a-z0-9_.]/g, '') && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-[#2C3246] pt-6 mb-2">
                      <label className="text-sm font-bold mb-2 block text-gray-900 dark:text-white">Atau ketik sendiri:</label>
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
                          className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rn-accent bg-gray-50 border-gray-200 text-gray-900 dark:bg-[#0A1128] dark:border-[#2C3246] dark:text-white"
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
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Headline Profil (Nama)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Nama tebal di bawah foto profil yang bisa di-search oleh orang di Instagram. (Maksimal 30 huruf)</p>
                
                {!suggestions.names ? (
                  <div className="text-center py-10">
                    <button onClick={() => generateNames(selectedBio.username, selectedBio)} disabled={loadingStep !== null} className="px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-orange-500/20 flex items-center gap-2 mx-auto disabled:opacity-50">
                      {loadingStep === "name" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
                      Generate Headline dengan AI
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Rekomendasi AI</span>
                      <button onClick={() => generateNames(selectedBio.username, selectedBio)} disabled={loadingStep !== null} className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline">
                        <RefreshCw className={`w-3 h-3 ${loadingStep === "name" ? "animate-spin" : ""}`} /> Regenerate
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 mb-6">
                      {suggestions.names.map((pname, idx) => (
                        <button key={idx} onClick={() => handleSelectName(pname)} className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${selectedBio.name === pname ? "border-orange-500 bg-orange-500/10 dark:border-orange-500/50 shadow-sm" : "border-gray-200 hover:border-orange-500/50 dark:border-[#2C3246] dark:hover:border-orange-500/50 bg-white dark:bg-[#141B31]"}`}>
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{pname}</span>
                          {selectedBio.name === pname && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-[#2C3246] pt-6 mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-900 dark:text-white">Atau ketik sendiri:</label>
                        <span className={`text-xs ${selectedBio.name.length > 30 ? "text-red-500 font-bold" : "text-gray-500"}`}>{selectedBio.name.length} / 30</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Nama | Strategi/Niche"
                        value={selectedBio.name}
                        onChange={(e) => setSelectedBio(prev => ({...prev, name: e.target.value}))}
                        onBlur={() => autoSave(id, selectedBio, suggestions, avatarUrl)}
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rn-accent bg-gray-50 border-gray-200 text-gray-900 dark:bg-[#0A1128] dark:border-[#2C3246] dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: BIO TEXT */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Isi Bio (3 Baris)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Teks deskripsi profil yang memuat benefit, kredibilitas, dan Call to Action. (Maksimal 150 huruf)</p>
                
                {!suggestions.bios ? (
                  <div className="text-center py-10">
                    <button onClick={() => generateBios(selectedBio.name, selectedBio)} disabled={loadingStep !== null} className="px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-orange-500/20 flex items-center gap-2 mx-auto disabled:opacity-50">
                      {loadingStep === "bio" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlignLeft className="w-4 h-4" />}
                      Generate Bio dengan AI
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Rekomendasi AI</span>
                      <button onClick={() => generateBios(selectedBio.name, selectedBio)} disabled={loadingStep !== null} className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 hover:underline">
                        <RefreshCw className={`w-3 h-3 ${loadingStep === "bio" ? "animate-spin" : ""}`} /> Regenerate
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      {suggestions.bios.map((bioObj, idx) => {
                        const fullStr = `${bioObj.line1}\n${bioObj.line2}\n${bioObj.line3}`;
                        const isSelected = selectedBio.bioText === fullStr;
                        return (
                          <button key={idx} onClick={() => handleSelectBio(bioObj)} className={`p-4 rounded-xl border text-left flex items-start justify-between gap-4 transition-all ${isSelected ? "border-orange-500 bg-orange-500/10 dark:border-orange-500/50 shadow-sm" : "border-gray-200 hover:border-orange-500/50 dark:border-[#2C3246] dark:hover:border-orange-500/50 bg-white dark:bg-[#141B31]"}`}>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                              {fullStr}
                            </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-1" />}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-[#2C3246] pt-6 mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-900 dark:text-white">Atau edit kustom:</label>
                        <span className={`text-xs ${selectedBio.bioText.length > 150 ? "text-red-500 font-bold" : "text-gray-500"}`}>{selectedBio.bioText.length} / 150</span>
                      </div>
                      <textarea 
                        rows={3}
                        value={selectedBio.bioText}
                        onChange={(e) => setSelectedBio(prev => ({...prev, bioText: e.target.value}))}
                        onBlur={() => autoSave(id, selectedBio, suggestions, avatarUrl)}
                        className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-rn-accent resize-none bg-gray-50 border-gray-200 text-gray-900 dark:bg-[#0A1128] dark:border-[#2C3246] dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            </div>
            {/* Navigation Buttons */}
            <div className="mt-4 pt-6 flex items-center justify-between shrink-0">
              {step > 1 ? (
                <button 
                  onClick={goToPrevStep} 
                  title="Kembali"
                  aria-label="Kembali"
                  className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <div></div> // Empty div for flex layout
              )}
              
              {step < 3 ? (
                <button 
                  onClick={goToNextStep} 
                  disabled={(step === 1 && !selectedBio.username) || (step === 2 && !selectedBio.name)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white flex items-center gap-2 transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Lanjut <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    autoSave(id, selectedBio, suggestions, avatarUrl);
                    showToast("Bio berhasil disimpan!", "success");
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white flex items-center gap-2 transition-colors shadow-sm shadow-orange-500/20 cursor-pointer"
                >
                  Simpan <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Panel: Live Mockup */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col min-h-0">
          <h3 className="font-bold text-center mb-4 uppercase tracking-widest text-[11px] text-gray-400 dark:text-gray-500 shrink-0">LIVE MOCKUP</h3>
          <div className="flex-1 min-h-0 flex flex-col items-center justify-start">
            <Mockup />
            
            {/* Copy Button */}
            <div className="w-full max-w-[350px] mt-4">
              <button 
                onClick={copyProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white transition-colors shadow-sm shadow-orange-500/20 cursor-pointer"
              >
                <Copy className="w-4 h-4" /> Copy Profile IG
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31]">
            {toast.type === "success" ? (
              <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            <p className="text-sm font-bold text-gray-900 dark:text-white">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reset Bio Builder?</h3>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                  Seluruh history username, headline, dan bio akan dihapus permanen. Anda akan mulai dari awal.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1f2947]"
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
