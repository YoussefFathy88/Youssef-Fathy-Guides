"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

type NodeRole = "follower" | "candidate" | "leader";

interface NodeState {
  id: number;
  role: NodeRole;
  timer: number;    // 0-100; depletes toward 0
  timerSpeed: number; // how fast it depletes per tick (px)
  votes: number;
  voteFor: number | null;
}

interface Message {
  id: number;
  from: number;
  to: number;
  type: "RequestVote" | "VoteGranted" | "Heartbeat" | "AppendEntries";
  pct: number; // 0-1 travel progress
}

interface LogEntry {
  index: number;
  term: number;
  value: string;
  replicatedTo: number[];
  committed: boolean;
}

type Phase = "idle" | "election" | "voting" | "normal" | "partitioned";

let msgIdSeq = 0;
const nextId = () => ++msgIdSeq;

export interface ConsensusSimulatorProps {
  title?: string;
  caption?: string;
  nodeCount?: number;
}

const TIMER_SPEEDS = [2.8, 1.6, 1.4, 1.2, 1.1]; // Node 0 fastest

function makeNodes(n: number): NodeState[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    role: "follower",
    timer: 100 - i * 2, // stagger initial timers
    timerSpeed: TIMER_SPEEDS[i] ?? 1.0,
    votes: 0,
    voteFor: null,
  }));
}

function nodeX(id: number, total: number, svgW: number): number {
  const padding = 50;
  const step = (svgW - padding * 2) / Math.max(1, total - 1);
  return padding + id * step;
}

const NODE_Y = 60;
const NODE_R = 22;
const SVG_H = 130;

export default function ConsensusSimulator({
  title,
  caption,
  nodeCount = 5,
}: ConsensusSimulatorProps) {
  const [nodes, setNodes] = useState<NodeState[]>(() => makeNodes(nodeCount));
  const [messages, setMessages] = useState<Message[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [leaderId, setLeaderId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isPartitioned, setIsPartitioned] = useState(false);
  const [entryCounter, setEntryCounter] = useState(1);
  const [hbTick, setHbTick] = useState(0);
  const [svgW, setSvgW] = useState(500);

  const svgRef = useRef<SVGSVGElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  const nodesRef = useRef(nodes);
  const leaderRef = useRef(leaderId);
  const hbRef = useRef(0);

  phaseRef.current = phase;
  nodesRef.current = nodes;
  leaderRef.current = leaderId;
  hbRef.current = hbTick;

  // Observe SVG width
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setSvgW(e.contentRect.width || 500);
    });
    if (svgRef.current) obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  const spawnMessages = useCallback((msgs: Omit<Message, "id" | "pct">[]) => {
    setMessages(prev => [
      ...prev,
      ...msgs.map(m => ({ ...m, id: nextId(), pct: 0 })),
    ]);
  }, []);

  // Animate message travel
  useEffect(() => {
    const raf = setInterval(() => {
      setMessages(prev => {
        const next = prev
          .map(m => ({ ...m, pct: m.pct + 0.06 }))
          .filter(m => m.pct < 1.0);
        return next;
      });
    }, 40);
    return () => clearInterval(raf);
  }, []);

  const runElection = useCallback((candidateId: number) => {
    setNodes(prev => prev.map(n =>
      n.id === candidateId
        ? { ...n, role: "candidate", votes: 1, voteFor: candidateId, timer: 0 }
        : { ...n, timer: 80 + Math.random() * 20 }
    ));
    setPhase("election");
    // Send RequestVote to all others
    const others = Array.from({ length: nodeCount }, (_, i) => i).filter(i => i !== candidateId);
    spawnMessages(others.map(to => ({ from: candidateId, to, type: "RequestVote" as const })));

    // After 1s, grant votes → leader
    setTimeout(() => {
      spawnMessages(others.map(to => ({ from: to, to: candidateId, type: "VoteGranted" as const })));
      setTimeout(() => {
        setNodes(prev => prev.map(n => ({
          ...n,
          role: n.id === candidateId ? "leader" : "follower",
          votes: 0,
          voteFor: null,
          timer: n.id === candidateId ? 100 : 80 + Math.random() * 20,
        })));
        setLeaderId(candidateId);
        setPhase("normal");
      }, 800);
    }, 900);
  }, [nodeCount, spawnMessages]);

  // Main tick
  useEffect(() => {
    if (phase === "idle") return;
    if (isPaused) { if (tickRef.current) clearInterval(tickRef.current); return; }

    tickRef.current = setInterval(() => {
      const currentPhase = phaseRef.current;
      const currentLeader = leaderRef.current;

      if (currentPhase === "normal" || currentPhase === "partitioned") {
        setHbTick(h => h + 1);
        return;
      }

      if (currentPhase !== "election") {
        // Deplete timers; first to 0 triggers election
        setNodes(prev => {
          let electionTriggered = false;
          const next = prev.map(n => {
            if (n.role !== "follower") return n;
            const newTimer = n.timer - n.timerSpeed;
            if (newTimer <= 0 && !electionTriggered) {
              electionTriggered = true;
              setTimeout(() => runElection(n.id), 0);
              return { ...n, timer: 0 };
            }
            return { ...n, timer: Math.max(0, newTimer) };
          });
          return next;
        });
      }
    }, 80);

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase, isPaused, runElection]);

  // Heartbeats from leader
  useEffect(() => {
    if (leaderId === null || phase !== "normal") return;
    if (hbTick % 18 !== 0 || hbTick === 0) return;
    const others = Array.from({ length: nodeCount }, (_, i) => i).filter(i => i !== leaderId);
    const targets = isPartitioned ? others.filter(i => i < Math.ceil(nodeCount / 2)) : others;
    spawnMessages(targets.map(to => ({ from: leaderId, to, type: "Heartbeat" as const })));
    // Reset follower timers
    setNodes(prev => prev.map(n =>
      n.id !== leaderId ? { ...n, timer: 90 + Math.random() * 10 } : n
    ));
  }, [hbTick, leaderId, nodeCount, phase, isPartitioned, spawnMessages]);

  const handleStart = () => {
    setNodes(makeNodes(nodeCount));
    setLog([]);
    setLeaderId(null);
    setIsPartitioned(false);
    setHbTick(0);
    setPhase("starting" as Phase);
    setTimeout(() => setPhase("running" as Phase), 50);
  };

  // Alias: "running" phase = timers ticking before election
  const isRunning = ["running", "election", "normal", "partitioned"].includes(phase) as boolean;

  const handleAddEntry = () => {
    if (leaderId === null) return;
    const val = `cmd:${entryCounter}`;
    setEntryCounter(c => c + 1);
    const idx = log.length;
    setLog(prev => [...prev, { index: idx, term: 1, value: val, replicatedTo: [leaderId], committed: false }]);

    // Replicate to others
    const others = Array.from({ length: nodeCount }, (_, i) => i).filter(i => i !== leaderId);
    const targets = isPartitioned ? others.filter(i => i < Math.ceil(nodeCount / 2)) : others;
    spawnMessages(targets.map(to => ({ from: leaderId, to, type: "AppendEntries" as const })));

    setTimeout(() => {
      setLog(prev => prev.map((e, i) => i === idx
        ? { ...e, replicatedTo: [...new Set([...e.replicatedTo, ...targets])], committed: targets.length + 1 > nodeCount / 2 }
        : e
      ));
    }, 700);
  };

  const handlePartition = () => {
    const next = !isPartitioned;
    setIsPartitioned(next);
    setPhase(next ? "partitioned" : "normal");
  };

  const roleColors: Record<NodeRole, string> = {
    follower: "fill-slate-200 dark:fill-slate-600",
    candidate: "fill-blue-400",
    leader: "fill-amber-400",
  };

  const roleBorder: Record<NodeRole, string> = {
    follower: "stroke-slate-400 dark:stroke-slate-500",
    candidate: "stroke-blue-500",
    leader: "stroke-amber-500",
  };

  const partitionBoundary = isPartitioned ? Math.ceil(nodeCount / 2) : -1;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* SVG: nodes + arrows */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgW} ${SVG_H}`}
          className="w-full"
          style={{ height: SVG_H }}
          aria-label="Raft consensus node diagram"
        >
          {/* Partition zone backgrounds */}
          {isPartitioned && (
            <>
              <rect x={2} y={2} width={nodeX(partitionBoundary - 1, nodeCount, svgW) + 32} height={SVG_H - 4} rx={8}
                fill="none" stroke="#f87171" strokeWidth={1.5} strokeDasharray="5 3" />
              <rect x={nodeX(partitionBoundary, nodeCount, svgW) - 32} y={2}
                width={svgW - nodeX(partitionBoundary, nodeCount, svgW) + 30} height={SVG_H - 4} rx={8}
                fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 3" />
              <text x={nodeX(0, nodeCount, svgW)} y={14} textAnchor="middle" fontSize={9} fill="#f87171">majority group</text>
              <text x={nodeX(nodeCount - 1, nodeCount, svgW)} y={14} textAnchor="middle" fontSize={9} fill="#94a3b8">minority</text>
            </>
          )}

          {/* Message arrows */}
          {messages.map(msg => {
            const fx = nodeX(msg.from, nodeCount, svgW);
            const tx = nodeX(msg.to, nodeCount, svgW);
            const cx = fx + (tx - fx) * msg.pct;
            const cy = NODE_Y + Math.sin(msg.pct * Math.PI) * -18;
            const color = msg.type === "Heartbeat" ? "#14b8a6"
              : msg.type === "RequestVote" ? "#7c3aed"
              : msg.type === "VoteGranted" ? "#f59e0b"
              : "#3b82f6";
            return (
              <g key={msg.id}>
                <line x1={fx} y1={NODE_Y} x2={tx} y2={NODE_Y}
                  stroke={color} strokeWidth={0.8} strokeOpacity={0.25} />
                <circle cx={cx} cy={cy} r={5} fill={color} opacity={0.85} />
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize={7} fill={color}>
                  {msg.type === "RequestVote" ? "RV" : msg.type === "VoteGranted" ? "VG" : msg.type === "Heartbeat" ? "HB" : "AE"}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const x = nodeX(node.id, nodeCount, svgW);
            const isLeader = node.role === "leader";
            return (
              <g key={node.id}>
                {/* Timer arc */}
                {node.role !== "leader" && (
                  <circle cx={x} cy={NODE_Y} r={NODE_R + 4}
                    fill="none"
                    stroke={node.role === "candidate" ? "#3b82f6" : "#e2e8f0"}
                    strokeWidth={3}
                    strokeDasharray={`${((node.timer / 100) * 2 * Math.PI * (NODE_R + 4)).toFixed(1)} 999`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${x} ${NODE_Y})`}
                    className="transition-all duration-75 dark:stroke-gray-700"
                  />
                )}
                {isLeader && (
                  <circle cx={x} cy={NODE_Y} r={NODE_R + 5}
                    fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 2" />
                )}
                <circle cx={x} cy={NODE_Y} r={NODE_R}
                  className={cn(roleColors[node.role], roleBorder[node.role])}
                  strokeWidth={2}
                />
                <text x={x} y={NODE_Y + 4} textAnchor="middle" fontSize={10} fontWeight="600"
                  fill={node.role === "follower" ? "#475569" : "#1e293b"}
                  className="dark:fill-white"
                >
                  N{node.id + 1}
                </text>
                {/* Role badge */}
                <text x={x} y={NODE_Y + NODE_R + 14} textAnchor="middle" fontSize={8}
                  fill={node.role === "leader" ? "#d97706" : node.role === "candidate" ? "#3b82f6" : "#94a3b8"}
                  fontWeight={node.role !== "follower" ? "700" : "400"}
                >
                  {node.role === "leader" ? "★ Leader" : node.role === "candidate" ? "Cand." : "Follower"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Log */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Replicated Log</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{log.filter(e => e.committed).length} committed</span>
        </div>
        <div className="flex min-h-[36px] flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
          {log.length === 0 && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">No entries yet</span>
          )}
          {log.map(entry => (
            <div
              key={entry.index}
              className={cn(
                "flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-medium transition-colors duration-500",
                entry.committed
                  ? "border-teal-300 bg-teal-100 text-teal-700 dark:border-teal-600 dark:bg-teal-900/40 dark:text-teal-300"
                  : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
              )}
            >
              <span>{entry.value}</span>
              <span className="opacity-60">
                {entry.committed ? "✓" : `${entry.replicatedTo.length}/${nodeCount}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {[
          { color: "bg-slate-300 dark:bg-slate-600", label: "Follower" },
          { color: "bg-blue-400", label: "Candidate" },
          { color: "bg-amber-400", label: "Leader" },
          { color: "bg-teal-400", label: "HB heartbeat" },
          { color: "bg-violet-400", label: "RV request vote" },
          { color: "bg-amber-400", label: "VG vote granted" },
          { color: "bg-blue-400", label: "AE append entry" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={cn("h-2 w-2 rounded-full", l.color)} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!isRunning ? (
          <button
            type="button"
            onClick={handleStart}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-700"
          >
            ▶ Start Election
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsPaused(p => !p)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
                isPaused
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
              )}
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button
              type="button"
              disabled={leaderId === null}
              onClick={handleAddEntry}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              + Add Entry
            </button>
            <button
              type="button"
              onClick={handlePartition}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition",
                isPartitioned
                  ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
              )}
            >
              {isPartitioned ? "🔌 Heal Partition" : "✂ Inject Partition"}
            </button>
            <button
              type="button"
              onClick={() => { setNodes(makeNodes(nodeCount)); setLog([]); setLeaderId(null); setIsPartitioned(false); setPhase("idle"); setHbTick(0); }}
              className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              ↩ Reset
            </button>
          </>
        )}
        <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500">
          {phase === "idle" ? "Ready" : phase === "election" || (phase as string) === "running" || (phase as string) === "starting" ? "Electing…" : phase === "partitioned" ? "⚡ Network partition active" : leaderId !== null ? `Node ${leaderId + 1} is Leader` : ""}
        </span>
      </div>

      {isPartitioned && (
        <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          Partition active: the minority group (right side) cannot reach majority — writes there will never commit.
        </div>
      )}
    </div>
  );
}
