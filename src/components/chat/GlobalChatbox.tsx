import React, { useRef, useState, useEffect } from 'react';
import { Send, Square, Mic, Plus, ChevronDown } from 'lucide-react';

interface AiModel { modelId?: string; name?: string; value?: string; id?: string; label?: string; [key: string]: any; }

interface GlobalChatboxProps {
  // Model state
  models: AiModel[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  
  // Text state
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  
  // Loading state
  isLoading: boolean;
  onStop: () => void;
  
  // Plus menu
  renderPlusMenu?: () => React.ReactNode;
  renderAttachmentPreview?: () => React.ReactNode;
  modeBadge?: React.ReactNode;
  
  // Voice feature
  
  onVoiceResult?: (text: string) => void;
  
  // Placeholder
  placeholder?: string;
  minHeight?: string;
  hasAttachment?: boolean;
}

export default function GlobalChatbox({
  models,
  selectedModel,
  onModelChange,
  value,
  onChange,
  onSubmit,
  isLoading,
  onStop,
  renderPlusMenu,
  modeBadge,
  renderAttachmentPreview,
  
  onVoiceResult,
  placeholder = "Ketik pesan...",
  minHeight = "min-h-[60px]",
  hasAttachment = false
}: GlobalChatboxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [localInterimText, setLocalInterimText] = useState("");
  const recognitionRef = useRef<any>(null);
  
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

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
          if (finalTranscript && onVoiceResult) {
            onVoiceResult(finalTranscript);
          }
          setLocalInterimText(currentInterim);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          setLocalInterimText("");
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setLocalInterimText("");
        };
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onVoiceResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setLocalInterimText("");
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      }
    }
  };

    // Auto-resize effect triggered by value or voice text changes
  useEffect(() => {
    if (textareaRef.current) {
      if (!value && !localInterimText) {
        textareaRef.current.style.height = "auto";
      } else {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      }
    }
  }, [value, localInterimText]);

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
  };

  const textLength = value.trim().length + (localInterimText ? localInterimText.trim().length : 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (textLength >= 20 || hasAttachment)) {
        onSubmit();
      }
    }
  };

  // Determine disabled state for send button
  const isSendDisabled = isLoading || (textLength < 20 && !hasAttachment);

  return (
    <div className="w-full bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] rounded-2xl shadow-lg flex flex-col focus-within:ring-2 focus-within:ring-rn-accent/50 focus-within:border-rn-accent transition-all duration-300 relative z-10">
      {renderAttachmentPreview && renderAttachmentPreview()}
      <textarea 
        ref={textareaRef}
        value={value + (localInterimText ? (value && !value.endsWith(" ") ? " " : "") + localInterimText : "")}
        onChange={autoResize}
        onKeyDown={handleKeyDown}
        className={`w-full bg-transparent px-4 py-3 ${minHeight} max-h-[250px] resize-none outline-none overflow-y-auto text-gray-900 dark:text-white placeholder-gray-400 text-sm leading-relaxed`}
        placeholder={placeholder}
      />
      
      <div className="px-4 pb-2 pt-0 flex items-center justify-between border-t border-transparent bg-transparent relative z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          
          {/* Plus Menu Injection */}
          {renderPlusMenu && renderPlusMenu()}
          
          {renderPlusMenu && <div className="h-4 w-px bg-gray-200 dark:bg-white/10 hidden sm:block"></div>}
          
          {/* Model Selector */}
          <div className="relative shrink-0 flex items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsModelMenuOpen(!isModelMenuOpen); }}
              className="flex items-center gap-1.5 px-3 py-1.5 md:py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span>AI:</span>
              <span className="text-gray-900 dark:text-white whitespace-nowrap">
                {models.find(m => (m.modelId || m.value || m.id) === selectedModel)?.name || 
                 models.find(m => (m.modelId || m.value || m.id) === selectedModel)?.label || 
                 'Gemini 2.5 Flash'}
              </span>
              <ChevronDown size={12} strokeWidth={2.5} className={`transition-transform text-gray-400 dark:text-gray-400 ml-0.5 ${isModelMenuOpen ? 'rotate-180' : ''}`}/>
            </button>
            
            {isModelMenuOpen && (
              <>
                <div className="fixed inset-0 z-[40]" onClick={(e) => { e.stopPropagation(); setIsModelMenuOpen(false); }}></div>
                <div onClick={(e) => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 w-[180px] bg-white dark:bg-[#141B31] border border-gray-200 dark:border-[#2C3246] shadow-xl rounded-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 cursor-default">
                  {models.map((model) => {
                    const val = model.modelId || model.value || model.id || "";
                    const name = model.name || model.label;
                    return (
                      <button 
                        key={val} 
                        onClick={(e) => { e.stopPropagation(); onModelChange(val); setIsModelMenuOpen(false); }} 
                        className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${selectedModel === val ? 'text-orange-600 dark:text-orange-400 bg-orange-500/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
          {/* Badge Injection */}
          {modeBadge && (
            <div className="hidden sm:flex items-center shrink-0">
              {modeBadge}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {!hasAttachment && (
            <span className={`text-[10px] md:text-xs font-bold mr-1 ${textLength < 20 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
              {textLength}/20
            </span>
          )}
          <button 
            onClick={toggleListening}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 transition-colors border ${isListening ? 'bg-orange-50 dark:bg-rn-accent/20 text-rn-accent border-rn-accent/30 dark:border-rn-accent/50 animate-pulse' : 'bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'}`}
            title={isListening ? "Hentikan merekam" : "Input menggunakan suara"}
          >
            <Mic size={18} />
          </button>
          <button 
            onClick={() => {
              if (isLoading) {
                onStop();
              } else {
                onSubmit();
              }
            }}
            disabled={!isLoading && (textLength < 20 && !hasAttachment)}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full text-white flex items-center justify-center shrink-0 transition-colors shadow-sm ${isLoading ? "bg-red-500 hover:bg-red-600" : "bg-rn-accent hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"}`}
          >
            {isLoading ? <Square size={14} className="fill-current" strokeWidth={2.5} /> : <Send size={14} className="-ml-0.5" strokeWidth={2.5}/>}
          </button>
        </div>
      </div>
    </div>
  );
}
