import { getFriendlyErrorMessage } from '@/lib/utils/aiErrorHandler';
import { useState, useRef, useCallback } from 'react';


function isGibberish(text: string): boolean {
  if (!text) return false;
  
  const clean = text.toLowerCase().replace(/\s+/g, '');
  
  // Rule 1: No vowels at all (must have at least one a, i, u, e, o)
  if (clean.length > 0 && !/[aiueo]/.test(clean)) return true;
  
  // Rule 2: Excessive consonants (5 or more in a row)
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(clean)) return true;
  
  // Rule 3: Character repetition (4 or more of the same char)
  if (/(.)\1{3,}/.test(clean)) return true;
  
  // Rule 4: Keyboard mashing patterns (much stricter now)
  if (/(asd|qwe|zxc|fgh|jkl|das|dsa|ewq|cxz|dad|adad|sada){2,}/.test(clean)) return true;

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
