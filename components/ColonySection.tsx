import Link from "next/link";
import type { Route } from "next";

import { COLONY_MODULE } from "@/lib/anatomy";

const COLONY_COLOR = "#6366F1";

export function ColonySection() {
  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-white/10"
      style={{
        background: `linear-gradient(135deg, ${COLONY_COLOR}0D 0%, #050B18 40%)`,
        backgroundImage:
          "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full"
        style={{
          background: `radial-gradient(circle, ${COLONY_COLOR}20 0%, transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full"
        style={{
          background: `radial-gradient(circle, ${COLONY_COLOR}18 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-base"
                style={{ backgroundColor: `${COLONY_COLOR}20`, border: `1px solid ${COLONY_COLOR}40` }}
              >
                🌐
              </span>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                The Colony
              </h2>
            </div>
            <p className="text-sm" style={{ color: COLONY_COLOR }}>
              How Agents Collaborate
            </p>
            <p className="max-w-lg text-sm text-slate-400">
              When one agent isn&apos;t enough — multi-agent architectures, orchestration, and emergent behavior.
            </p>
          </div>

          {/* Stats pill */}
          <div
            className="shrink-0 rounded-full px-4 py-2 text-xs font-medium"
            style={{
              color: COLONY_COLOR,
              backgroundColor: `${COLONY_COLOR}18`,
              border: `1px solid ${COLONY_COLOR}30`,
            }}
          >
            {COLONY_MODULE.sessions.length} sessions · Coming soon
          </div>
        </div>

        {/* Divider */}
        <div
          className="mb-8 h-px w-full opacity-20"
          style={{
            background: `linear-gradient(90deg, ${COLONY_COLOR}, transparent)`,
          }}
        />

        {/* Session cards grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {COLONY_MODULE.sessions.map((session, i) => {
            const index = String(i + 1).padStart(2, "0");
            const isAvailable = session.status === "available";

            const cardContent = (
              <>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className="font-mono text-xs font-bold tabular-nums"
                    style={{ color: COLONY_COLOR }}
                  >
                    {index}
                  </span>
                  {!isAvailable && (
                    <span
                      className="rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-500"
                      style={{ borderColor: "rgba(148,163,184,0.15)" }}
                    >
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-xs leading-snug text-slate-300">{session.title}</p>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: COLONY_COLOR }}
                />
              </>
            );

            const sharedClasses =
              "group relative rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all duration-200 overflow-hidden";

            if (isAvailable) {
              return (
                <Link
                  key={session.id}
                  href={`/sessions/${session.slug}` as Route}
                  className={`${sharedClasses} hover:border-[${COLONY_COLOR}40] hover:bg-[${COLONY_COLOR}0D]`}
                  style={{ display: "block" }}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={session.id} className={`${sharedClasses} cursor-not-allowed opacity-60`}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
