"use client";

import { Fragment, useMemo } from "react";

export interface EmbeddingVectorsTableProps {
  title?: string;
  caption?: string;
  tokens: string[];
  /** When length matches `tokens`, first column shows `8842 (The)` — row index in the embedding matrix. */
  ids?: number[];
  /** Width of each mock embedding vector (keep small for slides). */
  dim?: number;
}

/** Deterministic mock embedding values in roughly [-1, 1] for reproducible slides. */
function mockEmbeddingValues(token: string, position: number, dim: number): number[] {
  return Array.from({ length: dim }, (_, j) => {
    let h = position * 47465291 + j * 2987654321;
    for (let c = 0; c < token.length; c++) {
      h = Math.imul(h ^ token.charCodeAt(c), 1597334677);
    }
    const u = ((h >>> 0) % 20000) / 10000 - 1;
    return Math.round(u * 100) / 100;
  });
}

export default function EmbeddingVectorsTable({
  title,
  caption,
  tokens,
  ids,
  dim: dimProp,
}: EmbeddingVectorsTableProps) {
  const dim = Math.min(12, Math.max(4, Math.round(dimProp ?? 8)));
  const showIds = Boolean(ids && ids.length === tokens.length);

  const rows = useMemo(
    () =>
      tokens.map((tok, pos) => ({
        tok,
        pos,
        id: showIds ? ids![pos]! : undefined,
        vec: mockEmbeddingValues(tok, pos, dim),
      })),
    [tokens, dim, ids, showIds],
  );

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-10 dark:border-gray-700 dark:bg-gray-800 shadow-sm">
      {(title || caption) && (
        <div className="mb-6 space-y-3 md:mb-10">
          {title && (
            <h2 className="text-xl font-black tracking-tight text-gray-900 md:text-3xl dark:text-gray-100">
              {title}
            </h2>
          )}
          {caption && (
            <p className="text-lg font-medium leading-relaxed text-gray-600 md:text-xl dark:text-gray-300">{caption}</p>
          )}
        </div>
      )}

      {tokens.length === 0 ? (
        <p className="text-lg text-gray-600 md:text-xl dark:text-gray-300 font-bold">Pass at least one token.</p>
      ) : (
        <div className="space-y-8 md:space-y-12">
          <p className="text-balance text-xl font-bold leading-relaxed text-gray-800 md:text-3xl dark:text-gray-100">
            Each token ID selects one row from a learned embedding matrix. That row is a real-valued{" "}
            <strong className="font-black text-gray-950 dark:text-white underline underline-offset-8 decoration-blue-500/30">vector</strong> — an ordered list of{" "}
            <strong className="font-black text-gray-950 dark:text-white">{dim}</strong> numbers.
          </p>

          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-md">
            <table className="w-full min-w-[300px] border-collapse text-left md:min-w-[480px]">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-900/90">
                  <th className="w-[min(36%,220px)] px-6 py-6 text-lg font-black text-gray-900 md:px-8 md:py-8 md:text-xl dark:text-gray-100 uppercase tracking-widest">
                    {showIds ? "Token ID" : "Token"}
                  </th>
                  <th className="px-6 py-6 text-lg font-black text-gray-900 md:px-8 md:py-8 md:text-xl dark:text-gray-100 uppercase tracking-widest">
                    Embedding vector
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ tok, pos, id, vec }) => (
                  <tr
                    key={id !== undefined ? `id-${id}` : `${tok}-${pos}`}
                    className="border-b border-gray-200 last:border-0 dark:border-gray-600/80 hover:bg-gray-200/30 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-6 align-top text-xl font-black text-gray-950 md:px-8 md:py-8 md:text-3xl dark:text-white">
                      {showIds && id !== undefined ? (
                        <>
                          <span className="font-mono tabular-nums tracking-tight text-blue-600 dark:text-blue-400">{id}</span>{" "}
                          <span className="font-black text-gray-500 dark:text-gray-400 text-base md:text-lg">({tok})</span>
                        </>
                      ) : (
                        tok
                      )}
                    </td>
                    <td className="px-6 py-6 md:px-8 md:py-8">
                      <p className="font-mono text-lg font-black tabular-nums leading-relaxed text-gray-900 md:text-2xl dark:text-gray-100">
                        <span className="text-gray-400 dark:text-gray-500 mr-2">[</span>
                        {vec.map((v, vi) => (
                          <Fragment key={vi}>
                            {vi > 0 ? <span className="text-gray-300 dark:text-gray-600">, </span> : null}
                            <span className="mx-1 inline-block rounded-xl bg-white px-3 py-2 align-middle text-center shadow-lg ring-1 ring-gray-200 md:px-4 md:py-3 dark:bg-gray-800 dark:ring-gray-600 border-b-4 border-gray-100 dark:border-gray-700">
                              {v.toFixed(2)}
                            </span>
                          </Fragment>
                        ))}
                        <span className="text-gray-400 dark:text-gray-500 ml-2">]</span>
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
