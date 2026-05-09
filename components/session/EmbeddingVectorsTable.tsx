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
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-10 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-6 space-y-2 md:mb-8">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 md:text-xl dark:text-gray-100">
              {title}
            </h2>
          )}
          {caption && (
            <p className="text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">{caption}</p>
          )}
        </div>
      )}

      {tokens.length === 0 ? (
        <p className="text-base text-gray-600 md:text-lg dark:text-gray-300">Pass at least one token.</p>
      ) : (
        <div className="space-y-6 md:space-y-8">
          <p className="text-balance text-base font-medium leading-relaxed text-gray-800 md:text-lg dark:text-gray-100">
            Each token ID selects one row from a learned embedding matrix. That row is a real-valued{" "}
            <strong className="font-bold text-gray-950 dark:text-white">vector</strong> — an ordered list (array) of{" "}
            <strong className="font-bold text-gray-950 dark:text-white">{dim}</strong> numbers. Values below are
            illustrative only.
          </p>

          <div className="overflow-x-auto rounded-xl border-2 border-gray-200 dark:border-gray-600">
            <table className="w-full min-w-[300px] border-collapse text-left md:min-w-[480px]">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-900/90">
                  <th className="w-[min(36%,220px)] px-4 py-4 text-base font-bold text-gray-900 md:px-5 md:py-5 md:text-lg dark:text-gray-100">
                    {showIds ? "Token ID" : "Token"}
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-gray-900 md:px-5 md:py-5 md:text-lg dark:text-gray-100">
                    Embedding vector (dim {dim})
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ tok, pos, id, vec }) => (
                  <tr
                    key={id !== undefined ? `id-${id}` : `${tok}-${pos}`}
                    className="border-b border-gray-200 last:border-0 dark:border-gray-600/80"
                  >
                    <td className="px-4 py-4 align-top text-lg font-bold text-gray-950 md:px-5 md:py-5 md:text-xl dark:text-white">
                      {showIds && id !== undefined ? (
                        <>
                          <span className="font-mono tabular-nums tracking-tight">{id}</span>{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-300">({tok})</span>
                        </>
                      ) : (
                        tok
                      )}
                    </td>
                    <td className="px-4 py-4 md:px-5 md:py-5">
                      <p className="font-mono text-base font-semibold tabular-nums leading-relaxed text-gray-900 md:text-lg dark:text-gray-100">
                        <span className="text-gray-600 dark:text-gray-400">[</span>
                        {vec.map((v, vi) => (
                          <Fragment key={vi}>
                            {vi > 0 ? <span className="text-gray-400 dark:text-gray-500">, </span> : null}
                            <span className="mx-0.5 inline-block rounded-md bg-white px-2 py-1.5 align-middle text-center shadow-sm ring-1 ring-gray-200 md:px-2.5 md:py-2 dark:bg-gray-800 dark:ring-gray-600">
                              {v.toFixed(2)}
                            </span>
                          </Fragment>
                        ))}
                        <span className="text-gray-600 dark:text-gray-400">]</span>
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
