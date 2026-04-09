"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

const LAYERS = [
  { num: 7, name: "Application", short: "App",  bg: "bg-violet-500", light: "bg-violet-50 dark:bg-violet-900/30", border: "border-violet-300 dark:border-violet-700", text: "text-violet-700 dark:text-violet-300", adds: "HTTP / DNS / SMTP message body", pdu: "Data",    desc: "Creates the user data that will be sent across the network." },
  { num: 6, name: "Presentation", short: "Pres", bg: "bg-blue-500",   light: "bg-blue-50 dark:bg-blue-900/30",     border: "border-blue-300 dark:border-blue-700",     text: "text-blue-700 dark:text-blue-300",     adds: "TLS encryption / compression / encoding",   pdu: "Data",    desc: "Translates, encrypts, and compresses data between app and network formats." },
  { num: 5, name: "Session",      short: "Sess", bg: "bg-teal-500",   light: "bg-teal-50 dark:bg-teal-900/30",     border: "border-teal-300 dark:border-teal-700",     text: "text-teal-700 dark:text-teal-300",     adds: "Session ID for dialog management",          pdu: "Data",    desc: "Establishes, manages, and terminates communication sessions." },
  { num: 4, name: "Transport",    short: "TCP",  bg: "bg-amber-500",  light: "bg-amber-50 dark:bg-amber-900/30",   border: "border-amber-300 dark:border-amber-700",   text: "text-amber-700 dark:text-amber-300",   adds: "TCP header: src/dst port, seq/ack numbers", pdu: "Segment", desc: "End-to-end reliable delivery, flow control, and error recovery (TCP/UDP)." },
  { num: 3, name: "Network",      short: "IP",   bg: "bg-green-600",  light: "bg-green-50 dark:bg-green-900/30",  border: "border-green-300 dark:border-green-700",   text: "text-green-700 dark:text-green-300",   adds: "IP header: src/dst IP, TTL, checksum",      pdu: "Packet",  desc: "Logical addressing (IP) and routing packets across networks." },
  { num: 2, name: "Data Link",    short: "ETH",  bg: "bg-rose-500",   light: "bg-rose-50 dark:bg-rose-900/30",     border: "border-rose-300 dark:border-rose-700",     text: "text-rose-700 dark:text-rose-300",     adds: "Ethernet frame: src/dst MAC, FCS checksum", pdu: "Frame",   desc: "Node-to-node delivery, MAC addressing, error detection (Ethernet/Wi-Fi)." },
  { num: 1, name: "Physical",     short: "PHY",  bg: "bg-gray-500",   light: "bg-gray-100 dark:bg-gray-800/60",    border: "border-gray-300 dark:border-gray-600",     text: "text-gray-600 dark:text-gray-300",     adds: "Electrical / optical / radio bit encoding", pdu: "Bits",    desc: "Converts frames into raw bits transmitted over the physical medium." },
] as const;

// animStep: 0=idle, 1-7=sender layer 0-6 active, 8=transmitting, 9-15=receiver layer 6→0, 16=done
const TOTAL_STEPS = 16;

function getSenderLayer(step: number): number | null {
  return step >= 1 && step <= 7 ? step - 1 : null;
}

function getReceiverLayer(step: number): number | null {
  if (step >= 9 && step <= 15) return 15 - step; // 9→6(Phys), 15→0(App)
  return null;
}

function getSenderHeaders(step: number): number {
  return Math.min(7, Math.max(0, step));
}

function getReceiverHeaders(step: number): number {
  if (step < 8) return 0;
  return Math.max(0, 7 - (step - 8));
}

export interface PacketJourneyVisualizerProps {
  title?: string;
  caption?: string;
}

export default function PacketJourneyVisualizer({ title, caption }: PacketJourneyVisualizerProps) {
  const [animStep, setAnimStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [transmitPct, setTransmitPct] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const transmitStartRef = useRef<number | null>(null);

  const isDone = animStep === TOTAL_STEPS;
  const isTransmitting = animStep === 8;
  const senderLayer = getSenderLayer(animStep);
  const receiverLayer = getReceiverLayer(animStep);
  const senderHeaders = getSenderHeaders(animStep <= 8 ? animStep : 7);
  const receiverHeaders = getReceiverHeaders(animStep);
  const tooltipLayer = selectedLayer !== null ? LAYERS[selectedLayer] : null;

  const advance = useCallback(() => {
    setAnimStep(s => {
      if (s >= TOTAL_STEPS) { setIsPlaying(false); return s; }
      return s + 1;
    });
  }, []);

  // Animate the transmit dot across the wire
  useEffect(() => {
    if (!isTransmitting) { setTransmitPct(0); return; }
    transmitStartRef.current = null;
    const animate = (ts: number) => {
      if (!transmitStartRef.current) transmitStartRef.current = ts;
      const elapsed = ts - transmitStartRef.current;
      const pct = Math.min(1, elapsed / 650);
      setTransmitPct(pct);
      if (pct < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isTransmitting]);

  useEffect(() => {
    if (!isPlaying) { if (timerRef.current) clearTimeout(timerRef.current); return; }
    const delay = animStep === 8 ? 800 : 650;
    timerRef.current = setTimeout(advance, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, animStep, advance]);

  const handlePlayPause = () => {
    if (isDone) { setAnimStep(0); setTransmitPct(0); setTimeout(() => setIsPlaying(true), 50); return; }
    setIsPlaying(p => !p);
  };

  const handleReset = () => {
    setIsPlaying(false); setAnimStep(0); setTransmitPct(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  function statusText() {
    if (animStep === 0) return "Click ▶ Play to animate packet encapsulation → transmission → decapsulation.";
    if (senderLayer !== null) return `Sender — L${LAYERS[senderLayer].num} ${LAYERS[senderLayer].name}: adding ${LAYERS[senderLayer].adds}.`;
    if (isTransmitting) return "Transmitting encoded bit-stream across the physical medium…";
    if (receiverLayer !== null) return `Receiver — L${LAYERS[receiverLayer].num} ${LAYERS[receiverLayer].name}: stripping the ${LAYERS[receiverLayer].name} header.`;
    if (isDone) return "✓ Delivered — the Application layer on the receiver has the original data.";
    return "";
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      <div className="flex items-stretch gap-3">
        {/* ── Sender ──────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">Sender</p>
          <div className="flex flex-col gap-0.5">
            {LAYERS.map((layer, i) => {
              const isActive = senderLayer === i;
              const isPassed = animStep >= i + 2 || animStep >= 8;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedLayer(selectedLayer === i ? null : i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[11px] transition-all duration-300",
                    isActive
                      ? `border-2 ${layer.border} ${layer.light} shadow-sm`
                      : isPassed
                      ? `${layer.light} border-transparent opacity-60`
                      : `${layer.light} border-transparent`,
                    isActive && "ring-1 ring-inset ring-current/20",
                  )}
                >
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white", layer.bg)}>
                    {layer.num}
                  </span>
                  <span className={cn("min-w-0 truncate font-medium", isActive ? layer.text : "text-gray-600 dark:text-gray-400")}>
                    {layer.name}
                  </span>
                  {isActive && (
                    <span className={cn("ml-auto shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold", layer.bg, "text-white")}>
                      +hdr
                    </span>
                  )}
                  {isPassed && !isActive && (
                    <span className="ml-auto shrink-0 text-[9px] text-gray-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Center: packet stack + wire ─────────────── */}
        <div className="flex w-20 shrink-0 flex-col items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Packet</p>

          {/* Sender packet stack */}
          {animStep >= 1 && animStep <= 8 && (
            <div className="flex w-full flex-col items-center">
              <div
                className="flex flex-col overflow-hidden rounded border border-gray-300 bg-white text-center dark:border-gray-600 dark:bg-gray-900"
                style={{ width: "100%", transition: "all 0.4s ease" }}
              >
                {[...Array(senderHeaders)].map((_, hi) => {
                  const layerIdx = senderHeaders - 1 - hi;
                  const l = LAYERS[layerIdx];
                  return (
                    <div key={hi} className={cn("py-0.5 text-[7px] font-bold text-white", l.bg)}>
                      {l.short}
                    </div>
                  );
                })}
                <div className="bg-gray-200 py-0.5 text-[7px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  DATA
                </div>
              </div>
              <span className="mt-0.5 text-[9px] text-gray-400">{senderHeaders} hdrs</span>
            </div>
          )}

          {/* Wire */}
          <div className="relative flex w-full items-center">
            <div className="h-0.5 w-full bg-gray-300 dark:bg-gray-600" />
            {isTransmitting && (
              <div
                className="absolute h-3 w-3 -translate-y-1/2 rounded-full bg-violet-500 shadow"
                style={{
                  left: `${transmitPct * 100}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  transition: "left 0.05s linear",
                }}
              />
            )}
          </div>

          {/* Receiver packet stack */}
          {animStep >= 8 && animStep < 16 && receiverHeaders > 0 && (
            <div className="flex w-full flex-col items-center">
              <div className="flex flex-col overflow-hidden rounded border border-gray-300 bg-white text-center dark:border-gray-600 dark:bg-gray-900" style={{ width: "100%" }}>
                {[...Array(receiverHeaders)].map((_, hi) => {
                  const layerIdx = receiverHeaders - 1 - hi;
                  const l = LAYERS[layerIdx];
                  return (
                    <div key={hi} className={cn("py-0.5 text-[7px] font-bold text-white", l.bg)}>
                      {l.short}
                    </div>
                  );
                })}
                <div className="bg-gray-200 py-0.5 text-[7px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  DATA
                </div>
              </div>
              <span className="mt-0.5 text-[9px] text-gray-400">{receiverHeaders} hdrs</span>
            </div>
          )}

          {isDone && (
            <div className="rounded bg-teal-100 px-1.5 py-1 text-center text-[9px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              ✓ Done
            </div>
          )}
        </div>

        {/* ── Receiver ────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">Receiver</p>
          <div className="flex flex-col gap-0.5">
            {LAYERS.map((layer, i) => {
              const isActive = receiverLayer === i;
              // receiver processes from Physical (6) up to Application (0)
              // step 9 → layer 6 done, step 10 → layer 5 done, ..., step 15 → layer 0 done
              const isPassed = animStep > 9 + (6 - i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedLayer(selectedLayer === i ? null : i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[11px] transition-all duration-300",
                    isActive
                      ? `border-2 ${layer.border} ${layer.light} shadow-sm`
                      : isPassed
                      ? `${layer.light} border-transparent opacity-60`
                      : `${layer.light} border-transparent`,
                  )}
                >
                  <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white", layer.bg)}>
                    {layer.num}
                  </span>
                  <span className={cn("min-w-0 truncate font-medium", isActive ? layer.text : "text-gray-600 dark:text-gray-400")}>
                    {layer.name}
                  </span>
                  {isActive && (
                    <span className={cn("ml-auto shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold", layer.bg, "text-white")}>
                      -hdr
                    </span>
                  )}
                  {isPassed && !isActive && (
                    <span className="ml-auto shrink-0 text-[9px] text-gray-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip panel */}
      {tooltipLayer && (
        <div className={cn(
          "mt-4 rounded-xl border p-3 transition-all duration-200",
          tooltipLayer.light,
          tooltipLayer.border,
          "border",
        )}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn("text-xs font-bold", tooltipLayer.text)}>
                Layer {tooltipLayer.num}: {tooltipLayer.name} — PDU unit: {tooltipLayer.pdu}
              </p>
              <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">{tooltipLayer.desc}</p>
              <p className={cn("mt-1 text-[11px] font-medium", tooltipLayer.text)}>
                Adds: {tooltipLayer.adds}
              </p>
            </div>
            <button type="button" onClick={() => setSelectedLayer(null)} className="shrink-0 text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="mt-3 min-h-[36px] rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {statusText()}
      </div>

      {/* Controls */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handlePlayPause}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
            isPlaying
              ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              : "bg-violet-600 text-white hover:bg-violet-700",
          )}
        >
          {isPlaying ? "⏸ Pause" : isDone ? "↩ Replay" : animStep > 0 ? "▶ Resume" : "▶ Play"}
        </button>
        {animStep > 0 && !isPlaying && (
          <button
            type="button"
            onClick={() => { if (!isDone) advance(); }}
            disabled={isDone}
            className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            Step →
          </button>
        )}
        {animStep > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            ↩ Reset
          </button>
        )}
        <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500">
          {animStep}/{TOTAL_STEPS} · Click any layer band for details
        </span>
      </div>
    </div>
  );
}
