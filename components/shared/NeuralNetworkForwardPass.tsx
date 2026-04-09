"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

export interface NeuralNetworkForwardPassProps {
  title?: string;
  caption?: string;
  layers?: number[];
  inputLabels?: string[];
  outputLabels?: string[];
}

const DEFAULT_LAYERS = [3, 4, 4, 2];
const DEFAULT_INPUT_LABELS = ["Feature 1", "Feature 2", "Feature 3"];
const DEFAULT_OUTPUT_LABELS = ["Class A", "Class B"];

// Deterministic activation value based on layer + neuron index
function activation(li: number, ni: number): string {
  return (((li * 7 + ni * 13) % 89) / 100 + 0.05).toFixed(2);
}

const LAYER_LABELS_DEFAULT = ["Input", "Hidden 1", "Hidden 2", "Output"];
const ACTIVATION_FNS = ["—", "ReLU", "ReLU", "Softmax"];

const WIDTH = 520;
const HEIGHT = 280;
const NODE_R = 15;

export default function NeuralNetworkForwardPass({
  title,
  caption,
  layers = DEFAULT_LAYERS,
  inputLabels = DEFAULT_INPUT_LABELS,
  outputLabels = DEFAULT_OUTPUT_LABELS,
}: NeuralNetworkForwardPassProps) {
  const reducedMotion = useReducedMotion();
  const [activeLayer, setActiveLayer] = useState(-1);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const layerLabels = [
    "Input",
    ...Array.from({ length: layers.length - 2 }, (_, i) => `Hidden ${i + 1}`),
    "Output",
  ];

  const layerSpacing = WIDTH / (layers.length + 1);

  const nodePositions = layers.map((count, li) => {
    const x = layerSpacing * (li + 1);
    const maxNodes = Math.max(...layers);
    const vSpacing = (HEIGHT - 40) / Math.max(count, 1);
    return Array.from({ length: count }, (_, ni) => ({
      x,
      y: 20 + vSpacing * (ni + 0.5) + ((maxNodes - count) * vSpacing) / 2,
      li,
      ni,
    }));
  });

  const runForwardPass = useCallback(() => {
    if (running) return;
    setRunning(true);
    setActiveLayer(0);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const delay = reducedMotion ? 80 : 550;
    layers.forEach((_, i) => {
      const t = setTimeout(() => {
        setActiveLayer(i);
        if (i === layers.length - 1) {
          const t2 = setTimeout(() => setRunning(false), delay);
          timersRef.current.push(t2);
        }
      }, i * delay);
      timersRef.current.push(t);
    });
  }, [running, layers, reducedMotion]);

  const handleButton = () => {
    if (running) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveLayer(-1);
    setTimeout(runForwardPass, 40);
  };

  const isDone = activeLayer === layers.length - 1 && !running;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* SVG network */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          style={{ minWidth: 320, maxHeight: 300 }}
          aria-label="Neural network diagram"
        >
          {/* Edges */}
          {nodePositions.slice(0, -1).map((layer, li) =>
            layer.flatMap(from =>
              nodePositions[li + 1].map(to => {
                const edgeActive = activeLayer > li;
                return (
                  <line
                    key={`e-${li}-${from.ni}-${to.ni}`}
                    x1={from.x + NODE_R}
                    y1={from.y}
                    x2={to.x - NODE_R}
                    y2={to.y}
                    stroke={edgeActive ? "#7c3aed" : "#e2e8f0"}
                    strokeWidth={edgeActive ? 1.5 : 0.8}
                    strokeOpacity={edgeActive ? 0.65 : 0.5}
                    className="transition-all duration-300"
                  />
                );
              })
            )
          )}

          {/* Nodes */}
          {nodePositions.map((layer, li) =>
            layer.map(node => {
              const isActive = activeLayer === li;
              const isDoneNode = activeLayer > li;
              return (
                <g key={`n-${li}-${node.ni}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_R}
                    fill={isActive ? "#7c3aed" : isDoneNode ? "#5eead4" : "#f1f5f9"}
                    stroke={isActive ? "#5b21b6" : isDoneNode ? "#14b8a6" : "#cbd5e1"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="transition-all duration-300"
                  />
                  {(isActive || isDoneNode) && (
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fontSize={8}
                      fill="white"
                      fontWeight="700"
                    >
                      {activation(li, node.ni)}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* Input labels */}
          {nodePositions[0].map((node, ni) => (
            <text
              key={`in-${ni}`}
              x={node.x - NODE_R - 4}
              y={node.y + 4}
              textAnchor="end"
              fontSize={8.5}
              fill="#94a3b8"
            >
              {inputLabels[ni] ?? `x${ni + 1}`}
            </text>
          ))}

          {/* Output labels */}
          {nodePositions[nodePositions.length - 1].map((node, ni) => (
            <text
              key={`out-${ni}`}
              x={node.x + NODE_R + 4}
              y={node.y + 4}
              textAnchor="start"
              fontSize={8.5}
              fill={activeLayer >= layers.length - 1 ? "#14b8a6" : "#94a3b8"}
            >
              {outputLabels[ni] ?? `y${ni + 1}`}
            </text>
          ))}

          {/* Layer labels at bottom */}
          {nodePositions.map((_, li) => (
            <text
              key={`ll-${li}`}
              x={layerSpacing * (li + 1)}
              y={HEIGHT - 4}
              textAnchor="middle"
              fontSize={8.5}
              fill="#94a3b8"
            >
              {layerLabels[li] ?? `L${li}`}
            </text>
          ))}
        </svg>
      </div>

      {/* Layer info strip */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {layers.map((count, li) => {
          const isActive = activeLayer === li;
          const isDoneLayer = activeLayer > li;
          return (
            <div
              key={li}
              className={cn(
                "flex min-w-[76px] flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 text-center transition-colors",
                isActive
                  ? "border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10"
                  : isDoneLayer
                  ? "border-teal-300 bg-teal-50 dark:border-teal-500/40 dark:bg-teal-500/10"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
              )}
            >
              <span className={cn(
                "text-[10px] font-semibold",
                isActive ? "text-violet-700 dark:text-violet-300"
                  : isDoneLayer ? "text-teal-700 dark:text-teal-300"
                  : "text-gray-500 dark:text-gray-400",
              )}>
                {LAYER_LABELS_DEFAULT[li] ?? layerLabels[li]}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{count} neurons</span>
              <span className="text-[9px] italic text-gray-400 dark:text-gray-500">
                {ACTIVATION_FNS[li] ?? "ReLU"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status + run button */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="flex-1 text-xs text-gray-500 dark:text-gray-400">
          {activeLayer === -1
            ? "Click 'Run Forward Pass' to animate signal propagation through each layer."
            : running
            ? `Activating ${layerLabels[activeLayer]}…`
            : isDone
            ? "Forward pass complete — Softmax converts output logits to class probabilities."
            : `Layer ${activeLayer + 1} active.`}
        </p>
        <button
          type="button"
          disabled={running}
          onClick={handleButton}
          className={cn(
            "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
            running
              ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
              : "bg-violet-600 text-white hover:bg-violet-700",
          )}
        >
          {running ? "Running…" : isDone ? "↩ Reset & Run" : "▶ Run Forward Pass"}
        </button>
      </div>
    </motion.div>
  );
}
