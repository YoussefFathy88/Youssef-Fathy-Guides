"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Dimension {
  label: string;
  value: number;
  description: string;
}

interface VectorPoint {
  id: string;
  label: string;
  angle: number;
  color: string;
}

export default function VectorAnatomyExplorer() {
  const [step, setStep] = useState(0);
  const [sampleIdx, setSampleIdx] = useState(0);

  const trainingSamples = [
    { text: ["The", "capital", "of", "Egypt", "is", "Cairo"], highlights: [3, 5] },
    { text: ["Cairo", "is", "the", "largest", "city", "in", "Egypt"], highlights: [0, 6] },
    { text: ["History", "of", "Ancient", "Egypt", "and", "Cairo"], highlights: [3, 5] },
  ];

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setSampleIdx(prev => (prev + 1) % trainingSamples.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [step, trainingSamples.length]);

  const dimensions: Dimension[] = [
    { label: "Geography / Locations", value: 0.82, description: "Is this token related to a place or country?" },
    { label: "Historical / Ancient", value: 0.75, description: "Does it evoke history or ancient civilizations?" },
    { label: "Grammar: Noun vs Verb", value: -0.15, description: "Syntactic role in the sentence." },
    { label: "Temperature / Climate", value: 0.68, description: "Associations with heat or desert environments." },
  ];

  const points: VectorPoint[] = [
    { id: "egypt", label: "Egypt", angle: 30, color: "#f59e0b" },
    { id: "cairo", label: "Cairo", angle: 35, color: "#fbbf24" },
    { id: "apple", label: "Apple", angle: 145, color: "#ef4444" },
  ];

  return (
    <div className="surface-panel w-full p-8 md:p-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Anatomy of a Vector</h2>
          <p className="mt-3 text-xl font-medium text-slate-400 md:text-2xl">Visualizing how meaning is compressed into numbers.</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-3 w-10 rounded-full transition-all",
                step === i ? "bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]" : "bg-white/10"
              )}
            />
          ))}
        </div>
      </div>

      <div className="min-h-[440px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-simple-table"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="badge-amber text-xl px-5 py-2">Mental Model</div>
                <h3 className="text-4xl font-black text-white md:text-5xl">The Embedding Table</h3>
              </div>

              <div className="w-full overflow-hidden rounded-3xl border-2 border-white/10 bg-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xl md:text-3xl">
                    <thead>
                      <tr className="border-b-2 border-white/10 bg-white/5 text-slate-300">
                        <th className="p-6 font-bold min-w-[120px]">Word</th>
                        <th className="p-6 whitespace-nowrap">Is living</th>
                        <th className="p-6 whitespace-nowrap">On land</th>
                        <th className="p-6 whitespace-nowrap">Can fly</th>
                        <th className="p-6 whitespace-nowrap">Wild</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-slate-400">
                      {[
                        { w: "Dog", v: [1.0, 1.0, 0.0, 0.2] },
                        { w: "Cat", v: [1.0, 1.0, 0.0, 0.1] },
                        { w: "Lion", v: [1.0, 1.0, 0.0, 0.9] },
                        { w: "Eagle", v: [1.0, 0.3, 1.0, 0.4] },
                        { w: "Fish", v: [1.0, 0.0, 0.0, 0.1] },
                        { w: "Animal", v: [1.0, 0.5, 0.2, 0.5] },
                        { w: "Dangerous", v: [0.0, 0.0, 0.0, 1.0] },
                      ].map((row, i) => (
                        <motion.tr
                          key={row.w}
                          className="border-b border-white/5 hover:bg-white/10 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <td className="p-6 font-sans font-bold text-white">{row.w}</td>
                          {row.v.map((val, j) => (
                            <td key={j} className={cn("p-6", val > 0 ? "text-amber-400 font-bold" : "text-slate-500 opacity-60")}>
                              {val.toFixed(1)}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-train"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-8 lg:grid-cols-2"
            >
              <div className="space-y-8">
                <div className="badge-indigo text-lg px-4 py-1.5">Behind the scenes: Training</div>
                <h3 className="text-4xl font-black text-white md:text-5xl">How were these learned?</h3>
                <p className="text-xl leading-relaxed text-slate-200 md:text-2xl">
                  The model reads billions of <strong className="text-white">training samples</strong>.
                  Every time "Egypt" and "Cairo" appear in the same context, it's a signal.
                </p>
                <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-6 shadow-inner">
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-3">Training Corpus</div>
                  {trainingSamples.map((sample, sIdx) => (
                    <div key={sIdx} className="flex flex-wrap gap-2 font-mono text-sm leading-tight md:text-base">
                      {sample.text.map((word, wIdx) => (
                        <span
                          key={wIdx}
                          className={cn(
                            "px-1 rounded transition-all duration-500",
                            sample.highlights.includes(wIdx)
                              ? (wIdx === sample.highlights[0] ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30" : "bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30")
                              : "opacity-30 text-white"
                          )}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="text-lg italic text-slate-400 font-medium">
                  "Repeated exposure across different samples reinforces the relationship."
                </p>
              </div>
              <div className="relative flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-slate-950 p-8 overflow-hidden">
                {/* Vector Drift Visualization */}
                <div className="relative h-40 w-full">
                  {/* Point A (Egypt) */}
                  <motion.div
                    className="absolute flex flex-col items-center gap-1"
                    animate={{ x: [20, 100], y: [20, 80] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  >
                    <div className="h-4 w-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                    <span className="text-[10px] font-bold text-amber-400">Egypt</span>
                  </motion.div>
                  {/* Point B (Cairo) */}
                  <motion.div
                    className="absolute flex flex-col items-center gap-1"
                    animate={{ x: [200, 120], y: [140, 95] }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  >
                    <div className="h-4 w-4 rounded-full bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.5)]" />
                    <span className="text-[10px] font-bold text-violet-300">Cairo</span>
                  </motion.div>

                  {/* Forces */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full border border-dashed border-white/10 animate-pulse" />
                    <div className="absolute text-[10px] text-white/10 uppercase tracking-widest font-black text-center max-w-[80px]">Statistical Attraction</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-lookup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-10 lg:grid-cols-2"
            >
              <div className="space-y-8">
                <div className="badge-violet text-lg px-4 py-1.5">Usage: The Lookup</div>
                <h3 className="text-4xl font-black text-white md:text-5xl">Grabbing the learned row</h3>
                <p className="text-xl leading-relaxed text-slate-200 md:text-2xl">
                  When the model is ready, it stores every word's meaning in a giant table called the
                  <strong className="text-white"> Embedding Matrix</strong>.
                </p>
                <p className="text-xl leading-relaxed text-slate-200 md:text-2xl">
                  When the ID <code className="text-amber-400 font-black px-2 py-1 bg-amber-400/10 rounded">5602</code> (Egypt) comes in, the model
                  simply performs a fast <strong className="text-white underline underline-offset-8 decoration-violet-500/50">lookup</strong> to pull its specific row.
                </p>
              </div>
              <div className="relative flex items-center justify-center p-4">
                <div className="grid grid-cols-8 gap-1.5 opacity-20">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="h-4 w-4 rounded-sm bg-white/20" />
                  ))}
                </div>
                <motion.div
                  layoutId="lookup-row"
                  className="absolute left-0 right-0 h-6 border-y border-violet-500/50 bg-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  animate={{ y: [0, -40, 20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute -left-4 font-mono text-xs text-violet-400 font-bold">Row 5602</div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-after-training"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-10 lg:grid-cols-2"
            >
              <div className="space-y-8">
                <div className="badge-sky text-lg px-4 py-1.5">Result: The Vectors</div>
                <h3 className="text-4xl font-black text-white md:text-5xl">Meaning = Numbers</h3>
                <p className="text-xl leading-relaxed text-slate-200 md:text-2xl">
                  After training, words with similar meanings end up having <strong className="text-white">similar numbers</strong> across their dimensions.
                </p>
                <p className="text-xl leading-relaxed text-slate-200 md:text-2xl">
                  Notice how "Egypt" and "Cairo" share very close values, while "Apple" is completely different.
                </p>
              </div>
              <div className="w-full overflow-hidden rounded-3xl border-2 border-white/10 bg-white/5 shadow-2xl flex flex-col justify-center">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xl md:text-2xl">
                    <thead>
                      <tr className="border-b-2 border-white/10 bg-white/5 text-slate-300">
                        <th className="p-6 font-bold min-w-[120px]">Word</th>
                        <th className="p-6 whitespace-nowrap">Dim 1</th>
                        <th className="p-6 whitespace-nowrap">Dim 2</th>
                        <th className="p-6 whitespace-nowrap">Dim 3</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-slate-400">
                      {[
                        { w: "Egypt", v: [0.82, 0.91, -0.15], color: "text-amber-400" },
                        { w: "Cairo", v: [0.78, 0.88, -0.12], color: "text-violet-400" },
                        { w: "Apple", v: [-0.95, 0.11, 0.84], color: "text-rose-400" },
                      ].map((row, i) => (
                        <motion.tr
                          key={row.w}
                          className="border-b border-white/5 hover:bg-white/10 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <td className={cn("p-6 font-sans font-bold", row.color)}>{row.w}</td>
                          {row.v.map((val, j) => (
                            <td key={j} className={cn("p-6", val > 0 ? "text-white font-bold" : "text-slate-500")}>
                              {val.toFixed(2)}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-geometry"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-8 lg:grid-cols-2"
            >
              <div className="space-y-8">
                <div className="badge-teal text-lg px-4 py-1.5">Geometry: The Angle</div>
                <h3 className="text-4xl font-black text-white md:text-5xl">Similarity is an Angle</h3>
                <p className="text-xl leading-relaxed text-slate-200 md:text-2xl">
                  Because these vectors have hundreds of dimensions, we use <strong className="text-white underline underline-offset-8 decoration-teal-500/50">Cosine Similarity</strong> to compare them.
                </p>
                <div className="space-y-6">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-xl font-black text-emerald-400">Near Angle = Similar Meaning</span>
                    </div>
                    <p className="mt-2 text-lg text-emerald-200/70 ml-8 font-medium">"Egypt" and "Cairo" point in the same direction.</p>
                  </div>
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 opacity-80 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-4 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                      <span className="text-xl font-black text-rose-400">Far Angle = Unrelated Meaning</span>
                    </div>
                    <p className="mt-2 text-lg text-rose-200/70 ml-8 font-medium">"Egypt" and "Apple" have a large angle between them.</p>
                  </div>
                </div>
              </div>
              <div className="relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-slate-950 p-4">
                <svg viewBox="-100 -100 200 200" className="h-full w-full">
                  {/* Axis */}
                  <line x1="-90" y1="0" x2="90" y2="0" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="-90" x2="0" y2="90" stroke="white" strokeOpacity="0.05" strokeWidth="1" />

                  {/* Vectors */}
                  {points.map((p) => {
                    const x = Math.cos((p.angle * Math.PI) / 180) * 80;
                    const y = -Math.sin((p.angle * Math.PI) / 180) * 80;
                    return (
                      <g key={p.id}>
                        <motion.line
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          x1="0" y1="0" x2={x} y2={y}
                          stroke={p.color}
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <motion.circle
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          cx={x} cy={y} r="4" fill={p.color}
                        />
                        <text
                          x={x + (x > 0 ? 8 : -8)}
                          y={y + (y > 0 ? 8 : -8)}
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor={x > 0 ? "start" : "end"}
                        >
                          {p.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Arc for Angle */}
                  <path
                    d="M 20,-11 A 23,23 0 0 1 19,-13"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                  <text x="30" y="-20" fill="#f59e0b" fontSize="8" fontWeight="black">Small θ</text>
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <div className="mt-12 flex justify-center gap-6">
        <button
          onClick={() => setStep(prev => Math.max(0, prev - 1))}
          className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-xl font-black text-white transition hover:bg-white/10 disabled:opacity-20 active:scale-95 shadow-xl"
          disabled={step === 0}
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (step === 4) {
              setStep(0);
            } else {
              setStep(prev => prev + 1);
            }
          }}
          className="rounded-xl bg-violet-600 px-10 py-4 text-xl font-black text-white shadow-2xl shadow-violet-900/40 transition hover:bg-violet-500 active:scale-95"
        >
          {step === 4 ? "Restart Story" : "Next Part"}
        </button>
      </div>
    </div>
  );
}

