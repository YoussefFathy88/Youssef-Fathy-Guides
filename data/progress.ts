"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "joees-genai-course-progress";
const PROGRESS_EVENT = "joees-progress-changed";

function readCompleted() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setCompleted(readCompleted());

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(PROGRESS_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(PROGRESS_EVENT, sync);
    };
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setCompleted(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }, []);

  const markComplete = useCallback(
    (sessionId: string) => {
      const next = new Set(completed);
      next.add(sessionId);
      persist(next);
    },
    [completed, persist],
  );

  const reset = useCallback(() => {
    const next = new Set<string>();
    setCompleted(next);
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }, []);

  return { completed, markComplete, reset };
}
