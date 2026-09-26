"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Loader2, ArrowLeft, CheckCircle2, Compass, FileJson, Download, FileText, Upload, RefreshCw, Save, AlertCircle, Target, Award, MessageSquare, Flag, Eye, Heart, Zap, TrendingUp, Users, LayoutDashboard, Map, Video, DollarSign, User, Lock, Star, Activity, X, Crosshair, Shield, List, BookOpen, Megaphone, UserCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import HeroCanvasCell from "@/components/master-blueprint/HeroCanvasCell";
import CanvasCell from "@/components/master-blueprint/CanvasCell";


export default function MasterBlueprintClient({ initialData, nicheReferences }: { initialData?: any, nicheReferences?: any[] }) {
  const { data: session, status } = useSession();
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [canvasData, setCanvasData] = useState<any>(initialData?.aiResult || null);
  const [blueprintId, setBlueprintId] = useState<string | null>(initialData?.id || null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isContentOpen, setIsContentOpen] = useState(true);
  const [isPsychologyOpen, setIsPsychologyOpen] = useState(true);

  const handleBuatUlang = () => {
    setCanvasData(null);
    setBlueprintId(null);
    setStep(1);
    setFormData(initialForm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm = {
    nama: "",
    ikigai_suka: "",
    ikigai_kuasa: "",
    ikigai_dibutuhkan: "",
    ikigai_dibayar: "",
    demo_nama_persona: "",
    demo_usia: "",
    demo_gender: "",
    demo_lokasi: "",
    demo_pekerjaan: "",
    demo_penghasilan: "",
    demo_pendidikan: "",
    demo_status_personal: "",
    demo_platform: "",
    demo_jam_aktif: "",
    psiko_pain_point: "",
    psiko_tujuan: "",
    psiko_ketakutan: "",
    psiko_aspirasi: "",
    psiko_frustrasi: "",
    psiko_pertanyaan: "",
    psiko_konsumsi: "",
    psiko_sosok: "",
    psiko_bahasa: "",
    psiko_mau_bayar: "",
    gaya_komunikasi: "",
    platform: ""
  };

  const [formData, setFormData] = useState(initialData?.inputData || initialForm);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadNiche = (niche: any) => {
    if (!niche) return;
    setFormData({
      ...formData,
      ikigai_suka: niche.ikigai_suka || "",
      ikigai_kuasa: niche.ikigai_kuasa || "",
      ikigai_dibutuhkan: niche.ikigai_dibutuhkan || "",
      ikigai_dibayar: niche.ikigai_dibayar || "",
      demo_nama_persona: niche.demo_nama_persona || "",
      demo_usia: niche.demo_usia || "",
      demo_gender: niche.demo_gender || "",
      demo_lokasi: niche.demo_lokasi || "",
      demo_pekerjaan: niche.demo_pekerjaan || "",
      demo_penghasilan: niche.demo_penghasilan || "",
      demo_pendidikan: niche.demo_pendidikan || "",
      demo_status_personal: niche.demo_status_personal || "",
      demo_platform: niche.demo_platform || "",
      demo_jam_aktif: niche.demo_jam_aktif || "",
      psiko_pain_point: niche.psiko_pain_point || "",
      psiko_tujuan: niche.psiko_tujuan || "",
      psiko_ketakutan: niche.psiko_ketakutan || "",
      psiko_aspirasi: niche.psiko_aspirasi || "",
      psiko_frustrasi: niche.psiko_frustrasi || "",
      psiko_pertanyaan: niche.psiko_pertanyaan || "",
      psiko_konsumsi: niche.psiko_konsumsi || "",
      psiko_sosok: niche.psiko_sosok || "",
      psiko_bahasa: niche.psiko_bahasa || "",
      psiko_mau_bayar: niche.psiko_mau_bayar || ""
    });
    showToast(`Data niche "${niche.niche_topik}" berhasil dimuat!`);
  };

  const importJSON = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.formData) setFormData({ ...initialForm, ...json.formData });
        if (json.canvasData) setCanvasData(json.canvasData);
        showToast("Data berhasil diimport!");
      } catch (err) {
        showToast("Format file JSON tidak valid.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportJSON = () => {
    if (!canvasData) return;
    const dataStr = JSON.stringify({ formData, canvasData }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `master-blueprint-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTXT = () => {
    if (!canvasData) return;
    let txt = `MASTER BLUEPRINT\n\n`;
    Object.entries(canvasData).forEach(([key, val]) => {
      txt += `${key.toUpperCase()}:\n`;
      if (Array.isArray(val)) {
        val.forEach(v => txt += `- ${v}\n`);
      } else {
        txt += `${val}\n`;
      }
      txt += `\n`;
    });
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `master-blueprint-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e?: React.FormEvent, isRegenerate = false) => {
    if (e) e.preventDefault();
    if (step < 4 && !isRegenerate) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, id: blueprintId };
      const res = await fetch("/api/ai/master-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal generate Master Blueprint");
      }
      const data = await res.json();
      setCanvasData(data.result);
      if (data.id) setBlueprintId(data.id);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Terjadi kesalahan saat generate. Coba lagi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const confirmDelete = async () => {
    setIsDeleteModalOpen(false);
    if (!blueprintId) {
      setCanvasData(null);
      setStep(1);
      router.refresh();
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/master-blueprint?id=${blueprintId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Blueprint berhasil dihapus permanen!");
        setCanvasData(null);
        setBlueprintId(null);
        setStep(1);
        router.refresh();
      } else {
        showToast("Gagal menghapus blueprint.", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBlueprint = () => {
    setIsDeleteModalOpen(true);
  };

  const saveUpdatesToDB = async () => {
    if (!canvasData) return;
    setIsSaving(true);
    try {
      if (blueprintId) {
        // Update existing
        const res = await fetch("/api/master-blueprint", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: blueprintId, aiResult: canvasData }),
        });
        if (res.ok) showToast("Perubahan berhasil disimpan ke database!");
        else showToast("Gagal menyimpan perubahan.", "error");
      } else {
        // Create new
        const res = await fetch("/api/master-blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData, aiResult: canvasData }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) setBlueprintId(data.id);
          showToast("Data baru berhasil disimpan ke database!");
        } else {
          showToast("Gagal menyimpan data baru.", "error");
        }
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCanvas = (key: string, value: string | string[]) => {
    setCanvasData((prev: any) => {
      if (prev?.canvas_blueprint) {
        return {
          ...prev,
          canvas_blueprint: { ...prev.canvas_blueprint, [key]: value }
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const inputClass = `w-full p-3 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500/50 outline-none transition-all ${
    isDark ? "bg-[#18181b] border-white/10 text-white placeholder:text-gray-600" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
  }`;
  const labelClass = `text-xs font-bold mb-1.5 block ${isDark ? "text-gray-300" : "text-gray-700"}`;

  if (status === "loading") {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Render Result if generated
  if (canvasData) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 py-8 md:py-12 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 font-heading text-gray-900 dark:text-white">
              Master Blueprint
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                <Compass className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rancang pondasi konten dan bisnismu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shrink-0 transition-all bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20">
                <Download className="w-4 h-4" /> Export
              </button>
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                  <button onClick={() => { exportJSON(); setIsExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <FileJson className="w-4 h-4" /> Export JSON
                  </button>
                  <button onClick={() => { exportTXT(); setIsExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Export TXT
                  </button>
                </div>
              )}
            </div>
            <button onClick={(e) => { e.preventDefault(); saveUpdatesToDB(); }} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shrink-0 transition-all bg-orange-500 text-white hover:bg-orange-600 shadow-sm disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
              </button>
          </div>
        </div>

        
        {/* Support both legacy canvas_blueprint wrapping and direct object */}
        {(() => {
          const blueprint = canvasData.canvas_blueprint || canvasData;
          return (
            <div className="space-y-6 md:space-y-10">
              <HeroCanvasCell title="Positioning & Identity" dataKey="positioning_identity" content={blueprint.positioning_identity} onUpdate={handleUpdateCanvas} />
              
              {/* PAGE 1: Brand Foundation */}
              <div className="bg-white dark:bg-[#121214] rounded-[12px] border border-gray-200 dark:border-white/5 p-5 md:p-8">
                <div 
                  onClick={() => setIsBrandOpen(!isBrandOpen)} 
                  className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 pb-4 border-b border-gray-200 dark:border-white/10 gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-heading group-hover:text-orange-500 transition-colors">Brand Foundation</h2>
                    {isBrandOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-400 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold self-start md:self-auto border border-emerald-200 dark:border-emerald-800/50">PAGE 1 - CORE FOUNDATION</span>
                </div>
                {isBrandOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CanvasCell title="Niche Statement" badge="Spesifik" dataKey="niche_statement" content={blueprint.niche_statement} icon={Target} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Value Statement" badge="Inti" dataKey="value_statement" content={blueprint.value_statement} icon={Award} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Core Message" badge="Pesan" dataKey="core_message" content={blueprint.core_message} icon={MessageSquare} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Mission Statement" badge="Misi" dataKey="mission_statement" content={blueprint.mission_statement} icon={Flag} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Vision & Goals" badge="Target" dataKey="vision_goals" content={blueprint.vision_goals} icon={Eye} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Core Values" badge="Prinsip" dataKey="core_values" content={blueprint.core_values} icon={Heart} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Strengths" badge="Kekuatan" dataKey="strengths" content={blueprint.strengths} icon={Zap} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Knowledge & Skills" badge="Keahlian" dataKey="knowledge_skills" content={blueprint.knowledge_skills} icon={BookOpen} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Purpose & Motivation" badge="Motivasi" dataKey="purpose_motivation" content={blueprint.purpose_motivation} icon={Star} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Areas of Expertise" badge="Spesialisasi" dataKey="areas_of_expertise" content={blueprint.areas_of_expertise} icon={Award} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Key Messages" badge="Pesan Utama" dataKey="key_messages" content={blueprint.key_messages} icon={MessageSquare} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Language & Tone" badge="Gaya Bahasa" dataKey="language_tone" content={blueprint.language_tone} icon={Megaphone} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Brand Personality" badge="Karakter" dataKey="brand_personality" content={blueprint.brand_personality} icon={UserCircle} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Brand Promise" badge="Janji" dataKey="brand_promise" content={blueprint.brand_promise} icon={Shield} onUpdate={handleUpdateCanvas} />
                </div>
                )}
              </div>
              
              {/* PAGE 2: Expansion Engine */}
              <div className="bg-white dark:bg-[#121214] rounded-[12px] border border-gray-200 dark:border-white/5 p-5 md:p-8">
                <div 
                  onClick={() => setIsContentOpen(!isContentOpen)}
                  className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 pb-4 border-b border-gray-200 dark:border-white/10 gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-heading group-hover:text-orange-500 transition-colors">Content & Business Strategy</h2>
                    {isContentOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold self-start md:self-auto border border-blue-200 dark:border-blue-800/50">PAGE 2 - EXPANSION ENGINE</span>
                </div>
                {isContentOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CanvasCell title="Market Potential" badge="Pasar" dataKey="market_potential" content={blueprint.market_potential} icon={TrendingUp} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Competitor Landscape" badge="Kompetitor" dataKey="competitor_landscape" content={blueprint.competitor_landscape} icon={Users} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Content Gap" badge="Celah Pasar" dataKey="content_gap" content={blueprint.content_gap} icon={Compass} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Target Audiences" badge="Audiens" dataKey="target_audiences" content={blueprint.target_audiences} icon={Users} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Pain Points" badge="Masalah" dataKey="pain_points" content={blueprint.pain_points} icon={AlertCircle} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Audience Transformation" badge="Before & After" dataKey="audience_transformation" content={blueprint.audience_transformation} icon={RefreshCw} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Solutions & Benefits" badge="Solusi" dataKey="solutions_benefits" content={blueprint.solutions_benefits} icon={CheckCircle2} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Content Pillars" badge="Pilar Konten" dataKey="content_pillars" content={blueprint.content_pillars} icon={LayoutDashboard} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Content Strategy" badge="Taktik Konten" dataKey="content_strategy" content={blueprint.content_strategy} icon={Map} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Platform Strategy" badge="Fokus Platform" dataKey="platform_strategy" content={blueprint.platform_strategy} icon={Video} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Monetization Strategy" badge="Monetisasi" dataKey="monetization_strategy" content={blueprint.monetization_strategy} icon={DollarSign} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="CTA Strategy" badge="Call to Action" dataKey="cta_strategy" content={blueprint.cta_strategy} icon={Target} onUpdate={handleUpdateCanvas} />
                </div>
                )}
              </div>
              
              {/* PAGE 3: Audience Psychology */}
              <div className="bg-white dark:bg-[#121214] rounded-[12px] border border-gray-200 dark:border-white/5 p-5 md:p-8">
                <div 
                  onClick={() => setIsPsychologyOpen(!isPsychologyOpen)}
                  className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 pb-4 border-b border-gray-200 dark:border-white/10 gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-heading group-hover:text-orange-500 transition-colors">Audience Psychology</h2>
                    {isPsychologyOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-400 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold self-start md:self-auto border border-purple-200 dark:border-purple-800/50">PAGE 3 - DEEP CONNECTION</span>
                </div>
                {isPsychologyOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CanvasCell title="Persona Narrative" badge="ICP Story" dataKey="persona_narrative" content={blueprint.persona_narrative} icon={User} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Trigger Points" badge="Momen Butuh" dataKey="trigger_points" content={blueprint.trigger_points} icon={Zap} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Buying Psychology" badge="Konversi" dataKey="buying_psychology" content={blueprint.buying_psychology} icon={DollarSign} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Deep Questions" badge="Isi Kepala" dataKey="deep_audience_questions" content={blueprint.deep_audience_questions} icon={MessageSquare} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Stress & Blockers" badge="Hambatan" dataKey="stress_blockers" content={blueprint.stress_blockers} icon={Lock} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Dream Outcome" badge="Impian" dataKey="dream_outcome" content={blueprint.dream_outcome} icon={Star} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Biggest Fears" badge="Ketakutan" dataKey="biggest_fears" content={blueprint.biggest_fears} icon={AlertCircle} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Daily Frustrations" badge="Frustasi" dataKey="daily_frustrations" content={blueprint.daily_frustrations} icon={Activity} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="False Beliefs" badge="Asumsi Salah" dataKey="false_beliefs" content={blueprint.false_beliefs} icon={X} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Internal Problems" badge="Masalah Internal" dataKey="internal_problems" content={blueprint.internal_problems} icon={User} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="External Problems" badge="Masalah Eksternal" dataKey="external_problems" content={blueprint.external_problems} icon={Crosshair} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Biggest Objections" badge="Keberatan" dataKey="biggest_objections" content={blueprint.biggest_objections} icon={MessageSquare} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Emotional Triggers" badge="Pemicu Emosi" dataKey="emotional_triggers" content={blueprint.emotional_triggers} icon={Zap} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Audience Vocabulary" badge="Istilah" dataKey="audience_vocabulary" content={blueprint.audience_vocabulary} icon={FileText} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Common Enemies" badge="Musuh Bersama" dataKey="common_enemies" content={blueprint.common_enemies} icon={Shield} onUpdate={handleUpdateCanvas} />
                  <CanvasCell title="Brand Content Rules" badge="Aturan Konten" dataKey="brand_content_rules" content={blueprint.brand_content_rules} icon={List} onUpdate={handleUpdateCanvas} />
                </div>
                )}
              </div>
              
              <div className="mt-8 flex flex-col items-center pb-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button onClick={handleBuatUlang} className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shrink-0 transition-all bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 shadow-sm w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4" /> Buat Ulang Blueprint
                  </button>
                  <button onClick={handleDeleteBlueprint} disabled={isSaving} className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shrink-0 transition-all bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 shadow-sm w-full sm:w-auto disabled:opacity-50">
                    <Trash2 className="w-4 h-4" /> Hapus Blueprint
                  </button>
                </div>
              </div>

            </div>
          );
        })()}
        
        {toast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${isDark ? "bg-[#18181b] border-white/10" : "bg-white border-gray-200"}`}>
              {toast.type === "success" ? (
                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{toast.message}</p>
            </div>
          </div>
        )}
      
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${isDark ? "bg-[#18181b] border-white/10" : "bg-white border-gray-200"} animate-in zoom-in-95 duration-200`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Hapus Blueprint?</h3>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Data ini akan dihapus permanen dari database dan tidak bisa dikembalikan.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-8">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm transition-colors bg-red-600 text-white hover:bg-red-700 shadow-sm flex items-center gap-2"
                >
                  Ya, Hapus Blueprint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 pt-2 md:pt-4 flex flex-col h-[calc(100dvh-150px)] md:h-[calc(100dvh-180px)]">
      <input type="file" ref={fileInputRef} onChange={importJSON} accept=".json" className="hidden" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-start">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-1">
              <h1 className={`text-xl md:text-3xl font-bold font-heading whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                Master Blueprint
              </h1>
              <div className={`w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center ${isDark ? "bg-[#27272a] text-orange-500" : "bg-orange-50 text-orange-500"}`}>
                <Compass className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
            <p className={`text-xs md:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Rancang pondasi konten dan bisnismu.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            onChange={(e) => {
              const niche = (nicheReferences || []).find(n => n.id === e.target.value);
              if (niche) loadNiche(niche.data);
              e.target.value = "";
            }}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-white/10 rounded-xl outline-none truncate max-w-[150px] md:max-w-[200px] border-r-8 border-transparent"
          >
            <option value="">💡 Referensi Niche...</option>
            {(nicheReferences || []).map((n: any, i: number) => <option key={n.id || i} value={n.id}>{n.nama}</option>)}
          </select>
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap">
            <Upload className="w-4 h-4" /> Import JSON
          </button>
        </div>
      </div>

      {/* INDIKATOR LANGKAH & PROGRESS BAR */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className={`text-xs md:text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Langkah {step}/4
        </div>
      </div>
      <div className={`shrink-0 w-full h-1.5 rounded-full mb-6 ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
        <div 
          className="h-1.5 rounded-full bg-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto pb-6 px-1 custom-scrollbar">
          {/* Step 1: Identitas Kreator */}
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <h3 className={`font-bold text-lg mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Identitas Kreator</h3>
              <div>
                <label className={labelClass}>Nama Kamu</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} required className={inputClass} placeholder="Cth: Angga" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Topik yang Disukai (Passion)</label>
                  <textarea rows={3} name="ikigai_suka" value={formData.ikigai_suka} onChange={handleChange} required className={inputClass} placeholder="Cth: Nulis copywriting, bahas tech, design..." />
                </div>
                <div>
                  <label className={labelClass}>Keahlian (Bisa/Kuasa)</label>
                  <textarea rows={3} name="ikigai_kuasa" value={formData.ikigai_kuasa} onChange={handleChange} required className={inputClass} placeholder="Cth: Jago riset, paham Canva..." />
                </div>
                <div>
                  <label className={labelClass}>Masalah yang Bisa Diselesaikan (Demand)</label>
                  <textarea rows={3} name="ikigai_dibutuhkan" value={formData.ikigai_dibutuhkan} onChange={handleChange} required className={inputClass} placeholder="Cth: Banyak umkm ga tau cara bikin promo..." />
                </div>
                <div>
                  <label className={labelClass}>Cara Monetisasi (Dibayar)</label>
                  <textarea rows={3} name="ikigai_dibayar" value={formData.ikigai_dibayar} onChange={handleChange} required className={inputClass} placeholder="Cth: Jual e-book, freelance, affiliate..." />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Profil Target Audiens (Demografis) */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <h3 className={`font-bold text-lg mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Profil Target Audiens (Demografis)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Nama Persona</label><input type="text" name="demo_nama_persona" value={formData.demo_nama_persona} onChange={handleChange} required className={inputClass} placeholder="Cth: Budi si Pemula" /></div>
                
                <div>
                  <label className={labelClass}>Usia</label>
                  <select name="demo_usia" value={formData.demo_usia} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Rentang Usia...</option>
                    <option value="Di bawah 18 tahun">Di bawah 18 tahun</option>
                    <option value="18 - 24 tahun">18 - 24 tahun</option>
                    <option value="25 - 34 tahun">25 - 34 tahun</option>
                    <option value="35 - 44 tahun">35 - 44 tahun</option>
                    <option value="45+ tahun">45+ tahun</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Gender</label>
                  <select name="demo_gender" value={formData.demo_gender} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Gender...</option>
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                    <option value="Semua Gender">Semua Gender</option>
                  </select>
                </div>
                
                <div><label className={labelClass}>Lokasi</label><input type="text" name="demo_lokasi" value={formData.demo_lokasi} onChange={handleChange} required className={inputClass} placeholder="Cth: Kota Besar di Indonesia" /></div>
                <div><label className={labelClass}>Pekerjaan</label><input type="text" name="demo_pekerjaan" value={formData.demo_pekerjaan} onChange={handleChange} required className={inputClass} placeholder="Cth: Karyawan Swasta" /></div>
                
                <div>
                  <label className={labelClass}>Penghasilan</label>
                  <select name="demo_penghasilan" value={formData.demo_penghasilan} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Penghasilan...</option>
                    <option value="Pelajar/Mahasiswa (Belum Berpenghasilan)">Pelajar/Mahasiswa</option>
                    <option value="Di bawah Rp 3 Juta">Di bawah Rp 3 Juta</option>
                    <option value="Rp 3 Juta - Rp 10 Juta">Rp 3 Juta - Rp 10 Juta</option>
                    <option value="Di atas Rp 10 Juta">Di atas Rp 10 Juta</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Pendidikan</label>
                  <select name="demo_pendidikan" value={formData.demo_pendidikan} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Pendidikan...</option>
                    <option value="SMA/SMK Sederajat">SMA/SMK Sederajat</option>
                    <option value="D3 / S1">D3 / S1</option>
                    <option value="S2 / S3">S2 / S3</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Status Personal</label>
                  <select name="demo_status_personal" value={formData.demo_status_personal} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Status...</option>
                    <option value="Lajang / Belum Menikah">Lajang / Belum Menikah</option>
                    <option value="Menikah Belum Punya Anak">Menikah Belum Punya Anak</option>
                    <option value="Menikah & Punya Anak (Parenting)">Menikah & Punya Anak</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Platform Utama</label>
                  <select name="demo_platform" value={formData.demo_platform} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Platform...</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="X (Twitter)">X (Twitter)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Jam Aktif Utama</label>
                  <select name="demo_jam_aktif" value={formData.demo_jam_aktif} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Waktu...</option>
                    <option value="Pagi (06:00 - 09:00)">Pagi (06:00 - 09:00)</option>
                    <option value="Siang (12:00 - 14:00)">Siang (Istirahat 12:00 - 14:00)</option>
                    <option value="Sore (16:00 - 18:00)">Sore (Pulang Kerja 16:00 - 18:00)</option>
                    <option value="Malam (19:00 - 22:00)">Malam (Prime Time 19:00 - 22:00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Profil Target Audiens (Psikografis) */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <h3 className={`font-bold text-lg mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Profil Target Audiens (Psikografis)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Pain Point Utama</label><textarea rows={2} name="psiko_pain_point" value={formData.psiko_pain_point} onChange={handleChange} required className={inputClass} placeholder="Masalah utama audiens..." /></div>
                <div><label className={labelClass}>Tujuan / Keinginan (Dream)</label><textarea rows={2} name="psiko_tujuan" value={formData.psiko_tujuan} onChange={handleChange} required className={inputClass} placeholder="Apa yang ingin dicapai..." /></div>
                <div><label className={labelClass}>Ketakutan Terbesar</label><textarea rows={2} name="psiko_ketakutan" value={formData.psiko_ketakutan} onChange={handleChange} required className={inputClass} placeholder="Apa yang paling ditakuti..." /></div>
                <div><label className={labelClass}>Aspirasi</label><textarea rows={2} name="psiko_aspirasi" value={formData.psiko_aspirasi} onChange={handleChange} required className={inputClass} placeholder="Mimpi besar mereka..." /></div>
                <div><label className={labelClass}>Frustrasi Harian</label><textarea rows={2} name="psiko_frustrasi" value={formData.psiko_frustrasi} onChange={handleChange} required className={inputClass} placeholder="Yang bikin pusing tiap hari..." /></div>
                <div><label className={labelClass}>Pertanyaan di Kepala</label><textarea rows={2} name="psiko_pertanyaan" value={formData.psiko_pertanyaan} onChange={handleChange} required className={inputClass} placeholder="Cth: Gimana sih caranya..." /></div>
                <div><label className={labelClass}>Kebiasaan Konsumsi Media</label><textarea rows={2} name="psiko_konsumsi" value={formData.psiko_konsumsi} onChange={handleChange} required className={inputClass} placeholder="Suka baca thread panjang atau video 15 detik?" /></div>
                <div><label className={labelClass}>Sosok yang Diikuti</label><textarea rows={2} name="psiko_sosok" value={formData.psiko_sosok} onChange={handleChange} required className={inputClass} placeholder="Cth: Raditya Dika, Deddy Corbuzier..." /></div>
                <div><label className={labelClass}>Gaya Bahasa</label><textarea rows={2} name="psiko_bahasa" value={formData.psiko_bahasa} onChange={handleChange} required className={inputClass} placeholder="Formal, gaul, santai, teknis?" /></div>
                <div><label className={labelClass}>Mau Bayar Untuk...</label><textarea rows={2} name="psiko_mau_bayar" value={formData.psiko_mau_bayar} onChange={handleChange} required className={inputClass} placeholder="Cth: Kursus murah, template excel, jasa edit..." /></div>
              </div>
            </div>
          )}

          {/* Step 4: Gaya Komunikasi */}
          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <h3 className={`font-bold text-lg mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Gaya Komunikasi & Eksekusi</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Pilih Gaya Komunikasi Utama</label>
                  <select name="gaya_komunikasi" value={formData.gaya_komunikasi} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Gaya...</option>
                    <option value="Edukatif & Solutif (Guru / Pakar)">Edukatif & Solutif (Guru / Pakar)</option>
                    <option value="Santai & Relatable (Teman Nongkrong)">Santai & Relatable (Teman Nongkrong)</option>
                    <option value="Tegas & Blak-blakan (Hard Truth)">Tegas & Blak-blakan (Hard Truth)</option>
                    <option value="Motivasi & Inspiratif (Cheerleader)">Motivasi & Inspiratif (Cheerleader)</option>
                    <option value="Analitis & Data-driven (Peneliti)">Analitis & Data-driven (Peneliti)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Platform Eksekusi Pertama</label>
                  <select name="platform" value={formData.platform} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Mulai dari mana?</option>
                    <option value="Instagram Reels & Carousel">Instagram Reels & Carousel</option>
                    <option value="TikTok (Short Video)">TikTok (Short Video)</option>
                    <option value="X (Twitter) Threads">X (Twitter) Threads</option>
                    <option value="LinkedIn (Personal Branding)">LinkedIn (Personal Branding)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NAVIGASI (Sticky di Bawah) */}
        <div className="shrink-0 pt-6 pb-2 mt-4 flex justify-between items-center border-t border-transparent">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {step === 4 ? (isSubmitting ? "Generating..." : "Generate") : "Lanjut"}
          </button>
        </div>
      </form>

      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border ${isDark ? "bg-[#18181b] border-white/10" : "bg-white border-gray-200"}`}>
            {toast.type === "success" ? (
              <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{toast.message}</p>
          </div>
        </div>
      )}
    
        

    </div>
  );
}