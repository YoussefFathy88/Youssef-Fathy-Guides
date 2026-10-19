"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ShortsShell } from "@/components/shorts/ShortsShell";

const BASE_WIDTH = 390;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.3;
const ZOOM_STEP = 0.05;

interface ShortsRecordingViewProps {
  children: ReactNode;
  topic: string;
  title: string;
  description: string;
}

/**
 * Wraps the phone-frame Short with recording-friendly controls: a zoom
 * slider (to match whatever crop a screen recorder uses) and a "recording
 * mode" toggle that pins the frame to the top of the viewport with the page
 * chrome hidden, so the bottom half of the screen stays free for a webcam.
 */
export function ShortsRecordingView({ children, topic, title, description }: ShortsRecordingViewProps) {
  const [zoom, setZoom] = useState(1);
  const [recordingMode, setRecordingMode] = useState(false);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  }, []);
  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  }, []);
  const resetZoom = useCallback(() => setZoom(1), []);

  return (
    <div
      className={cn(
        /* Shorts are recorded as video: always dark, whatever the site theme. */
        "dark relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col items-center gap-4 bg-[#080d18] px-4 text-slate-100",
        recordingMode ? "justify-start pt-4 pb-10" : "justify-center py-10",
      )}
    >
      {/* Toolbar */}
      <div className="flex w-full max-w-[390px] items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-white transition hover:bg-white/20 disabled:opacity-30"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetZoom}
            aria-label="Reset zoom to 100%"
            className="w-14 rounded-lg bg-white/5 px-1 py-1.5 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/15"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-white transition hover:bg-white/20 disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => setRecordingMode((r) => !r)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm font-semibold transition",
            recordingMode
              ? "border-rose-400/50 bg-rose-500/20 text-rose-200"
              : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10",
          )}
        >
          {recordingMode ? "● Recording mode" : "Recording mode"}
        </button>
      </div>

      {!recordingMode && (
        <div className="w-full max-w-[390px]">
          <Link
            href="/shorts"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Shorts
          </Link>
        </div>
      )}

      {/* The Short — full 9:16 phone frame, width driven by zoom */}
      <ShortsShell maxWidthPx={Math.round(BASE_WIDTH * zoom)}>{children}</ShortsShell>

      {!recordingMode && (
        <div className="w-full max-w-[390px] space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{topic}</p>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-sm leading-relaxed text-slate-400">{description}</p>
        </div>
      )}
    </div>
  );
}
