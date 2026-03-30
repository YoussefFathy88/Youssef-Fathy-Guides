"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SessionSectionProps {
  id: string;
  label: string;
  children: ReactNode;
}

export function SessionSection({ id, label, children }: SessionSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      data-session-label={label}
      data-session-section="true"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -18% 0px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "scroll-mt-28 border-t border-gray-100 pt-12 dark:border-gray-800 lg:scroll-mt-24",
        "[&:first-of-type]:border-transparent [&:first-of-type]:pt-0 [&:last-of-type]:pt-8",
      )}
    >
      {children}
    </motion.section>
  );
}
