import { useState, useEffect } from 'react';

export function useSessionState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from sessionStorage on initial client mount
  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
    }
    setIsInitialized(true);
  }, [key]);

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    if (isInitialized) {
      try {
        let payloadToStore = state;
        // If state is an array of messages, strip oversized base64 data to stay safely within browser quota
        if (Array.isArray(state)) {
          payloadToStore = state.map((item: any) => {
            if (item && typeof item === 'object' && typeof item.fileData === 'string' && item.fileData.length > 50000) {
              const { fileData, ...rest } = item;
              return rest;
            }
            return item;
          }) as unknown as T;
        }
        window.sessionStorage.setItem(key, JSON.stringify(payloadToStore));
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    }
  }, [key, state, isInitialized]);

  return [state, setState] as const;
}
