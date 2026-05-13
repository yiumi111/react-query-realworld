import { useState, useEffect, useCallback, useRef } from 'react';

interface DraftData {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

export function useDraft(draftKey: string) {
  const [hasDraft, setHasDraft] = useState(false);

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved) as DraftData;
        setHasDraft(true);
        return parsed;
      }
    } catch {
      // ignore parse errors
    }
    return null;
  }, [draftKey]);

  const saveDraft = useCallback(
    (data: DraftData) => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(data));
        setHasDraft(true);
      } catch {
        // ignore storage errors
      }
    },
    [draftKey],
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setHasDraft(false);
    } catch {
      // ignore storage errors
    }
  }, [draftKey]);

  return { loadDraft, saveDraft, clearDraft, hasDraft };
}
