"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, CheckCircle2, Compass, Mic, FileJson, Target, Download, PlayCircle } from "lucide-react";

export default function MasterBlueprintPage() {
  const { data: session, status } = useSession();
  const { theme, systemTheme } = useTheme();
  const router = useRouter();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canvasData, setCanvasData] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: "",
    // Step 1
    ikigai_suka: "",
    ikigai_kuasa: "",
    ikigai_dibutuhkan: "",
    ikigai_dibayar: "",
    // Step 2 Demografis
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
    // Step 2 Psikografis
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
    // Step 3
    gaya_komunikasi: "",
    platform: ""
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ai/master-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal generate Master Blueprint");
      const data = await res.json();
      setCanvasData(data.result);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat generate. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex-1 w-full max-w-5xl mx-auto p-6 py-12 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold font-heading mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Master Blueprint: {canvasData.niche_statement || "Berhasil Dibuat"}
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {canvasData.positioning_identity}
            </p>
          </div>
          <button onClick={() => setCanvasData(null)} className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-sm font-bold rounded-xl transition-colors">
            Buat Ulang
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-gray-200"}`}>
            <h3 className="font-bold text-lg mb-4 text-orange-500 border-b border-orange-500/20 pb-2">1. Brand Foundation</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Core Message</span>
                <p className="text-sm font-medium mt-1">{canvasData.core_message}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Mission</span>
                <p className="text-sm font-medium mt-1">{canvasData.mission_statement}</p>
              </div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-gray-200"}`}>
            <h3 className="font-bold text-lg mb-4 text-blue-500 border-b border-blue-500/20 pb-2">2. Audience Psychology</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Persona Narrative</span>
                <p className="text-sm font-medium mt-1">{canvasData.persona_narrative}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Pain Points</span>
                  <ul className="text-sm mt-1 list-disc list-inside">
                    {canvasData.pain_points?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Dream Outcome</span>
                  <ul className="text-sm mt-1 list-disc list-inside">
                    {canvasData.dream_outcome?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-gray-200"}`}>
            <h3 className="font-bold text-lg mb-4 text-green-500 border-b border-green-500/20 pb-2">3. Content Strategy</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Content Pillars</span>
                <ul className="text-sm mt-1 list-disc list-inside">
                  {canvasData.content_pillars?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Content Gap</span>
                <p className="text-sm font-medium mt-1">{canvasData.content_gap}</p>
              </div>
            </div>
          </div>
          
          {/* Card 4 */}
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-gray-200"}`}>
            <h3 className="font-bold text-lg mb-4 text-purple-500 border-b border-purple-500/20 pb-2">4. Business & Action</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Monetization Strategy</span>
                <ul className="text-sm mt-1 list-disc list-inside">
                  {canvasData.monetization_strategy?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Platform Strategy</span>
                <ul className="text-sm mt-1 list-disc list-inside">
                  {canvasData.platform_strategy?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-6 py-8 flex flex-col h-[calc(100vh-80px)] animate-in fade-in duration-300">
      
      {/* Header (Fixed at top) */}
      <div className="shrink-0 flex justify-between items-start md:items-end gap-2 mb-4">
        <div>
          {/* TEKS JUDUL & ICON (Ikon sejajar di sebelah kanan judul) */}
          <div className="flex items-center gap-2 md:gap-3 mb-1">
            <h1 className={`text-xl md:text-3xl font-bold font-heading ${isDark ? "text-white" : "text-gray-900"}`}>
              Master Blueprint
            </h1>
            <div className={`w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center ${isDark ? "bg-[#27272a] text-orange-500" : "bg-orange-50 text-orange-500"}`}>
              <Compass className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
          </div>
          {/* DESKRIPSI */}
          <p className={`text-xs md:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} pr-2 md:pr-0`}>
            Rancang pondasi konten dan bisnismu.
          </p>
        </div>
        
        {/* INDIKATOR LANGKAH */}
        <div className={`shrink-0 text-xs md:text-sm font-bold mt-1 md:mt-0 md:pb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Langkah {step}/4
        </div>
      </div>

      {/* Progress Bar (Fixed at top) */}
      <div className={`shrink-0 w-full h-1 rounded-full mb-6 ${isDark ? "bg-white/10" : "bg-gray-200"}`}>
        <div 
          className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Form Area (Scrollable Middle & Fixed Footer) */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        
        {/* Scrollable Container for Inputs */}
        <div className="flex-1 overflow-y-auto px-1 pr-3 custom-scrollbar space-y-6 pb-4">
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
                    <option value="Bebas / Keduanya">Bebas / Keduanya</option>
                  </select>
                </div>
                
                <div><label className={labelClass}>Lokasi</label><input type="text" name="demo_lokasi" value={formData.demo_lokasi} onChange={handleChange} required className={inputClass} placeholder="Cth: Jabodetabek" /></div>
                
                <div>
                  <label className={labelClass}>Pekerjaan</label>
                  <select name="demo_pekerjaan" value={formData.demo_pekerjaan} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Pekerjaan...</option>
                    <option value="Pelajar / Mahasiswa">Pelajar / Mahasiswa</option>
                    <option value="Karyawan Swasta">Karyawan Swasta</option>
                    <option value="PNS / BUMN">PNS / BUMN</option>
                    <option value="Pebisnis / Pengusaha">Pebisnis / Pengusaha</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Penghasilan</label>
                  <select name="demo_penghasilan" value={formData.demo_penghasilan} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Penghasilan...</option>
                    <option value="Belum Berpenghasilan">Belum Berpenghasilan</option>
                    <option value="Di bawah 3 Juta">Di bawah 3 Juta</option>
                    <option value="3 - 5 Juta">3 - 5 Juta</option>
                    <option value="5 - 10 Juta">5 - 10 Juta</option>
                    <option value="10 - 20 Juta">10 - 20 Juta</option>
                    <option value="Di atas 20 Juta">Di atas 20 Juta</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Pendidikan</label>
                  <select name="demo_pendidikan" value={formData.demo_pendidikan} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Pendidikan...</option>
                    <option value="SMP / Sederajat">SMP / Sederajat</option>
                    <option value="SMA / SMK">SMA / SMK</option>
                    <option value="Diploma">Diploma</option>
                    <option value="S1">S1</option>
                    <option value="S2 / S3">S2 / S3</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Status Personal</label>
                  <select name="demo_status_personal" value={formData.demo_status_personal} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Status...</option>
                    <option value="Single">Single</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Punya Anak / Orang Tua">Punya Anak / Orang Tua</option>
                  </select>
                </div>
                
                <div><label className={labelClass}>Platform Utama</label><input type="text" name="demo_platform" value={formData.demo_platform} onChange={handleChange} required className={inputClass} placeholder="Cth: TikTok & IG Reels" /></div>
                
                <div>
                  <label className={labelClass}>Jam Aktif Sosmed</label>
                  <select name="demo_jam_aktif" value={formData.demo_jam_aktif} onChange={handleChange} required className={inputClass}>
                    <option value="" disabled hidden>Pilih Jam Aktif...</option>
                    <option value="Pagi (06:00 - 09:00)">Pagi (06:00 - 09:00)</option>
                    <option value="Siang (12:00 - 14:00)">Siang (12:00 - 14:00)</option>
                    <option value="Sore (16:00 - 18:00)">Sore (16:00 - 18:00)</option>
                    <option value="Malam (19:00 - 22:00)">Malam (19:00 - 22:00)</option>
                    <option value="Sepanjang Hari">Sepanjang Hari</option>
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
                <div>
                  <label className={labelClass}>Pain Point Terbesar</label>
                  <textarea rows={2} name="psiko_pain_point" value={formData.psiko_pain_point} onChange={handleChange} required className={inputClass} placeholder="Cth: Pengen ngonten tapi malu kamera..." />
                </div>
                <div>
                  <label className={labelClass}>Tujuan Hidup / Impian</label>
                  <textarea rows={2} name="psiko_tujuan" value={formData.psiko_tujuan} onChange={handleChange} required className={inputClass} placeholder="Cth: Punya side income 2jt/bulan..." />
                </div>
                <div>
                  <label className={labelClass}>Ketakutan (Fears)</label>
                  <textarea rows={2} name="psiko_ketakutan" value={formData.psiko_ketakutan} onChange={handleChange} required className={inputClass} placeholder="Cth: Takut dihujat temen sendiri..." />
                </div>
                <div>
                  <label className={labelClass}>Aspirasi / Desire</label>
                  <textarea rows={2} name="psiko_aspirasi" value={formData.psiko_aspirasi} onChange={handleChange} required className={inputClass} placeholder="Cth: Ingin diakui dan produktif..." />
                </div>
                <div>
                  <label className={labelClass}>Frustrasi Sehari-hari</label>
                  <textarea rows={2} name="psiko_frustrasi" value={formData.psiko_frustrasi} onChange={handleChange} required className={inputClass} placeholder="Cth: Udah posting tiap hari tapi views mentok..." />
                </div>
                <div>
                  <label className={labelClass}>Pertanyaan di Kepala</label>
                  <textarea rows={2} name="psiko_pertanyaan" value={formData.psiko_pertanyaan} onChange={handleChange} required className={inputClass} placeholder="Cth: 'Kapan ya gua bisa pecah telor?'" />
                </div>
                <div>
                  <label className={labelClass}>Konsumsi Media</label>
                  <textarea rows={2} name="psiko_konsumsi" value={formData.psiko_konsumsi} onChange={handleChange} required className={inputClass} placeholder="Cth: Podcast bisnis, reels edukasi..." />
                </div>
                <div>
                  <label className={labelClass}>Sosok yang Diikuti</label>
                  <textarea rows={2} name="psiko_sosok" value={formData.psiko_sosok} onChange={handleChange} required className={inputClass} placeholder="Cth: Raymond Chin, Fellexandro Ruby..." />
                </div>
                <div>
                  <label className={labelClass}>Bahasa Sehari-hari</label>
                  <textarea rows={2} name="psiko_bahasa" value={formData.psiko_bahasa} onChange={handleChange} required className={inputClass} placeholder="Cth: Bahasa gaul jaksel, lu-gue..." />
                </div>
                <div>
                  <label className={labelClass}>Rela Bayar Untuk</label>
                  <textarea rows={2} name="psiko_mau_bayar" value={formData.psiko_mau_bayar} onChange={handleChange} required className={inputClass} placeholder="Cth: Template instan, tools otomasi..." />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Distribusi & Gaya */}
          {step === 4 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <h3 className={`font-bold text-lg mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Distribusi & Gaya</h3>
              <div>
                <label className={labelClass}>Gaya Komunikasi</label>
                <textarea rows={3} name="gaya_komunikasi" value={formData.gaya_komunikasi} onChange={handleChange} required className={inputClass} placeholder="Cth: Santai, blak-blakan, logis, kayak temen nongkrong" />
              </div>
              <div>
                <label className={labelClass}>Fokus Platform & Format</label>
                <textarea rows={3} name="platform" value={formData.platform} onChange={handleChange} required className={inputClass} placeholder="Cth: Instagram (Carousel edukasi) & TikTok (Talking head pendek)" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons (Fixed at bottom) */}
        <div className="shrink-0 flex justify-between items-center pt-4 pb-2 mt-2 bg-transparent z-10">
          {step > 1 ? (
            <button type="button" onClick={handlePrev} className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          ) : (
            <div></div> // Empty div to keep 'Lanjut' button on the right
          )}
          
          <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {step === 4 ? "Generate Blueprint" : "Lanjut"}
          </button>
        </div>
      </form>
    </div>
  );
}
