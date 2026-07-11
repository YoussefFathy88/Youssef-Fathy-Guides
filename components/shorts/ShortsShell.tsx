"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ShortsShellProps {
  children: ReactNode;
  className?: string;
  /** Overrides the default 390px cap — used to zoom the frame for recording. */
  maxWidthPx?: number;
}

/**
 * 9:16 vertical container for YouTube Shorts-style content.
 *
 * Provides a phone-shaped frame with the dark gradient background used across
 * the site. The inner Short component is fully responsible for its own title,
 * animation, subtitle strip, and progress controls.
 */
export function ShortsShell({ children, className, maxWidthPx = 390 }: ShortsShellProps) {
  return (
    <div
      style={{ maxWidth: `${maxWidthPx}px` }}
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-3xl",
        // 9:16 portrait via aspect-ratio; max-width set inline so it can be zoomed
        "aspect-[9/16]",
        "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800",
        // Subtle border gives it the phone-frame look
        "ring-1 ring-white/10 shadow-2xl shadow-black/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
