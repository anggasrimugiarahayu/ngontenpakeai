"use client";

import { useAIChat } from "@/hooks/useAIChat";

import CustomSelect from "@/components/ui/CustomSelect";
import GlobalChatLayout, { ChatMessage } from "@/components/chat/GlobalChatLayout";
import { useSessionState } from "@/hooks/useSessionState";
import useSWR from "swr";
import { getBlueprintAction } from "@/app/actions/blueprint";
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {  
  Images, Send, Square, Mic, MessageSquare, Search, UserCircle, 
  Bot, Lightbulb, ChevronDown, Copy, Check, Save, Plus, X, FileText 
, CheckCircle2 } from "lucide-react";



interface PromptBlock {
  label: string;
  content: string;
}

interface CarouselIdea {
  tahap_funnel?: string;
  template_ide_digunakan?: string;
  nama_ide?: string;
  topic?: string;
  angle?: string;
  unique_angle?: string;
  insight_utama?: string;
  core_idea?: string;
  masalah_audiens?: string;
  dream_outcome?: string;
  alternative_angles?: string;
  recommended_style_art?: string;
  color_palette?: string;
  typography?: string;
}


const AI_MODELS = [
  { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash', value: 'gemini-3.7-flash' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', value: 'gemini-3.6-flash' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', value: 'gemini-3.5-flash' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite', value: 'gemini-3.5-flash-lite' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', value: 'gemini-3.1-flash-lite' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite', value: 'gemini-2.5-flash-lite' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' }
];

export default function CarouselBuilderClient() {
  const { data: blueprint } = useSWR("blueprint", getBlueprintAction);
  const blueprintId = blueprint?.id;
  const blueprintData = blueprint?.aiResult;

  const [carouselPromptText, setCarouselPromptText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [chatHistory, setChatHistory] = useSessionState<ChatMessage[]>("chat_carousel_builder", []);
  const { fetchAI, isLoading, abort } = useAIChat();
  
  const [isScriptMenuOpen, setIsScriptMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const [cpMode, setCpMode] = useState<'brainstorming' | 'custom_script'>('brainstorming');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [dbStyles, setDbStyles] = useState<{kode: string, namaLabel: string, deskripsiPrompt: string}[]>([]);
  const [dbFonts, setDbFonts] = useState<{kode: string, namaLabel: string, deskripsiPrompt: string}[]>([]);
  
  useEffect(() => {
    fetch('/api/carousel-builder/config-data')
      .then(res => res.json())
      .then(data => {
        if (data.styles) setDbStyles(data.styles);
        if (data.fonts) setDbFonts(data.fonts);
      })
      .catch(err => console.error("Failed to load config data", err));
  }, []);

  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [configData, setConfigData] = useState({
    selected_idea_name: '',
    style_art: '',
    typography: '',
    color_palette: '',
    tipe_wajah: 'NORMAL',
    gender: 'Pria',
    gaya_rambut: '',
    outfit_pakaian: '',
    aksesoris: '',
    body_text: 'Tanpa Point (Paragraf)',
    jumlah_slide: 5,
    watermark_username: '@username'
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
              currentInterim += event.currentInterim += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setCarouselPromptText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
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

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCarouselPromptText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  
  const handleCopyBlock = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlock(id);
    setTimeout(() => setCopiedBlock(null), 2000);
  };
  
  const generateCarouselPrompt = async (autoSubmitText: string | null = null, isHidden: boolean = false) => {
    const currentInput = typeof autoSubmitText === 'string' ? autoSubmitText : carouselPromptText;
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { 
      id: Date.now(), 
      role: 'user', 
      content: currentInput
    };
    
    if (!isHidden) {
      setChatHistory(prev => [...prev, userMessage]);
    }
    
    if (typeof autoSubmitText !== 'string') {
      setCarouselPromptText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
    setIsScriptMenuOpen(false);
    
    const { data, error } = await fetchAI('/api/carousel-builder/generate', {
      chatHistory: [...chatHistory, userMessage],
      cpMode: cpMode,
      currentInput: currentInput,
      blueprint: blueprintData,
      model: selectedModel,
      isShortcut: typeof autoSubmitText === 'string' || currentInput.includes('[SYSTEM AUTO-SUBMIT]')
    });
    
    if (error) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        
        // ANTI-RUGI NGETIK RECOVERY (Opsi A)
        // Jika submit berasal dari Review Prompt, buka kembali kotak draf kuning tersebut
        if (typeof autoSubmitText === 'string') {
          for (let i = newHistory.length - 1; i >= 0; i--) {
            if (newHistory[i].type === 'review_prompt') {
              newHistory[i] = { ...newHistory[i], isReviewing: true };
              break;
            }
          }
        }
        
        return [...newHistory, {
          id: Date.now() + 1,
          role: "assistant",
          content: "",
          data: {
            is_error: true,
            error_message: error
          }
        }];
      });
      
      setIsScriptMenuOpen(false);
      
      // ANTI-RUGI NGETIK RECOVERY (Normal Chat)
      // Jika ketik manual dari bawah, kembalikan teksnya ke chatbox bawah
      if (typeof autoSubmitText !== 'string') {
        setCarouselPromptText(currentInput);
      }
      return;
    }
    
    if (data) {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        type: data.response_type || "chat",
        data: data
      }]);
      
      if (data.response_type === 'request_config') {
        setConfigData(prev => ({ ...prev, jumlah_slide: data.detected_slides || 5 }));
        setShowConfigModal(true);
      }
    }
  };;
  
  const handleSubmitConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfigModal(false);
    
    const configString = `[SYSTEM AUTO-SUBMIT] Tolong eksekusi ide berjudul "${configData.selected_idea_name}".
KONFIGURASI VISUAL:
- Jumlah Slide: ${configData.jumlah_slide}
- Watermark Username: ${configData.watermark_username}
- Style Art Visual: ${configData.style_art}
- Pilihan Font: ${configData.typography}
- Karakter (Gender): ${configData.gender}
- Karakter (Tipe Wajah): ${configData.tipe_wajah}
- Body Text: ${configData.body_text}
- Gaya Rambut: ${configData.gaya_rambut || 'Sesuai Style Art'}
- Outfit / Pakaian: ${configData.outfit_pakaian || 'Sesuai Style Art'}
- Aksesoris: ${configData.aksesoris || 'Tanpa Aksesoris'}

TOLONG JALANKAN MASTER PROMPT SEKARANG SESUAI KONFIGURASI INI.`;

    // ADD REVIEW STEP INSTEAD OF DIRECT SUBMIT
    setChatHistory(prev => [...prev, {
      id: Date.now() + 1,
      role: 'assistant',
      type: 'review_prompt',
      data: {
        reviewText: configString
      },
      isReviewing: true
    }]);
  };

  const renderInputControls = () => (
    <div className="relative shrink-0 flex items-center">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsScriptMenuOpen(!isScriptMenuOpen); }} 
        className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#141B31] transition-colors ${isScriptMenuOpen ? 'bg-gray-100 dark:bg-[#141B31]' : ''}`}
      >
        <Plus size={18} className={`transition-transform duration-200 ${isScriptMenuOpen ? 'rotate-45' : ''}`} />
      </button>

      {isScriptMenuOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-[240px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 py-1.5">
          <div className="px-4 py-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 border-b border-gray-100 dark:border-[#2C3246]/50 bg-gray-50 dark:bg-white/5">Pilih Mode Prompting</div>
          <button onClick={() => { setCpMode('brainstorming'); setIsScriptMenuOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-[#2C3246]/50 ${cpMode === 'brainstorming' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#141B31]'}`}>
            <Lightbulb size={16} className={cpMode === 'brainstorming' ? 'text-orange-500' : 'text-gray-500'} strokeWidth={2.5}/> Mode Brainstorming
          </button>
          <button onClick={() => { setCpMode('custom_script'); setIsScriptMenuOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${cpMode === 'custom_script' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#141B31]'}`}>
            <FileText size={16} className={cpMode === 'custom_script' ? 'text-orange-500' : 'text-gray-500'} strokeWidth={2.5}/> Mode Custom Script
          </button>
        </div>
      )}
    </div>
  );

  const modeBadgeElement = (
    <span className="text-[10px] md:text-[11px] font-bold px-2.5 py-1.5 rounded-full border border-rn-accent/20 bg-rn-accent/10 text-rn-accent flex items-center gap-1.5 whitespace-nowrap">
      {cpMode === 'brainstorming' ? <><Lightbulb size={12} strokeWidth={3}/> Mode Brainstorming</> : <><FileText size={12} strokeWidth={3}/> Mode Custom Script</>}
    </span>
  );

  const renderCustomMessage = (msg: ChatMessage) => {
    if (!msg.data) return null;
    
    const hasIdeas = msg.data.ideas_table && msg.data.ideas_table.length > 0;
    const hasBlocks = msg.data.prompt_blocks && msg.data.prompt_blocks.length > 0;
    const isReview = msg.type === 'review_prompt';
    
    if (!hasIdeas && !hasBlocks && !isReview) return null;
    
    return (
      <div className="flex flex-col w-full">
        {msg.data.ideas_table && msg.data.ideas_table.length > 0 && (
          
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-[#2C3246] shadow-sm bg-white dark:bg-[#141B31] w-full mt-4">
              <table className="w-full text-left border-collapse min-w-[1600px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#0A1128] border-b border-gray-200 dark:border-[#2C3246] text-gray-600 dark:text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-heading">
                    <th className="p-4 font-black w-[120px]">Funneling</th>
                    <th className="p-4 font-black w-[250px]">Ide Konten & Format</th>
                    <th className="p-4 font-black w-[250px]">Unique Angle</th>
                    <th className="p-4 font-black w-[250px]">Masalah & Insight</th>
                    <th className="p-4 font-black w-[200px]">Dream Outcome</th>
                    <th className="p-4 font-black w-[250px]">Rekomendasi Visual</th>
                    <th className="p-4 font-black text-center w-[120px] sticky right-0 bg-gray-50 dark:bg-[#0A1128] border-l border-gray-200 dark:border-[#2C3246] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-20 bg-clip-padding">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#2C3246]">
                  {msg.data.ideas_table.map((ide: any, i: number) => (
                    <tr key={i} className="hover:bg-indigo-50/30 dark:hover:bg-white/5 transition-colors group/row text-sm">
                      <td className="p-4 align-top">
                        <span className={`text-[10px] md:text-[11px] font-bold tracking-widest px-2.5 py-1.5 rounded-md border whitespace-nowrap block text-center ${ide.tahap_funnel?.toUpperCase().includes('TOFU') ? 'bg-[#5A9CB5] text-white border-[#5A9CB5]' : ide.tahap_funnel?.toUpperCase().includes('MOFU') ? 'bg-[#FACE68] text-gray-900 border-[#FACE68]' : ide.tahap_funnel?.toUpperCase().includes('BOFU') ? 'bg-[#FF6B00] text-gray-900 border-[#FF6B00]' : 'bg-gray-100 dark:bg-[#0A1128] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-[#2C3246]'}`}>
                          {ide.tahap_funnel || 'IDEA'}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        {ide.template_ide_digunakan && (
                          <span className="text-[9px] md:text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                            Format: {ide.template_ide_digunakan}
                          </span>
                        )}
                        <h5 className="font-bold text-sm md:text-base text-gray-900 dark:text-white font-heading leading-tight mb-2.5 whitespace-normal">{ide.nama_ide || ide.topic}</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {ide.opportunity_score && <span className="text-[9px] md:text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] px-2 py-1 rounded">{ide.opportunity_score}</span>}
                          {ide.potensi_engagement && <span className="text-[9px] md:text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] px-2 py-1 rounded">{ide.potensi_engagement}</span>}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="mb-3">
                          <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1 tracking-wider font-heading">Unique Angle</span>
                          <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed whitespace-normal">{ide.angle || ide.unique_angle}</p>
                        </div>
                        {ide.alternative_angles && (
                          <div className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg border border-gray-200 dark:border-[#2C3246] text-[11px] md:text-[12px] text-gray-700 dark:text-gray-400 font-medium whitespace-normal mt-2">
                            <span className="font-bold block mb-1 text-gray-900 dark:text-white uppercase tracking-wider text-[9px] font-heading">Alternatif:</span>
                            {ide.alternative_angles}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        {ide.masalah_audiens && (
                          <div className="mb-3">
                            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1 tracking-wider font-heading">Masalah Audiens</span>
                            <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed whitespace-normal">{ide.masalah_audiens}</p>
                          </div>
                        )}
                        {(ide.insight_utama || ide.core_idea) && (
                          <div className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg border border-gray-200 dark:border-[#2C3246] mt-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1 tracking-wider font-heading">Insight Utama</span>
                            <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed whitespace-normal">{ide.insight_utama || ide.core_idea}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-[#2C3246] h-full">
                          <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2 tracking-wider font-heading"><Lightbulb size={12} strokeWidth={2.5}/> Impian Audiens</span>
                          <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed whitespace-normal">{ide.dream_outcome || 'Impian yang sangat diidamkan audiens dari ide ini.'}</p>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block tracking-wider font-heading">Rekomendasi Visual Carousel</span>
                          <div className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg border border-gray-200 dark:border-[#2C3246]">
                            <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-0.5 tracking-wider font-heading">Style Art</span>
                            <p className="text-[11px] md:text-[12px] text-gray-900 dark:text-white font-bold whitespace-normal">{ide.recommended_style_art}</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg border border-gray-200 dark:border-[#2C3246] flex-1">
                              <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-0.5 tracking-wider font-heading">Palette</span>
                              <p className="text-[11px] md:text-[12px] text-gray-900 dark:text-white font-bold whitespace-normal">{ide.color_palette}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-lg border border-gray-200 dark:border-[#2C3246] flex-1">
                              <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-0.5 tracking-wider font-heading">Typography</span>
                              <p className="text-[11px] md:text-[12px] text-gray-900 dark:text-white font-bold whitespace-normal">{ide.typography}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center align-top sticky right-0 bg-white dark:bg-[#141B31] group-hover:bg-indigo-50/30 dark:group-hover:bg-white/5 border-l border-gray-200 dark:border-[#2C3246] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-20 transition-colors bg-clip-padding">
                        <button
                          onClick={() => {
                            const autoPrompt = `Saya pilih ide ini:\n- Topic: ${ide.nama_ide || ide.topic}\n- Angle: ${ide.angle || ide.unique_angle}\n- Style: ${ide.recommended_style_art}\n- Colors: ${ide.color_palette}\n- Font: ${ide.typography}\n\n[PERINTAH SISTEM]: Tolong tampilkan form konfigurasi visual sekarang ("response_type": "request_config"). JANGAN proses/cetak prompt sebelum saya kirimkan tag [SYSTEM AUTO-SUBMIT].`;
                            setConfigData(prev => ({ ...prev, selected_idea_name: ide.nama_ide || ide.topic, style_art: dbStyles[0]?.deskripsiPrompt || ide.recommended_style_art || "", typography: dbFonts[0]?.deskripsiPrompt || ide.typography || "", color_palette: ide.color_palette || "" }));
                            generateCarouselPrompt(autoPrompt);
                          }}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 mx-auto w-full cursor-pointer"
                        >
                          <CheckCircle2 size={14} strokeWidth={3} className="shrink-0" /> Pilih Ide
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW (CARDS) */}
            <div className="md:hidden flex flex-col gap-3 mt-4">
              {msg.data.ideas_table.map((ide: any, i: number) => (
                <div key={`mobile-carousel-${i}`} className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-[12px] p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] space-y-4 relative overflow-hidden">
                  {/* Top bar indicator by funnel */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${ide.tahap_funnel?.toUpperCase().includes('TOFU') ? 'bg-[#5A9CB5]' : ide.tahap_funnel?.toUpperCase().includes('MOFU') ? 'bg-[#FACE68]' : ide.tahap_funnel?.toUpperCase().includes('BOFU') ? 'bg-[#FF6B00]' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                  
                  {/* Top row: Funneling and Action */}
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2C3246]/50 pb-3">
                    <span className={`text-[10px] md:text-[11px] font-bold tracking-widest px-2.5 py-1.5 rounded-md border whitespace-nowrap block text-center ${ide.tahap_funnel?.toUpperCase().includes('TOFU') ? 'bg-[#5A9CB5] text-white border-[#5A9CB5]' : ide.tahap_funnel?.toUpperCase().includes('MOFU') ? 'bg-[#FACE68] text-gray-900 border-[#FACE68]' : ide.tahap_funnel?.toUpperCase().includes('BOFU') ? 'bg-[#FF6B00] text-gray-900 border-[#FF6B00]' : 'bg-gray-100 dark:bg-[#0A1128] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-[#2C3246]'}`}>
                      {ide.tahap_funnel || 'IDEA'}
                    </span>
                    <button
                      onClick={() => {
                        const autoPrompt = `Saya pilih ide ini:\n- Topic: ${ide.nama_ide || ide.topic}\n- Angle: ${ide.angle || ide.unique_angle}\n- Style: ${ide.recommended_style_art}\n- Colors: ${ide.color_palette}\n- Font: ${ide.typography}\n\n[PERINTAH SISTEM]: Tolong tampilkan form konfigurasi visual sekarang ("response_type": "request_config"). JANGAN proses/cetak prompt sebelum saya kirimkan tag [SYSTEM AUTO-SUBMIT].`;
                        setConfigData(prev => ({ ...prev, selected_idea_name: ide.nama_ide || ide.topic, style_art: dbStyles[0]?.deskripsiPrompt || ide.recommended_style_art || "", typography: dbFonts[0]?.deskripsiPrompt || ide.typography || "", color_palette: ide.color_palette || "" }));
                        generateCarouselPrompt(autoPrompt);
                      }}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 size={12} strokeWidth={3} /> Pilih Ide
                    </button>
                  </div>
                  
                  {/* Title and scores */}
                  <div>
                    {ide.template_ide_digunakan && (
                      <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                        Format: {ide.template_ide_digunakan}
                      </span>
                    )}
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white font-heading leading-tight mb-2 whitespace-normal">{ide.nama_ide || ide.topic}</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {ide.opportunity_score && <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 px-2 py-1 rounded">{ide.opportunity_score}</span>}
                      {ide.potensi_engagement && <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 px-2 py-1 rounded">{ide.potensi_engagement}</span>}
                    </div>
                  </div>
                  
                  {/* Masalah & Solusi */}
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1.5 pt-1">
                    {ide.masalah_audiens && <p><span className="font-bold">Masalah:</span> {ide.masalah_audiens}</p>}
                    {(ide.insight_utama || ide.core_idea) && <p><span className="font-bold">Solusi/Insight:</span> {ide.insight_utama || ide.core_idea}</p>}
                  </div>
                  
                  {/* Visual Rec */}
                  <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block tracking-wider font-heading">Rekomendasi Visual</span>
                    <p className="text-[11px] text-gray-800 dark:text-gray-300 font-medium">Style: <span className="font-bold">{ide.recommended_style_art}</span></p>
                    <p className="text-[11px] text-gray-800 dark:text-gray-300 font-medium">Font: <span className="font-bold">{ide.typography}</span></p>
                  </div>

                  {/* Unique Angle */}
                  <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246]">
                    <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block mb-1 tracking-wider font-heading">Unique Angle</span>
                    <p className="text-[12px] text-gray-800 dark:text-gray-300 font-medium leading-relaxed whitespace-normal">{ide.angle || ide.unique_angle}</p>
                  </div>

                  {/* Alternatif */}
                  {ide.alternative_angles && (
                    <div className="bg-gray-50 dark:bg-[#0F172A] p-2.5 rounded-lg border border-gray-200 dark:border-[#2C3246] text-[11px] text-gray-700 dark:text-gray-400 font-medium whitespace-normal mt-2">
                      <span className="font-bold block mb-1 text-gray-900 dark:text-white uppercase tracking-wider text-[9px] font-heading">Alternatif:</span>
                      {ide.alternative_angles}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>

        )}
        
        {/* REVIEW PROMPT DRAFT */}
        {msg.type === 'review_prompt' && msg.data && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 mt-4 w-full">
            {msg.isReviewing ? (
              <div className="bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-[12px] p-5 md:p-6 shadow-none max-w-full">
                <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-4 py-3 rounded-xl text-[12px] md:text-[13px] font-bold flex items-start gap-2 border border-amber-200 dark:border-amber-800 mb-4">
                  <Check size={18} className="shrink-0 mt-0.5" />
                  <span>Review & Edit instruksi prompt di bawah ini sebelum dikirim ke AI.</span>
                </div>
                <textarea
                  value={msg.data.reviewText}
                  onChange={(e) => setChatHistory(prev => prev.map(m => m.id === msg.id ? { ...m, data: { ...m.data, reviewText: e.target.value } } : m))}
                  className="w-full h-[350px] p-4 text-[12px] md:text-[13px] font-mono leading-relaxed rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#0A1128] text-gray-900 dark:text-white outline-none resize-y transition-all"
                />
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-[#2C3246] mt-4">
                  <button
                      onClick={() => {
                          setChatHistory(prev => prev.map(m => m.id === msg.id ? { ...m, isReviewing: false } : m));
                          generateCarouselPrompt(msg.data.reviewText, true);
                      }}
                      className="px-8 py-3 bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white rounded-full font-bold shadow-sm shadow-orange-500/20 transition-all font-heading text-sm md:text-base flex items-center gap-2 cursor-pointer"
                  >
                      <Send size={16} strokeWidth={2.5}/> Eksekusi Master Prompt
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-xl p-4 text-xs text-gray-500 italic">
                Prompt telah disubmit untuk diproses.
              </div>
            )}
          </div>
        )}

        {msg.data.prompt_blocks && msg.data.prompt_blocks.length > 0 && (
          <div className="space-y-4 w-full mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Images className="text-orange-500" size={16} />
              <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider font-heading">Hasil Master Prompt</h4>
            </div>
            {(msg.data?.prompt_blocks || []).map((block: any, idxBlock: number) => (
              <div key={idxBlock} className="bg-white dark:bg-[#141B31] rounded-xl border border-gray-200 dark:border-[#2C3246] overflow-hidden shadow-sm group">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-[#0A1128] border-b border-gray-200 dark:border-[#2C3246]">
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{block.label}</span>
                  <button
                    onClick={() => handleCopyBlock(block.content, `${msg.id}-${idxBlock}`)}
                    className={`transition-colors flex items-center gap-1 text-[11px] font-bold ${copiedBlock === `${msg.id}-${idxBlock}` ? 'text-green-500' : 'text-gray-400 hover:text-orange-500'}`}
                  >
                    {copiedBlock === `${msg.id}-${idxBlock}` ? <><Check size={12} /> Tersalin!</> : <><Copy size={12} /> Salin Blok</>}
                  </button>
                </div>
                <div className="p-4 text-[13px] font-mono text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {block.content}
                </div>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2C3246]">
              <button 
                onClick={() => {
                  const fullText = (msg.data?.prompt_blocks || []).map((b: any) => `[${b.label}]\n${b.content}`).join('\n\n');
                  handleCopyBlock(fullText, `${msg.id}-all`);
                }}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer ${copiedBlock === `${msg.id}-all` ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40' : 'bg-white hover:bg-gray-50 dark:bg-[#141B31] dark:hover:bg-[#1f2947] border border-gray-200 dark:border-[#2C3246] text-gray-700 dark:text-gray-200'}`}
              >
                {copiedBlock === `${msg.id}-all` ? <><Check size={14} /> Master Prompt Tersalin!</> : <><Copy size={14} /> Salin Seluruh Master Prompt</>}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full" onClick={() => { setIsScriptMenuOpen(false); setIsModelMenuOpen(false); }}>
      <GlobalChatLayout
        title={<>Carousel Builder <Images className="text-rn-accent inline-block ml-2" size={32} /></>}
        subtitle="Sulap ide jadi desain carousel multi-slide yang mengalir dan bikin audiens betah geser sampai akhir."
        chatHistory={chatHistory}
        renderCustomMessage={renderCustomMessage}
        models={AI_MODELS}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        value={carouselPromptText}
        onChange={(e: any) => setCarouselPromptText(e.target.value)}
        onSubmit={() => generateCarouselPrompt(null)}
        isLoading={isLoading}
        onStop={abort}
        renderPlusMenu={renderInputControls}
        modeBadge={modeBadgeElement}
        onVoiceResult={(text: string) => setCarouselPromptText(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + text)}
        placeholder="Topik: 5 Kesalahan Fatal Saat Mulai Bisnis dari Nol..."
      />

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowConfigModal(false)}>
          <div className="bg-white dark:bg-[#141B31] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2C3246] w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200 dark:border-[#2C3246] flex items-center justify-between shrink-0 bg-gray-50 dark:bg-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading text-lg flex items-center gap-2">
                <Images className="text-rn-accent" size={18} /> Konfigurasi Visual Carousel
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <X size={20} strokeWidth={2.5}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmitConfig} className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <CustomSelect
                    label="Jumlah Slide"
                    value={configData.jumlah_slide}
                    onChange={(val) => setConfigData({ ...configData, jumlah_slide: parseInt(val) })}
                    options={[...Array(29)].map((_, i) => ({ value: i + 2, label: `${i + 2} Slide` }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">Watermark Username</label>
                  <input 
                    type="text" 
                    value={configData.watermark_username}
                    onChange={e => setConfigData({...configData, watermark_username: e.target.value})}
                    placeholder="@username" 
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] focus:ring-2 focus:ring-orange-500/50 outline-none text-sm font-bold text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <CustomSelect
                    label="Style Art Visual"
                    value={configData.style_art}
                    onChange={(val) => setConfigData({ ...configData, style_art: val })}
                    options={dbStyles.map((style) => ({ value: style.deskripsiPrompt, label: style.namaLabel }))}
                  />
                </div>
                <div>
                  <CustomSelect
                    label="Pilihan Font"
                    value={configData.typography}
                    onChange={(val) => setConfigData({ ...configData, typography: val })}
                    options={dbFonts.map((font) => ({ value: font.deskripsiPrompt, label: font.namaLabel }))}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-[#2C3246] mt-2">
                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-4 tracking-wide font-heading">Pengaturan Karakter & Teks</h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <CustomSelect
                      label="Gender"
                      value={configData.gender}
                      onChange={(val) => setConfigData({ ...configData, gender: val })}
                      options={[
                        { value: "Pria", label: "Pria" },
                        { value: "Wanita", label: "Wanita" },
                        { value: "Anak Laki-Laki", label: "Anak Laki-Laki" },
                        { value: "Anak Perempuan", label: "Anak Perempuan" },
                        { value: "Bayi", label: "Bayi" },
                        { value: "Kucing", label: "Kucing" },
                        { value: "Tanpa Karakter (Objek/Pemandangan)", label: "Tanpa Karakter" },
                      ]}
                    />
                  </div>
                  <div>
                    <CustomSelect
                      label="Tipe Wajah"
                      value={configData.tipe_wajah}
                      onChange={(val) => setConfigData({ ...configData, tipe_wajah: val })}
                      options={[
                        { value: "NORMAL", label: "NORMAL" },
                        { value: "FACELESS (Tanpa Wajah)", label: "FACELESS" },
                      ]}
                    />
                  </div>
                  <div>
                    <CustomSelect
                      label="Body Text"
                      value={configData.body_text}
                      onChange={(val) => setConfigData({ ...configData, body_text: val })}
                      options={[
                        { value: "Tanpa Point (Paragraf)", label: "Tanpa Point (Paragraf)" },
                        { value: "Dengan Point (Bullet Points)", label: "Dengan Point (Bullet)" },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Gaya Rambut</label>
                    <input 
                      type="text" 
                      value={configData.gaya_rambut}
                      onChange={e => setConfigData({...configData, gaya_rambut: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] focus:ring-2 focus:ring-orange-500/50 outline-none text-sm font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Outfit / Pakaian</label>
                    <input 
                      type="text" 
                      value={configData.outfit_pakaian}
                      onChange={e => setConfigData({...configData, outfit_pakaian: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] focus:ring-2 focus:ring-orange-500/50 outline-none text-sm font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Aksesoris</label>
                    <input 
                      type="text" 
                      value={configData.aksesoris}
                      onChange={e => setConfigData({...configData, aksesoris: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] focus:ring-2 focus:ring-orange-500/50 outline-none text-sm font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-[#2C3246] flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowConfigModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] hover:bg-gray-50 dark:hover:bg-[#1f2947] transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer">
                  <Check size={16} strokeWidth={3}/> Proses Master Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
