/**
 * Serializable fixtures for the session component gallery.
 * Interactive demos are assembled in gallery-demos.tsx.
 */

export const embeddingSearchFixture = {
  title: "Semantic ticket router — powered by embeddings",
  caption:
    "Type a ticket (or pick a preset), press Start walkthrough, then use Next at each stage to see tokenizing, embedding, similarity scores, and the final route.",
  placeholder: "e.g. I can't log into my account after the update",
  presets: [
    "can't log in after resetting my password",
    "my invoice shows the wrong amount",
    "the app crashes when I open the dashboard",
    "how do I add a new team member?",
    "I was charged twice this month",
    "export to CSV is not working",
    "forgot my two-factor auth device",
  ],
  categories: [
    {
      id: "auth",
      label: "Authentication & Access",
      centroidLabel: "login, password, MFA, locked out, access denied",
      color: "blue" as const,
      icon: "🔐",
    },
    {
      id: "billing",
      label: "Billing & Payments",
      centroidLabel: "invoice, charge, refund, subscription, payment failed",
      color: "amber" as const,
      icon: "💳",
    },
    {
      id: "bugs",
      label: "Bug Reports",
      centroidLabel: "crash, error, broken, not working, unexpected behaviour",
      color: "red" as const,
      icon: "🐛",
    },
    {
      id: "account",
      label: "Account Management",
      centroidLabel: "add user, team, permissions, role, invite, settings",
      color: "teal" as const,
      icon: "👥",
    },
    {
      id: "data",
      label: "Data & Exports",
      centroidLabel: "export, download, CSV, report, sync, import",
      color: "violet" as const,
      icon: "📊",
    },
  ],
  stages: [
    {
      id: "tokenize",
      label: "Stage 1 — Tokenize the ticket",
      description:
        "The ticket text is split into tokens, the same process covered in the previous session.",
    },
    {
      id: "embed",
      label: "Stage 2 — Embed into vector space",
      description:
        "The embedding model maps the token sequence to a single fixed-length vector. This vector is the semantic fingerprint of the ticket.",
    },
    {
      id: "compare",
      label: "Stage 3 — Cosine similarity against every category",
      description:
        "The ticket vector is compared to each category centroid. The score is the cosine of the angle between them — 1.0 is identical direction, 0.0 is orthogonal.",
    },
    {
      id: "route",
      label: "Stage 4 — Route to the winning category",
      description:
        "The category with the highest cosine similarity score is assigned. No keywords. No rules. Just geometry.",
    },
  ],
};

export const contextLimitStepsFixture = [
  {
    id: "s1",
    label: "Step 1 — Lawyer pastes the full contract",
    caption:
      "A 15,000-word merger agreement lands in the input box. At 1.3 tokens per word for legal text, this is 20,000 tokens before anything else enters the context.",
    blocks: [{ id: "contract", label: "Contract (20,000 tokens)", tokens: 20000, color: "rose" as const }],
    sideNote: null,
    errorState: false,
    resetBar: false,
  },
  {
    id: "s2",
    label: "Step 2 — System prompt loads",
    caption:
      "The app prepends a 1,000-token system prompt: role instructions, output format rules, jurisdiction notes, and disclaimers. Running total: 21,000 tokens.",
    blocks: [
      { id: "contract", label: "Contract (20,000 tokens)", tokens: 20000, color: "rose" as const },
      { id: "system", label: "System prompt (1,000 tokens)", tokens: 1000, color: "gray" as const },
    ],
    sideNote: "21,000 / 128,000 tokens used",
    errorState: false,
    resetBar: false,
  },
  {
    id: "s3",
    label: "Step 3 — Conversation history accumulates",
    caption:
      "Five back-and-forth turns from earlier in the session add another 4,000 tokens. Running total: 25,000. Still under a 128k limit — but already over a 16k or 32k model.",
    blocks: [
      { id: "contract", label: "Contract (20,000 tokens)", tokens: 20000, color: "rose" as const },
      { id: "system", label: "System prompt (1,000 tokens)", tokens: 1000, color: "gray" as const },
      { id: "history", label: "Chat history (4,000 tokens)", tokens: 4000, color: "amber" as const },
    ],
    sideNote: "⚠️ 25,000 tokens — over 16k and 32k model limits",
    errorState: false,
    resetBar: false,
  },
  {
    id: "s4",
    label: "Step 4 — Context limit hit on a smaller model",
    caption:
      "The lawyer submits a question. The API returns context_length_exceeded. The app either crashes or silently truncates the oldest content — dropping part of the contract the answer depended on.",
    blocks: [
      { id: "contract", label: "Contract (20,000 tokens)", tokens: 20000, color: "rose" as const },
      { id: "system", label: "System prompt (1,000 tokens)", tokens: 1000, color: "gray" as const },
      { id: "history", label: "Chat history (4,000 tokens)", tokens: 4000, color: "amber" as const },
    ],
    sideNote: "❌ context_length_exceeded — API error or silent truncation",
    errorState: true,
    resetBar: false,
  },
  {
    id: "s5",
    label: "Step 5 — Fix: chunk the contract, retrieve only what's needed",
    caption:
      "The contract is split into 500-token sections at indexing time. Each question triggers a search over those sections. Only the 3 most relevant chunks (~1,920 tokens) enter the context instead of all 20,000. The limit is never approached.",
    blocks: [
      { id: "system", label: "System prompt (1,000 tokens)", tokens: 1000, color: "gray" as const },
      { id: "history", label: "Chat history (4,000 tokens)", tokens: 4000, color: "amber" as const },
      { id: "chunk1", label: "Chunk 1 — Liability clause (640 tokens)", tokens: 640, color: "teal" as const },
      { id: "chunk2", label: "Chunk 2 — Termination terms (640 tokens)", tokens: 640, color: "teal" as const },
      { id: "chunk3", label: "Chunk 3 — Payment schedule (640 tokens)", tokens: 640, color: "teal" as const },
    ],
    sideNote: "✅ 6,920 / 128,000 tokens — same answer, 10× fewer tokens",
    errorState: false,
    resetBar: true,
  },
];
