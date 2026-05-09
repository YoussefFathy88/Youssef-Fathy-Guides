"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface RecapRow {
  term: string;
  definition: string;
}

export interface RecapTableProps {
  rows?: RecapRow[];
}

export function RecapTable({ rows = [] }: RecapTableProps) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const reducedMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/50">
      <table className="w-full border-collapse text-left">
        <tbody>
          {safeRows.map((row, index) => (
            <motion.tr
              key={`${row.term}-${index}`}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{
                duration: 0.28,
                ease: "easeOut",
                delay: reducedMotion ? 0 : index * 0.08,
              }}
              className={index % 2 === 1 ? "bg-gray-50 dark:bg-gray-800/50" : undefined}
            >
              <td className="w-40 px-5 py-5 align-top font-mono text-base font-bold text-violet-700 dark:text-violet-300 sm:w-52 sm:px-6 md:text-lg">
                {row.term}
              </td>
              <td className="px-5 py-5 text-base font-medium leading-relaxed text-gray-800 dark:text-gray-200 sm:px-6 md:text-lg">
                {row.definition}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
