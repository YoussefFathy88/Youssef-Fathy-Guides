"use client";

import { useReducedMotion } from "framer-motion";

import { GradientInstabilityMini } from "./gradient-instability-mini";

type GradientStory = "explode" | "vanish" | "layernorm";

export interface GradientInstabilityExplorerProps {
  title?: string;
  caption?: string;
  minimal?: boolean;
  /** Lock to one story (use one slide per concept in MDX). */
  story?: GradientStory;
}

export default function GradientInstabilityExplorer({
  title,
  caption,
  minimal = false,
  story,
}: GradientInstabilityExplorerProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="surface-panel w-full p-8 md:p-10">
      {!minimal ? (
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            {title ?? "Deep stacks: exploding & vanishing gradients"}
          </h2>
          <p className="text-base font-medium text-slate-300 md:text-lg">
            {caption ??
              "After attention, values can blow up or fade away — LayerNorm fixes this in the next step."}
          </p>
        </div>
      ) : null}
      <GradientInstabilityMini reducedMotion={!!reducedMotion} story={story} />
    </div>
  );
}
