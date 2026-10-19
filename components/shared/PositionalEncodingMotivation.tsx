"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PositionalEncodingMotivation() {
  const [step, setStep] = useState(0);

  return (
    <div className="surface-panel w-full p-8 md:p-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-4xl">Why Positional Encoding?</h2>
          <p className="mt-3 text-xl font-medium text-slate-600 dark:text-slate-400 md:text-2xl">Visualizing why the model needs to know order.</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-3 w-10 rounded-full transition-all",
                step === i ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" : "bg-gray-900/[0.07] dark:bg-white/10"
              )}
            />
          ))}
        </div>
      </div>

      <div className="min-h-[440px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-raw"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="badge-slate text-xl px-5 py-2">Step 1</div>
                <h3 className="text-4xl font-black text-gray-950 dark:text-white md:text-5xl">Raw Embedding Table</h3>
              </div>
              
              <div className="w-full overflow-hidden rounded-3xl border-2 border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 shadow-2xl mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xl md:text-3xl">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        <th className="p-6 font-bold min-w-[120px]">Word</th>
                        <th className="p-6 whitespace-nowrap">Is a person</th>
                        <th className="p-6 whitespace-nowrap">Is an action</th>
                        <th className="p-6 whitespace-nowrap">Doing the action</th>
                        <th className="p-6 whitespace-nowrap">Receiving the action</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-slate-600 dark:text-slate-400">
                      {[
                        { w: "Ahmed", v: [0.8, 0.0, 0.0, 0.0] },
                        { w: "Sara",  v: [0.8, 0.0, 0.0, 0.0] },
                        { w: "loves", v: [0.0, 0.9, 0.0, 0.0] },
                      ].map((row, i) => (
                        <motion.tr 
                          key={row.w} 
                          className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-900/[0.07] dark:hover:bg-white/10 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <td className="p-6 font-sans font-bold text-gray-950 dark:text-white">{row.w}</td>
                          {row.v.map((val, j) => (
                            <td key={j} className={cn("p-6", val > 0 ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-500 opacity-60")}>
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
              key="step-pe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="badge-emerald text-xl px-5 py-2">Step 2</div>
                <h3 className="text-4xl font-black text-gray-950 dark:text-white md:text-5xl">Positional Encoding — The 3 Constant Vectors</h3>
              </div>
              
              <div className="w-full overflow-hidden rounded-3xl border-2 border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 shadow-2xl mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xl md:text-3xl">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        <th className="p-6 font-bold min-w-[120px]">Position</th>
                        <th className="p-6 whitespace-nowrap">Slot meaning</th>
                        <th className="p-6 whitespace-nowrap text-center">d1</th>
                        <th className="p-6 whitespace-nowrap text-center">d2</th>
                        <th className="p-6 whitespace-nowrap text-center">d3</th>
                        <th className="p-6 whitespace-nowrap text-center">d4</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-slate-600 dark:text-slate-400">
                      {[
                        { pos: "PE[0]", meaning: "Who is doing the action",       v: [0.0, 0.0, 0.5, 0.0] },
                        { pos: "PE[1]", meaning: "The action itself",             v: [0.0, 0.3, 0.0, 0.0] },
                        { pos: "PE[2]", meaning: "Who is receiving the action",   v: [0.0, 0.0, 0.0, 0.5] },
                      ].map((row, i) => (
                        <motion.tr 
                          key={row.pos} 
                          className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-900/[0.07] dark:hover:bg-white/10 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <td className="p-6 font-sans font-bold text-emerald-700 dark:text-emerald-400">{row.pos}</td>
                          <td className="p-6 font-sans text-slate-700 dark:text-slate-300">{row.meaning}</td>
                          {row.v.map((val, j) => (
                            <td key={j} className={cn("p-6 text-center", val > 0 ? "text-gray-950 dark:text-white font-bold" : "text-slate-600 dark:text-slate-500 opacity-60")}>
                              {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
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

          {step === 2 && (
            <motion.div
              key="step-result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="badge-violet text-xl px-5 py-2">Step 3</div>
                <h3 className="text-4xl font-black text-gray-950 dark:text-white md:text-5xl">After Positional Encoding — "Ahmed loves Sara"</h3>
              </div>
              
              <div className="mt-4 space-y-6">
                <div className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-950 p-6 shadow-inner font-mono text-xl md:text-2xl text-slate-700 dark:text-slate-300">
                  <h4 className="text-2xl font-bold font-sans text-gray-950 dark:text-white mb-4">Calculation</h4>
                  <div className="space-y-3">
                    <div className="flex gap-4"><span className="w-32">Ahmed + PE[0]:</span> <span>[0.8, 0.0,     0.0+0.5, 0.0    ]</span></div>
                    <div className="flex gap-4"><span className="w-32">loves + PE[1]:</span> <span>[0.0, 0.9+0.3, 0.0,     0.0    ]</span></div>
                    <div className="flex gap-4"><span className="w-32">Sara  + PE[2]:</span> <span>[0.8, 0.0,     0.0,     0.0+0.5]</span></div>
                  </div>
                </div>

                <div className="w-full overflow-hidden rounded-3xl border-2 border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xl md:text-3xl">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 text-slate-700 dark:text-slate-300">
                          <th className="p-6 font-bold min-w-[120px]">Token</th>
                          <th className="p-6 whitespace-nowrap text-center">Is a person</th>
                          <th className="p-6 whitespace-nowrap text-center">Is an action</th>
                          <th className="p-6 whitespace-nowrap text-center">Doing the action</th>
                          <th className="p-6 whitespace-nowrap text-center">Receiving the action</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-slate-600 dark:text-slate-400">
                        {[
                          { w: "Ahmed", v: [0.8, 0.0, 0.5, 0.0] },
                          { w: "loves", v: [0.0, 1.2, 0.0, 0.0] },
                          { w: "Sara",  v: [0.8, 0.0, 0.0, 0.5] },
                        ].map((row, i) => (
                          <motion.tr 
                            key={row.w} 
                            className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-900/[0.07] dark:hover:bg-white/10 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <td className="p-6 font-sans font-bold text-gray-950 dark:text-white">{row.w}</td>
                            {row.v.map((val, j) => (
                              <td key={j} className={cn("p-6 text-center", val > 0 ? (val > 0.9 ? "text-violet-700 dark:text-violet-400 font-bold" : (j >= 2 ? "text-amber-700 dark:text-amber-400 font-bold" : "text-emerald-700 dark:text-emerald-400 font-bold")) : "text-slate-600 dark:text-slate-500 opacity-60")}>
                                {val.toFixed(1)}
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-center gap-6">
        <button
          onClick={() => setStep(prev => Math.max(0, prev - 1))}
          className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-900/[0.04] dark:bg-white/5 px-8 py-4 text-xl font-black text-gray-950 dark:text-white transition hover:bg-gray-900/[0.07] dark:hover:bg-white/10 disabled:opacity-20 active:scale-95 shadow-xl"
          disabled={step === 0}
        >
          Previous
        </button>
        <button
          onClick={() => {
            if (step === 2) {
              setStep(0);
            } else {
              setStep(prev => prev + 1);
            }
          }}
          className="rounded-xl bg-emerald-600 px-10 py-4 text-xl font-black text-white shadow-2xl shadow-emerald-900/40 transition hover:bg-emerald-500 active:scale-95"
        >
          {step === 2 ? "Restart Story" : "Next Part"}
        </button>
      </div>
    </div>
  );
}
