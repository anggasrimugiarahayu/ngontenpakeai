"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Square, CheckCircle2, MessageSquare, Search, UserCircle, Calendar, Bot, Lightbulb, Video, Filter, ChevronDown, Copy, Check, Save, Plus, Mic } from "lucide-react";

interface Idea {
  tahap_funnel?: string;
  template_ide_digunakan?: string;
  nama_ide: string;
  angle: string;
  insight_utama?: string;
  masalah_audiens?: string;
  dream_outcome?: string;
  alternative_angles?: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content?: string;
  data?: {
    is_error?: boolean;
    error_message?: string;
    conversation_reply?: string;
    proposed_ideas?: Idea[];
  };
}

const QUICK_ACTIONS = [
  { icon: Filter, label: 'Ide Konten Funneling' },
  { icon: Video, label: 'Peluang Konten Viral' },
  { icon: Lightbulb, label: 'Cari Ide Konten' },
  { icon: MessageSquare, label: 'Eksplor Angle' },
  { icon: Search, label: 'Riset Topik & Trend' },
  { icon: UserCircle, label: 'Analisis Audiens' },
  { icon: CheckCircle2, label: 'Ide Evergreen' },
  { icon: Calendar, label: 'Rencana Konten Mingguan' },
  { icon: Bot, label: 'Temukan Insight Baru' }
];

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

export default function IdeaRoomsClient({ blueprintId, blueprintData }: { blueprintId: string, blueprintData: any }) {
  const [ideaPromptText, setIdeaPromptText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText("");
      return;
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onresult = (event: any) => {
          let final = '';
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (final) {
            setIdeaPromptText((prev) => {
              const separator = prev && !prev.endsWith(' ') ? ' ' : '';
              return prev + separator + final;
            });
          }
          setInterimText(interim);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          setInterimText("");
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimText("");
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      } else {
        alert("Browser kamu tidak mendukung fitur input suara. Coba gunakan Google Chrome.");
      }
    }
  };

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIdeaPromptText(e.target.value);
    setInterimText("");
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const generateContentIdeas = async (manualPromptText: string | null = null) => {
    const rawText = (manualPromptText || ideaPromptText).trim();
    if (!rawText) return;

    if (isLoading) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsLoading(false);
      }
      return;
    }

    let actualPrompt = rawText;
    let displayContent = rawText;
    let isFunneling = false;

    // TRANSLATION LAYER: Menerjemahkan tombol Meta-Prompt
    if (rawText === 'Ide Konten Funneling') {
      isFunneling = true;
      displayContent = "Tolong berikan rekomendasi 30 Ide Konten Funneling (10 TOFU, 10 MOFU, 10 BOFU) berdasarkan analisa Master Blueprint saya.";
      actualPrompt = "Tolong buatkan strategi Ide Konten Funneling secara komprehensif berdasarkan analisa mendalam KESELURUHAN Master Blueprint saya. Berikan total 30 ide konten yang dibagi menjadi 10 TOFU, 10 MOFU, dan 10 BOFU. INGAT: Topik/Pembahasan KESELURUHAN ide WAJIB 100% diambil dari Niche Blueprint saya.";
    } else if (rawText === 'Riset Topik & Trend') {
      actualPrompt = "Gunakan akses pencarian internet (Search Grounding) untuk meriset topik, keresahan, dan tren terbaru saat ini (Tahun 2026) yang sedang viral/ramai dibicarakan KHUSUS di dalam Niche/Topik Master Blueprint saya. Setelah itu, buatkan ide konten berdasarkan tren tersebut. INGAT HARGA MATI: Topik idenya adalah Niche saya, BUKAN membuat konten edukasi tentang 'bagaimana cara meriset tren'!";
    } else if (rawText === 'Ide Evergreen') {
      actualPrompt = "Buatkan ide konten yang bersifat Evergreen (solusi untuk masalah mendasar/fundamental yang selalu dicari orang kapanpun, tidak lekang oleh waktu) KHUSUS untuk Niche/Topik Master Blueprint saya. INGAT HARGA MATI: Topik idenya adalah Niche saya, BUKAN membuat konten edukasi tentang 'apa itu konten evergreen'!";
    } else if (rawText === 'Peluang Konten Viral') {
      actualPrompt = "Berikan ide konten dengan potensi viral tinggi (bisa berupa kontroversi ringan, opini *unpopular/contrarian*, atau keresahan massal yang sangat *relatable*) KHUSUS untuk Niche/Topik Master Blueprint saya.";
    } else if (rawText === 'Eksplor Angle') {
      actualPrompt = "Pilih satu masalah/topik utama dari Master Blueprint saya, lalu berikan ide konten dengan sudut pandang (*angle*) yang sangat *out-of-the-box*, *contrarian*, atau tidak biasa dipikirkan oleh kompetitor di niche saya.";
    } else if (rawText === 'Analisis Audiens') {
      actualPrompt = "Lakukan Analisis Audiens mendalam berdasarkan Master Blueprint saya, berikan insight psikologis baru, lalu hasilkan ide konten yang menyerang titik emosional terkuat mereka.";
    } else if (rawText === 'Rencana Konten Mingguan') {
      actualPrompt = "Buatkan Rencana Konten Mingguan (Senin-Minggu) yang seimbang antara edukasi, hiburan, dan konversi, berdasarkan Master Blueprint saya.";
    } else if (rawText === 'Cari Ide Konten') {
      actualPrompt = "Tolong berikan ide konten yang segar, tajam, dan langsung bisa dieksekusi hari ini berdasarkan Master Blueprint saya.";
    } else if (rawText === 'Temukan Insight Baru') {
      actualPrompt = "Analisa ulang Master Blueprint saya dan temukan insight atau sudut pandang yang mungkin saya lewatkan, lalu jadikan itu sebagai ide konten yang provokatif.";
    }

    const newUserMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: displayContent
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setIdeaPromptText("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    abortControllerRef.current = new AbortController();

    // Prepare context
    const chatContext = chatHistory.slice(-4).map(msg => 
      `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.role === 'user' ? msg.content : msg.data?.conversation_reply}`
    ).join('\n\n');

    try {
      const res = await fetch("/api/idea-rooms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          promptText: actualPrompt,
          isFunneling,
          blueprintData,
          chatHistory: chatContext,
          model: selectedModel
        })
      });

      const data = await res.json();
      let errMessage = "Terjadi kesalahan saat menghubungi API AI.";
      if (data.error) {
        let rawErrorStr = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        try {
          const match = rawErrorStr.match(/(\{.*\})/);
          if (match) {
            const parsed = JSON.parse(match[1]);
            errMessage = parsed.error?.message || parsed.message || rawErrorStr;
          } else {
            errMessage = rawErrorStr;
          }
        } catch {
          errMessage = rawErrorStr;
        }
      }

      if (errMessage.includes("experiencing high demand") || errMessage.includes("503") || errMessage.includes("UNAVAILABLE")) {
        errMessage = "Server AI sedang penuh (High Demand). Silakan tunggu beberapa detik dan coba lagi.";
      } else if (errMessage.includes("API_KEY_INVALID")) {
        errMessage = "API Key tidak valid. Silakan periksa di pengaturan profil Anda.";
      }
      
      if (!res.ok || data.error) {
        throw new Error(errMessage);
      }

      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        data
      }]);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Generation aborted by user");
        return;
      }
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        data: {
          is_error: true,
          error_message: error.message || "Maaf, terjadi kesalahan saat menyambung ke AI. Silakan coba beberapa saat lagi."
        }
      }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-transparent text-gray-900 dark:text-gray-100 font-sans transition-colors relative">
      
      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        {chatHistory.length === 0 ? (
          /* Empty State - Hero UI like Screenshot */
          <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center px-4 -mt-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 font-heading text-center flex items-center justify-center gap-2">
              Idea Rooms <span className="text-2xl md:text-3xl">💡</span>
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-sm">
              Ubah Master Blueprint kamu menjadi gudang ide konten.
            </p>

            {/* Input Box Centered */}
            <div className="w-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col focus-within:ring-2 focus-within:ring-rn-accent/50 focus-within:border-rn-accent transition-all duration-300 relative z-10">
              <textarea 
                ref={textareaRef}
                value={ideaPromptText + (interimText ? (ideaPromptText && !ideaPromptText.endsWith(' ') ? ' ' : '') + interimText : '')}
                onChange={autoResizeTextarea}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateContentIdeas();
                  }
                }}
                className="w-full bg-transparent p-4 min-h-[140px] max-h-[250px] resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm md:text-base leading-relaxed"
                placeholder="Contoh: Aplikasi tracking pengeluaran harian, bisa input lewat WhatsApp, ada dashboard ringkasan bulanan..."
              />
              
              <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t border-transparent bg-transparent relative z-20">
                <div className="flex items-center gap-2 overflow-visible flex-wrap">
                  {/* Dropdown Quick Actions (Plus Button) */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                      className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isActionsMenuOpen ? 'bg-gray-100 dark:bg-white/10' : ''}`}
                      title="Quick Actions"
                    >
                      <Plus size={18} className={`transition-transform duration-200 ${isActionsMenuOpen ? 'rotate-45' : ''}`} />
                    </button>
                    
                    {isActionsMenuOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-[220px] max-h-[250px] overflow-y-auto bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 py-1 animate-in fade-in zoom-in-95">
                        {QUICK_ACTIONS.map((action, i) => {
                          const Icon = action.icon;
                          return (
                            <button 
                              key={i} 
                              onClick={() => { setIsActionsMenuOpen(false); generateContentIdeas(action.label); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <Icon size={14} className="text-gray-500 shrink-0" /> {action.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dropdown Model AI */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      AI: <span className="text-gray-900 dark:text-white">{AI_MODELS.find(m => m.value === selectedModel)?.label}</span>
                      <ChevronDown size={12} className={`transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isModelMenuOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-[180px] bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95">
                        {AI_MODELS.map((m, i) => (
                          <button 
                            key={i} 
                            onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${selectedModel === m.value ? 'text-rn-accent bg-orange-50 dark:bg-orange-900/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleListening}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border ${isListening ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'}`}
                    title={isListening ? "Hentikan merekam" : "Input menggunakan suara"}
                  >
                    <Mic size={16} />
                  </button>
                  <button 
                    onClick={() => generateContentIdeas()}
                    disabled={!isLoading && !ideaPromptText.trim()}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-rn-accent text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    {isLoading ? <Square size={14} className="fill-current" /> : <Send size={14} className="-ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Calendar size={14} /> Histori Blueprint Tersimpan
            </div>
          </div>
        ) : (
          /* Chat History View */
          <div className="w-full max-w-3xl px-4 py-8 flex flex-col gap-8">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] md:max-w-[60%] bg-gray-100 dark:bg-[#1c1c1f] text-gray-900 dark:text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-[13px] md:text-sm shadow-sm border border-transparent dark:border-white/5">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full max-w-full space-y-5">
                    {msg.data?.is_error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-[13px] md:text-sm border border-red-100 dark:border-red-900/30">
                        {msg.data.error_message}
                      </div>
                    ) : (
                      <>
                        {msg.data?.conversation_reply && (
                          <div className="text-[13px] md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl" dangerouslySetInnerHTML={{__html: msg.data.conversation_reply.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}} />
                        )}
                        
                        {msg.data?.proposed_ideas && msg.data.proposed_ideas.length > 0 && (
                          <div className="space-y-4 pt-2">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                              <Lightbulb size={18} className="text-rn-accent" /> Rekomendasi Ide Konten
                            </h4>
                            
                            {/* Desktop Table View */}
                            <div className="hidden lg:block w-full overflow-x-auto bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                              <table className="w-full text-left border-collapse text-[13px]">
                                <thead>
                                  <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-[10px] md:text-xs uppercase tracking-wider text-gray-500">
                                    <th className="p-4 font-bold">Funnel</th>
                                    <th className="p-4 font-bold w-[250px]">Ide / Template</th>
                                    <th className="p-4 font-bold w-[250px]">Angle Unik</th>
                                    <th className="p-4 font-bold w-[200px]">Pain Point</th>
                                    <th className="p-4 font-bold text-center">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                  {msg.data.proposed_ideas.map((ide, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                      <td className="p-4 align-top">
                                        <span className={`text-[9px] md:text-[10px] font-bold tracking-widest px-2 py-1 rounded-md border block text-center
                                          ${ide.tahap_funnel?.toUpperCase().includes('TOFU') ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50' : 
                                            ide.tahap_funnel?.toUpperCase().includes('MOFU') ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50' : 
                                            ide.tahap_funnel?.toUpperCase().includes('BOFU') ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50' : 
                                            'bg-gray-50 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-400 dark:border-white/10'}`}>
                                          {ide.tahap_funnel || 'IDEA'}
                                        </span>
                                      </td>
                                      <td className="p-4 align-top">
                                        <p className="font-bold text-[13px] md:text-sm text-gray-900 dark:text-white leading-snug mb-2">{ide.nama_ide}</p>
                                        <p className="text-[10px] md:text-[11px] text-gray-500 dark:text-gray-400">Template: <span className="italic">{ide.template_ide_digunakan}</span></p>
                                      </td>
                                      <td className="p-4 align-top">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[12px] md:text-[13px]">{ide.angle}</p>
                                      </td>
                                      <td className="p-4 align-top">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[12px] md:text-[13px]">{ide.masalah_audiens}</p>
                                      </td>
                                      <td className="p-4 align-top text-center">
                                        <button 
                                          onClick={() => copyToClipboard(JSON.stringify(ide, null, 2))}
                                          className="p-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 rounded-lg transition-colors"
                                          title="Copy Ide"
                                        >
                                          <Copy size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-4">
                              {msg.data.proposed_ideas.map((ide, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                  <div className={`absolute top-0 left-0 w-full h-1 
                                    ${ide.tahap_funnel?.toUpperCase().includes('TOFU') ? 'bg-blue-500' : 
                                      ide.tahap_funnel?.toUpperCase().includes('MOFU') ? 'bg-amber-500' : 
                                      ide.tahap_funnel?.toUpperCase().includes('BOFU') ? 'bg-orange-500' : 'bg-gray-500'}`}>
                                  </div>
                                  <div className="flex justify-between items-start mb-3 pt-1">
                                    <span className="text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400">{ide.tahap_funnel}</span>
                                    <button onClick={() => copyToClipboard(JSON.stringify(ide, null, 2))} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                      <Copy size={14} />
                                    </button>
                                  </div>
                                  <h5 className="font-bold text-gray-900 dark:text-white text-base mb-4 leading-snug">{ide.nama_ide}</h5>
                                  <div className="space-y-3 text-sm">
                                    <div>
                                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Angle Unik</p>
                                      <p className="text-gray-700 dark:text-gray-300">{ide.angle}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pain Point</p>
                                      <p className="text-gray-700 dark:text-gray-300">{ide.masalah_audiens}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
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
        <div className="sticky bottom-0 w-full bg-white/90 dark:bg-rn-dark-bg/90 backdrop-blur-md pt-4 pb-8 px-4 z-40">
          <div className="max-w-3xl mx-auto relative">
            
            <div className="w-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg flex flex-col focus-within:ring-2 focus-within:ring-rn-accent/50 focus-within:border-rn-accent transition-all duration-300 relative z-10">
              <textarea 
                value={ideaPromptText + (interimText ? (ideaPromptText && !ideaPromptText.endsWith(' ') ? ' ' : '') + interimText : '')}
                onChange={autoResizeTextarea}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateContentIdeas();
                  }
                }}
                className="w-full bg-transparent p-4 min-h-[60px] max-h-[150px] resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm md:text-base leading-relaxed"
                placeholder="Tulis idemu..."
              />
              
              <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t border-transparent bg-transparent relative z-20">
                <div className="flex items-center gap-2 overflow-visible flex-wrap">
                  {/* Dropdown Quick Actions (Plus Button) */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                      className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isActionsMenuOpen ? 'bg-gray-100 dark:bg-white/10' : ''}`}
                      title="Quick Actions"
                    >
                      <Plus size={18} className={`transition-transform duration-200 ${isActionsMenuOpen ? 'rotate-45' : ''}`} />
                    </button>
                    
                    {isActionsMenuOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-[220px] max-h-[250px] overflow-y-auto bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 py-1 animate-in fade-in zoom-in-95">
                        {QUICK_ACTIONS.map((action, i) => {
                          const Icon = action.icon;
                          return (
                            <button 
                              key={i} 
                              onClick={() => { setIsActionsMenuOpen(false); generateContentIdeas(action.label); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <Icon size={14} className="text-gray-500 shrink-0" /> {action.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dropdown Model AI */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      AI: <span className="text-gray-900 dark:text-white">{AI_MODELS.find(m => m.value === selectedModel)?.label}</span>
                      <ChevronDown size={12} className={`transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isModelMenuOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-[180px] bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95">
                        {AI_MODELS.map((m, i) => (
                          <button 
                            key={i} 
                            onClick={() => { setSelectedModel(m.value); setIsModelMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${selectedModel === m.value ? 'text-rn-accent bg-orange-50 dark:bg-orange-900/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleListening}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border ${isListening ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-900/50 animate-pulse' : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'}`}
                    title={isListening ? "Hentikan merekam" : "Input menggunakan suara"}
                  >
                    <Mic size={16} />
                  </button>
                  <button 
                    onClick={() => generateContentIdeas()}
                    disabled={!isLoading && !ideaPromptText.trim()}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-rn-accent text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-orange-600 transition-colors shadow-sm"
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
