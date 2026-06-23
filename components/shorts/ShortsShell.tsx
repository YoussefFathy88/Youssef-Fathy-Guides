"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ShortsShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * 9:16 vertical container for YouTube Shorts-style content.
 *
 * Provides a phone-shaped frame with the dark gradient background used across
 * the site. The inner Short component is fully responsible for its own title,
 * animation, subtitle strip, and progress controls.
 */
export function ShortsShell({ children, className }: ShortsShellProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-3xl",
        // 9:16 portrait via aspect-ratio; max-width matches a modern phone screen
        "aspect-[9/16] max-w-[390px]",
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
