"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Square, CheckCircle2, MessageSquare, Search, UserCircle, Calendar, Bot, Lightbulb, Video, Filter, ChevronDown, Copy, Check, Save, Plus, Mic, X, FileText } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

interface ChatMessage {
  id: string | number;
  role: "user" | "assistant";
  content?: string;
  data?: {
    is_error?: boolean;
    error_message?: string;
    analisis_strategi?: string;
    variations?: ScriptVariation[];
  };
}

const AI_MODELS = [
  { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

export default function ScriptBuilderClient({ blueprintData }: { blueprintData: any }) {
  const [scriptPromptText, setScriptPromptText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

  // Script options
  const [scriptFormat, setScriptFormat] = useState<string>('');
  const [scriptCarouselSlides, setScriptCarouselSlides] = useState<number>(5);
  const [scriptReelsDuration, setScriptReelsDuration] = useState<number>(30);
  const [scriptTone, setScriptTone] = useState<string>('');

  const [isScriptMenuOpen, setIsScriptMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeDeepMenu, setActiveDeepMenu] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const scriptMenuRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isLoading]);

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScriptPromptText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'id-ID';

        recognitionRef.current.onresult = (event: any) => {
          let currentInterim = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setScriptPromptText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
          }
          setInterimText(currentInterim);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          setInterimText("");
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setInterimText("");
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText("");
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleUpdateSetting = (type: string, val: any) => {
    if (type === 'format_carousel') {
      setScriptFormat('Carousel');
      setScriptCarouselSlides(val);
    } else if (type === 'format_reels') {
      setScriptFormat('Reels');
      setScriptReelsDuration(val);
    } else if (type === 'tone') {
      setScriptTone(val);
    }
  };

  const generateScript = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || scriptPromptText;
    if (!textToSubmit.trim() && !customPrompt) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText("");
    }

    const newMessageId = Date.now();
    setChatHistory(prev => [...prev, {
      id: newMessageId,
      role: "user",
      content: textToSubmit
    }]);

    if (!customPrompt) setScriptPromptText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);
    setIsScriptMenuOpen(false);
    setActiveSubMenu(null);
    setActiveDeepMenu(null);

    let requestContext = "";
    if (scriptFormat) requestContext += `Format: ${scriptFormat === 'Carousel' ? 'Carousel (' + scriptCarouselSlides + ' Slide)' : scriptFormat === 'Reels' ? 'Reels (' + scriptReelsDuration + 's)' : scriptFormat}
`;
    if (scriptTone) requestContext += `Tone: ${scriptTone}
`;

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/script-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: textToSubmit,
          configContext: requestContext,
          blueprintData,
          chatHistory: chatHistory.slice(-4).map(m => ({ role: m.role, content: m.content || JSON.stringify(m.data) }))
        }),
        signal: abortControllerRef.current.signal
      });

      const data = await res.json();
      
      if (!res.ok || data.error) {
        setChatHistory(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content: "",
          data: {
            is_error: true,
            error_message: data.error || "Gagal menghubungi AI."
          }
        }]);
        return;
      }

      if (!data.variations && data.script_sections) {
        data.variations = [data];
      } else if (!data.variations || data.variations.length === 0) {
        data.variations = [{
          judul: textToSubmit,
          framework_digunakan: "Auto-Selected",
          hook_digunakan: "Custom",
          cta_digunakan: "Custom",
          script_sections: [{ label: "Naskah Konten", content: "..." }],
          caption: ""
        }];
      }

      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "",
        data
      }]);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setChatHistory(prev => [...prev, {
          id: Date.now(),
          role: "assistant",
          content: "",
          data: {
            is_error: true,
            error_message: "Proses pembuatan script dibatalkan."
          }
        }]);
        return;
      }
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "",
        data: {
          is_error: true,
          error_message: error.message || "Maaf, terjadi kesalahan saat menyambung ke AI."
        }
      }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const copyScriptToClipboard = (ver: ScriptVariation, id: string) => {
    let scriptText = `Judul: ${ver.judul}
`;
    scriptText += `Framework: ${ver.framework_digunakan}
`;
    scriptText += `Hook: ${ver.hook_digunakan}
`;
    scriptText += `CTA: ${ver.cta_digunakan}

`;
    
    ver.script_sections.forEach(sec => {
      scriptText += `[${sec.label}]
${sec.content}

`;
    });
    
    if (ver.caption) {
      scriptText += `--- CAPTION ---
${ver.caption}
`;
    }

    navigator.clipboard.writeText(scriptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scriptMenuRef.current && !scriptMenuRef.current.contains(e.target as Node)) {
        setIsScriptMenuOpen(false);
        setActiveSubMenu(null);
        setActiveDeepMenu(null);
      }
      setIsModelMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const renderInputControls = () => (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
      {/* 1. MAIN MENU DROPDOWN (Tombol Plus) */}
      <div className="relative shrink-0 flex items-center" ref={scriptMenuRef}>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsScriptMenuOpen(!isScriptMenuOpen); setActiveSubMenu(null); setActiveDeepMenu(null); }} 
          className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isScriptMenuOpen && !activeSubMenu?.startsWith('badge_') ? 'bg-gray-100 dark:bg-white/10' : ''}`}
        >
          <Plus size={18} className={`transition-transform duration-200 ${isScriptMenuOpen && !activeSubMenu?.startsWith('badge_') ? 'rotate-45' : ''}`} />
        </button>

        {isScriptMenuOpen && !activeSubMenu?.startsWith('badge_') && (
          <div className="absolute bottom-full left-0 mb-2 w-[280px] max-w-[calc(100vw-3rem)] md:w-[280px] bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 shadow-lg rounded-xl z-50 py-1.5 animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1c1c1f] mb-1">Pengaturan Naskah</div>
            
            {/* Format Menu */}
            <div className="flex flex-col">
              <div 
                onClick={(e) => { e.stopPropagation(); setActiveSubMenu(activeSubMenu === 'format' ? null : 'format'); setActiveDeepMenu(null); }}
                className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                Format Konten <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeSubMenu === 'format' ? 'rotate-180' : ''}`} />
              </div>
              {activeSubMenu === 'format' && (
                <div className="bg-gray-50 dark:bg-[#1c1c1f] border-y border-gray-200 dark:border-white/10 py-1">
                  <div className="flex flex-col">
                    <div 
                      onClick={(e) => { e.stopPropagation(); setActiveDeepMenu(activeDeepMenu === 'carousel' ? null : 'carousel'); }}
                      className="px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300"
                    >
                      Carousel <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeDeepMenu === 'carousel' ? 'rotate-180' : ''}`}/>
                    </div>
                    {activeDeepMenu === 'carousel' && (
                      <div className="bg-white dark:bg-[#1c1c1f] border-y border-gray-100 dark:border-white/10 py-1 max-h-32 overflow-y-auto custom-table-scrollbar">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                          <div key={i} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('format_carousel', i); setIsScriptMenuOpen(false); }} className="px-8 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">{i} Slide</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div 
                      onClick={(e) => { e.stopPropagation(); setActiveDeepMenu(activeDeepMenu === 'reels' ? null : 'reels'); }}
                      className="px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300"
                    >
                      Reels / TikTok <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeDeepMenu === 'reels' ? 'rotate-180' : ''}`}/>
                    </div>
                    {activeDeepMenu === 'reels' && (
                      <div className="bg-white dark:bg-[#1c1c1f] border-y border-gray-100 dark:border-white/10 py-1 max-h-32 overflow-y-auto custom-table-scrollbar">
                        {[15, 30, 45, 60, 90, 120].map(s => (
                          <div key={s} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('format_reels', s); setIsScriptMenuOpen(false); }} className="px-8 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">{s} Detik</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tone Menu */}
            <div className="flex flex-col border-t border-gray-200 dark:border-white/10">
              <div 
                onClick={(e) => { e.stopPropagation(); setActiveSubMenu(activeSubMenu === 'tone' ? null : 'tone'); setActiveDeepMenu(null); }}
                className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                Gaya Bahasa <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeSubMenu === 'tone' ? 'rotate-180' : ''}`} />
              </div>
              {activeSubMenu === 'tone' && (
                <div className="bg-gray-50 dark:bg-[#1c1c1f] border-y border-gray-200 dark:border-white/10 py-1 max-h-48 overflow-y-auto custom-table-scrollbar">
                  {['Storytelling', 'Edukatif', 'Profesional', 'Santai', 'Humor', 'Inspiratif', 'Motivasi', 'Blak-blakan & Kritis'].map(t => (
                    <div key={t} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('tone', t); setIsScriptMenuOpen(false); }} className="px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-white/10 last:border-0">{t}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. INLINED MODEL SELECTOR (Outside of scrollable area) */}
      <div className="relative shrink-0 flex items-center">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsModelMenuOpen(!isModelMenuOpen); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span>AI:</span>
          <span className="text-gray-900 dark:text-white whitespace-nowrap">{AI_MODELS.find(m => m.value === selectedModel)?.label || 'Gemini 2.5 Flash'}</span>
          <ChevronDown size={12} strokeWidth={2.5} className={`transition-transform text-gray-400 dark:text-gray-400 ml-0.5 ${isModelMenuOpen ? 'rotate-180' : ''}`}/>
        </button>
        
        {isModelMenuOpen && (
          <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-[180px] bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 shadow-lg rounded-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 cursor-default">
            {AI_MODELS.map((m, i) => (
              <button 
                key={m.value} 
                onClick={(e) => { e.stopPropagation(); setSelectedModel(m.value); setIsModelMenuOpen(false); }} 
                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${selectedModel === m.value ? 'text-rn-accent bg-orange-50 dark:bg-orange-900/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. SCROLLABLE AREA ONLY for Badges */}
      <div className="flex flex-nowrap gap-1.5 sm:gap-2 items-center overflow-x-auto no-scrollbar w-full py-1">
        
        {/* TAG 1: FORMAT KONTEN */}
        {scriptFormat && (
          <span 
            onClick={(e) => { 
              e.stopPropagation();
              if(activeSubMenu === 'badge_format') { setIsScriptMenuOpen(false); setActiveSubMenu(null); } 
              else { setIsScriptMenuOpen(true); setActiveSubMenu('badge_format'); setActiveDeepMenu(null); } 
            }}
            className="relative group inline-flex py-1.5 items-center gap-1 bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-3 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shrink-0 whitespace-nowrap"
          >
            <span>{scriptFormat === 'Carousel' ? `Carousel (${scriptCarouselSlides})` : scriptFormat === 'Reels' ? `Reels (${scriptReelsDuration}s)` : scriptFormat}</span>
            <button onClick={(e) => { e.stopPropagation(); setScriptFormat(''); setActiveSubMenu(null); setIsScriptMenuOpen(false); }} className="text-gray-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto group-hover:ml-1 overflow-hidden transition-all duration-200 ease-in-out shrink-0 flex items-center justify-center"><X size={12} strokeWidth={3}/></button>
            
            {/* POPUP KHUSUS FORMAT */}
            {isScriptMenuOpen && activeSubMenu === 'badge_format' && (
              <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-[220px] bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 shadow-lg rounded-xl z-50 py-1 animate-in fade-in zoom-in-95 overflow-hidden cursor-default">
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1c1c1f] mb-1">Ubah Format</div>
                
                <div className="flex flex-col">
                  <div onClick={(e) => { e.stopPropagation(); setActiveDeepMenu(activeDeepMenu === 'carousel' ? null : 'carousel'); }} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                    Carousel <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeDeepMenu === 'carousel' ? 'rotate-180' : ''}`}/>
                  </div>
                  {activeDeepMenu === 'carousel' && (
                    <div className="bg-gray-50 dark:bg-[#1c1c1f] border-y border-gray-100 dark:border-white/10 py-1 max-h-32 overflow-y-auto custom-table-scrollbar">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('format_carousel', i); setIsScriptMenuOpen(false); }} className="px-8 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">{i} Slide</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div onClick={(e) => { e.stopPropagation(); setActiveDeepMenu(activeDeepMenu === 'reels' ? null : 'reels'); }} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                    Reels / TikTok <ChevronDown size={14} className={`transition-transform text-gray-400 dark:text-gray-400 ${activeDeepMenu === 'reels' ? 'rotate-180' : ''}`}/>
                  </div>
                  {activeDeepMenu === 'reels' && (
                    <div className="bg-gray-50 dark:bg-[#1c1c1f] border-y border-gray-100 dark:border-white/10 py-1 max-h-32 overflow-y-auto custom-table-scrollbar">
                      {[15, 30, 45, 60, 90, 120].map(s => (
                        <div key={s} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('format_reels', s); setIsScriptMenuOpen(false); }} className="px-8 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300">{s} Detik</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </span>
        )}

        {/* TAG 3: TONE / GAYA BAHASA */}
        {scriptTone && (
          <span 
            onClick={(e) => { 
              e.stopPropagation();
              if(activeSubMenu === 'badge_tone') { setIsScriptMenuOpen(false); setActiveSubMenu(null); } 
              else { setIsScriptMenuOpen(true); setActiveSubMenu('badge_tone'); setActiveDeepMenu(null); } 
            }}
            className="relative group inline-flex py-1.5 items-center gap-1 bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-3 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shrink-0 whitespace-nowrap"
          >
            <span>{scriptTone}</span>
            <button onClick={(e) => { e.stopPropagation(); setScriptTone(''); setActiveSubMenu(null); setIsScriptMenuOpen(false); }} className="text-gray-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto group-hover:ml-1 overflow-hidden transition-all duration-200 ease-in-out shrink-0 flex items-center justify-center"><X size={12} strokeWidth={3} /></button>
            
            {/* POPUP KHUSUS TONE */}
            {isScriptMenuOpen && activeSubMenu === 'badge_tone' && (
              <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-[200px] bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 shadow-lg rounded-xl z-50 py-1 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 cursor-default">
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1c1c1f] mb-1">Ubah Gaya Bahasa</div>
                {['Storytelling', 'Edukatif', 'Profesional', 'Santai', 'Humor', 'Inspiratif', 'Motivasi', 'Blak-blakan & Kritis'].map(t => (
                  <div key={t} onClick={(e) => { e.stopPropagation(); handleUpdateSetting('tone', t); setIsScriptMenuOpen(false); }} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-white/10 last:border-0">{t}</div>
                ))}
              </div>
            )}
          </span>
        )}
      </div>
    </div>
);

  return (
    <div className="absolute left-0 right-0 top-[64px] md:top-[80px] bottom-[50px] flex flex-col overflow-hidden bg-transparent text-gray-900 dark:text-gray-100 font-sans transition-colors z-10">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full flex flex-col items-center">
        {chatHistory.length === 0 ? (
          <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center px-4 -mt-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 font-heading text-center flex items-center justify-center gap-2">
              Script Builder <span className="text-2xl md:text-3xl">🎬</span>
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-sm">
              Atur format konten, gaya bahasa, dan racik naskah komplit secara instan.
            </p>

            <div className="w-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col focus-within:ring-2 focus-within:ring-rn-accent/50 focus-within:border-rn-accent transition-all duration-300 relative z-10">
              <textarea 
                ref={textareaRef}
                value={scriptPromptText + (interimText ? (scriptPromptText && !scriptPromptText.endsWith(' ') ? ' ' : '') + interimText : '')}
                onChange={autoResizeTextarea}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateScript();
                  }
                }}
                className="w-full bg-transparent p-4 min-h-[140px] max-h-[250px] resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm md:text-base leading-relaxed"
                placeholder="Contoh: Bikin script reels tentang 3 kesalahan fatal konten kreator pemula..."
              />
              
              <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t border-transparent bg-transparent relative z-20">
                {renderInputControls()}
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={toggleListening}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border ${isListening ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'}`}
                    title={isListening ? "Hentikan merekam" : "Input menggunakan suara"}
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (isLoading) {
                        abortControllerRef.current?.abort();
                      } else {
                        generateScript();
                      }
                    }}
                    disabled={!isLoading && !scriptPromptText.trim()}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-rn-accent text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    {isLoading ? <Square size={14} className="fill-current" strokeWidth={2.5} /> : <Send size={14} className="-ml-0.5" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto px-4 flex flex-col space-y-8 pb-8 pt-6">
            {chatHistory.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                {msg.role === "user" && (
                  <div className="flex flex-col items-end w-full">
                    <div className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 px-5 py-4 rounded-[20px] rounded-tr-sm max-w-[85%] md:max-w-[75%] shadow-sm border border-gray-200 dark:border-white/5">
                      <p className="text-[14px] whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                    </div>
                  </div>
                )}
                {msg.role === "assistant" && (
                  <div className="flex flex-col w-full">
                    {msg.data?.is_error ? (
                      <div className="flex justify-start">
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-4 rounded-[20px] rounded-tl-sm border border-red-200 dark:border-red-900/30 inline-block break-words whitespace-pre-wrap max-w-[85%] md:max-w-[75%]">
                          <p className="text-[14px]">{msg.data.error_message}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 w-full mt-2">
                        {msg.data?.analisis_strategi && (
                          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold font-heading text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-1.5"><Bot size={14}/> Analisis AI</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-[14px] prose-p:leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-a:text-rn-accent">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.data.analisis_strategi}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        
                        {msg.data?.variations && msg.data.variations.length > 0 && (
                          <div className="w-full overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="flex flex-nowrap gap-4 w-max md:w-full md:grid md:grid-cols-1 md:gap-6">
                              {msg.data.variations.map((ver, vidx) => (
                                <div key={vidx} className="w-[300px] md:w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm shrink-0 flex flex-col group">
                                  <div className="p-4 md:p-5 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 relative">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                      <span className="px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold bg-rn-accent/10 text-rn-accent border border-rn-accent/20">Var {vidx + 1}</span>
                                      <span className="px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">{ver.framework_digunakan}</span>
                                    </div>
                                    <h4 className="font-bold font-heading text-[15px] md:text-[16px] text-gray-900 dark:text-white leading-tight mb-2 pr-10">{ver.judul}</h4>
                                    
                                    <button 
                                      onClick={() => copyScriptToClipboard(ver, `${msg.id}-${vidx}`)}
                                      className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-rn-accent hover:border-rn-accent transition-colors shadow-sm"
                                      title="Salin Naskah"
                                    >
                                      {copiedId === `${msg.id}-${vidx}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                  </div>
                                  
                                  <div className="p-4 md:p-5 flex-1 flex flex-col gap-4 text-[14px]">
                                    <div className="space-y-4">
                                      {ver.script_sections.map((sec, sidx) => (
                                        <div key={sidx}>
                                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">{sec.label}</div>
                                          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                            {sec.content}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {ver.caption && (
                                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5"><MessageSquare size={14}/> Caption</div>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                          {ver.caption}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 p-4 bg-gray-50 dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-sm w-fit">
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Sticky Input Footer when Chat > 0 */}
      {chatHistory.length > 0 && (
        <div className="w-full shrink-0 bg-white/90 dark:bg-rn-dark-bg/90 backdrop-blur-md pt-2 pb-4 px-4 z-40">
          <div className="max-w-3xl mx-auto relative">
            <div className="w-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg flex flex-col focus-within:ring-2 focus-within:ring-rn-accent/50 focus-within:border-rn-accent transition-all duration-300 relative z-10">
              <textarea 
                value={scriptPromptText + (interimText ? (scriptPromptText && !scriptPromptText.endsWith(' ') ? ' ' : '') + interimText : '')}
                onChange={autoResizeTextarea}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateScript();
                  }
                }}
                className="w-full bg-transparent px-4 py-3 min-h-[48px] max-h-[150px] resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm leading-relaxed"
                placeholder="Tulis idemu..."
              />
              
              <div className="px-4 pb-2 pt-0 flex items-center justify-between border-t border-transparent bg-transparent relative z-20">
                {renderInputControls()}
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={toggleListening}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border ${isListening ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'}`}
                    title={isListening ? "Hentikan merekam" : "Input menggunakan suara"}
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (isLoading) {
                        abortControllerRef.current?.abort();
                      } else {
                        generateScript();
                      }
                    }}
                    disabled={!isLoading && !scriptPromptText.trim()}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-rn-accent text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    {isLoading ? <Square size={14} className="fill-current" strokeWidth={2.5} /> : <Send size={14} className="-ml-0.5" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
