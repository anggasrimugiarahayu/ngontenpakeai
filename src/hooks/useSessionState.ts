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
        window.sessionStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    }
  }, [key, state, isInitialized]);

  return [state, setState] as const;
}
