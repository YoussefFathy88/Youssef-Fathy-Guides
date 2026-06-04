"use client";

import type { ReactNode } from "react";

export interface SessionOutlineGroupProps {
  /** 0-based index matching the `outline` array in session frontmatter */
  index: number;
  children: ReactNode;
}

/**
 * Groups consecutive ## slides under one outline tracker pill in presenter mode.
 * Wrap multiple slide pairs (## + component) that belong to the same outline topic.
 */
export function SessionOutlineGroup({ index, children }: SessionOutlineGroupProps) {
  return <div data-session-outline-group-marker={String(index)}>{children}</div>;
}

SessionOutlineGroup.displayName = "SessionOutlineGroup";
