"use client";

import React, { useState } from "react";
import GlobalChatLayout from "@/components/chat/GlobalChatLayout";
import { useAIChat } from "@/hooks/useAIChat";
import { Copy, Check, Filter, Video, Lightbulb, MessageSquare, Search, UserCircle, CheckCircle2, Calendar, Bot, ChevronDown, Plus } from "lucide-react";

export default function IdeaRoomsClient({ blueprintId, blueprintData }: { blueprintId: string, blueprintData: any }) {
  const { fetchAI, isLoading, abort } = useAIChat();
  const [promptText, setPromptText] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleActionClick = async (label: string) => {
    setIsActionsMenuOpen(false);
    await processIdeaGeneration(label, true);
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    await processIdeaGeneration(promptText);
  };

  const processIdeaGeneration = async (input: string, isShortcut: boolean = false) => {
    const userMsg = { id: Date.now(), role: "user", content: input };
    setChatHistory(prev => [...prev, userMsg]);
    setPromptText("");

    const { data, error } = await fetchAI("/api/idea-rooms/generate", {
      promptText: input,
      blueprintData,
      isShortcut,
      isFunneling: input === 'Ide Konten Funneling',
      chatHistory: chatHistory.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content || m.data?.conversation_reply || ''}`).join('\n')
    });

    if (error || !data) {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "",
        data: { is_error: true, error_message: error || "Gagal menghubungi AI." }
      }]);
      setPromptText(input); // Restore input on error
      return;
    }

    setChatHistory(prev => [...prev, {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
      data: data
    }]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderPlusMenu = () => (
    <div className="relative shrink-0 flex items-center">
      <button 
        onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
        className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${isActionsMenuOpen ? 'bg-gray-100 dark:bg-white/10' : ''}`}
      >
        <Plus size={18} className={`transition-transform duration-200 ${isActionsMenuOpen ? 'rotate-45' : ''}`} />
      </button>

      {isActionsMenuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-[240px] max-w-[calc(100vw-2rem)] md:w-64 bg-white dark:bg-black border border-gray-300 dark:border-white/20 hover:border-gray-900 dark:hover:border-white transition-all rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 py-1">
          <div className="px-4 py-2 text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 border-b border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/5 font-heading">Topik Diskusi Cepat</div>
          <div className="max-h-60 overflow-y-auto custom-table-scrollbar pt-1">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <button 
                  key={i} 
                  onClick={() => handleActionClick(action.label)} 
                  className="w-full text-left px-4 py-2 md:py-2.5 text-[12px] md:text-xs text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white flex items-center gap-3 transition-colors border-b border-gray-100/50 dark:border-white/10 last:border-0"
                >
                  <Icon size={14} className="md:w-4 md:h-4 text-gray-600 dark:text-gray-400" strokeWidth={2.5}/> {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomMessage = (msg: any) => {
    if (!msg.data?.proposed_ideas || msg.data.proposed_ideas.length === 0) return null;
    return (
      <div className="w-full pb-4">
        <div className="flex flex-col gap-4 md:gap-6">
          {msg.data.proposed_ideas.map((ide: any, i: number) => {
            const isTofu = ide.tahap_funnel?.toUpperCase().includes('TOFU');
            const isMofu = ide.tahap_funnel?.toUpperCase().includes('MOFU');
            const isBofu = ide.tahap_funnel?.toUpperCase().includes('BOFU');
            
            let funnelClass = "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-white/20";
            if (isTofu) funnelClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50";
            else if (isMofu) funnelClass = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50";
            else if (isBofu) funnelClass = "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50";

            return (
              <div key={i} className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm shrink-0 flex flex-col group">
                <div className="p-4 md:p-5 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 pr-0 sm:pr-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold border uppercase tracking-wider ${funnelClass}`}>
                        {ide.tahap_funnel || 'IDEA'}
                      </span>
                      {ide.template_ide_digunakan && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30">
                          {ide.template_ide_digunakan}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold font-heading text-[15px] md:text-[16px] text-gray-900 dark:text-white leading-tight">{ide.nama_ide}</h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                    <button 
                      onClick={() => {
                        const textToCopy = `[ FUNNELING ]\n${ide.tahap_funnel || 'IDEA'}\n\n[ FORMAT ]\n${ide.template_ide_digunakan || '-'}\n\n[ JUDUL IDE ]\n${ide.nama_ide}\n\n[ UNIQUE ANGLE ]\n${ide.angle}\n\n[ MASALAH AUDIENS ]\n${ide.masalah_audiens}\n\n[ INSIGHT ]\n${ide.insight_utama}\n\n[ DREAM OUTCOME ]\n${ide.dream_outcome || '-'}`;
                        copyToClipboard(textToCopy, `${msg.id}-${i}`);
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all text-[11px] md:text-xs border shrink-0 ${copiedId === `${msg.id}-${i}` ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 shadow-sm' : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/30 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {copiedId === `${msg.id}-${i}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} 
                      {copiedId === `${msg.id}-${i}` ? 'Tersalin' : 'Salin Ide'}
                    </button>
                  </div>
                </div>
                
                <div className="p-5 space-y-4 text-[13px] md:text-[14px] text-gray-800 dark:text-gray-300 font-medium bg-white dark:bg-black">
                  <div className="pb-4 border-b border-dashed border-gray-200 dark:border-white/20">
                    <h5 className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1.5">Unique Angle</h5>
                    <p className="leading-relaxed">{ide.angle}</p>
                  </div>
                  <div className="pb-4 border-b border-dashed border-gray-200 dark:border-white/20">
                    <h5 className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1.5">Masalah & Insight</h5>
                    <ul className="list-disc pl-4 space-y-1 marker:text-gray-400">
                      <li><strong className="text-gray-900 dark:text-white font-bold">Masalah:</strong> {ide.masalah_audiens}</li>
                      <li><strong className="text-gray-900 dark:text-white font-bold">Insight:</strong> {ide.insight_utama}</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1.5">Dream Outcome</h5>
                    <p className="leading-relaxed">{ide.dream_outcome || '-'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <GlobalChatLayout
      chatHistory={chatHistory}
      isLoading={isLoading}
      value={promptText}
      onChange={(e) => setPromptText(e.target.value)}
      onSubmit={handleGenerate}
      onStop={abort}
      models={AI_MODELS}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
      renderPlusMenu={renderPlusMenu}
      renderCustomMessage={renderCustomMessage}
      placeholder="Ketik topik atau pilih dari menu aksi cepat..."
      title={<>Idea Rooms <span className="text-2xl md:text-3xl ml-2">💡</span></>}
      subtitle="Ubah Master Blueprint kamu menjadi gudang ide konten yang terstruktur."
    />
  );
}
