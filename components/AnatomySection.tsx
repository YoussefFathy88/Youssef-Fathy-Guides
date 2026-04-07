"use client";

import { useCallback, useState } from "react";

import { AgentFigure } from "@/components/AgentFigure";
import { AnatomyPanel } from "@/components/AnatomyPanel";
import { ANATOMY_MODULES } from "@/lib/anatomy";

const MODULE_IDS = ANATOMY_MODULES.map((m) => m.id);

export function AnatomySection() {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const activeModule = ANATOMY_MODULES.find((m) => m.id === activeModuleId) ?? null;

  const handlePartClick = useCallback((moduleId: string) => {
    if (!MODULE_IDS.includes(moduleId)) return;
    setActiveModuleId((prev) => (prev === moduleId ? null : moduleId));
  }, []);

  const handleClose = useCallback(() => {
    setActiveModuleId(null);
  }, []);

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-white/10"
      style={{
        background: "#050B18",
        backgroundImage:
          "radial-gradient(circle, rgba(148,163,184,0.14) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Faint scanline noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
          zIndex: 0,
        }}
      />

      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-64 w-64 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #00E5FF 0%, transparent 70%)",
          transform: "translate(-30%, -30%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full opacity-8"
        style={{
          background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)",
          transform: "translate(30%, 30%)",
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Section header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="h-px flex-1 opacity-20"
              style={{
                background: "linear-gradient(90deg, transparent, #00E5FF)",
              }}
            />
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Agent Anatomy
            </p>
            <div
              className="h-px flex-1 opacity-20"
              style={{
                background: "linear-gradient(90deg, #00E5FF, transparent)",
              }}
            />
          </div>
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
            Explore the AI Agent
          </h2>
          <p className="text-center text-sm text-slate-500">
            Click a body part to explore its sessions
          </p>
        </div>

        {/* Module legend pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {ANATOMY_MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => handlePartClick(m.id)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200"
              style={{
                color: activeModuleId === m.id ? m.color : "rgba(148,163,184,0.7)",
                borderColor:
                  activeModuleId === m.id ? `${m.color}60` : "rgba(148,163,184,0.12)",
                backgroundColor:
                  activeModuleId === m.id ? `${m.color}18` : "transparent",
              }}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Main content: figure + panel */}
        <div className="grid gap-6 lg:grid-cols-[45%_55%]">
          {/* Agent figure */}
          <div className="flex items-center justify-center">
            <AgentFigure activeModule={activeModuleId} onPartClick={handlePartClick} />
          </div>

          {/* Panel column */}
          <div
            className="relative min-h-[480px]"
            style={{ overflow: "hidden" }}
          >
            <AnatomyPanel module={activeModule} onClose={handleClose} />
          </div>
        </div>
      </div>
    </section>
  );
}
