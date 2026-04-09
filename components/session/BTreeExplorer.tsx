"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { cn } from "@/lib/utils";

// ─── B-tree data model ────────────────────────────────────────────────────────

let _nid = 1000;
const nextId = () => ++_nid;

interface BNode {
  id: number;
  keys: number[];
  children: BNode[];
}

function mkNode(keys: number[] = [], children: BNode[] = []): BNode {
  return { id: nextId(), keys: [...keys], children };
}

function deepClone(n: BNode): BNode {
  return { id: n.id, keys: [...n.keys], children: n.children.map(deepClone) };
}

const isLeaf = (n: BNode) => n.children.length === 0;

function allNodes(n: BNode): BNode[] {
  return [n, ...n.children.flatMap(allNodes)];
}

// ─── Animation frames ─────────────────────────────────────────────────────────

interface Frame {
  root: BNode;
  hl: number[];     // amber highlight
  ok: number[];     // green highlight
  err: number[];    // red highlight
  status: string;
}

// ─── SVG layout ───────────────────────────────────────────────────────────────

const KW = 30;   // width per key cell
const NH = 36;   // node height
const PAD = 8;   // horizontal padding per node
const LH = 80;   // vertical level gap
const SG = 14;   // minimum sibling gap

function nodeW(n: BNode) { return Math.max(48, KW * n.keys.length + PAD * 2); }

function subtreeW(n: BNode): number {
  const nw = nodeW(n);
  if (isLeaf(n)) return nw;
  const cw = n.children.reduce((s, c) => s + subtreeW(c), 0) + (n.children.length - 1) * SG;
  return Math.max(nw, cw);
}

interface Pos { x: number; y: number; w: number }

function computeLayout(root: BNode): { pos: Map<number, Pos>; W: number; H: number } {
  const pos = new Map<number, Pos>();
  let maxY = 0;

  function layout(n: BNode, lx: number, y: number, avail: number) {
    const nw = nodeW(n);
    const cx = lx + avail / 2;
    pos.set(n.id, { x: cx - nw / 2, y, w: nw });
    maxY = Math.max(maxY, y + NH);
    if (!isLeaf(n)) {
      const cws = n.children.map(subtreeW);
      const tot = cws.reduce((s, w) => s + w, 0) + (n.children.length - 1) * SG;
      let sx = cx - tot / 2;
      for (let i = 0; i < n.children.length; i++) {
        layout(n.children[i], sx, y + LH, cws[i]);
        sx += cws[i] + SG;
      }
    }
  }

  const rw = subtreeW(root);
  layout(root, 20, 20, rw);
  return { pos, W: Math.max(280, rw + 40), H: maxY + 24 };
}

// ─── B-tree operations (frame-generating) ────────────────────────────────────

// Silent insert (for building initial tree)
function insertSilent(origRoot: BNode, key: number, maxKeys: number): BNode {
  let root = deepClone(origRoot);
  const path: BNode[] = [];

  (function traverse(n: BNode) {
    if (n.keys.includes(key)) return;
    path.push(n);
    if (isLeaf(n)) return;
    let i = n.keys.findIndex(k => k > key);
    if (i === -1) i = n.keys.length;
    traverse(n.children[i]);
  })(root);

  if (!path.length) return root;
  const leaf = path[path.length - 1];
  if (leaf.keys.includes(key)) return root;
  let p = leaf.keys.findIndex(k => k > key);
  if (p === -1) p = leaf.keys.length;
  leaf.keys.splice(p, 0, key);

  for (let pi = path.length - 1; pi >= 0; pi--) {
    const node = path[pi];
    if (node.keys.length <= maxKeys) break;
    const mid = Math.floor(node.keys.length / 2);
    const promoted = node.keys[mid];
    const right = mkNode(node.keys.slice(mid + 1), node.children.slice(mid + 1));
    node.keys = node.keys.slice(0, mid);
    node.children = node.children.slice(0, mid + 1);
    if (pi === 0) {
      root = mkNode([promoted], [node, right]);
    } else {
      const parent = path[pi - 1];
      let idx = parent.keys.findIndex(k => k > promoted);
      if (idx === -1) idx = parent.keys.length;
      parent.keys.splice(idx, 0, promoted);
      parent.children.splice(idx + 1, 0, right);
    }
  }
  return root;
}

function buildInitialTree(values: number[], maxKeys: number): BNode {
  let root = mkNode();
  for (const v of values) root = insertSilent(root, v, maxKeys);
  return root;
}

function buildInsertFrames(origRoot: BNode, key: number, maxKeys: number): { frames: Frame[]; newRoot: BNode } {
  const frames: Frame[] = [];
  let root = deepClone(origRoot);

  function snap(hl: number[], status: string, ok: number[] = [], err: number[] = []) {
    frames.push({ root: deepClone(root), hl, ok, err, status });
  }

  // Check duplicate + build path
  const visitIds: number[] = [];
  let dup = false;
  (function findPath(n: BNode) {
    visitIds.push(n.id);
    if (n.keys.includes(key)) { dup = true; return; }
    if (isLeaf(n)) return;
    let i = n.keys.findIndex(k => k > key);
    if (i === -1) i = n.keys.length;
    findPath(n.children[i]);
  })(root);

  if (dup) {
    snap(visitIds, `Key ${key} already in tree`, [], [visitIds[visitIds.length - 1]]);
    return { frames, newRoot: root };
  }

  for (let i = 0; i < visitIds.length; i++)
    snap(visitIds.slice(0, i + 1), i === 0 ? `Insert ${key}: searching from root` : `${key} belongs in this subtree`);

  // Node path for mutation
  const nodePath: BNode[] = [];
  (function buildPath(n: BNode) {
    nodePath.push(n);
    if (isLeaf(n)) return;
    let i = n.keys.findIndex(k => k > key);
    if (i === -1) i = n.keys.length;
    buildPath(n.children[i]);
  })(root);

  const leaf = nodePath[nodePath.length - 1];
  let p = leaf.keys.findIndex(k => k > key);
  if (p === -1) p = leaf.keys.length;
  leaf.keys.splice(p, 0, key);

  const overflowed = leaf.keys.length > maxKeys;
  snap([leaf.id],
    overflowed
      ? `Inserted ${key} → node [${leaf.keys.join(',')}] overflows (max ${maxKeys}) — splitting`
      : `Inserted ${key} into leaf [${leaf.keys.join(',')}]`,
    overflowed ? [] : [leaf.id]);

  for (let pi = nodePath.length - 1; pi >= 0; pi--) {
    const node = nodePath[pi];
    if (node.keys.length <= maxKeys) break;
    const mid = Math.floor(node.keys.length / 2);
    const promoted = node.keys[mid];
    const right = mkNode(node.keys.slice(mid + 1), node.children.slice(mid + 1));
    node.keys = node.keys.slice(0, mid);
    node.children = node.children.slice(0, mid + 1);
    if (pi === 0) {
      root = mkNode([promoted], [node, right]);
      snap([root.id, node.id, right.id], `Root split — promoted ${promoted} to new root`, [root.id]);
    } else {
      const parent = nodePath[pi - 1];
      let idx = parent.keys.findIndex(k => k > promoted);
      if (idx === -1) idx = parent.keys.length;
      parent.keys.splice(idx, 0, promoted);
      parent.children.splice(idx + 1, 0, right);
      const stillOverflows = parent.keys.length > maxKeys;
      snap([parent.id, node.id, right.id],
        stillOverflows
          ? `Promoted ${promoted} to parent [${parent.keys.join(',')}] — parent also overflows`
          : `Promoted ${promoted} to parent [${parent.keys.join(',')}]`,
        stillOverflows ? [] : [parent.id]);
    }
  }

  snap([], `Insert of ${key} complete`, []);
  return { frames, newRoot: root };
}

function buildSearchFrames(root: BNode, key: number): Frame[] {
  const frames: Frame[] = [];

  function snap(hl: number[], status: string, ok: number[] = [], err: number[] = []) {
    frames.push({ root, hl, ok, err, status });
  }

  snap([root.id], `Search ${key}: start at root`);

  function search(n: BNode, path: number[]): boolean {
    snap([...path, n.id], `Node [${n.keys.join(',')}] — comparing ${key}`);
    for (let i = 0; i < n.keys.length; i++) {
      if (n.keys[i] === key) { snap([n.id], `✓ Found key ${key}`, [n.id]); return true; }
      if (n.keys[i] > key) {
        if (isLeaf(n)) { snap([n.id], `Key ${key} not in tree`, [], [n.id]); return false; }
        return search(n.children[i], [...path, n.id]);
      }
    }
    if (isLeaf(n)) { snap([n.id], `Key ${key} not in tree`, [], [n.id]); return false; }
    return search(n.children[n.keys.length], [...path, n.id]);
  }

  search(root, []);
  return frames;
}

function buildDeleteFrames(origRoot: BNode, key: number, maxKeys: number): { frames: Frame[]; newRoot: BNode } {
  const frames: Frame[] = [];
  let root = deepClone(origRoot);
  const minKeys = Math.floor(maxKeys / 2);

  function snap(hl: number[], status: string, ok: number[] = [], err: number[] = []) {
    frames.push({ root: deepClone(root), hl, ok, err, status });
  }

  // Find target
  const path: BNode[] = [];
  let target: BNode | null = null;
  let targetKeyIdx = -1;

  (function find(n: BNode) {
    for (let i = 0; i < n.keys.length; i++) {
      if (n.keys[i] === key) { target = n; targetKeyIdx = i; path.push(n); return; }
    }
    if (isLeaf(n)) return;
    path.push(n);
    let i = n.keys.findIndex(k => k > key);
    if (i === -1) i = n.keys.length;
    find(n.children[i]);
  })(root);

  if (!target) {
    snap([root.id], `Key ${key} not found in tree`, [], [root.id]);
    return { frames, newRoot: root };
  }

  for (let i = 0; i < path.length; i++)
    snap(path.slice(0, i + 1).map(n => n.id), `Delete ${key}: traversing tree`);

  snap([target!.id], `Found ${key} in node [${target!.keys.join(',')}]`, [], [target!.id]);

  if (isLeaf(target!)) {
    target!.keys.splice(targetKeyIdx, 1);
    const underflow = path.length > 1 && target!.keys.length < minKeys;
    snap([target!.id],
      underflow ? `Removed ${key} — underflow (${target!.keys.length} < min ${minKeys}) — fixing…` : `Removed ${key} from leaf`,
      underflow ? [] : [target!.id]);

    if (underflow && path.length > 1) {
      const parent = path[path.length - 2];
      const ci = parent.children.findIndex(c => c.id === target!.id);
      const left = ci > 0 ? parent.children[ci - 1] : null;
      const right = ci < parent.children.length - 1 ? parent.children[ci + 1] : null;

      if (left && left.keys.length > minKeys) {
        const borrowed = left.keys.pop()!;
        const sepKey = parent.keys[ci - 1];
        parent.keys[ci - 1] = borrowed;
        target!.keys.unshift(sepKey);
        snap([parent.id, left.id, target!.id], `Rotated right: borrowed ${borrowed} from left sibling via parent`, [target!.id]);
      } else if (right && right.keys.length > minKeys) {
        const borrowed = right.keys.shift()!;
        const sepKey = parent.keys[ci];
        parent.keys[ci] = borrowed;
        target!.keys.push(sepKey);
        snap([parent.id, target!.id, right.id], `Rotated left: borrowed ${borrowed} from right sibling via parent`, [target!.id]);
      } else if (left) {
        const sepKey = parent.keys.splice(ci - 1, 1)[0];
        left.keys.push(sepKey, ...target!.keys);
        parent.children.splice(ci, 1);
        snap([parent.id, left.id], `Merged with left sibling, pulled separator ${sepKey} down`, [left.id]);
      } else if (right) {
        const sepKey = parent.keys.splice(ci, 1)[0];
        target!.keys.push(sepKey, ...right.keys);
        parent.children.splice(ci + 1, 1);
        snap([parent.id, target!.id], `Merged with right sibling, pulled separator ${sepKey} down`, [target!.id]);
      }

      // If root is now empty
      if (root.keys.length === 0 && root.children.length === 1) {
        root = root.children[0];
        snap([root.id], `Root emptied — promoting only child as new root`, [root.id]);
      }
    }
  } else {
    // Internal node: replace with in-order predecessor
    let pred = target!.children[targetKeyIdx];
    while (!isLeaf(pred)) pred = pred.children[pred.children.length - 1];
    const predKey = pred.keys[pred.keys.length - 1];
    snap([target!.id, pred.id], `Internal node — replacing ${key} with in-order predecessor ${predKey}`);
    target!.keys[targetKeyIdx] = predKey;
    pred.keys.pop();
    snap([target!.id, pred.id], `Swapped ${key} → ${predKey}, removed ${predKey} from leaf`, [target!.id]);
  }

  snap([], `Delete of ${key} complete`);
  return { frames, newRoot: root };
}

// ─── SVG Tree Renderer ────────────────────────────────────────────────────────

function TreeSVG({ frame }: { frame: Frame }) {
  const { pos, W, H } = computeLayout(frame.root);
  const hlSet = new Set(frame.hl);
  const okSet = new Set(frame.ok);
  const errSet = new Set(frame.err);

  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  function collectEdges(n: BNode) {
    if (isLeaf(n)) return;
    const p = pos.get(n.id)!;
    for (const child of n.children) {
      const c = pos.get(child.id)!;
      edges.push({ x1: p.x + p.w / 2, y1: p.y + NH, x2: c.x + c.w / 2, y2: c.y });
      collectEdges(child);
    }
  }
  collectEdges(frame.root);

  const nodes = allNodes(frame.root);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: Math.min(380, H) }}>
      <rect width={W} height={H} fill="white" />
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#94a3b8" strokeWidth={1.5} />
      ))}
      {nodes.map(n => {
        const p = pos.get(n.id);
        if (!p) return null;
        const isOk  = okSet.has(n.id);
        const isErr = errSet.has(n.id);
        const isHl  = hlSet.has(n.id);
        const fill   = isOk ? "#d1fae5" : isErr ? "#fee2e2" : isHl ? "#fef3c7" : "#f8fafc";
        const stroke = isOk ? "#10b981" : isErr ? "#ef4444" : isHl ? "#f59e0b" : "#94a3b8";
        const sw     = (isOk || isErr || isHl) ? 2 : 1;
        const tc     = isOk ? "#065f46" : isErr ? "#991b1b" : isHl ? "#78350f" : "#1e293b";
        return (
          <g key={n.id}>
            <rect x={p.x} y={p.y} width={p.w} height={NH} rx={6} fill={fill} stroke={stroke} strokeWidth={sw} />
            {n.keys.map((k, ki) => (
              <g key={ki}>
                {ki > 0 && (
                  <line x1={p.x + PAD + ki * KW} y1={p.y + 5} x2={p.x + PAD + ki * KW} y2={p.y + NH - 5}
                    stroke={stroke} strokeWidth={0.5} />
                )}
                <text
                  x={p.x + PAD + ki * KW + KW / 2} y={p.y + NH / 2}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={12} fontWeight="700" fill={tc} fontFamily="monospace"
                >
                  {k}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const SPEED_MAP = { slow: 1100, medium: 650, fast: 300 };
type Speed = keyof typeof SPEED_MAP;

const DEFAULT_VALUES = [10, 20, 5, 6, 12, 30, 7, 17];

export interface BTreeExplorerProps {
  title?: string;
  caption?: string;
  order?: number;
  initialValues?: number[];
}

export default function BTreeExplorer({
  title,
  caption,
  order = 3,
  initialValues = DEFAULT_VALUES,
}: BTreeExplorerProps) {
  const maxKeys = order;
  const minKeys = Math.floor(maxKeys / 2);

  const [tree, setTree] = useState<BNode>(() => buildInitialTree(initialValues, maxKeys));
  const [frames, setFrames] = useState<Frame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>("medium");
  const [insertVal, setInsertVal] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [deleteVal, setDeleteVal] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentFrame = frameIdx >= 0 && frameIdx < frames.length ? frames[frameIdx] : null;
  const displayRoot = currentFrame ? currentFrame.root : tree;
  const status = currentFrame ? currentFrame.status : `B-tree (order ${maxKeys}) — max ${maxKeys} keys per node, min ${minKeys}`;

  const advance = useCallback(() => {
    setFrameIdx(i => {
      if (i >= frames.length - 1) { setIsPlaying(false); return i; }
      return i + 1;
    });
  }, [frames.length]);

  useEffect(() => {
    if (!isPlaying) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(advance, SPEED_MAP[speed]);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, advance, speed]);

  // Commit final tree when animation finishes
  useEffect(() => {
    if (!isPlaying && frames.length > 0 && frameIdx === frames.length - 1) {
      const last = frames[frames.length - 1];
      setTree(deepClone(last.root));
    }
  }, [isPlaying, frames, frameIdx]);

  function runOp(newFrames: Frame[], finalRoot: BNode) {
    if (timerRef.current) clearInterval(timerRef.current);
    setFrames(newFrames);
    setFrameIdx(0);
    setIsPlaying(true);
    setTree(finalRoot);
  }

  function handleInsert() {
    const v = parseInt(insertVal, 10);
    if (isNaN(v)) return;
    const { frames: f, newRoot } = buildInsertFrames(tree, v, maxKeys);
    runOp(f, newRoot);
    setInsertVal("");
  }

  function handleSearch() {
    const v = parseInt(searchVal, 10);
    if (isNaN(v)) return;
    const f = buildSearchFrames(tree, v);
    setFrames(f);
    setFrameIdx(0);
    setIsPlaying(true);
    setSearchVal("");
  }

  function handleDelete() {
    const v = parseInt(deleteVal, 10);
    if (isNaN(v)) return;
    const { frames: f, newRoot } = buildDeleteFrames(tree, v, maxKeys);
    runOp(f, newRoot);
    setDeleteVal("");
  }

  function handleReset() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTree(buildInitialTree(initialValues, maxKeys));
    setFrames([]);
    setFrameIdx(-1);
    setIsPlaying(false);
  }

  const isLastFrame = frameIdx >= frames.length - 1;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "Insert", val: insertVal, setVal: setInsertVal, action: handleInsert, color: "bg-teal-600 hover:bg-teal-700" },
          { label: "Search", val: searchVal, setVal: setSearchVal, action: handleSearch, color: "bg-blue-600 hover:bg-blue-700" },
          { label: "Delete", val: deleteVal, setVal: setDeleteVal, action: handleDelete, color: "bg-rose-600 hover:bg-rose-700" },
        ].map(op => (
          <div key={op.label} className="flex items-center gap-1">
            <input
              type="number"
              value={op.val}
              onChange={e => op.setVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && op.action()}
              placeholder="key"
              className="h-8 w-16 rounded-lg border border-gray-200 bg-white px-2 text-center font-mono text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
            <button
              type="button"
              onClick={op.action}
              className={cn("h-8 rounded-lg px-3 text-xs font-semibold text-white transition", op.color)}
            >
              {op.label}
            </button>
          </div>
        ))}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-2 dark:border-gray-700">
          <span className="text-[10px] text-gray-400">Speed:</span>
          {(["slow", "medium", "fast"] as Speed[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={cn("h-6 rounded px-2 text-[10px] font-medium transition",
                s === speed ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300")}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ↩ Reset
        </button>
      </div>

      {/* Tree SVG */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700">
        <div style={{ minWidth: 280 }}>
          <TreeSVG frame={{ root: displayRoot, hl: currentFrame?.hl ?? [], ok: currentFrame?.ok ?? [], err: currentFrame?.err ?? [], status: "" }} />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {[
          { color: "bg-amber-200 border-amber-400", label: "Traversal path" },
          { color: "bg-green-200 border-green-500", label: "Inserted / success" },
          { color: "bg-red-200 border-red-500", label: "Not found / error" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={cn("h-3 w-3 rounded border", l.color)} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="mt-3 min-h-[36px] rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {status}
      </div>

      {/* Playback controls */}
      {frames.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] text-gray-400">{frameIdx + 1}/{frames.length}</span>
          <button
            type="button"
            disabled={frameIdx <= 0}
            onClick={() => { setIsPlaying(false); setFrameIdx(i => Math.max(0, i - 1)); }}
            className="flex h-7 items-center rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            ←
          </button>
          <button
            type="button"
            disabled={isLastFrame}
            onClick={() => { setIsPlaying(false); setFrameIdx(i => Math.min(frames.length - 1, i + 1)); }}
            className="flex h-7 items-center rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => { if (isLastFrame) { setFrameIdx(0); setIsPlaying(true); } else { setIsPlaying(p => !p); } }}
            className={cn("flex h-7 items-center gap-1 rounded-lg px-3 text-xs font-semibold transition",
              isPlaying ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200" : "bg-violet-600 text-white hover:bg-violet-700")}
          >
            {isPlaying ? "⏸" : isLastFrame ? "↩" : "▶"}
          </button>
          <div className="ml-auto flex flex-1 items-center gap-1">
            {frames.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setIsPlaying(false); setFrameIdx(i); }}
                className={cn("h-1.5 flex-1 rounded-full transition",
                  i <= frameIdx ? "bg-violet-500" : "bg-gray-200 dark:bg-gray-700")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
