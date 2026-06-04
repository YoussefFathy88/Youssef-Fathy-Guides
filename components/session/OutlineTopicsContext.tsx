"use client";

import { createContext, useContext } from "react";

const OutlineTopicsContext = createContext<string[]>([]);

export function OutlineTopicsProvider({
  topics,
  children,
}: {
  topics: string[];
  children: React.ReactNode;
}) {
  return (
    <OutlineTopicsContext.Provider value={topics}>{children}</OutlineTopicsContext.Provider>
  );
}

export function useOutlineTopics() {
  return useContext(OutlineTopicsContext);
}

export function resolveOutlineIndex(
  topic: string | undefined,
  index: number | undefined,
  topics: string[],
): number | undefined {
  if (typeof index === "number" && !Number.isNaN(index)) {
    return index;
  }

  if (topic && topics.length > 0) {
    const normalized = topic.trim().toLowerCase();
    const match = topics.findIndex((label) => label.trim().toLowerCase() === normalized);
    if (match >= 0) {
      return match;
    }
  }

  return undefined;
}
