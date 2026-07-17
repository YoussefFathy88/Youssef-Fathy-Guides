/**
 * Canonical tokenization / BPE facts + teaching copy.
 * Hard numbers: data/facts/tokenization.json (Sennrich et al. 2015; Hugging Face LLM Course; Modal blog).
 * Components must import from here — do not duplicate stats in session UI files.
 */

import rawFacts from "./tokenization.json";

export const TOKENIZATION_FACTS = rawFacts;

/** Real-tokenizer vocabulary sizes, for the brief "vocabulary was built once, during training" note. */
export const TOKENIZER_VOCAB_EXAMPLES = [
  { model: "GPT-4", tokenizer: "cl100k_base", vocabSize: 100000 },
  { model: "GPT-4o", tokenizer: "o200k_base", vocabSize: 200000 },
] as const;
