"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, X, Save, Trash2, Check, FileText } from 'lucide-react';

export default function ContentCalendarClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [calendarData, setCalendarData] = useState<Record<string, any>>(initialData || {});
  const [currentCalDate, setCurrentCalDate] = useState(new Date());
  
  // Agenda Modal States
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);
  const [agendaForm, setAgendaForm] = useState({
    topic: '',
    script: '',
    caption: '',
    funnelStage: 'TOFU'
  });
  
  useEffect(() => {
    const pendingDate = searchParams.get('date');
    const pendingTopic = searchParams.get('topic');
    const pendingScript = searchParams.get('script');
    
    if (pendingDate && (pendingTopic || pendingScript)) {
      setSelectedCalDate(pendingDate);
      setAgendaForm({
        topic: pendingTopic || '',
        script: pendingScript || '',
        caption: '',
        funnelStage: 'TOFU'
      });
      setIsAgendaOpen(true);
      // Clean up the URL
      router.replace('/ruang-ngonten/content-calendar');
    }
  }, [searchParams, router]);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const saveToDB = async (newData: any) => {
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData: newData })
      });
    } catch (e) {
      console.error("Failed to save calendar data", e);
    }
  };

  const handleNextMonth = () => {
    setCurrentCalDate(new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    setCurrentCalDate(new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() - 1, 1));
  };

  const handleDateClick = (dateKey: string) => {
    const data = calendarData[dateKey];
    setSelectedCalDate(dateKey);
    
    let formattedScript = "";
    if (Array.isArray(data?.script)) {
      formattedScript = data.script.map((s: any) => `[${s.label}]\n${s.content}`).join('\n\n');
    } else if (typeof data?.script === 'string') {
      try {
        const parsed = JSON.parse(data.script);
        if (Array.isArray(parsed)) {
          formattedScript = parsed.map((s: any) => `[${s.label}]\n${s.content}`).join('\n\n');
        } else {
          formattedScript = data.script;
        }
      } catch (e) {
        formattedScript = data.script;
      }
    }

    setAgendaForm({
      topic: data?.topic || '',
      script: formattedScript,
      caption: data?.caption || '',
      funnelStage: data?.funnelStage || 'TOFU'
    });
    setSavedSuccess(false);
    setIsAgendaOpen(true);
  };

  const handleSaveAgenda = async () => {
    if (!selectedCalDate) return;
    setIsSaving(true);
    
    let parsedScript = agendaForm.script;
    // Try to parse it back to JSON array if it looks like one, to support ScriptBuilder format
    try {
      if (agendaForm.script.trim().startsWith('[')) {
        parsedScript = JSON.parse(agendaForm.script);
      }
    } catch (e) {}

    const newData = {
      ...calendarData,
      [selectedCalDate]: {
        topic: agendaForm.topic,
        script: parsedScript,
        caption: agendaForm.caption,
        funnelStage: agendaForm.funnelStage
      }
    };
    
    setCalendarData(newData);
    await saveToDB(newData);
    
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setIsAgendaOpen(false);
    }, 1000);
  };

  const handleDeleteAgenda = async () => {
    if (!selectedCalDate) return;
    const newData = { ...calendarData };
    delete newData[selectedCalDate];
    
    setCalendarData(newData);
    await saveToDB(newData);
    setIsAgendaOpen(false);
  };

  const renderCalendarGrid = () => {
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const todayDate = new Date();
    const todayKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth()+1).padStart(2,'0')}-${String(todayDate.getDate()).padStart(2,'0')}`;
    const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    let cells = [];

    // Header Hari
    daysOfWeek.forEach((day, index) => {
      cells.push(
        <div key={`head-${index}`} className={`text-[11px] md:text-xs font-black uppercase tracking-widest text-center pb-2 md:pb-4 font-heading ${index === 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {day}
        </div>
      );
    });

    // Blank Spaces
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`blank-${i}`} className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 mx-auto"></div>);
    }

    // Hari Aktual
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayData = calendarData[dateKey];
      const isToday = dateKey === todayKey;
      const isPast = dateKey < todayKey;
      const hasContent = !!dayData?.topic || !!dayData?.script;
      const funnelStage = dayData?.funnelStage;

      // Styling Indicator Funnel Stage
      let indicatorColor = '';
      if (hasContent && funnelStage) {
        if (funnelStage === 'TOFU') indicatorColor = 'bg-[#3b82f6]'; // Blue
        else if (funnelStage === 'MOFU') indicatorColor = 'bg-[#eab308]'; // Yellow
        else if (funnelStage === 'BOFU') indicatorColor = 'bg-[#f97316]'; // Orange
        else indicatorColor = 'bg-rn-accent';
      }

      let btnClass = "relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full mx-auto flex flex-col items-center justify-center transition-all duration-200 border group ";
      let numClass = "text-[14px] md:text-base font-bold font-heading z-10 ";

      if (hasContent) {
        btnClass += `border-transparent ${indicatorColor} shadow-sm hover:scale-[1.02] cursor-pointer `;
        numClass += "text-white";
      } else if (isPast) {
        btnClass += "bg-transparent text-gray-300 dark:text-gray-700 border-transparent cursor-not-allowed";
        numClass += "text-gray-300 dark:text-gray-700";
      } else if (isToday) {
        btnClass += "bg-orange-50 dark:bg-orange-900/10 border border-rn-accent cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20";
        numClass += "text-rn-accent";
      } else {
        btnClass += "bg-white dark:bg-[#121214] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer";
        numClass += "text-gray-700 dark:text-gray-300";
      }

      cells.push(
        <button 
          key={i} 
          disabled={isPast && !hasContent}
          onClick={() => handleDateClick(dateKey)}
          className={btnClass}
        >
          <span className={numClass}>{i}</span>
          
          
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="w-full">
        <div className="px-4 md:px-8 py-2 md:py-6 max-w-4xl mx-auto pb-10">
          
          <div className="mb-4 lg:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white font-heading">Content Calendar</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 md:mt-2 text-xs md:text-sm font-semibold">Petakan jadwal tayang, simpan ide, dan kelola proses produksi konten Anda secara teratur setiap harinya.</p>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-gray-50 dark:bg-[#0A0A0C] rounded-2xl border border-gray-200 dark:border-white/10 p-4 md:p-6 w-full shadow-sm">
            {/* Header Month / Nav */}
            <div className="flex items-center justify-between mb-4 md:mb-5 pb-3 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-lg md:text-xl font-black font-heading text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Calendar className="text-rn-accent" size={20} />
                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][currentCalDate.getMonth()]} {currentCalDate.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-white transition-colors shadow-sm"><ChevronLeft size={18} strokeWidth={2.5} /></button>
                <button onClick={handleNextMonth} className="p-2 rounded-xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-900 dark:text-white transition-colors shadow-sm"><ChevronRight size={18} strokeWidth={2.5} /></button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {renderCalendarGrid()}
            </div>
            
            {/* Legend Funneling */}
            <div className="mt-4 md:mt-5 border-t border-dashed border-gray-200 dark:border-white/10 pt-4 flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-[#3b82f6] shadow-sm"></div>
                <span className="text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-400 font-heading tracking-widest uppercase">TOFU (Awareness)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-[#eab308] shadow-sm"></div>
                <span className="text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-400 font-heading tracking-widest uppercase">MOFU (Consideration)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-[#f97316] shadow-sm"></div>
                <span className="text-[11px] md:text-xs font-bold text-gray-600 dark:text-gray-400 font-heading tracking-widest uppercase">BOFU (Conversion)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agenda Form Modal */}
      {isAgendaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsAgendaOpen(false)}>
          <div className="bg-white dark:bg-[#121214] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading text-lg flex items-center gap-2">
                <FileText className="text-rn-accent" size={18} /> 
                Agenda: <span className="text-rn-accent">{selectedCalDate}</span>
              </h3>
              <button onClick={() => setIsAgendaOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <X size={20} strokeWidth={2.5}/>
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Tahap Funnel</label>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {[
                    { val: 'TOFU', label: 'Top (Awareness)', color: 'bg-[#3b82f6]', border: 'border-[#3b82f6]', text: 'text-[#3b82f6]' },
                    { val: 'MOFU', label: 'Middle (Consideration)', color: 'bg-[#eab308]', border: 'border-[#eab308]', text: 'text-[#eab308]' },
                    { val: 'BOFU', label: 'Bottom (Conversion)', color: 'bg-[#f97316]', border: 'border-[#f97316]', text: 'text-[#f97316]' }
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => setAgendaForm({...agendaForm, funnelStage: f.val})}
                      className={`py-2 px-2 md:px-4 rounded-xl text-xs md:text-sm font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                        agendaForm.funnelStage === f.val 
                          ? `${f.border} ${f.color} text-white shadow-sm` 
                          : `border-gray-200 dark:border-white/10 bg-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20`
                      }`}
                    >
                      <span className="font-heading tracking-widest">{f.val}</span>
                      <span className="text-[9px] md:text-[10px] font-semibold opacity-80">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Topik / Ide Konten</label>
                <input 
                  type="text" 
                  value={agendaForm.topic}
                  onChange={(e) => setAgendaForm({...agendaForm, topic: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Contoh: 3 Rahasia Kenapa Gaji Rp 10 Juta..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Naskah / Skrip</label>
                <textarea 
                  value={agendaForm.script}
                  onChange={(e) => setAgendaForm({...agendaForm, script: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none transition-all min-h-[150px] text-sm resize-none"
                  placeholder="Isi skrip detail di sini..."
                ></textarea>
                {agendaForm.script.startsWith('[') && (
                  <p className="text-[10px] text-gray-500 mt-1">*Skrip ini berasal dari generator AI (JSON Array). Anda bisa mengeditnya dengan hati-hati atau membiarkannya.</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Caption (Opsional)</label>
                <textarea 
                  value={agendaForm.caption}
                  onChange={(e) => setAgendaForm({...agendaForm, caption: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none transition-all min-h-[80px] text-sm resize-none"
                  placeholder="Tulis caption & hashtag..."
                ></textarea>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/5 shrink-0">
              <button 
                onClick={handleDeleteAgenda}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-colors text-sm"
              >
                <Trash2 size={16} /> <span className="hidden sm:inline">Hapus Agenda</span>
              </button>
              
              <button 
                onClick={handleSaveAgenda}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-sm shadow-sm ${savedSuccess ? 'bg-green-500 text-white border-green-500' : 'bg-rn-accent text-white border-rn-accent hover:bg-orange-600'} border disabled:opacity-70`}
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : savedSuccess ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? "Menyimpan..." : savedSuccess ? "Tersimpan!" : "Simpan Agenda"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
