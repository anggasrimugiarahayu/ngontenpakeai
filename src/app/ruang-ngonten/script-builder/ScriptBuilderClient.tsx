"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Square, CheckCircle2, MessageSquare, Search, UserCircle, Calendar, Bot, Lightbulb, Video, Filter, ChevronDown, Copy, Check, Save, Plus, Mic, X } from "lucide-react";
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
  id: string;
  role: "user" | "assistant";
  content?: string;
  data?: {
    is_error?: boolean;
    error_message?: string;
    analisis_strategi?: string;
    variations?: ScriptVariation[];
  };
}

const QUICK_ACTIONS = [
  { icon: Video, label: 'Bikin Script Reels' },
  { icon: Copy, label: 'Bikin Carousel Edukasi' },
  { icon: Search, label: 'Script Review Produk' },
  { icon: Bot, label: 'Ubah Ide Jadi Script' },
];

export default function ScriptBuilderClient({ blueprintData }: { blueprintData: any }) {
  const [scriptPromptText, setScriptPromptText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Script options
  const [scriptFormat, setScriptFormat] = useState<string>('');
  const [scriptCarouselSlides, setScriptCarouselSlides] = useState<number>(5);
  const [scriptReelsDuration, setScriptReelsDuration] = useState<number>(30);
  const [scriptTone, setScriptTone] = useState<string>('');

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeDeepMenu, setActiveDeepMenu] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

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
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setScriptPromptText(prev => prev + ' ' + currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setScriptPromptText('');
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
    }

    const newMessageId = Date.now().toString();
    setChatHistory(prev => [...prev, {
      id: newMessageId,
      role: "user",
      content: textToSubmit
    }]);

    if (!customPrompt) setScriptPromptText("");
    setIsLoading(true);
    setActiveSubMenu(null);
    setActiveDeepMenu(null);

    let requestContext = "";
    if (scriptFormat) requestContext += `Format: ${scriptFormat === 'Carousel' ? `Carousel (${scriptCarouselSlides} Slide)` : scriptFormat === 'Reels' ? `Reels (${scriptReelsDuration}s)` : scriptFormat}\n`;
    if (scriptTone) requestContext += `Tone: ${scriptTone}\n`;

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
          id: Date.now().toString(),
          role: "assistant",
          content: "",
          data: {
            is_error: true,
            error_message: data.error || "Gagal menghubungi AI."
          }
        }]);
        return;
      }

      // Safe normalization (just like in the reference App.tsx)
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
        id: Date.now().toString(),
        role: "assistant",
        content: "",
        data
      }]);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setChatHistory(prev => [...prev, {
          id: Date.now().toString(),
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
        id: Date.now().toString(),
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
    let scriptText = `Judul: ${ver.judul}\n`;
    scriptText += `Framework: ${ver.framework_digunakan}\n`;
    scriptText += `Hook: ${ver.hook_digunakan}\n`;
    scriptText += `CTA: ${ver.cta_digunakan}\n\n`;
    
    ver.script_sections.forEach(sec => {
      scriptText += `[${sec.label}]\n${sec.content}\n\n`;
    });
    
    if (ver.caption) {
      scriptText += `--- CAPTION ---\n${ver.caption}\n`;
    }

    navigator.clipboard.writeText(scriptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveSubMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="absolute left-0 right-0 top-[64px] md:top-[80px] bottom-[50px] bg-white dark:bg-[#0A0A0A] flex flex-col overflow-hidden">
      
      {/* 1) EMPTY STATE */}
      {chatHistory.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center p-4 overflow-y-auto max-h-full">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 rounded-full bg-rn-accent/10 dark:bg-rn-accent/20 flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-rn-accent" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-center mb-2 text-gray-900 dark:text-white">
              Bikin Script Anti-Skip
            </h1>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-md text-sm">
              AI akan menuliskan struktur naskah yang memikat perhatian sejak detik pertama. Mau bahas apa hari ini?
            </p>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {QUICK_ACTIONS.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setScriptPromptText(action.label);
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-rn-accent dark:hover:border-rn-accent hover:bg-orange-50 dark:hover:bg-rn-accent/10 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 text-gray-600 dark:text-gray-300 group-hover:text-rn-accent">
                      <Icon size={18} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{action.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Empty State Chat Box */}
            <div className="w-full relative max-w-3xl">
              
              {/* Settings badges */}
              <div className="flex flex-wrap gap-2 mb-2 px-1">
                {/* Format Badge */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveSubMenu(activeSubMenu === 'format' ? null : 'format'); setActiveDeepMenu(null); }}
                    className="inline-flex items-center gap-1 bg-white dark:bg-black border border-gray-300 dark:border-white/40 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:border-gray-900 transition-all"
                  >
                    {scriptFormat === 'Carousel' ? `Carousel (${scriptCarouselSlides})` : scriptFormat === 'Reels' ? `Reels (${scriptReelsDuration}s)` : 'Format'} 
                    {scriptFormat && <X size={12} onClick={(e) => { e.stopPropagation(); setScriptFormat(''); }} className="ml-1 hover:text-red-500" />}
                  </button>

                  {/* Format Menu */}
                  {activeSubMenu === 'format' && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-[220px] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/20 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">Pilih Format</div>
                      <div className="flex flex-col">
                        <div onClick={() => setActiveDeepMenu(activeDeepMenu === 'carousel' ? null : 'carousel')} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                          Carousel <ChevronDown size={14} className={activeDeepMenu === 'carousel' ? 'rotate-180' : ''}/>
                        </div>
                        {activeDeepMenu === 'carousel' && (
                          <div className="bg-gray-50 dark:bg-black/50 py-1 max-h-32 overflow-y-auto border-y border-gray-100 dark:border-white/10">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                              <div key={i} onClick={() => { handleUpdateSetting('format_carousel', i); setActiveSubMenu(null); }} className="px-8 py-2 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-xs text-gray-600 dark:text-gray-400">{i} Slide</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col border-t border-gray-100 dark:border-white/10">
                        <div onClick={() => setActiveDeepMenu(activeDeepMenu === 'reels' ? null : 'reels')} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                          Reels / TikTok <ChevronDown size={14} className={activeDeepMenu === 'reels' ? 'rotate-180' : ''}/>
                        </div>
                        {activeDeepMenu === 'reels' && (
                          <div className="bg-gray-50 dark:bg-black/50 py-1 max-h-32 overflow-y-auto border-y border-gray-100 dark:border-white/10">
                            {[15, 30, 45, 60, 90].map(s => (
                              <div key={s} onClick={() => { handleUpdateSetting('format_reels', s); setActiveSubMenu(null); }} className="px-8 py-2 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-xs text-gray-600 dark:text-gray-400">{s} Detik</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tone Badge */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveSubMenu(activeSubMenu === 'tone' ? null : 'tone'); setActiveDeepMenu(null); }}
                    className="inline-flex items-center gap-1 bg-white dark:bg-black border border-gray-300 dark:border-white/40 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:border-gray-900 transition-all"
                  >
                    {scriptTone || 'Gaya Bahasa'}
                    {scriptTone && <X size={12} onClick={(e) => { e.stopPropagation(); setScriptTone(''); }} className="ml-1 hover:text-red-500" />}
                  </button>

                  {/* Tone Menu */}
                  {activeSubMenu === 'tone' && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-[180px] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/20 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">Pilih Gaya Bahasa</div>
                      {['Storytelling', 'Edukatif', 'Profesional', 'Santai', 'Humor', 'Motivasi', 'Blak-blakan'].map(t => (
                        <div key={t} onClick={() => { handleUpdateSetting('tone', t); setActiveSubMenu(null); }} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100/50 dark:border-white/10 last:border-0">{t}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-1 bg-white dark:bg-[#1A1A1A] rounded-2xl border transition-all ${isListening ? 'border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.2)]' : 'border-gray-200 dark:border-white/10 shadow-sm focus-within:border-rn-accent focus-within:ring-1 focus-within:ring-rn-accent/20'}`}>
                <div className="flex items-end gap-2 p-1">
                  <textarea 
                    value={scriptPromptText}
                    onChange={(e) => setScriptPromptText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        generateScript();
                      }
                    }}
                    placeholder="Deskripsikan video apa yang ingin kamu buat..."
                    className="w-full bg-transparent border-none outline-none resize-none min-h-[48px] max-h-[150px] py-3 px-3 text-[13px] text-gray-800 dark:text-gray-200 custom-scrollbar"
                    rows={1}
                  />
                  <div className="flex items-center gap-1 pb-1 pr-1 shrink-0">
                    <button 
                      onClick={toggleListening}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border ${isListening ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'}`}
                    >
                      <Mic size={16} />
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
                      className="w-9 h-9 rounded-full bg-rn-accent text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors shadow-sm"
                    >
                      {isLoading ? <Square size={14} className="fill-current" /> : <Send size={14} className="-ml-0.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ) : (
        /* 2) CHAT HISTORY STATE */
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar pb-4 pt-4">
          <div className="w-full max-w-3xl mx-auto px-4 flex flex-col space-y-6 pb-20">
            {chatHistory.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                
                {/* User Message */}
                {msg.role === "user" && (
                  <div className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm border border-gray-200 dark:border-white/5">
                    <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                )}
                
                {/* Assistant Message */}
                {msg.role === "assistant" && (
                  <div className="flex gap-3 w-full max-w-full">
                    <div className="w-8 h-8 rounded-full bg-rn-accent flex items-center justify-center shrink-0 shadow-sm mt-1">
                      <Bot size={16} className="text-white" />
                    </div>
                    
                    <div className="flex-1 w-full max-w-[calc(100%-2.5rem)]">
                      {msg.data?.is_error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl rounded-tl-sm border border-red-200 dark:border-red-900/30 inline-block break-words whitespace-pre-wrap max-w-full">
                          <p className="text-[13px]">{msg.data.error_message}</p>
                        </div>
                      ) : (
                        <div className="space-y-4 w-full">
                          {/* Strategic Analysis */}
                          {msg.data?.analisis_strategi && (
                            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
                              <h3 className="text-xs font-bold font-heading text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5"><Bot size={14}/> Analisis AI</h3>
                              <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] prose-p:leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-a:text-rn-accent">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.data.analisis_strategi}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                          
                          {/* Script Variations */}
                          {msg.data?.variations && msg.data.variations.length > 0 && (
                            <div className="w-full overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                              <div className="flex flex-nowrap gap-4 w-max md:w-full md:grid md:grid-cols-1 md:gap-6">
                                {msg.data.variations.map((ver, vidx) => (
                                  <div key={vidx} className="w-[300px] md:w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm shrink-0 flex flex-col group">
                                    <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 relative">
                                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rn-accent/10 text-rn-accent border border-rn-accent/20">Var {vidx + 1}</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">{ver.framework_digunakan}</span>
                                      </div>
                                      <h4 className="font-bold font-heading text-[14px] text-gray-900 dark:text-white leading-tight mb-2 pr-8">{ver.judul}</h4>
                                      
                                      <button 
                                        onClick={() => copyScriptToClipboard(ver, `${msg.id}-${vidx}`)}
                                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-rn-accent hover:border-rn-accent transition-colors shadow-sm"
                                        title="Salin Naskah"
                                      >
                                        {copiedId === `${msg.id}-${vidx}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                      </button>
                                    </div>
                                    
                                    <div className="p-4 flex-1 flex flex-col gap-4 text-[13px]">
                                      {/* Script Sections */}
                                      <div className="space-y-3">
                                        {ver.script_sections.map((sec, sidx) => (
                                          <div key={sidx}>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{sec.label}</div>
                                            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                              {sec.content}
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Caption */}
                                      {ver.caption && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><MessageSquare size={12}/> Caption</div>
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
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-gray-500 dark:text-gray-400 animate-pulse" />
                </div>
                <div className="bg-gray-100 dark:bg-[#111] px-5 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2 border border-gray-200 dark:border-white/5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {/* 3) STICKY BOTTOM INPUT (Only show when chat history exists) */}
      {chatHistory.length > 0 && (
        <div className="border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md p-3 shrink-0 relative z-20">
          <div className="max-w-3xl mx-auto w-full">
            
            {/* Settings badges */}
            <div className="flex flex-wrap gap-2 mb-2 px-1">
                {/* Format Badge */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveSubMenu(activeSubMenu === 'format_sticky' ? null : 'format_sticky'); setActiveDeepMenu(null); }}
                    className="inline-flex items-center gap-1 bg-white dark:bg-black border border-gray-300 dark:border-white/40 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:border-gray-900 transition-all"
                  >
                    {scriptFormat === 'Carousel' ? `Carousel (${scriptCarouselSlides})` : scriptFormat === 'Reels' ? `Reels (${scriptReelsDuration}s)` : 'Format'} 
                    {scriptFormat && <X size={12} onClick={(e) => { e.stopPropagation(); setScriptFormat(''); }} className="ml-1 hover:text-red-500" />}
                  </button>

                  {/* Format Menu */}
                  {activeSubMenu === 'format_sticky' && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-[220px] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/20 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">Pilih Format</div>
                      <div className="flex flex-col">
                        <div onClick={() => setActiveDeepMenu(activeDeepMenu === 'carousel' ? null : 'carousel')} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                          Carousel <ChevronDown size={14} className={activeDeepMenu === 'carousel' ? 'rotate-180' : ''}/>
                        </div>
                        {activeDeepMenu === 'carousel' && (
                          <div className="bg-gray-50 dark:bg-black/50 py-1 max-h-32 overflow-y-auto border-y border-gray-100 dark:border-white/10">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                              <div key={i} onClick={() => { handleUpdateSetting('format_carousel', i); setActiveSubMenu(null); }} className="px-8 py-2 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-xs text-gray-600 dark:text-gray-400">{i} Slide</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col border-t border-gray-100 dark:border-white/10">
                        <div onClick={() => setActiveDeepMenu(activeDeepMenu === 'reels' ? null : 'reels')} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                          Reels / TikTok <ChevronDown size={14} className={activeDeepMenu === 'reels' ? 'rotate-180' : ''}/>
                        </div>
                        {activeDeepMenu === 'reels' && (
                          <div className="bg-gray-50 dark:bg-black/50 py-1 max-h-32 overflow-y-auto border-y border-gray-100 dark:border-white/10">
                            {[15, 30, 45, 60, 90].map(s => (
                              <div key={s} onClick={() => { handleUpdateSetting('format_reels', s); setActiveSubMenu(null); }} className="px-8 py-2 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-xs text-gray-600 dark:text-gray-400">{s} Detik</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tone Badge */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveSubMenu(activeSubMenu === 'tone_sticky' ? null : 'tone_sticky'); setActiveDeepMenu(null); }}
                    className="inline-flex items-center gap-1 bg-white dark:bg-black border border-gray-300 dark:border-white/40 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:border-gray-900 transition-all"
                  >
                    {scriptTone || 'Gaya Bahasa'}
                    {scriptTone && <X size={12} onClick={(e) => { e.stopPropagation(); setScriptTone(''); }} className="ml-1 hover:text-red-500" />}
                  </button>

                  {/* Tone Menu */}
                  {activeSubMenu === 'tone_sticky' && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-[180px] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/20 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">Pilih Gaya Bahasa</div>
                      {['Storytelling', 'Edukatif', 'Profesional', 'Santai', 'Humor', 'Motivasi', 'Blak-blakan'].map(t => (
                        <div key={t} onClick={() => { handleUpdateSetting('tone', t); setActiveSubMenu(null); }} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100/50 dark:border-white/10 last:border-0">{t}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            <div className={`p-1 bg-white dark:bg-[#1A1A1A] rounded-2xl border transition-all ${isListening ? 'border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.2)]' : 'border-gray-200 dark:border-white/10 shadow-sm focus-within:border-rn-accent focus-within:ring-1 focus-within:ring-rn-accent/20'}`}>
              <div className="flex items-end gap-2 p-1">
                <textarea 
                  value={scriptPromptText}
                  onChange={(e) => setScriptPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      generateScript();
                    }
                  }}
                  placeholder="Ketik topik script videomu di sini..."
                  className="w-full bg-transparent border-none outline-none resize-none min-h-[48px] max-h-[150px] py-3 px-3 text-[13px] text-gray-800 dark:text-gray-200 custom-scrollbar"
                  rows={1}
                />
                
                <div className="flex items-center gap-1 pb-1 pr-1 shrink-0">
                  <button 
                    onClick={toggleListening}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border ${isListening ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'}`}
                    title={isListening ? "Hentikan merekam" : "Input menggunakan suara"}
                  >
                    <Mic size={16} />
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
                    className="w-9 h-9 rounded-full bg-rn-accent text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    {isLoading ? <Square size={14} className="fill-current" /> : <Send size={14} className="-ml-0.5" />}
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
