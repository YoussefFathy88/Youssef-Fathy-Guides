"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

// ─── Step data ────────────────────────────────────────────────────────────────

interface Step {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeColor: string;
}

const STEPS: Step[] = [
  {
    id: "problem",
    title: "Passwords alone are not enough",
    subtitle: "Stolen passwords leak — millions every year",
    accentColor: "text-rose-300",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
  {
    id: "tokens",
    title: "Login creates a secret token",
    subtitle: "Server signs it — only they can verify",
    accentColor: "text-blue-300",
    badgeColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "flow",
    title: "Every request carries the token",
    subtitle: "Browser sends it; server checks the signature",
    accentColor: "text-sky-300",
    badgeColor: "bg-sky-500/20 text-sky-200 border-sky-500/30",
  },
  {
    id: "mfa",
    title: "Two factors beat one stolen password",
    subtitle: "Something you know + something you have",
    accentColor: "text-emerald-300",
    badgeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
  {
    id: "oauth",
    title: "OAuth lets you use existing accounts",
    subtitle: "Google proves your identity — no new password",
    accentColor: "text-amber-300",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
];

// ─── Per-step visuals ─────────────────────────────────────────────────────────

function ProblemVisual({ reduced }: { reduced: boolean }) {
  const breaches = [
    { name: "RockYou2024", count: "10B", color: "bg-rose-500" },
    { name: "LinkedIn 2012", count: "117M", color: "bg-orange-500" },
    { name: "Adobe 2013", count: "153M", color: "bg-amber-500" },
    { name: "Yahoo 2013", count: "3B", color: "bg-red-600" },
  ];

  return (
    <div className="flex flex-col gap-3 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-base text-slate-400 text-center">
        Major breaches — passwords exposed (illustrative)
      </p>

      {breaches.map((b, i) => (
        <motion.div
          key={b.name}
          initial={reduced ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.18, duration: 0.35 }}
          className="space-y-1"
        >
          <div className="flex justify-between text-base">
            <span className="text-slate-200 font-medium">{b.name}</span>
            <span className="font-mono font-bold text-rose-300">{b.count}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className={cn("h-full rounded-full", b.color)}
              initial={{ width: "0%" }}
              animate={{ width: i === 0 ? "100%" : i === 3 ? "95%" : `${30 + i * 18}%` }}
              transition={{
                delay: reduced ? 0 : i * 0.18 + 0.1,
                duration: 0.55,
                ease: "easeOut",
              }}
            />
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.85, duration: 0.35 }}
        className="mt-1 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-center"
      >
        <p className="text-base font-semibold text-rose-100">
          A leaked password = instant access
        </p>
      </motion.div>
    </div>
  );
}

// JWT parts
const JWT_PARTS = [
  {
    label: "Header",
    value: 'alg: "HS256"',
    chipColor: "border-violet-400/50 bg-violet-500/20 text-violet-100",
    dotColor: "bg-violet-400",
  },
  {
    label: "Payload",
    value: 'userId: "42"',
    chipColor: "border-blue-400/50 bg-blue-500/20 text-blue-100",
    dotColor: "bg-blue-400",
  },
  {
    label: "Signature",
    value: "HMAC(secret)",
    chipColor: "border-emerald-400/50 bg-emerald-500/20 text-emerald-100",
    dotColor: "bg-emerald-400",
  },
];

function TokensVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[320px] mx-auto">
      <div className="rounded-xl border border-slate-600/40 bg-slate-800/50 px-3 py-2 text-center">
        <p className="text-base text-slate-300">
          <span className="font-bold text-white">POST /login</span> → server
          checks password → issues a{" "}
          <span className="font-bold text-blue-300">JWT token</span>
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-base font-bold uppercase tracking-wide text-slate-400">
          JWT = 3 parts joined by dots
        </p>
        {JWT_PARTS.map((part, i) => (
          <motion.div
            key={part.label}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.2, duration: 0.35 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5",
              part.chipColor,
            )}
          >
            <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", part.dotColor)} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                {part.label}
              </p>
              <p className="text-base font-mono font-semibold">{part.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 0.7, type: "spring", bounce: 0.3 }}
        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-center"
      >
        <p className="text-base font-medium text-blue-100">
          Only the server knows the secret — so only it can sign
        </p>
      </motion.div>
    </div>
  );
}

const FLOW_STEPS = [
  { label: "Browser", sublabel: "sends request + JWT", color: "border-sky-500/40 bg-sky-500/15 text-sky-100" },
  { label: "Server", sublabel: "verifies signature", color: "border-violet-500/40 bg-violet-500/15 text-violet-100" },
  { label: "✓ Access", sublabel: "no password check needed", color: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100" },
];

function FlowVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-base text-slate-400 text-center">
        After login — every API call
      </p>

      {FLOW_STEPS.map((step, i) => (
        <div key={step.label} className="flex flex-col items-center w-full gap-1">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.25, duration: 0.35 }}
            className={cn(
              "w-full rounded-2xl border px-4 py-3 text-center",
              step.color,
            )}
          >
            <p className="text-lg font-bold">{step.label}</p>
            <p className="text-base opacity-80">{step.sublabel}</p>
          </motion.div>

          {i < FLOW_STEPS.length - 1 && (
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : i * 0.25 + 0.15 }}
              className="text-slate-500"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.div>
          )}
        </div>
      ))}

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.9 }}
        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-center"
      >
        <p className="text-base font-medium text-sky-100">
          Stateless — server stores nothing
        </p>
      </motion.div>
    </div>
  );
}

const MFA_ROWS = [
  {
    label: "Password only",
    outcome: "❌ Leaked → hacked",
    outlineColor: "border-rose-500/40 bg-rose-500/10",
    textColor: "text-rose-200",
  },
  {
    label: "Password + OTP code",
    outcome: "✅ Needs both → safe",
    outlineColor: "border-emerald-500/40 bg-emerald-500/10",
    textColor: "text-emerald-200",
  },
];

function MfaVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-4 px-4 w-full max-w-[320px] mx-auto">
      {MFA_ROWS.map((row, i) => (
        <motion.div
          key={row.label}
          initial={reduced ? false : { opacity: 0, x: i === 0 ? -16 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.3, duration: 0.4 }}
          className={cn("rounded-2xl border px-4 py-4 space-y-2", row.outlineColor)}
        >
          <p className="text-base font-bold text-slate-200">{row.label}</p>
          <p className={cn("text-lg font-semibold", row.textColor)}>{row.outcome}</p>
        </motion.div>
      ))}

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.7 }}
        className="space-y-2"
      >
        <p className="text-base font-bold uppercase tracking-wide text-slate-400">
          The two factors
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Something you know", example: "password / PIN", color: "border-violet-400/40 bg-violet-500/15 text-violet-100" },
            { label: "Something you have", example: "phone / TOTP app", color: "border-amber-400/40 bg-amber-500/15 text-amber-100" },
          ].map((f) => (
            <div key={f.label} className={cn("rounded-xl border px-2.5 py-2.5 text-center", f.color)}>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">{f.label}</p>
              <p className="text-base font-semibold">{f.example}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const OAUTH_STEPS = [
  { emoji: "👤", label: "You click", detail: '"Log in with Google"', color: "border-slate-500/40 bg-slate-800/50 text-slate-100" },
  { emoji: "🔗", label: "Redirect", detail: "to Google login page", color: "border-blue-500/40 bg-blue-500/15 text-blue-100" },
  { emoji: "✅", label: "Google confirms", detail: "you're who you say", color: "border-violet-500/40 bg-violet-500/15 text-violet-100" },
  { emoji: "🎫", label: "Access token", detail: "sent back to your app", color: "border-amber-500/40 bg-amber-500/15 text-amber-100" },
];

function OauthVisual({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 px-4 w-full max-w-[320px] mx-auto">
      <p className="text-base text-slate-400 text-center">
        OAuth 2.0 — one-click login flow
      </p>
      {OAUTH_STEPS.map((s, i) => (
        <div key={s.label} className="flex flex-col items-center gap-1">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.22, duration: 0.35 }}
            className={cn("w-full flex items-center gap-3 rounded-xl border px-3 py-2.5", s.color)}
          >
            <span className="text-2xl leading-none">{s.emoji}</span>
            <div>
              <p className="text-base font-bold leading-tight">{s.label}</p>
              <p className="text-base opacity-75">{s.detail}</p>
            </div>
          </motion.div>
          {i < OAUTH_STEPS.length - 1 && (
            <motion.svg
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : i * 0.22 + 0.12 }}
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="text-slate-600"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          )}
        </div>
      ))}

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduced ? 0 : 1.0, type: "spring", bounce: 0.3 }}
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center"
      >
        <p className="text-base font-semibold text-amber-100">
          No new password — Google vouches for you
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AuthenticationShort() {
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex]!;

  const goToStep = useCallback((idx: number) => {
    setStepIndex(idx);
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((prev) => (prev + 1) % STEPS.length);
  }, []);

  const goPrev = useCallback(() => {
    setStepIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
  }, []);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function renderVisual(id: string) {
    switch (id) {
      case "problem": return <ProblemVisual reduced={reducedMotion} />;
      case "tokens":  return <TokensVisual  reduced={reducedMotion} />;
      case "flow":    return <FlowVisual    reduced={reducedMotion} />;
      case "mfa":     return <MfaVisual     reduced={reducedMotion} />;
      case "oauth":   return <OauthVisual   reduced={reducedMotion} />;
      default:        return null;
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Badge + step dots */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            step.badgeColor,
          )}
        >
          Auth
        </span>

        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToStep(i)}
              aria-label={`Step ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === stepIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="px-5 pb-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={`title-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className={cn("text-2xl font-bold leading-tight", step.accentColor)}
          >
            {step.title}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Animation zone */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`visual-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? {} : { opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            {renderVisual(step.id)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtitle strip */}
      <div className="px-5 pt-3 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`subtitle-${step.id}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="rounded-xl bg-black/40 px-4 py-2.5 backdrop-blur-sm"
          >
            <p className="text-center text-base font-medium text-white">
              {step.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls + progress */}
      <div className="space-y-3 px-5 pb-5 pt-2">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous step"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={goNext}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
            aria-label="Next step"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white/70"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-center text-base font-medium uppercase tracking-widest text-white/50">
          Step {stepIndex + 1} / {STEPS.length} — tap Next
        </p>
      </div>
    </div>
  );
}
