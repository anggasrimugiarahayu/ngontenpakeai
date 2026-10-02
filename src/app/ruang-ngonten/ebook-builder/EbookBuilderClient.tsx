"use client";

import { useSessionState } from "@/hooks/useSessionState";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Lightbulb, Target, CheckCircle2, Copy, AlertCircle, BookOpen, Send
} from 'lucide-react';
import GlobalChatLayout, { ChatMessage } from '@/components/chat/GlobalChatLayout';
import { useAIChat } from '@/hooks/useAIChat';


export default function EbookBuilderClient({ blueprintData = {} }: { blueprintData?: any }) {
  const { fetchAI, isLoading, setIsLoading, abort } = useAIChat();
  
  const [chatHistory, setChatHistory] = useSessionState<ChatMessage[]>("chat_ebook_builder", []);
  const [inputText, setInputText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  
  const [actionState, setActionState] = useState<string | null>(null);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    
    const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setActionState(`copy-${id}`);
    setTimeout(() => setActionState(null), 2000);
  };

  const generateContent = async (overridePrompt?: string, sourceMsgId?: number) => {
    const promptText = overridePrompt || inputText;
    if (!promptText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: promptText,
    };

    setChatHistory(prev => [...prev, userMessage]);
    if (!overridePrompt) setInputText("");

    const historyCtx = chatHistory.filter(m => m.type !== 'welcome').map(m => ({
      role: m.role,
      content: m.content,
      type: m.type,
      data: m.data
    }));

    const { data, error } = await fetchAI('/api/ebook-builder/generate', {
      prompt: promptText,
      history: historyCtx,
      blueprint: blueprintData,
      model: selectedModel
    });

    if (error) {
      const errorMsg: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        type: 'error',
        data: { is_error: true, error_message: error }
      };
      setChatHistory(prev => {
        let newHistory = [...prev, errorMsg];
        if (sourceMsgId) {
           newHistory = newHistory.map(m => m.id === sourceMsgId ? { ...m, isReviewing: true } : m);
        }
        return newHistory;
      });
      if (!promptText.includes('[SYSTEM AUTO-SUBMIT]')) {
        setInputText(promptText);
      }
      return;
    }

    if (data) {
      const assistantMessage: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        type: data.response_type || 'chat',
        data: data
      };
      setChatHistory(prev => [...prev, assistantMessage]);
    }
  };

  const renderCustomMessage = (msg: ChatMessage) => {
    if (msg.data?.is_error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-5 text-red-700 dark:text-red-400 text-sm font-bold flex items-start gap-3 mt-2">
           <AlertCircle size={18} className="shrink-0 mt-0.5" strokeWidth={2.5} /> 
           <span className="leading-relaxed">{msg.data.error_message}</span>
        </div>
      );
    }

    if (msg.type === 'chat' && msg.data?.ideas_table && msg.data.ideas_table.length > 0) {
      return (
        <div className="space-y-6 mt-4 animate-in fade-in slide-in-from-bottom-2">
          {/* TAMPILAN DESKTOP (TABLE) */}
          <div className="hidden lg:block overflow-x-auto custom-table-scrollbar rounded-[12px] border border-gray-300 dark:border-white/10 bg-white dark:bg-[#121214] shadow-sm">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-heading">
                <th className="p-4 font-black w-[300px]">Topik Ebook & Masalah</th>
                <th className="p-4 font-black w-[250px]">Unique Angle</th>
                <th className="p-4 font-black w-[250px]">Dream Outcome</th>
                <th className="p-4 font-black text-center w-[120px] sticky right-0 bg-gray-50 dark:bg-white/5 border-l border-gray-200 dark:border-white/10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {msg.data.ideas_table.map((ide: any, i: number) => (
                <tr key={i} className="hover:bg-rn-accent/5 dark:hover:bg-white/5 transition-colors group/row">
                  <td className="p-4 align-top">
                    <h5 className="font-bold text-sm md:text-base text-gray-900 dark:text-white font-heading leading-tight mb-2.5 whitespace-normal">{ide.topic || ide.nama_ide}</h5>
                    <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1 tracking-wider font-heading">Masalah Audiens</span>
                    <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-300 font-medium whitespace-normal">{ide.masalah_audiens}</p>
                  </td>
                  <td className="p-4 align-top whitespace-normal">
                    <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed">{ide.unique_angle || ide.angle}</p>
                  </td>
                  <td className="p-4 align-top whitespace-normal">
                    <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                       <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed">{ide.dream_outcome || ide.hasil_akhir || ide.outcome || ide.insight_utama || "-"}</p>
                    </div>
                  </td>
                  <td className="p-4 align-top text-center sticky right-0 bg-white dark:bg-[#121214] group-hover/row:bg-rn-accent/5 dark:group-hover/row:bg-[#1a1a1c] border-l border-gray-100 dark:border-white/10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-10 transition-colors">
                    <button
                      onClick={() => {
                        const autoPrompt = `[SYSTEM_OUTLINE] Saya tertarik dengan ide ini:\nTopik: ${ide.topic || ide.nama_ide}\nAngle: ${ide.unique_angle || ide.angle}\n\nTolong buatkan saya kerangka Outline (Daftar Isi) beserta Bab, Sub-bab, dan Inti Pembahasan yang sangat detail berdasarkan referensi gaya ebook premium.`;
                        generateContent(autoPrompt);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full font-bold transition-all text-xs font-heading w-full border bg-white dark:bg-black border-gray-300 dark:border-white/20 text-gray-700 dark:text-white shadow-sm hover:border-rn-accent dark:hover:border-rn-accent hover:text-rn-accent whitespace-nowrap"
                    >
                      <CheckCircle2 size={14} className="mb-0.5 shrink-0" /> Pilih Ide
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TAMPILAN MOBILE (CARD) */}
        <div className="lg:hidden space-y-4">
          {msg.data.ideas_table.map((ide: any, i: number) => (
            <div key={`mobile-ebook-${i}`} className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-[12px] p-4 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rn-accent"></div>
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3 pt-1">
                <h5 className="font-bold text-sm text-gray-900 dark:text-white font-heading leading-tight flex-1 pr-3">{ide.topic || ide.nama_ide}</h5>
                <button
                  onClick={() => {
                    const autoPrompt = `[SYSTEM_OUTLINE] Saya tertarik dengan ide ini:\nTopik: ${ide.topic || ide.nama_ide}\nAngle: ${ide.unique_angle || ide.angle}\n\nTolong buatkan saya kerangka Outline (Daftar Isi) beserta Bab, Sub-bab, dan Inti Pembahasan yang sangat detail berdasarkan referensi gaya ebook premium.`;
                    generateContent(autoPrompt);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-[11px] font-heading border bg-white dark:bg-black border-gray-300 dark:border-white/20 text-gray-700 dark:text-white shadow-sm hover:border-rn-accent hover:text-rn-accent whitespace-nowrap shrink-0"
                >
                  <CheckCircle2 size={12} className="mb-0.5 shrink-0" /> Pilih Ide
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1 tracking-wider font-heading">Masalah Audiens</span>
                  <p className="text-[12px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed">{ide.masalah_audiens}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1 tracking-wider font-heading">Unique Angle</span>
                  <p className="text-[12px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed">{ide.unique_angle || ide.angle}</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2 tracking-wider font-heading"><Lightbulb size={12} strokeWidth={2.5}/> Dream Outcome</span>
                  <p className="text-[12px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed">{ide.dream_outcome || ide.hasil_akhir || ide.outcome || ide.insight_utama || "-"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      );
    }

    if (msg.type === 'review_outline' && msg.data?.outlineText) {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 mt-4 w-full">
          {msg.isReviewing !== false ? (
            <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-[16px] p-5 md:p-6 shadow-sm w-full">
              <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-4 py-3 rounded-xl text-[12px] md:text-[13px] font-bold flex items-start gap-2 border border-amber-200 dark:border-amber-800 mb-4">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>Review & Edit Outline ini. Jika sudah mantap, klik &quot;Generate Master Prompt&quot;. AI akan memecah instruksi ini menjadi blok prompt untuk ChatGPT.</span>
              </div>
              <textarea
                defaultValue={msg.data.outlineText}
                onChange={(e) => {
                  msg.data.outlineText = e.target.value;
                }}
                className="w-full h-[350px] p-4 text-[13px] md:text-[14px] leading-relaxed rounded-xl border border-gray-200 dark:border-white/10 focus:border-rn-accent focus:ring-1 focus:ring-rn-accent bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-200 outline-none resize-y transition-all"
              />
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10 mt-4">
                <button
                    onClick={() => {
                        setChatHistory(prev => prev.map(m => m.id === msg.id ? { ...m, isReviewing: false } : m));
                        const finalPrompt = `[SYSTEM AUTO-SUBMIT] Saya telah menyetujui Outline ini. Tolong jalankan MODE C (Prompt Production) dan cetak Master Prompt berupa block-block terpisah untuk diberikan ke ChatGPT/Claude berdasarkan Outline final berikut:\n\n${msg.data.outlineText}`;
                        generateContent(finalPrompt, msg.id);
                    }}
                    className="px-6 py-2.5 bg-rn-accent text-white rounded-full font-bold hover:bg-orange-600 transition-colors font-heading text-sm flex items-center gap-2 shadow-sm"
                >
                    <Send size={16} strokeWidth={2.5}/> Generate Master Prompt
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-[12px] md:text-[13px] font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={18} className="shrink-0" /> Outline Ebook telah dikunci dan dikirim untuk diproses menjadi Prompt.
            </div>
          )}
        </div>
      );
    }

    if (msg.type === 'ebook_result' && msg.data?.prompt_blocks) {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 mt-6 w-full">
          <h4 className="font-bold text-gray-900 dark:text-white font-heading flex items-center gap-2 text-sm md:text-base mb-3">
            <CheckCircle2 size={18} className="text-rn-accent" strokeWidth={2.5}/> 
            Master Prompt Ebook ({msg.data.prompt_blocks.length} Blok)
          </h4>
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-4 py-3 rounded-xl text-[12px] md:text-[13px] font-semibold flex items-start gap-2 border border-blue-200 dark:border-blue-800 mb-4">
            <p>💡 <b>Cara Pakai:</b> Copy prompt berbahasa Indonesia di bawah ini SECARA BERURUTAN (mulai dari blok 1) dan berikan ke ChatGPT atau Claude Anda. AI tersebut akan langsung merespons dengan konten Ebook yang sangat relevan dan mendalam sesuai strategi Anda!</p>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {msg.data.prompt_blocks.map((block: any, pIdx: number) => (
              <div key={pIdx} className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 rounded-[12px] overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-white/5 px-4 md:px-5 py-3.5 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base block font-heading truncate flex-1">{block.label}</span>
                  <button 
                    onClick={() => copyToClipboard(block.content, `${msg.id}-${pIdx}`)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all text-xs font-heading border whitespace-nowrap shrink-0 ${actionState === `copy-${msg.id}-${pIdx}` ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-black border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:border-rn-accent hover:text-rn-accent'}`}
                  >
                    <Copy size={14} /> {actionState === `copy-${msg.id}-${pIdx}` ? 'Tersalin!' : 'Salin Prompt'}
                  </button>
                </div>
                <div className="p-4 md:p-5">
                  <div className="bg-gray-50 dark:bg-[#1a1a1c] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                    <p className="leading-relaxed whitespace-pre-wrap font-medium text-[13px] md:text-[14px] text-gray-800 dark:text-gray-300 font-mono tracking-tight">{block.content}</p>
                  </div>
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
    <div className="relative shrink-0 flex items-center" ref={plusMenuRef}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsPlusMenuOpen(!isPlusMenuOpen); }} 
        className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isPlusMenuOpen ? 'bg-gray-100 dark:bg-white/10' : ''}`}
      >
        <Plus size={18} className={`transition-transform duration-200 ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
      </button>

      {isPlusMenuOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-[260px] md:w-[280px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 py-1.5">
          <div className="px-4 py-2.5 text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-heading">Menu Diskusi Cepat</div>
          <div className="max-h-60 overflow-y-auto no-scrollbar pt-1">
            {[
              { icon: Lightbulb, label: 'Carikan 5 Ide Ebook', command: 'Carikan saya 5 Ide Ebook spesifik yang sangat relevan dengan audiens Blueprint saya.' },
              { icon: Target, label: 'Ide Ebook dari Pain Point', command: 'Berdasarkan Pain Point terbesar di Blueprint saya, apa ide ebook yang paling laku dijual?' },
              { icon: CheckCircle2, label: 'Ide Ebook Evergreen', command: 'Carikan ide ebook evergreen yang solusinya akan terus relevan sampai 5 tahun ke depan.' }
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button key={i} onClick={(e) => {
                  e.preventDefault();
                  setIsPlusMenuOpen(false);
                  generateContent(action.command);
                }} className="w-full text-left px-4 py-3 md:py-3.5 text-[13px] md:text-sm text-gray-700 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-gray-100/50 dark:border-white/5 last:border-0">
                  <Icon size={16} className="text-gray-500" strokeWidth={2.5}/> {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full w-full">
      <GlobalChatLayout
        title={<>Ebook Prompt Builder <BookOpen className="text-rn-accent inline-block ml-2" size={32} /></>}
        subtitle="Riset ide brilian, rakit kerangka (outline), dan cetak master prompt untuk membuat Ebook berkualitas premium."
        chatHistory={chatHistory}
        renderCustomMessage={renderCustomMessage}
        models={[]}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        value={inputText}
        onChange={(e: any) => setInputText(e.target.value)}
        onSubmit={() => generateContent()}
        isLoading={isLoading}
        onStop={abort}
        renderPlusMenu={renderPlusMenu}
        onVoiceResult={(text: string) => setInputText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text)}
        placeholder="Ketik ide atau topik Ebook Anda di sini..."
      />
    </div>
  );
}

// Tambahan komponen Plus di file yang sama agar tidak perlu impor luar
function Plus({ size = 24, className = "", ...props }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
