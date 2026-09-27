"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Square, CheckCircle2, MessageSquare, Search, UserCircle, Calendar, Bot, Lightbulb, Video, Filter, ChevronDown, Copy, Check, Save } from "lucide-react";

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

export default function IdeaRoomsClient({ blueprintId, blueprintData }: { blueprintId: string, blueprintData: any }) {
  const [ideaPromptText, setIdeaPromptText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIdeaPromptText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const generateContentIdeas = async (manualPromptText: string | null = null) => {
    const rawText = (manualPromptText || ideaPromptText).trim();
    if (!rawText || isLoading) return;

    let isFunneling = rawText === 'Ide Konten Funneling';

    const newUserMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: rawText
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setIdeaPromptText("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Prepare context
    const chatContext = chatHistory.slice(-4).map(msg => 
      `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.role === 'user' ? msg.content : msg.data?.conversation_reply}`
    ).join('\n\n');

    try {
      const res = await fetch("/api/idea-rooms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: rawText,
          isFunneling,
          blueprintData,
          chatHistory: chatContext
        })
      });

      const data = await res.json();
      
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        data
      }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        data: {
          is_error: true,
          error_message: "Maaf, terjadi kesalahan saat menyambung ke AI. Silakan coba beberapa saat lagi."
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-[#0a0a0c] text-gray-900 dark:text-gray-100 font-sans transition-colors relative">
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md z-40 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading flex items-center gap-2">
            Idea Rooms <span className="text-xl">💡</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Ubah Master Blueprint kamu menjadi gudang ide konten.</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full flex flex-col items-center pb-32">
        {chatHistory.length === 0 ? (
          /* Empty State - Hero UI like Screenshot */
          <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center px-4 -mt-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 font-heading text-center flex items-center gap-2">
              Mau bikin apa? <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 p-1.5 rounded-lg text-sm"><Lightbulb size={20} /></span>
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-sm">
              Ubah Ide kamu menjadi rencana yang tajam, 100% selaras dengan <span className="font-bold text-gray-900 dark:text-white">Master Blueprint</span> kamu.
            </p>

            {/* Input Box Centered */}
            <div className="w-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-rn-accent/50 focus-within:border-rn-accent transition-all duration-300">
              <textarea 
                ref={textareaRef}
                value={ideaPromptText}
                onChange={autoResizeTextarea}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateContentIdeas();
                  }
                }}
                className="w-full bg-transparent p-4 min-h-[100px] max-h-[250px] resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm md:text-base leading-relaxed"
                placeholder="Contoh: Aplikasi tracking pengeluaran harian, bisa input lewat WhatsApp, ada dashboard ringkasan bulanan..."
              />
              
              <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t border-transparent bg-transparent">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {/* Dropdown Quick Actions */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Bot size={14} /> Quick Actions <ChevronDown size={12} className={`transition-transform ${isActionsMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isActionsMenuOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-[220px] bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95">
                        {QUICK_ACTIONS.map((action, i) => {
                          const Icon = action.icon;
                          return (
                            <button 
                              key={i} 
                              onClick={() => { setIsActionsMenuOpen(false); generateContentIdeas(action.label); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <Icon size={14} className="text-gray-500" /> {action.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <span className="px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-100 dark:border-orange-500/20 whitespace-nowrap">
                    Blueprint Connected
                  </span>
                </div>
                
                <button 
                  onClick={() => generateContentIdeas()}
                  disabled={!ideaPromptText.trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-rn-accent text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors shadow-sm"
                >
                  {isLoading ? <Square size={14} className="fill-current" /> : <Send size={14} className="-ml-0.5" />}
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Calendar size={14} /> Histori Blueprint Tersimpan
            </div>
          </div>
        ) : (
          /* Chat History View */
          <div className="w-full max-w-5xl px-4 py-8 flex flex-col gap-8">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] md:max-w-[60%] bg-gray-100 dark:bg-[#1c1c1f] text-gray-900 dark:text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full max-w-full space-y-6">
                    {msg.data?.is_error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                        {msg.data.error_message}
                      </div>
                    ) : (
                      <>
                        {msg.data?.conversation_reply && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{__html: msg.data.conversation_reply.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}} />
                        )}
                        
                        {msg.data?.proposed_ideas && msg.data.proposed_ideas.length > 0 && (
                          <div className="space-y-4 pt-2">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                              <Lightbulb size={18} className="text-rn-accent" /> Rekomendasi Ide Konten
                            </h4>
                            
                            {/* Desktop Table View */}
                            <div className="hidden lg:block w-full overflow-x-auto bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                              <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                  <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider text-gray-500">
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
                                        <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-md border block text-center
                                          ${ide.tahap_funnel?.toUpperCase().includes('TOFU') ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50' : 
                                            ide.tahap_funnel?.toUpperCase().includes('MOFU') ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50' : 
                                            ide.tahap_funnel?.toUpperCase().includes('BOFU') ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50' : 
                                            'bg-gray-50 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-400 dark:border-white/10'}`}>
                                          {ide.tahap_funnel || 'IDEA'}
                                        </span>
                                      </td>
                                      <td className="p-4 align-top">
                                        <p className="font-bold text-gray-900 dark:text-white leading-snug mb-2">{ide.nama_ide}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Template: <span className="italic">{ide.template_ide_digunakan}</span></p>
                                      </td>
                                      <td className="p-4 align-top">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[13px]">{ide.angle}</p>
                                      </td>
                                      <td className="p-4 align-top">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[13px]">{ide.masalah_audiens}</p>
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
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-[#0a0a0c] dark:via-[#0a0a0c] pt-10 pb-6 px-4 z-40">
          <div className="max-w-3xl mx-auto relative">
            
            {/* Quick Actions Float */}
            <div className="absolute bottom-full mb-3 left-0 w-full overflow-x-auto no-scrollbar flex gap-2">
              {QUICK_ACTIONS.slice(0, 5).map((action, i) => {
                const Icon = action.icon;
                return (
                  <button 
                    key={i}
                    onClick={() => generateContentIdeas(action.label)}
                    disabled={isLoading}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/10 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors whitespace-nowrap shadow-sm disabled:opacity-50"
                  >
                    <Icon size={12} /> {action.label}
                  </button>
                )
              })}
            </div>

            <div className="w-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg flex items-end focus-within:ring-2 focus-within:ring-rn-accent/50 focus-within:border-rn-accent transition-all p-2 relative">
              <textarea 
                value={ideaPromptText}
                onChange={autoResizeTextarea}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateContentIdeas();
                  }
                }}
                className="w-full bg-transparent px-3 py-2 min-h-[40px] max-h-[150px] resize-none outline-none text-gray-900 dark:text-white text-sm"
                placeholder="Tulis idemu atau pilih aksi di atas..."
              />
              <button 
                onClick={() => generateContentIdeas()}
                disabled={!ideaPromptText.trim() || isLoading}
                className="w-9 h-9 ml-2 rounded-xl bg-rn-accent text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-orange-600 transition-colors shadow-sm mb-0.5"
              >
                {isLoading ? <Square size={16} className="fill-current" /> : <Send size={16} className="-ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
