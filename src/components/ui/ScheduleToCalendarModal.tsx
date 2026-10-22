"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { getContentCalendarAction } from "@/app/actions/toolsData";
import { Calendar, CheckCircle2, Save, Square, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultData: {
    topic: string;
    script: string;
    caption?: string;
    funnelStage?: string;
  } | null;
}

const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

export default function ScheduleToCalendarModal({ isOpen, onClose, defaultData }: ScheduleToCalendarModalProps) {
  const { data: dbCalendar } = useSWR("contentCalendar", getContentCalendarAction);
  const calendarData = dbCalendar?.data || {};

  const [step, setStep] = useState<"calendar" | "form" | "success">("calendar");
  const [currentCalDate, setCurrentCalDate] = useState(new Date());
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);
  
  const [agendaForm, setAgendaForm] = useState({
    topic: '',
    script: '',
    caption: '',
    funnelStage: 'TOFU'
  });
  
  const [isSavingAgenda, setIsSavingAgenda] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("calendar");
      setSelectedCalDate(null);
      if (defaultData) {
        setAgendaForm({
          topic: defaultData.topic || '',
          script: defaultData.script || '',
          caption: defaultData.caption || '',
          funnelStage: defaultData.funnelStage || 'TOFU'
        });
      }
    }
  }, [isOpen, defaultData]);

  if (!isOpen) return null;

  const handleNextMonth = () => setCurrentCalDate(new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 1));
  const handlePrevMonth = () => setCurrentCalDate(new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() - 1, 1));

  const handleSaveAgenda = async () => {
    if (!selectedCalDate) return;
    setIsSavingAgenda(true);
    
    const newCalendarData = {
      ...calendarData,
      [selectedCalDate]: {
        topic: agendaForm.topic,
        script: agendaForm.script,
        caption: agendaForm.caption,
        funnelStage: agendaForm.funnelStage
      }
    };
    
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData: newCalendarData })
      });
      mutate("contentCalendar");
      setStep("success");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAgenda(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200" onClick={() => { if (!isSavingAgenda && step !== "success") onClose(); }}>
      <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-lg overflow-hidden flex flex-col max-h-[90dvh]" onClick={e => e.stopPropagation()}>
        
        {step === "calendar" && (
          <>
            <div className="px-5 py-4 border-b border-gray-200 dark:border-[#2C3246] flex items-center justify-between bg-gray-50 dark:bg-white/5 shrink-0">
               <h3 className="text-sm md:text-base font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2">
                 <Calendar size={18} strokeWidth={2.5} className="text-orange-500"/> Pilih Tanggal Tayang
               </h3>
               <button onClick={onClose} className="text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] hover:bg-gray-200 dark:hover:bg-[#1f2947] rounded-full p-1.5 transition-colors cursor-pointer"><X size={16} strokeWidth={2.5}/></button>
            </div>
            
            <div className="p-5 overflow-y-auto no-scrollbar bg-white dark:bg-transparent">
               <div className="flex items-center justify-between mb-6">
                 <h4 className="font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                   <Calendar size={18} className="text-orange-500"/> {MONTH_NAMES[currentCalDate.getMonth()]} {currentCalDate.getFullYear()}
                 </h4>
                 <div className="flex items-center gap-2">
                   <button onClick={handlePrevMonth} className="p-2 border border-gray-200 dark:border-[#2C3246] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1f2947] transition-colors text-gray-700 dark:text-white cursor-pointer"><ChevronLeft size={16}/></button>
                   <button onClick={handleNextMonth} className="p-2 border border-gray-200 dark:border-[#2C3246] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1f2947] transition-colors text-gray-700 dark:text-white cursor-pointer"><ChevronRight size={16}/></button>
                 </div>
               </div>
               
               <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400">
                 <div className="text-red-500">MIN</div><div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div>
               </div>
               
               <div className="grid grid-cols-7 gap-2">
                 {(() => {
                    const year = currentCalDate.getFullYear();
                    const month = currentCalDate.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDay = new Date(year, month, 1).getDay();
                    
                    const today = new Date();
                    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
                    
                    let cells = [];
                    for(let i=0; i<firstDay; i++) cells.push(<div key={`blank-${i}`} className="h-8 md:h-10"/>);
                    
                    for(let i=1; i<=daysInMonth; i++) {
                       const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
                       const hasContent = !!calendarData[dateKey]?.topic;
                       const isToday = dateKey === todayKey;
                       const isPast = dateKey < todayKey;
                       
                       let btnClass = "h-8 md:h-10 rounded-xl flex items-center justify-center text-[13px] font-bold transition-all duration-200 border ";
                       
                       if (hasContent) {
                          btnClass += "bg-green-500 border-green-500 text-white shadow-sm hover:bg-green-600 cursor-pointer";
                       } else if (isPast) {
                          btnClass += "bg-gray-50 dark:bg-[#0A1128] border-transparent text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed";
                       } else if (isToday) {
                          btnClass += "bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 shadow-sm ring-2 ring-orange-500/20 cursor-pointer";
                       } else {
                          btnClass += "bg-white dark:bg-[#141B31] border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-300 hover:border-orange-500 hover:text-orange-500 cursor-pointer";
                       }
                       
                       cells.push(
                          <button 
                            key={dateKey}
                            disabled={isPast && !hasContent}
                            onClick={() => {
                              setSelectedCalDate(dateKey);
                              setStep("form");
                            }}
                            className={btnClass}
                            title={hasContent ? calendarData[dateKey].topic : isPast ? "Sudah lewat" : "Kosong"}
                          >
                            {i}
                          </button>
                       );
                    }
                    return cells;
                 })()}
               </div>
            </div>
          </>
        )}

        {step === "form" && (
          <>
            <div className="px-5 py-4 border-b border-gray-200 dark:border-[#2C3246] flex items-center justify-between bg-gray-50 dark:bg-white/5 shrink-0">
               <h3 className="text-sm md:text-base font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2">
                 <Calendar size={18} strokeWidth={2.5} className="text-orange-500"/> Konfirmasi Agenda Publikasi
               </h3>
               <button onClick={() => { if (!isSavingAgenda) onClose(); }} disabled={isSavingAgenda} className="text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] hover:bg-gray-200 dark:hover:bg-[#1f2947] rounded-full p-1.5 transition-colors disabled:opacity-50 cursor-pointer"><X size={16} strokeWidth={2.5}/></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAgenda(); }} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-[13px] border border-blue-100 dark:border-blue-900/30 flex items-center gap-2 font-medium">
                <Calendar size={14} /> Tanggal terpilih: <strong>{selectedCalDate}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Topik / Judul Konten</label>
                <input 
                  type="text" 
                  required
                  value={agendaForm.topic}
                  onChange={e => setAgendaForm({...agendaForm, topic: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-rn-accent focus:border-transparent outline-none transition-all text-sm"
                  placeholder="Judul konten"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Tahap Funnel</label>
                <div className="grid grid-cols-3 gap-2">
                  {['TOFU', 'MOFU', 'BOFU'].map(stage => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setAgendaForm({...agendaForm, funnelStage: stage})}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${agendaForm.funnelStage === stage ? (stage === 'TOFU' ? 'border-[#3b82f6] bg-[#3b82f6] text-white' : stage === 'MOFU' ? 'border-[#eab308] bg-[#eab308] text-white' : 'border-[#f97316] bg-[#f97316] text-white') : 'border-gray-200 dark:border-white/10 bg-transparent text-gray-500 hover:border-gray-300'}`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Naskah Skrip / Konten</label>
                <textarea 
                  required
                  value={agendaForm.script}
                  onChange={e => setAgendaForm({...agendaForm, script: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none transition-all min-h-[120px] text-sm resize-none custom-scrollbar"
                  placeholder="Isi skrip..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Caption (Opsional)</label>
                <textarea 
                  value={agendaForm.caption}
                  onChange={e => setAgendaForm({...agendaForm, caption: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-transparent outline-none transition-all min-h-[80px] text-sm resize-none custom-scrollbar"
                  placeholder="Caption instagram/tiktok..."
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button 
                  type="button" 
                  disabled={isSavingAgenda}
                  onClick={() => setStep("calendar")}
                  className="px-4 py-3.5 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-200 rounded-xl font-bold font-heading hover:bg-gray-50 dark:hover:bg-[#1f2947] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingAgenda}
                  className="flex-1 py-3.5 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white rounded-xl font-bold font-heading transition-colors flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingAgenda ? <><Square size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan ke Kalender</>}
                </button>
              </div>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="flex-1 p-5">
            <div className="px-5 py-4 flex items-center justify-end shrink-0">
               <button onClick={onClose} className="text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full p-1.5"><X size={16}/></button>
            </div>
            <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-300">
               <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} strokeWidth={3} />
               </div>
               <h3 className="font-bold text-gray-900 dark:text-white text-lg font-heading mb-2">Jadwal Tersimpan!</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm text-center">Konten sudah masuk ke antrean kalender kamu tanggal <strong>{selectedCalDate}</strong>.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
