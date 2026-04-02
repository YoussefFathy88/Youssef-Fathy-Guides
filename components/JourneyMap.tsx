"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import { useProgress } from "@/data/progress";
import {
  getCurrentSessionId,
  getModules,
  getSessionRoute,
  getSessionsByModule,
  getSessionState,
} from "@/lib/course";
import { cn, hexToRgba } from "@/lib/utils";

type JourneyMapProps = {
  currentSessionId?: string;
  className?: string;
};

export function JourneyMap({ currentSessionId, className }: JourneyMapProps) {
  const { completed } = useProgress();
  const modules = getModules();
  const derivedCurrentSessionId = useMemo(
    () => currentSessionId ?? getCurrentSessionId(completed),
    [completed, currentSessionId],
  );
  const pillRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const currentNode = pillRefs.current[derivedCurrentSessionId];
    currentNode?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [derivedCurrentSessionId]);

  return (
    <section className={cn("surface-card relative overflow-hidden p-6 sm:p-8", className)}>
      <div className="absolute bottom-10 left-[0.72rem] top-10 w-px bg-white/10 sm:left-[1.1rem]" />

      <div className="space-y-8">
        {modules.map((module) => {
          const moduleSessions = getSessionsByModule(module.id);

          return (
            <div key={module.id} className="relative space-y-4 pl-8 sm:pl-10">
              <div className="flex items-start gap-4">
                <span
                  className="mt-1 h-4 w-4 shrink-0 rounded-full"
                  style={{
                    backgroundColor: module.color,
                    boxShadow: `0 0 0 8px ${hexToRgba(module.color, 0.14)}`,
                  }}
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-white">
                      Module {module.id} - {module.title}
                    </p>
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
                      style={{
                        color: module.color,
                        borderColor: hexToRgba(module.color, 0.28),
                        backgroundColor: hexToRgba(module.color, 0.12),
                      }}
                    >
                      {module.episodeRange}
                    </span>
                  </div>
                  <p className="max-w-4xl text-sm text-slate-400">{module.tagline}</p>
                </div>
              </div>

              <div className="-mx-2 overflow-x-auto px-2 pb-2 pt-4">
                <div className="flex min-w-max gap-3">
                  {moduleSessions.map((session) => {
                    const state =
                      session.id === derivedCurrentSessionId
                        ? "current"
                        : getSessionState(session, completed, derivedCurrentSessionId);
                    const baseClasses =
                      "relative inline-flex min-w-[12rem] items-center justify-center rounded-full border px-4 py-3 text-sm font-medium transition duration-300";

                    const style =
                      state === "completed"
                        ? {
                            color: "#d1fae5",
                            borderColor: hexToRgba("#22c55e", 0.2),
                            backgroundColor: hexToRgba("#22c55e", 0.16),
                          }
                        : state === "current"
                          ? {
                              color: "#ffffff",
                              borderColor: module.color,
                              backgroundColor: module.color,
                            }
                          : state === "available"
                            ? {
                                color: module.color,
                                borderColor: hexToRgba(module.color, 0.32),
                                backgroundColor: "transparent",
                              }
                            : {
                                color: "#94a3b8",
                                borderColor: "rgba(148, 163, 184, 0.16)",
                                backgroundColor: "rgba(148, 163, 184, 0.06)",
                              };

                    const pill = (
                      <>
                        <span>{session.id}</span>
                        <span className="ml-2 truncate">{session.title}</span>
                      </>
                    );

                    return (
                      <Link
                        key={session.id}
                        href={getSessionRoute(session)}
                        ref={(node) => {
                          pillRefs.current[session.id] = node;
                        }}
                        className={baseClasses}
                        style={style}
                      >
                        {pill}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
