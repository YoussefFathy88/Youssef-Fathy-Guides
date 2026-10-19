"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef } from "react";

import type { AnatomyModule } from "@/lib/anatomy";

interface AnatomyPanelProps {
  module: AnatomyModule | null;
  onClose: () => void;
}

export function AnatomyPanel({ module, onClose }: AnatomyPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!module) return;

    function handlePointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [module, onClose]);

  const isOpen = module !== null;

  return (
    <div
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(105%)",
        transition: "transform 300ms ease-out",
        willChange: "transform",
      }}
      className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-[#0D1424]"
      aria-hidden={!isOpen}
    >
      {module ? <PanelContent module={module} /> : <PanelPlaceholder />}
    </div>
  );
}

function PanelPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/[0.04]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="10" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="4" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" />
          <line x1="14" y1="4" x2="14" y2="8" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="20" x2="14" y2="24" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="14" x2="8" y2="14" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="14" x2="24" y2="14" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Select a body part</p>
        <p className="text-xs text-slate-600">Click any region on the agent to explore its sessions</p>
      </div>
    </div>
  );
}

function PanelContent({ module }: { module: AnatomyModule }) {
  const availableCount = module.sessions.filter((s) => s.status === "available").length;

  return (
    <>
      {/* Header */}
      <div
        className="shrink-0 border-b border-gray-200 dark:border-white/10 p-6"
        style={{
          background: `linear-gradient(135deg, ${module.color}18 0%, transparent 60%)`,
          borderLeft: `4px solid ${module.color}`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label={module.label}>
                {module.emoji}
              </span>
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">{module.label}</h2>
            </div>
            <p className="text-sm font-normal" style={{ color: module.color }}>
              {module.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                color: module.color,
                backgroundColor: `${module.color}20`,
                border: `1px solid ${module.color}40`,
              }}
            >
              {availableCount}/{module.sessions.length} live
            </span>
          </div>
        </div>

        {/* Accent bar */}
        <div
          className="mt-4 h-px w-full rounded-full opacity-40"
          style={{ background: `linear-gradient(90deg, ${module.color}, transparent)` }}
        />
      </div>

      {/* Session list */}
      <div className="overflow-y-auto p-4 pb-6" style={{ maxHeight: "380px" }}>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-600">
          Sessions
        </p>
        <ol className="space-y-2">
          {module.sessions.map((session, i) => {
            const isAvailable = session.status === "available";
            const index = String(i + 1).padStart(2, "0");

            if (isAvailable) {
              return (
                <li key={session.id}>
                  <Link
                    href={`/sessions/${session.slug}` as Route}
                    className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-900/[0.04] dark:hover:bg-white/[0.04]"
                  >
                    <span
                      className="mt-0.5 shrink-0 text-xs font-mono font-semibold tabular-nums"
                      style={{ color: module.color }}
                    >
                      {index}
                    </span>
                    <span className="text-sm leading-snug text-[#F1F5F9] transition-colors group-hover:text-gray-950 dark:group-hover:text-white">
                      {session.title}
                    </span>
                    <svg
                      className="ml-auto mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 7h8M8 4l3 3-3 3"
                        stroke={module.color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </li>
              );
            }

            return (
              <li key={session.id}>
                <div className="flex cursor-not-allowed items-start gap-3 rounded-xl p-3">
                  <span
                    className="mt-0.5 shrink-0 text-xs font-mono font-semibold tabular-nums"
                    style={{ color: `${module.color}70` }}
                  >
                    {index}
                  </span>
                  <span className="text-sm leading-snug text-slate-600 dark:text-slate-500">{session.title}</span>
                  <span
                    className="ml-auto mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider"
                    style={{
                      color: module.color,
                      backgroundColor: `${module.color}20`,
                      border: `1px solid ${module.color}40`,
                    }}
                  >
                    Soon
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
