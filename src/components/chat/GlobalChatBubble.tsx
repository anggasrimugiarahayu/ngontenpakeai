import React from 'react';
import Link from 'next/link';
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
  isExtracting?: boolean;
  extractingLabel?: string;
  
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
  fileName,
  isExtracting,
  extractingLabel
}: GlobalChatBubbleProps) {
  return (
    <div className={`flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {role === 'user' ? (
        <div className="bg-gray-100 dark:bg-[#141B31] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2C3246] p-4 rounded-2xl rounded-tr-sm max-w-[85%] text-[14px] md:text-[15px] leading-relaxed shadow-sm">
          {hasFile && fileData && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-[#2C3246] max-w-sm">
              {fileType?.startsWith('image/') ? (
                <div className="relative overflow-hidden rounded-lg">
                  <img src={fileData} alt={fileName || 'Attachment'} className="w-full h-auto object-cover max-h-[300px]" />
                  {isExtracting ? (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 animate-in fade-in duration-200">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 rounded-full text-xs font-bold text-white border border-white/20 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping shrink-0" />
                        <span>{extractingLabel || "Mengekstrak naskah dari gambar..."}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={11} /> Naskah Terekstrak
                    </div>
                  )}
                </div>
              ) : fileType?.startsWith('video/') ? (
                <div className="relative overflow-hidden rounded-lg bg-black">
                  <video src={fileData} controls className="w-full h-auto max-h-[300px] bg-black" />
                  {isExtracting && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 animate-in fade-in duration-200 pointer-events-none">
                      <div className="flex items-center gap-2 px-3.5 py-2 bg-black/85 rounded-full text-xs font-bold text-white border border-white/20 shadow-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping shrink-0" />
                        <span>{extractingLabel || "Mentranskrip audio video via Whisper..."}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : fileType?.startsWith('audio/') ? (
                <div className="p-3 bg-white dark:bg-[#0F172A] relative">
                   <audio src={fileData} controls className="w-full" />
                   <p className="text-xs text-gray-500 mt-2 truncate">{fileName}</p>
                   {isExtracting && (
                     <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-500 font-bold">
                       <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                       <span>{extractingLabel || "Mentranskrip audio..."}</span>
                     </div>
                   )}
                </div>
              ) : (
                <div className="p-3 bg-white dark:bg-[#0F172A] flex items-center gap-2">
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
            (errorMessage?.includes("QUOTA_EXCEEDED") || errorMessage?.includes("Kuota Percobaan Gratis") || errorMessage?.includes("kuota percobaan gratis")) ? (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white dark:bg-[#141B31] border border-orange-500/30 dark:border-orange-500/20 rounded-2xl rounded-tl-sm p-5 md:p-6 shadow-xl max-w-md space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">
                      Kuota Percobaan Gratis Kamu Sudah Habis ✨
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Kamu sudah menggunakan kuota kesempatan coba gratis di fitur ini. Yuk, upgrade ke Paket PRO Tools untuk lanjut generate tanpa batas kuota!
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/checkout?type=PRO_TOOLS"
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-bold bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white shadow-sm shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      🚀 Upgrade ke Paket PRO Tools Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-4 rounded-[20px] rounded-tl-sm border border-red-200 dark:border-red-900/30 inline-block break-words whitespace-pre-wrap max-w-[85%] md:max-w-[75%]">
                  <p className="text-[14px]">{errorMessage}</p>
                </div>
              </div>
            )
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
