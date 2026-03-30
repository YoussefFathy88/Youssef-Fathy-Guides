"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface RecapRow {
  term: string;
  definition: string;
}

export interface RecapTableProps {
  rows: RecapRow[];
}

export function RecapTable({ rows }: RecapTableProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/50">
      <table className="w-full border-collapse text-left">
        <tbody>
          {rows.map((row, index) => (
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
              <td className="w-36 px-4 py-4 align-top font-mono text-sm font-medium text-violet-600 dark:text-violet-400 sm:w-44 sm:px-5">
                {row.term}
              </td>
              <td className="px-4 py-4 text-sm leading-7 text-gray-700 dark:text-gray-300 sm:px-5">
                {row.definition}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
