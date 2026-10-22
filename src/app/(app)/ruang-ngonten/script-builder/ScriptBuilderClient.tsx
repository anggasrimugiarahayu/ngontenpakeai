"use client";

import GlobalChatLayout, { ChatMessage } from "@/components/chat/GlobalChatLayout";
import { useAIChat } from "@/hooks/useAIChat";
import { useSessionState } from "@/hooks/useSessionState";
import useSWR, { mutate } from "swr";
import { getBlueprintAction } from "@/app/actions/blueprint";
import { getContentCalendarAction } from "@/app/actions/toolsData";
import React, { useState, useEffect, useRef } from "react";
import ScheduleToCalendarModal from "@/components/ui/ScheduleToCalendarModal";
import { Calendar, Check, Copy, MessageSquare, Save, Square, X, CheckCircle2, ChevronLeft, ChevronRight, FileText, Plus, ChevronDown } from "lucide-react";

interface ScriptSection {
  label: string;
  content: string;
}

interface ScriptVariation {
  judul: string;
  framework_digunakan: string;
  hook_digunakan: string;
  cta_digunakan: string;
  script_sections: ScriptSection[];
  caption: string;
}

const AI_MODELS = [
  { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
];

export default function ScriptBuilderClient() {
  const { data: blueprint } = useSWR("blueprint", getBlueprintAction);
  const { data: dbCalendar } = useSWR("contentCalendar", getContentCalendarAction);
  const blueprintId = blueprint?.id;
  const blueprintData = blueprint?.aiResult;

  const { fetchAI, isLoading, abort } = useAIChat();
  const [chatHistory, setChatHistory] = useSessionState<ChatMessage[]>("chat_script_builder", []);
  const [scriptPromptText, setScriptPromptText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.7-flash");
  
  const [scriptFormat, setScriptFormat] = useState("");
  const [scriptTone, setScriptTone] = useState("");
  const [scriptCarouselSlides, setScriptCarouselSlides] = useState(3);
  const [scriptReelsDuration, setScriptReelsDuration] = useState(60);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scriptActionState, setScriptActionState] = useState<string | null>(null);

  // Menu States
  const [isScriptMenuOpen, setIsScriptMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeDeepMenu, setActiveDeepMenu] = useState<string | null>(null);
  const scriptMenuRef = useRef<HTMLDivElement>(null);

  // Calendar States for "Jadwalkan" Feature
                const [calendarData, setCalendarData] = useState<Record<string, any>>({});

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDefaultData, setScheduleDefaultData] = useState<{topic: string, script: string, caption?: string, funnelStage?: string} | null>(null);


  useEffect(() => {
    if (dbCalendar) {
      setCalendarData(dbCalendar.data || {});
    } else {
      try {
        const saved = localStorage.getItem('calendarData');
        if (saved) setCalendarData(JSON.parse(saved));
      } catch(e) {}
    }
  }, [dbCalendar]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scriptMenuRef.current && !scriptMenuRef.current.contains(event.target as Node)) {
        setIsScriptMenuOpen(false);
        setActiveSubMenu(null);
        setActiveDeepMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateSetting = (type: string, value: string | number) => {
    if (type === 'format_carousel') {
      setScriptFormat('Carousel');
      setScriptCarouselSlides(value as number);
    } else if (type === 'format_reels') {
      setScriptFormat('Reels');
      setScriptReelsDuration(value as number);
    } else if (type === 'tone') {
      setScriptTone(value as string);
    }
  };


  const copyScriptToClipboard = (ver: ScriptVariation, id: string) => {
    const textToCopy = `=== ${ver.judul} ===\n\n` + 
      ver.script_sections.map(s => `[${s.label}]\n${s.content}`).join('\n\n') +
      (ver.caption ? `\n\n[CAPTION]\n${ver.caption}` : '');
    
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateScript = async () => {
    if (!scriptPromptText.trim() || isLoading) return;
    
    const currentInput = scriptPromptText;
    setScriptPromptText("");
    
    setChatHistory(prev => [...prev, {
      id: Date.now(),
      role: "user",
      content: currentInput
    }]);

    let requestContext = "";
    if (scriptFormat) requestContext += `Format: ${scriptFormat === 'Carousel' ? `Carousel (${scriptCarouselSlides} Slide)` : scriptFormat === 'Reels' ? `Reels (${scriptReelsDuration}s)` : scriptFormat}\n`;
    if (scriptTone) requestContext += `Tone: ${scriptTone}\n`;

    // To match backend logic, we send prompt text, and the server reads configContext
    // The backend uses configContext in the system prompt.
    const { data, error } = await fetchAI('/api/script-builder/generate', {
      promptText: currentInput,
      configContext: requestContext,
      model: selectedModel
    });

    if (error || !data) {
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "",
        data: { is_error: true, error_message: error || "Gagal menghubungi AI." }
      }]);
      setScriptPromptText(currentInput);
      return;
    }

    let finalData = data;
    if (!finalData.variations && finalData.script_sections) {
      finalData.variations = [finalData];
    } else if (!finalData.variations || finalData.variations.length === 0) {
      finalData.variations = [{
        judul: "Naskah Otomatis",
        framework_digunakan: "General",
        hook_digunakan: "Custom",
        cta_digunakan: "Standard",
        script_sections: [{ label: "Konten", content: finalData.text || "" }],
        caption: ""
      }];
    }

    setChatHistory(prev => [...prev, {
      id: Date.now(),
      role: "assistant",
      content: "",
      data: finalData
    }]);
  };

  const renderPlusMenu = () => (
    <div className="relative shrink-0 flex items-center" ref={scriptMenuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsScriptMenuOpen(!isScriptMenuOpen); setActiveSubMenu(null); setActiveDeepMenu(null); }} 
        className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#141B31] transition-colors ${isScriptMenuOpen && !activeSubMenu?.startsWith('badge_') ? 'bg-gray-100 dark:bg-[#141B31]' : ''}`}
      >
        <Plus size={18} className={`transition-transform duration-200 ${isScriptMenuOpen && !activeSubMenu?.startsWith('badge_') ? 'rotate-45' : ''}`} />
      </button>

      {isScriptMenuOpen && !activeSubMenu?.startsWith('badge_') && (
        <div className="absolute bottom-full left-0 mb-2 w-[280px] max-w-[calc(100vw-3rem)] md:w-[280px] bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shadow-lg rounded-xl z-50 py-1.5 animate-in fade-in zoom-in-95 overflow-hidden">
          <div className="px-4 py-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#141B31] mb-1">Pengaturan Naskah</div>
          
          <div className="flex flex-col">
            <div onClick={(e) => { e.stopPropagation(); setActiveSubMenu(activeSubMenu === 'format' ? null : 'format'); setActiveDeepMenu(null); }} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-[#1f2947] cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
              Format Konten <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeSubMenu === 'format' ? 'rotate-180' : ''}`} />
            </div>
            {activeSubMenu === 'format' && (
              <div className="bg-gray-50 dark:bg-[#0F172A] border-y border-gray-200 dark:border-[#2C3246] py-1">
                <div className="flex flex-col">
                  <div onClick={(e) => { e.stopPropagation(); setActiveDeepMenu(activeDeepMenu === 'carousel' ? null : 'carousel'); }} className="px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1f2947] cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                    Carousel <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeDeepMenu === 'carousel' ? 'rotate-180' : ''}`}/>
                  </div>
                  {activeDeepMenu === 'carousel' && (
                    <div className="bg-white dark:bg-[#141B31] py-1 max-h-32 overflow-y-auto custom-table-scrollbar">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('format_carousel', i); setIsScriptMenuOpen(false); }} className="px-9 py-2 hover:bg-gray-50 dark:hover:bg-[#1f2947] cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">{i} Slide</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div onClick={(e) => { e.stopPropagation(); setActiveDeepMenu(activeDeepMenu === 'reels' ? null : 'reels'); }} className="px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1f2947] cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                    Reels / TikTok <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeDeepMenu === 'reels' ? 'rotate-180' : ''}`}/>
                  </div>
                  {activeDeepMenu === 'reels' && (
                    <div className="bg-white dark:bg-[#141B31] py-1 max-h-32 overflow-y-auto custom-table-scrollbar">
                      {[15, 30, 45, 60, 90, 120].map(s => (
                        <div key={s} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('format_reels', s); setIsScriptMenuOpen(false); }} className="px-9 py-2 hover:bg-gray-50 dark:hover:bg-[#1f2947] cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">{s} Detik</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div onClick={(e) => { e.stopPropagation(); setActiveSubMenu(activeSubMenu === 'tone' ? null : 'tone'); setActiveDeepMenu(null); }} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-[#1f2947] cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
              Gaya Bahasa <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeSubMenu === 'tone' ? 'rotate-180' : ''}`} />
            </div>
            {activeSubMenu === 'tone' && (
              <div className="bg-gray-50 dark:bg-[#0F172A] border-y border-gray-200 dark:border-[#2C3246] py-1 max-h-48 overflow-y-auto custom-table-scrollbar">
                {['Storytelling', 'Edukatif', 'Profesional', 'Santai', 'Humor', 'Inspiratif', 'Motivasi', 'Blak-blakan & Kritis'].map(tone => (
                  <div key={tone} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('tone', tone); setIsScriptMenuOpen(false); }} className="px-5 py-2.5 hover:bg-white dark:hover:bg-[#1f2947] cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">
                    {tone}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );

  const renderBadges = () => (
    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar w-full fade-in slide-in-from-bottom-2 duration-300">
      {scriptFormat && (
        <span onClick={() => { setIsScriptMenuOpen(true); setActiveSubMenu("badge_format"); setActiveDeepMenu(null); }} className="flex cursor-pointer hover:bg-rn-accent/20 transition-colors items-center gap-1.5 px-2.5 py-1.5 bg-rn-accent/10 border border-rn-accent/20 text-rn-accent rounded-full text-[10px] md:text-[11px] font-bold whitespace-nowrap">
          {scriptFormat} {scriptFormat === 'Carousel' ? `(${scriptCarouselSlides} slide)` : ''}
          <button onClick={(e) => { e.stopPropagation(); setScriptFormat(''); }} className="hover:bg-rn-accent/30 rounded-full p-0.5 ml-0.5 transition-colors text-rn-accent/70 hover:text-rn-accent"><X size={12}/></button>
        </span>
      )}
      {scriptTone && (
        <span onClick={() => { setIsScriptMenuOpen(true); setActiveSubMenu("tone"); setActiveDeepMenu(null); }} className="flex cursor-pointer hover:bg-blue-500/20 transition-colors items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-[10px] md:text-[11px] font-bold whitespace-nowrap">
          {scriptTone}
          <button onClick={(e) => { e.stopPropagation(); setScriptTone(''); }} className="hover:bg-blue-500/30 rounded-full p-0.5 ml-0.5 transition-colors text-blue-500/70 hover:text-blue-500"><X size={12}/></button>
        </span>
      )}
    </div>
  );

  const renderCustomMessage = (msg: ChatMessage) => {
    if (!msg.data?.variations || msg.data.variations.length === 0) return null;
    return (
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex flex-nowrap gap-4 w-max md:w-full md:grid md:grid-cols-1 md:gap-6">
          {msg.data.variations.map((ver: any, vidx: number) => (
            <div key={vidx} className="w-[300px] md:w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl overflow-hidden shadow-sm shrink-0 flex flex-col group">
              <div className="p-4 md:p-5 border-b border-gray-100 dark:border-[#2C3246] bg-gray-50 dark:bg-[#141B31] relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 pr-0 sm:pr-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30">Var {vidx + 1}</span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">{ver.framework_digunakan || 'Storytelling'}</span>
                  </div>
                  <h4 className="font-bold font-heading text-[15px] md:text-[16px] text-gray-900 dark:text-white leading-tight mb-2">{ver.judul || 'Variasi Naskah'}</h4>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{ver.analisis_strategi || 'Pendekatan kreatif.'}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                  <button 
                    onClick={() => {
                      setScriptActionState(`schedule-${msg.id}-${vidx}`);
                      setTimeout(() => {
                        setScriptActionState(null);
                        setScheduleDefaultData({
                          topic: ver.judul || '',
                          script: ver.script_sections ? ver.script_sections.map((s:any) => `[${s.label}]\n${s.content}`).join('\n\n') : '',
                          caption: ver.caption || '',
                          funnelStage: 'TOFU'
                        });
                        setIsScheduleModalOpen(true);
                      }, 200);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all text-[11px] md:text-xs border shrink-0 ${scriptActionState === `schedule-${msg.id}-${vidx}` ? 'border-orange-500 bg-[#f97316] text-white shadow-sm' : 'bg-white dark:bg-[#141B31] border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-orange-500/50 hover:bg-gray-50 dark:hover:bg-[#1f2947] hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <Calendar size={14} /> Jadwalkan
                  </button>
                  <button 
                    onClick={() => {
                      setScriptActionState(`copy-${msg.id}-${vidx}`);
                      setTimeout(() => {
                        setScriptActionState(null);
                        copyScriptToClipboard(ver, `${msg.id}-${vidx}`);
                      }, 200);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all text-[11px] md:text-xs border shrink-0 ${scriptActionState === `copy-${msg.id}-${vidx}` || copiedId === `${msg.id}-${vidx}` ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-600 shadow-sm' : 'bg-white dark:bg-[#141B31] border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-orange-500/50 hover:bg-gray-50 dark:hover:bg-[#1f2947] hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    {copiedId === `${msg.id}-${vidx}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                    {copiedId === `${msg.id}-${vidx}` ? 'Tersalin' : 'Salin Skrip'}
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-6 text-[13px] md:text-[14px] text-gray-800 dark:text-gray-300 font-medium bg-white dark:bg-[#141B31]">
                {ver.script_sections ? (
                  ver.script_sections.map((sec: any, secIdx: number) => (
                    <div key={secIdx} className="pb-4 border-b border-dashed border-gray-200 dark:border-[#2C3246] last:border-0 last:pb-0">
                      <strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">{sec.label}</strong>
                      <p className="whitespace-pre-wrap leading-relaxed">{sec.content}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="pb-4 border-b border-dashed border-gray-200 dark:border-[#2C3246]"><strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">Hook</strong><p className="whitespace-pre-wrap leading-relaxed">{ver.hook || ''}</p></div>
                    <div className="pb-4 border-b border-dashed border-gray-200 dark:border-[#2C3246]"><strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">Body Konten</strong><p className="whitespace-pre-wrap leading-relaxed">{ver.body || ''}</p></div>
                    <div className="pb-4"><strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">CTA</strong><p className="whitespace-pre-wrap leading-relaxed">{ver.cta || ''}</p></div>
                  </>
                )}
                
                {ver.caption && (
                  <div className="pt-4 border-t border-gray-200 dark:border-[#2C3246]">
                    <strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">Caption & Hashtag Sosmed</strong>
                    <p className="whitespace-pre-wrap leading-relaxed">{ver.caption}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full">
      <GlobalChatLayout
        title={<>Script Builder <FileText className="text-rn-accent inline-block ml-2" size={32} /></>}
        subtitle="Ubah ide mentah menjadi naskah konten TikTok/Reels yang siap direkam."
        chatHistory={chatHistory}
        models={AI_MODELS}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        value={scriptPromptText}
        onChange={(e) => setScriptPromptText(e.target.value)}
        onSubmit={generateScript}
        isLoading={isLoading}
        onStop={abort}
        renderPlusMenu={renderPlusMenu}
        modeBadge={renderBadges()}
        renderCustomMessage={renderCustomMessage}
        placeholder="Tulis idemu untuk dijadikan naskah video..."
      />

      {/* Pop-Up Modal Tanggal */}
      
      <ScheduleToCalendarModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        defaultData={scheduleDefaultData}
      />
    </div>
  );
}
