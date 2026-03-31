"use client";

import { createContext, useContext, type ReactNode } from "react";

type PresentationContextValue = {
  isPresentationMode: boolean;
  activeSectionId: string | null;
};

const PresentationContext = createContext<PresentationContextValue>({
  isPresentationMode: false,
  activeSectionId: null,
});

export function PresentationProvider({
  value,
  children,
}: {
  value: PresentationContextValue;
  children: ReactNode;
}) {
  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
}

export function useSessionPresentation() {
  return useContext(PresentationContext);
}
