import { getFriendlyErrorMessage } from '@/lib/utils/aiErrorHandler';
import { useState, useRef, useCallback } from 'react';


function isGibberish(text: string): boolean {
  if (!text) return false;

  // Extract only alphabetical words (ignore punctuation like "....", numbers like "100000", symbols, etc.)
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  if (words.length === 0) return true;

  const allLetters = words.join('');

  // Rule 1: Must have reasonable vowel presence overall (at least 12% vowels across all letters)
  const vowelCount = (allLetters.match(/[aiueo]/g) || []).length;
  if (allLetters.length > 0 && vowelCount / allLetters.length < 0.12) return true;

  // Rule 2: Very low unique letter diversity (e.g. mashing only 1-4 keys like "dasda dasda dadad sadas")
  const uniqueLetters = new Set(allLetters).size;
  if (allLetters.length >= 12 && uniqueLetters <= 4) return true;

  // Rule 3: Evaluate individual words so punctuation or word-joining across spaces never causes false positives
  const isWordGibberish = (word: string): boolean => {
    // Long word without any vowels
    if (word.length >= 6 && !/[aiueo]/.test(word)) return true;
    // 6 or more consecutive consonants inside a single word
    if (/[bcdfghjklmnpqrstvwxyz]{6,}/.test(word)) return true;
    // 4 or more identical characters in a row inside a word
    if (/(.)\1{3,}/.test(word)) return true;
    // Keyboard mashing inside a word
    if (/(asd|qwe|zxc|fgh|jkl|das|dsa|ewq|cxz|dad|adad|sada){2,}/.test(word)) return true;
    if (/^(asd|qwe|zxc|fgh|jkl|das|dsa|ewq|cxz|dad|adad|sada)+[a-z]?$/.test(word)) return true;
    // Unnaturally long single word (> 30 letters)
    if (word.length > 30) return true;
    return false;
  };

  const gibberishWordCount = words.filter(isWordGibberish).length;

  // Flag as gibberish only if at least half of the words are gibberish
  if (gibberishWordCount / words.length >= 0.5) return true;

  return false;
}

export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAI = useCallback(async (endpoint: string, payload: any) => {
    if (isLoading) return { error: "Proses sebelumnya masih berjalan." };

    const textToCheck = payload?.promptText || payload?.currentInput || payload?.prompt;
    
    // Minimum 20 characters rule (unless they uploaded an attachment or used a shortcut)
    const hasAttachment = payload?.fileData || payload?.image || payload?.video;
    const isShortcut = payload?.isShortcut === true;
    
    if (textToCheck && textToCheck.trim().length < 20 && !hasAttachment && !isShortcut) {
      return { error: "Pesan terlalu pendek. Mohon jelaskan lebih detail (minimal 20 karakter)." };
    }

    if (textToCheck && !isShortcut && isGibberish(textToCheck)) {
      return { error: "Mohon masukkan informasi yang benar. Kami tidak memahami kata tanpa makna." };
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (!response.ok || data.error || data.is_error) {
         if (data.code === "QUOTA_EXCEEDED" || data.error === "QUOTA_EXCEEDED") {
           return { error: "QUOTA_EXCEEDED", code: "QUOTA_EXCEEDED" };
         }
         return { error: getFriendlyErrorMessage(data.error || data.message || data.error_message || "Gagal menghubungi AI.") };
      }

      return { data };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { error: "Proses dibatalkan." };
      }
      return { error: getFriendlyErrorMessage(error) };
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { fetchAI, isLoading, abort, setIsLoading };
}
