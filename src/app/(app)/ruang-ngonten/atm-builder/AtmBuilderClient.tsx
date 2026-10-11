"use client";

import toast from "react-hot-toast";
import GlobalChatLayout, { ChatMessage } from "@/components/chat/GlobalChatLayout";
import { useAIChat } from "@/hooks/useAIChat";
import { useSessionState } from "@/hooks/useSessionState";
import useSWR, { mutate } from "swr";
import { getBlueprintAction } from "@/app/actions/blueprint";
import { getContentCalendarAction } from "@/app/actions/toolsData";
import React, { useState, useRef, useEffect } from "react";
import { CopyPlus, LayoutTemplate, Mic2, Zap, Target, Send, Square, CheckCircle2, MessageSquare, Search, UserCircle, Calendar, Bot, Lightbulb, Video, Filter, ChevronDown, Copy, Check, Save, Plus, Mic, X, FileText, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AI_MODELS = [
  { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
];

export default function AtmBuilderClient() {
  const { data: blueprint } = useSWR("blueprint", getBlueprintAction);
  const { data: dbCalendar } = useSWR("contentCalendar", getContentCalendarAction);
  const blueprintId = blueprint?.id;
  const blueprintData = blueprint?.aiResult;

  const { fetchAI, isLoading, setIsLoading, abort } = useAIChat();
  const [chatHistory, setChatHistory] = useSessionState<ChatMessage[]>("chat_atm_builder", []);
  const [atmInputText, setAtmInputText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.7-flash");
  
  // ATM Attachment State
  const atmFileInputRef = useRef<HTMLInputElement>(null);
  const [atmAttachedFile, setAtmAttachedFile] = useState<any>(null);
  
  const [atmActionState, setAtmActionState] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAtmPlusMenuOpen, setIsAtmPlusMenuOpen] = useState(false);
  const atmPlusMenuRef = useRef<HTMLDivElement>(null);

  // Calendar States for "Jadwalkan" Feature
                const [calendarData, setCalendarData] = useState<Record<string, any>>({});

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDefaultData, setScheduleDefaultData] = useState<{topic: string, script: string, caption?: string, funnelStage?: string} | null>(null);


  useEffect(() => {
    if (dbCalendar) {
      setCalendarData(dbCalendar.data || {});
    }
  }, [dbCalendar]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (atmPlusMenuRef.current && !atmPlusMenuRef.current.contains(event.target as Node)) {
        setIsAtmPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleCopyBlock = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleATMUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar! Maksimal 50 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAtmAttachedFile({
          fileData: event.target?.result as string,
          fileType: file.type,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateATMContent = async () => {
    if ((!atmInputText.trim() && !atmAttachedFile) || isLoading) return;

    const currentInput = atmInputText;
    const currentFile = atmAttachedFile;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: currentInput,
      hasFile: !!currentFile,
      fileData: currentFile?.fileData,
      fileType: currentFile?.fileType,
      fileName: currentFile?.fileName
    };

    setChatHistory(prev => [...prev, userMessage]);
    setAtmInputText("");
    setAtmAttachedFile(null);

    const { data, error } = await fetchAI('/api/atm-builder/generate', {
      chatHistory: [...chatHistory, userMessage],
      currentInput: currentInput,
      fileData: currentFile?.fileData,
      fileType: currentFile?.fileType,
      blueprint: blueprintData,
      model: selectedModel
    });

    if (error) {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "",
        data: {
          is_error: true,
          error_message: error
        }
      }]);
      setAtmInputText(currentInput);
      if (currentFile) setAtmAttachedFile(currentFile);
      return;
    }

    if (data) {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        type: data.response_type || "atm_result",
        data: data
      }]);
    }
  };

  const renderCustomMessage = (msg: ChatMessage) => {
    if (!msg.data) return null;

    if (msg.data.is_error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 md:p-5 rounded-2xl w-full mt-2">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2 font-bold font-heading">
             ⚠️ Oops, terjadi kesalahan:
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">{msg.data.error_message}</p>
        </div>
      );
    }

    if (msg.type === 'atm_result') {
      return (
        <div className="w-full space-y-4 md:space-y-6 mt-2">
          {msg.data.transkrip_sumber && (
             <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 md:p-5 rounded-2xl">
                <h4 className="font-bold text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-heading">Transkrip Sumber Konten</h4>
                <div className="text-[12px] md:text-[13px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar pr-2 italic">
                  "{msg.data.transkrip_sumber}"
                </div>
             </div>
          )}

          {(msg.data.blueprint_match || msg.data.viral_dna) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {msg.data.viral_dna && (
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 p-4 md:p-5 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-gray-900 dark:text-white font-heading text-sm md:text-base mb-3 flex items-center gap-2"><Target size={16} className="text-purple-500" /> Viral DNA</h4>
                  <ul className="space-y-2.5 text-[12px] md:text-[13px] text-gray-600 dark:text-gray-400">
                    <li className="flex gap-2.5 items-start"><strong className="text-gray-900 dark:text-gray-200 min-w-[70px]">Format:</strong> <span>{msg.data.viral_dna.framework}</span></li>
                    <li className="flex gap-2.5 items-start"><strong className="text-gray-900 dark:text-gray-200 min-w-[70px]">Hook:</strong> <span>{msg.data.viral_dna.hook_type}</span></li>
                    <li className="flex gap-2.5 items-start"><strong className="text-gray-900 dark:text-gray-200 min-w-[70px]">Emosi:</strong> <span>{msg.data.viral_dna.emotional_trigger}</span></li>
                    <li className="flex gap-2.5 items-start"><strong className="text-gray-900 dark:text-gray-200 min-w-[70px]">Rahasia:</strong> <span>{msg.data.viral_dna.why_it_works}</span></li>
                  </ul>
                </div>
              )}
              {msg.data.blueprint_match && (
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 p-4 md:p-5 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-gray-900 dark:text-white font-heading text-sm md:text-base mb-3 flex items-center gap-2"><Search size={16} className="text-blue-500" /> Blueprint Match</h4>
                  <p className="text-[12px] md:text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    {msg.data.blueprint_match.alignment}
                  </p>
                </div>
              )}
            </div>
          )}

          {(msg.data.opening_text || msg.data.ringkasan_analisis) && (
            <div className="whitespace-pre-wrap text-[14px] text-gray-700 dark:text-gray-300 mb-6" dangerouslySetInnerHTML={{__html: (msg.data.opening_text || msg.data.ringkasan_analisis).replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white font-heading">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}} />
          )}

          <h4 className="font-bold text-gray-900 dark:text-white font-heading flex items-center gap-2 text-sm md:text-base mb-3 mt-6"><CheckCircle2 size={18} className="text-[#D0E206]" strokeWidth={2.5}/> 3 Versi Adaptasi (Original)</h4>
          <div className="grid grid-cols-1 gap-5">
            {(msg.data.versions || []).map((ver: any, i: number) => (
              <div key={i} className="bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-[12px] overflow-hidden shadow-none hover:border-gray-900 dark:hover:border-white transition-all">
                <div className="bg-gray-50 dark:bg-white/5 px-4 md:px-5 py-3.5 border-b border-gray-200 dark:border-white/20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <span className="font-bold font-heading text-gray-900 dark:text-white text-sm md:text-base block">Versi {i+1}: {ver.judul_internal?.replace(/^Versi\s*\d+\s*[-:]*\s*/i, '') || ver.judul_internal}</span>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
                    <button 
                        onClick={() => {
                          setAtmActionState(`schedule-${msg.id}-${i}`);
                          setTimeout(() => {
                        setAtmActionState(null);
                        let formattedScript = "";
                        try {
                          const parsed = JSON.parse(ver.script);
                          if (Array.isArray(parsed)) {
                            formattedScript = parsed.map((s: any) => `[${s.label}]\n${s.content}`).join('\n\n');
                          } else {
                            formattedScript = ver.script;
                          }
                        } catch(e) {
                          formattedScript = ver.script;
                        }
                        setScheduleDefaultData({
                          topic: ver.topic || ver.judul || '',
                          script: formattedScript,
                          caption: '',
                          funnelStage: 'TOFU'
                        });
                        setIsScheduleModalOpen(true);
                      }, 200);
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all text-[11px] md:text-xs border shrink-0 ${atmActionState === `schedule-${msg.id}-${i}` ? 'border-rn-accent bg-rn-accent text-white shadow-sm' : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    ><Calendar size={14} /> Jadwalkan</button>
                    
                    <button 
                        onClick={() => {
                          let fullCopy = "";
                          if (ver.sections) {
                            ver.sections.forEach((sec: any) => { fullCopy += `=== ${sec.label} ===\n${sec.content}\n\n`; });
                          } else {
                            fullCopy = `=== HOOK ===\n${ver.hook || ''}\n\n=== FORESHADOW ===\n${ver.bridge || ''}\n\n=== BODY ===\n${ver.body || ''}\n\n=== CTA ===\n${ver.cta || ''}\n\n`;
                          }
                          if(ver.caption) fullCopy += `=== CAPTION ===\n${ver.caption}`;
                          handleCopyBlock(fullCopy, `copy-${msg.id}-${i}`);
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all text-[11px] md:text-xs border shrink-0 ${copiedId === `copy-${msg.id}-${i}` ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 shadow-sm' : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {copiedId === `copy-${msg.id}-${i}` ? <Check size={14} /> : <Copy size={14} />} 
                      {copiedId === `copy-${msg.id}-${i}` ? "Tersalin" : "Salin Skrip"}
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-6 text-[13px] md:text-[14px] text-gray-800 dark:text-gray-300 font-medium bg-white dark:bg-black">
                  {ver.sections ? (
                    ver.sections.map((sec: any, secIdx: number) => (
                      <div key={secIdx} className="pb-4 border-b border-dashed border-gray-200 dark:border-white/20 last:border-0 last:pb-0">
                        <strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">{sec.label}</strong>
                        <p className="whitespace-pre-wrap leading-relaxed">{sec.content}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="pb-4 border-b border-dashed border-gray-200 dark:border-white/20"><strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">Hook</strong><p className="whitespace-pre-wrap leading-relaxed">{ver.hook}</p></div>
                      <div className="pb-4 border-b border-dashed border-gray-200 dark:border-white/20"><strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">Bridge</strong><p className="whitespace-pre-wrap leading-relaxed">{ver.bridge}</p></div>
                      <div className="pb-4 border-b border-dashed border-gray-200 dark:border-white/20"><strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">Body Konten</strong><p className="whitespace-pre-wrap leading-relaxed">{ver.body}</p></div>
                      <div className="pb-4"><strong className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-heading">CTA</strong><p className="whitespace-pre-wrap leading-relaxed">{ver.cta}</p></div>
                    </>
                  )}
                  
                  {ver.caption && (
                    <div className="pt-4 border-t border-gray-200 dark:border-white/20">
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
    }
    return null;
  };

  const renderPlusMenu = () => (
    <div className="relative shrink-0 flex items-center" ref={atmPlusMenuRef}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAtmPlusMenuOpen(!isAtmPlusMenuOpen); }} 
        className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isAtmPlusMenuOpen ? 'bg-gray-100 dark:bg-white/10' : ''}`}
      >
        <Plus size={18} className={`transition-transform duration-200 ${isAtmPlusMenuOpen ? 'rotate-45' : ''}`} />
      </button>

      {isAtmPlusMenuOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-[280px] md:w-[320px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 py-1.5">
          <div className="px-4 py-2.5 text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-heading">Sumber Input ATM</div>
          
          <input type="file" ref={atmFileInputRef} onChange={(e) => { handleATMUpload(e); setIsAtmPlusMenuOpen(false); }} className="hidden" accept="image/*, video/*, audio/*, text/plain" />
          
          <button onClick={(e) => { e.preventDefault(); atmFileInputRef.current?.click(); }} className="w-full text-left px-4 py-3 md:py-3.5 text-[13px] md:text-sm text-gray-700 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-gray-100/50 dark:border-white/5">
            <Camera size={16} className="text-gray-500" strokeWidth={2.5}/> Upload Gambar / Screenshot
          </button>
          <button onClick={(e) => { e.preventDefault(); atmFileInputRef.current?.click(); }} className="w-full text-left px-4 py-3 md:py-3.5 text-[13px] md:text-sm text-gray-700 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-gray-100/50 dark:border-white/5">
            <Video size={16} className="text-gray-500" strokeWidth={2.5}/> Upload Video / Audio
          </button>
          
          <div className="px-4 py-3 bg-gray-50 dark:bg-[#1a1a1c] border-t border-gray-100 dark:border-white/10">
            <p className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
              <strong className="font-bold font-heading text-gray-800 dark:text-white block mb-0.5">Informasi Transkripsi:</strong> 
              Pastikan ukuran berkas tidak lebih dari 50 MB. Dukungan format: MP3, M4A, WAV, MP4, Gambar (JPG/PNG).
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderAttachmentPreview = () => {
    if (!atmAttachedFile) return null;
    return (
      <div className="px-4 pt-4 pb-0 flex flex-wrap gap-2">
        <div className="relative inline-flex items-center justify-center border border-gray-300 dark:border-white/40 rounded-xl overflow-hidden bg-white dark:bg-black max-w-[150px] max-h-[150px] group shadow-none">
          <button 
            onClick={() => setAtmAttachedFile(null)} 
            className="absolute top-1.5 right-1.5 bg-gray-900 text-white border-2 border-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 z-10 transition-all shadow-sm"
            title="Hapus lampiran"
          ><X size={12} strokeWidth={3} /></button>
          
          {atmAttachedFile.fileType?.startsWith('image/') ? (
              <img src={atmAttachedFile.fileData} alt="preview" className="w-full h-full object-cover max-h-[120px]" />
          ) : atmAttachedFile.fileType?.startsWith('video/') ? (
              <video src={atmAttachedFile.fileData} className="w-full h-full object-cover max-h-[120px]" />
          ) : (
              <div className="w-[120px] h-[80px] flex flex-col items-center justify-center bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-300 gap-1.5 p-2 border border-gray-200 dark:border-white/20 rounded-lg m-1">
                <FileText size={24} strokeWidth={2.5}/>
                <span className="text-[10px] text-gray-700 dark:text-gray-300 truncate w-full text-center font-bold px-2 font-heading">{atmAttachedFile.fileName}</span>
              </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full">
      <GlobalChatLayout
        title={<>ATM Content Builder <CopyPlus className="text-rn-accent inline-block ml-2" size={32} /></>}
        subtitle="Bedah dan rakit ulang konten referensi viral menjadi versi Anda sendiri tanpa terlihat menjiplak."
        chatHistory={chatHistory}
        renderCustomMessage={renderCustomMessage}
        models={AI_MODELS}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        value={atmInputText}
        onChange={(e: any) => setAtmInputText(e.target.value)}
        onSubmit={generateATMContent}
        isLoading={isLoading}
        onStop={abort}
        renderPlusMenu={renderPlusMenu}
        renderAttachmentPreview={renderAttachmentPreview}
        hasAttachment={!!atmAttachedFile}
        onVoiceResult={(text: string) => setAtmInputText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text)}
        placeholder="Paste teks atau script referensi di sini..."
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
