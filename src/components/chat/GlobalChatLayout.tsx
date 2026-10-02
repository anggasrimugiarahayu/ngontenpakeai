import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import GlobalChatbox from './GlobalChatbox';
import GlobalChatBubble from './GlobalChatBubble';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content?: string;
  type?: string;
  data?: any;
  isReviewing?: boolean;
  hasFile?: boolean;
  fileData?: string;
  fileType?: string;
  fileName?: string;
}

interface GlobalChatLayoutProps {
  title: React.ReactNode;
  subtitle?: string;
  
  chatHistory: ChatMessage[];
  renderCustomMessage?: (msg: ChatMessage) => React.ReactNode;
  
  // Chatbox passthrough
  models: any[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onStop: () => void;
  renderPlusMenu?: () => React.ReactNode;
  renderAttachmentPreview?: () => React.ReactNode;
  hasAttachment?: boolean;
  modeBadge?: React.ReactNode;
  onVoiceResult?: (text: string) => void;
  placeholder?: string;
}


export default function GlobalChatLayout({
  title,
  subtitle,
  chatHistory,
  renderCustomMessage,
  
  models,
  selectedModel,
  onModelChange,
  value,
  onChange,
  onSubmit,
  isLoading,
  onStop,
  renderPlusMenu,
  renderAttachmentPreview,
  hasAttachment,
  modeBadge,
  onVoiceResult,
  placeholder
}: GlobalChatLayoutProps) {
  const mainScrollRef = useRef<HTMLElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [dbModels, setDbModels] = useState<any[]>(models);
  

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/models');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setDbModels(data);
            
            // If current selectedModel is not in the fetched models, select the default one
            if (!data.find((m: any) => (m.modelId || m.value || m.id) === selectedModel)) {
               const defaultModel = data.find((m: any) => m.isDefault) || data[0];
               if (defaultModel) {
                 onModelChange(defaultModel.modelId || defaultModel.value || defaultModel.id);
               }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch AI models:", err);
      }
    }
    fetchModels();
  }, []);

  const handleScroll = () => {
    if (mainScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainScrollRef.current;
      if (scrollHeight - scrollTop - clientHeight > 150) {
        setShowScrollBottom(true);
      } else {
        setShowScrollBottom(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: mainScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Centralized Auto-Scroll Logic
  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      // Force scroll if the last message is from the user, OR if user is already at the bottom
      if (lastMsg.role === 'user' || !showScrollBottom) {
        scrollToBottom();
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [chatHistory.length]);

  // Track previous isLoading state to detect when generation finishes
  const prevIsLoading = useRef(isLoading);

  useEffect(() => {
    if (isLoading) {
      // AI started loading
      scrollToBottom();
      setTimeout(scrollToBottom, 100);
    } else if (prevIsLoading.current === true && isLoading === false) {
      // AI finished loading (Result just arrived and is rendering)
      scrollToBottom();
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 600); // 600ms is enough for heavy tables/images to render
    }
    prevIsLoading.current = isLoading;
  }, [isLoading]);

  const handleInternalSubmit = () => {
    

    // Immediate scroll on Enter/Send button click
    scrollToBottom();
    setTimeout(scrollToBottom, 50);
    
    // Trigger the actual submit logic
    onSubmit();
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-transparent text-gray-900 dark:text-gray-100 font-sans transition-colors z-10">
      <main ref={mainScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto w-full flex flex-col items-center relative scroll-smooth">
        
        {chatHistory.length === 0 ? (
          <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center px-4 -mt-10">
            <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight mb-4 text-gray-900 dark:text-white flex items-center gap-3">
              {title}
            </h2>
            {subtitle && (
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-sm">
                {subtitle}
              </p>
            )}

            <GlobalChatbox
              models={dbModels}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              value={value}
              onChange={onChange}
              onSubmit={handleInternalSubmit}
              isLoading={isLoading}
              onStop={onStop}
              renderPlusMenu={renderPlusMenu}
              renderAttachmentPreview={renderAttachmentPreview}
              hasAttachment={hasAttachment}
              modeBadge={modeBadge}
              onVoiceResult={onVoiceResult}
              placeholder={placeholder}
              minHeight="min-h-[140px]"
            />
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto px-4 flex flex-col space-y-8 pb-8 pt-6">
            {chatHistory.map((msg, idx) => (
              <GlobalChatBubble
                key={msg.id}
                role={msg.role}
                message={msg.role === 'user' ? msg.content : (msg.data?.message || "")}
                isAutoSubmit={msg.content?.includes('[SYSTEM AUTO-SUBMIT]')}
                isError={msg.data?.is_error}
                errorMessage={msg.data?.error_message}
                hasFile={msg.hasFile}
                fileData={msg.fileData}
                fileType={msg.fileType}
                fileName={msg.fileName}
              >
                {msg.role === 'assistant' && renderCustomMessage && renderCustomMessage(msg)}
              </GlobalChatBubble>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-1.5 p-4 bg-gray-50 dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-sm w-fit">
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>
        )}

        {showScrollBottom && chatHistory.length > 0 && (
          <div className="sticky bottom-6 flex justify-center z-[100] mt-auto pointer-events-none w-full max-w-3xl">
            <button 
              onClick={scrollToBottom}
              className="pointer-events-auto bg-rn-accent text-white shadow-xl rounded-full p-2.5 hover:bg-orange-600 transition-all transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2 flex items-center justify-center"
            >
              <ChevronDown size={20} strokeWidth={3} className="animate-bounce mt-1" />
            </button>
          </div>
        )}
      </main>

      {chatHistory.length > 0 && (
        <div className="w-full shrink-0 bg-transparent pt-2 pb-4 px-4 z-40">
          <div className="max-w-3xl mx-auto relative">
            <GlobalChatbox
              models={dbModels}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              value={value}
              onChange={onChange}
              onSubmit={handleInternalSubmit}
              isLoading={isLoading}
              onStop={onStop}
              renderPlusMenu={renderPlusMenu}
              renderAttachmentPreview={renderAttachmentPreview}
              hasAttachment={hasAttachment}
              modeBadge={modeBadge}
              onVoiceResult={onVoiceResult}
              placeholder={placeholder}
            />
          </div>
        </div>
      )}
    </div>
  );
}
