/** Shared decoder teaching example — last token “?” drives every stage. */

export const DECODER_EXAMPLE_SENTENCE = "Is Cairo the capital of Egypt ?";

export const DECODER_EXAMPLE_TOKENS = [
  "Is",
  "Cairo",
  "the",
  "capital",
  "of",
  "Egypt",
  "?",
] as const;

export const DECODER_LAST_TOKEN_INDEX = DECODER_EXAMPLE_TOKENS.length - 1;

export const DECODER_LAST_TOKEN = "?";

/** Top logits after “?” for this yes/no question (teaching). */
export const DECODER_LM_CANDIDATES = [
  { token: "Yes", logit: 7.8, prob: 0.52 },
  { token: "No", logit: 6.2, prob: 0.28 },
  { token: "The", logit: 3.1, prob: 0.06 },
  { token: "It", logit: 2.4, prob: 0.04 },
] as const;
