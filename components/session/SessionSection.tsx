"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SessionSectionProps {
  id: string;
  label: string;
  children: ReactNode;
}

export function SessionSection({ id, label, children }: SessionSectionProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "0px 0px -18% 0px",
  });

  return (
    <motion.section
      ref={ref}
      id={id}
      data-session-label={label}
      data-session-section="true"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={isInView || reducedMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "scroll-mt-28 border-t border-gray-100 pt-12 dark:border-gray-800 lg:scroll-mt-24",
        "[&:first-of-type]:border-transparent [&:first-of-type]:pt-0",
      )}
    >
      {children}
    </motion.section>
  );
}
