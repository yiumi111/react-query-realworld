import { useEffect, useCallback } from 'react';

interface DraftData {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

function getDraft(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

function saveDraft(key: string, data: DraftData): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function clearDraft(key: string): void {
  localStorage.removeItem(key);
}

export function useDraft(key: string, data: DraftData) {
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(key, data);
    }, 300);
    return () => clearTimeout(timer);
  }, [key, data]);

  const clear = useCallback(() => {
    clearDraft(key);
  }, [key]);

  return { clear };
}

export { getDraft, saveDraft, clearDraft };
export type { DraftData };
