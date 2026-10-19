import Link from "next/link";

import type { CourseSession, SessionState } from "@/lib/session-types";
import { getModuleById, getSessionRoute } from "@/lib/course";
import { hexToRgba } from "@/lib/utils";

type SessionCardProps = {
  session: CourseSession;
  state: SessionState;
  unlockHint?: string;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M5 10.5L8.5 14L15 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M6.75 8V6.75a3.25 3.25 0 1 1 6.5 0V8M5.5 8h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SessionCard({ session, state, unlockHint }: SessionCardProps) {
  const module = getModuleById(session.module);
  const moduleColor = module?.color ?? "#534AB7";
  const href = getSessionRoute(session);

  const inner = (
    <article
      className="surface-card flex h-full flex-col justify-between p-5 transition duration-300 hover:-translate-y-1"
      style={{
        borderColor:
          state === "locked"
            ? "rgba(148, 163, 184, 0.14)"
            : hexToRgba(moduleColor, 0.22),
        backgroundColor:
          state === "completed"
            ? hexToRgba("#16a34a", 0.12)
            : state === "current"
              ? hexToRgba(moduleColor, 0.12)
              : undefined,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: state === "locked" ? "#64748b" : moduleColor }}
            />
            <span
              className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]"
              style={{
                color: state === "locked" ? "#94a3b8" : moduleColor,
                borderColor: state === "locked"
                  ? "rgba(148, 163, 184, 0.18)"
                  : hexToRgba(moduleColor, 0.28),
                backgroundColor:
                  state === "locked" ? "rgba(148, 163, 184, 0.08)" : hexToRgba(moduleColor, 0.12),
              }}
            >
              {session.id}
            </span>
          </div>

          {state === "completed" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-200">
              <CheckIcon />
              Completed
            </span>
          ) : state === "locked" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              <LockIcon />
              Guided later
            </span>
          ) : state === "current" ? (
            <span className="rounded-full border border-gray-200 dark:border-white/15 bg-gray-900/[0.07] dark:bg-white/10 px-3 py-1 text-xs font-medium text-gray-950 dark:text-white">
              Current
            </span>
          ) : (
            <span className="rounded-full border border-gray-200 dark:border-white/10 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
              Available
            </span>
          )}
        </div>

        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Module {session.module}</p>
          <h3 className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">{session.title}</h3>
        </div>
      </div>

      <div className="mt-6 min-h-[3.5rem]">
        {state === "locked" ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Open anytime. Recommended after {unlockHint ?? "the previous session"}.
          </p>
        ) : state === "completed" ? (
          <p className="text-sm text-emerald-800 dark:text-emerald-100/90">Watch again</p>
        ) : state === "current" ? (
          <p className="text-sm text-slate-900 dark:text-slate-200">Continue this session</p>
        ) : (
          <p className="text-sm" style={{ color: moduleColor }}>
            Open session
          </p>
        )}
      </div>
    </article>
  );

  return <Link href={href}>{inner}</Link>;
}
