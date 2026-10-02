import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, CheckCircle2 } from 'lucide-react';

interface GlobalChatBubbleProps {
  role: 'user' | 'assistant';
  isError?: boolean;
  errorMessage?: string;
  isAutoSubmit?: boolean;
  hasFile?: boolean;
  fileData?: string;
  fileType?: string;
  fileName?: string;
  
  // Custom content (like custom cards, tables, etc)
  children?: React.ReactNode;
  
  // Optional markdown message text
  message?: string;
  
  // For 'assistant' avatar
  avatarIcon?: React.ReactNode;
  avatarLabel?: string;
}

export default function GlobalChatBubble({
  role,
  isError,
  errorMessage,
  isAutoSubmit,
  children,
  message,
  avatarIcon = <Bot size={14}/>,
  avatarLabel = "AI Assistant",
  hasFile,
  fileData,
  fileType,
  fileName
}: GlobalChatBubbleProps) {
  return (
    <div className={`flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {role === 'user' ? (
        <div className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 p-4 rounded-2xl rounded-tr-sm max-w-[85%] text-[14px] md:text-[15px] leading-relaxed shadow-sm">
          {hasFile && fileData && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 max-w-sm">
              {fileType?.startsWith('image/') ? (
                <img src={fileData} alt={fileName || 'Attachment'} className="w-full h-auto object-cover max-h-[300px]" />
              ) : fileType?.startsWith('video/') ? (
                <video src={fileData} controls className="w-full h-auto max-h-[300px] bg-black" />
              ) : fileType?.startsWith('audio/') ? (
                <div className="p-3 bg-white dark:bg-black">
                   <audio src={fileData} controls className="w-full" />
                   <p className="text-xs text-gray-500 mt-2 truncate">{fileName}</p>
                </div>
              ) : (
                <div className="p-3 bg-white dark:bg-black flex items-center gap-2">
                   <span className="text-xl">📎</span>
                   <p className="text-sm font-medium truncate">{fileName || 'File attached'}</p>
                </div>
              )}
            </div>
          )}
          {isAutoSubmit ? (
            <span className="italic text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={14}/> Mengirimkan konfigurasi ke AI...
            </span>
          ) : (
            message ? message.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i !== message.split('\n').length - 1 && <br />}
              </span>
            )) : children
          )}
        </div>
      ) : (
        <div className="space-y-4 w-full mt-2">
          {isError ? (
            <div className="flex justify-start">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-4 rounded-[20px] rounded-tl-sm border border-red-200 dark:border-red-900/30 inline-block break-words whitespace-pre-wrap max-w-[85%] md:max-w-[75%]">
                <p className="text-[14px]">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <>
              {message && (
                <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 prose dark:prose-invert prose-p:leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4 prose-li:my-0.5 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
                </div>
              )}
              {children && (
                <div className="mt-4">
                  {children}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
