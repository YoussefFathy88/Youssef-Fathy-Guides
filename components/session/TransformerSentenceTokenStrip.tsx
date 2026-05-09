"use client";

export interface TransformerSentenceTokenStripProps {
  /** Slide title inside the widget (optional — prefer MDX `##`). */
  title?: string;
  caption?: string;
  /** Word-level tokens (same length as `ids`). */
  tokens: string[];
  /** Synthetic vocabulary IDs for teaching. */
  ids: number[];
}

export default function TransformerSentenceTokenStrip({
  title,
  caption,
  tokens,
  ids,
}: TransformerSentenceTokenStripProps) {
  const ok = tokens.length > 0 && tokens.length === ids.length;

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

      {!ok ? (
        <p className="text-base text-amber-800 md:text-lg dark:text-amber-200">
          Pass the same number of <code>tokens</code> and <code>ids</code>.
        </p>
      ) : (
        <div className="space-y-8 md:space-y-10">
          <p className="text-balance text-base font-medium leading-relaxed text-gray-700 md:text-lg dark:text-gray-200">
            Word-level split for teaching; production models usually use subwords (BPE/SentencePiece).
          </p>

          <div>
            <p className="mb-3 text-base font-bold uppercase tracking-[0.12em] text-gray-700 md:mb-4 md:text-lg dark:text-gray-200">
              Tokens
            </p>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {tokens.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="rounded-xl bg-teal-500/15 px-4 py-3 text-lg font-bold tracking-tight text-teal-950 shadow-sm ring-1 ring-teal-600/15 md:px-6 md:py-4 md:text-2xl dark:bg-teal-500/25 dark:text-teal-50 dark:ring-teal-400/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400" aria-hidden="true">
            <div className="h-0.5 flex-1 bg-current opacity-60" />
            <span className="shrink-0 text-base font-bold uppercase tracking-[0.2em] md:text-lg">lookup</span>
            <div className="h-0.5 flex-1 bg-current opacity-60" />
          </div>

          <div>
            <p className="mb-3 text-base font-bold uppercase tracking-[0.12em] text-gray-700 md:mb-4 md:text-lg dark:text-gray-200">
              Integer IDs (vocabulary rows)
            </p>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {ids.map((id, i) => (
                <span
                  key={`id-${i}-${id}`}
                  className="rounded-xl bg-violet-500/15 px-4 py-3 font-mono text-lg font-bold tabular-nums tracking-tight text-violet-950 shadow-sm ring-1 ring-violet-600/15 md:px-6 md:py-4 md:text-2xl dark:bg-violet-500/25 dark:text-violet-50 dark:ring-violet-400/20"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
