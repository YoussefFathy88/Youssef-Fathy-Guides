The Transformer: Attention Is All You Need

Module: 1 — The Engine Room
Session: E04
Duration: 20–25 min (extended — architecture depth justified)
Difficulty: Intermediate
Prev: embeddings
Next: tokenization


SECTION 1 — GOAL
Every LLM you've ever used — GPT, Claude, Gemini — runs on one architecture: the Transformer. This session traces the full story, from why sequential models broke down on language, to how a 2017 Google paper replaced them with pure attention. By the end you'll be able to mentally trace a sentence from raw text all the way through the Transformer's layers to the predicted next token — and understand exactly what happens at each step and why it was designed that way.

SECTION 2 — BIG PICTURE
Before the Transformer, the dominant paradigm for language was recurrence: read one word, update your memory, read the next word, update your memory again. It worked, but it had a fundamental ceiling — the longer the sentence, the more that early information got crushed by later updates. The Transformer threw that entire paradigm away. Instead of a rolling memory, it reads the whole sentence at once and lets every word directly vote on every other word's meaning.
The full architecture has two stacks: an Encoder that reads and understands the input, and a Decoder that generates the output token by token. Every modern LLM is a variant of this — GPT uses decoder-only, BERT uses encoder-only, the original translation model used both.
Component: NodeFlowDiagram
Title: "The Full Transformer Architecture"
Caption: "Click each numbered step to walk through the complete encoder-decoder data flow."
Content:
layout: "freeform"
viewport: "presentation"
height: 520

nodes:
  # Input side
  - { id: "raw",      label: "Raw Text",         sublabel: '"The cat sat"',     x: 60,  y: 240, shape: "rect", color: "gray",   size: "sm" }
  - { id: "tok",      label: "Tokenizer",         sublabel: "text → token IDs", x: 200, y: 240, shape: "rect", color: "gray",   size: "sm" }
  - { id: "emb",      label: "Input Embedding",   sublabel: "+ Positional Enc", x: 340, y: 240, shape: "rect", color: "teal",   size: "md" }

  # Encoder stack (3 visible layers representing 6)
  - { id: "enc1",     label: "Encoder Layer 1",   sublabel: "MHSA + FFN",       x: 500, y: 140, shape: "rect", color: "violet", size: "md" }
  - { id: "enc2",     label: "Encoder Layer 2",   sublabel: "MHSA + FFN",       x: 500, y: 240, shape: "rect", color: "violet", size: "md" }
  - { id: "enc3",     label: "Encoder Layer 6",   sublabel: "MHSA + FFN",       x: 500, y: 340, shape: "rect", color: "violet", size: "md" }
  - { id: "encout",   label: "Encoder Output",    sublabel: "context vectors",  x: 650, y: 240, shape: "rect", color: "violet", size: "sm" }

  # Decoder stack
  - { id: "dec1",     label: "Decoder Layer 1",   sublabel: "Masked MHSA + Cross-Attn + FFN", x: 800, y: 140, shape: "rect", color: "amber", size: "md" }
  - { id: "dec2",     label: "Decoder Layer 2",   sublabel: "Masked MHSA + Cross-Attn + FFN", x: 800, y: 240, shape: "rect", color: "amber", size: "md" }
  - { id: "dec3",     label: "Decoder Layer 6",   sublabel: "Masked MHSA + Cross-Attn + FFN", x: 800, y: 340, shape: "rect", color: "amber", size: "md" }

  # Output side
  - { id: "linear",  label: "Linear + Softmax",  sublabel: "scores over vocab", x: 960, y: 240, shape: "rect", color: "teal",   size: "sm" }
  - { id: "out",     label: "Predicted Token",   sublabel: '"mat"',             x: 1100,y: 240, shape: "circle", color: "blue", size: "md", emoji: "✅" }

  # Output embedding fed to decoder
  - { id: "outemb",  label: "Output Embedding",  sublabel: "+ Positional Enc",  x: 800, y: 440, shape: "rect", color: "teal",   size: "sm" }

edges:
  - { from: "raw",    to: "tok",    animated: true,  color: "gray" }
  - { from: "tok",    to: "emb",    animated: true,  color: "gray" }
  - { from: "emb",    to: "enc1",   animated: true,  color: "teal" }
  - { from: "emb",    to: "enc2",   animated: true,  color: "teal" }
  - { from: "emb",    to: "enc3",   animated: true,  color: "teal" }
  - { from: "enc1",   to: "encout", animated: true,  color: "violet" }
  - { from: "enc2",   to: "encout", animated: true,  color: "violet" }
  - { from: "enc3",   to: "encout", animated: true,  color: "violet" }
  - { from: "encout", to: "dec1",   animated: true,  color: "violet", label: "cross-attention keys+values" }
  - { from: "encout", to: "dec2",   animated: true,  color: "violet" }
  - { from: "encout", to: "dec3",   animated: true,  color: "violet" }
  - { from: "outemb", to: "dec1",   animated: true,  color: "amber" }
  - { from: "outemb", to: "dec2",   animated: true,  color: "amber" }
  - { from: "outemb", to: "dec3",   animated: true,  color: "amber" }
  - { from: "dec1",   to: "linear", animated: true,  color: "amber" }
  - { from: "dec2",   to: "linear", animated: true,  color: "amber" }
  - { from: "dec3",   to: "linear", animated: true,  color: "amber" }
  - { from: "linear", to: "out",    animated: true,  color: "blue" }

steps:
  - { id: "s1", label: "1 — Raw Input",       description: "Raw text enters the system and is split into token IDs by the tokenizer.",                                                      highlightNodes: ["raw","tok"],          highlightEdges: ["raw→tok"] }
  - { id: "s2", label: "2 — Embed + Position",description: "Token IDs are looked up in the embedding matrix. A positional encoding vector is added to each embedding.",                    highlightNodes: ["emb"],                highlightEdges: ["tok→emb"] }
  - { id: "s3", label: "3 — Encoder Stack",   description: "6 identical encoder layers process the embeddings. Each layer runs Multi-Head Self-Attention then a Feed-Forward Network.",    highlightNodes: ["enc1","enc2","enc3"], highlightEdges: ["emb→enc1","emb→enc2","emb→enc3"] }
  - { id: "s4", label: "4 — Encoder Output",  description: "The encoder produces one context vector per input token — a 512-dim representation enriched by all 6 layers of attention.",   highlightNodes: ["encout"],             highlightEdges: ["enc1→encout","enc2→encout","enc3→encout"] }
  - { id: "s5", label: "5 — Decoder Input",   description: "The decoder also receives the previously generated output tokens as embeddings (shifted right). Generation starts with a special start token.", highlightNodes: ["outemb"],      highlightEdges: [] }
  - { id: "s6", label: "6 — Decoder Stack",   description: "6 decoder layers each run: Masked Self-Attention (can't peek ahead), then Cross-Attention over encoder output, then FFN.",   highlightNodes: ["dec1","dec2","dec3"], highlightEdges: ["encout→dec1","encout→dec2","encout→dec3"] }
  - { id: "s7", label: "7 — Token Prediction",description: "The decoder output passes through a linear layer and softmax to produce a probability over the entire vocabulary. The top token is the prediction.", highlightNodes: ["linear","out"], highlightEdges: ["dec1→linear","linear→out"] }
Six problems the Transformer solves that RNNs couldn't: parallelizable training, direct long-range connections, no vanishing gradients across distance, consistent O(1) path length between any two tokens, scalable to massive datasets, and no hidden state bottleneck. The next six concepts each explain one piece of how it achieves this.

SECTION 3 — CORE CONCEPTS

Concept 1 — Why RNNs Broke: The Sequential Bottleneck
To understand why the Transformer was revolutionary, you need to feel the problem it solved. An RNN processes one token at a time. At each step it produces a hidden state — a fixed-size vector that carries everything the model has seen so far. The next step reads that hidden state plus the new token and produces a new hidden state, overwriting the old one.
The problem is brutal: every new token competes for space in that fixed vector. By the time you reach position 30 in a sentence, the signal from position 1 has been diluted through 29 overwriting operations. The model literally forgets the beginning of long sentences. Training is also slow — step 30 cannot start until step 29 finishes. There is no parallelism at all.
Component: NodeFlowDiagram
Title: "RNN: The Sequential Hidden State Problem"
Caption: "Click each step to watch the hidden state get overwritten token by token."
Content:
layout: "horizontal-flow"
viewport: "presentation"
height: 340

nodes:
  - { id: "t1",  label: "The",   sublabel: "token 1",  x: 80,  y: 100, shape: "rect",   color: "gray",   size: "sm" }
  - { id: "t2",  label: "cat",   sublabel: "token 2",  x: 80,  y: 200, shape: "rect",   color: "gray",   size: "sm" }
  - { id: "t3",  label: "sat",   sublabel: "token 3",  x: 80,  y: 300, shape: "rect",   color: "gray",   size: "sm" }
  - { id: "t4",  label: "on",    sublabel: "token 4",  x: 80,  y: 400, shape: "rect",   color: "gray",   size: "sm", emoji: "…" }

  - { id: "h0",  label: "h₀",    sublabel: "empty",    x: 250, y: 50,  shape: "circle", color: "gray",   size: "sm" }
  - { id: "h1",  label: "h₁",    sublabel: "sees: The", x: 250, y: 150, shape: "circle", color: "teal",  size: "md" }
  - { id: "h2",  label: "h₂",    sublabel: "mostly: cat", x: 250, y: 250, shape: "circle", color: "teal", size: "md" }
  - { id: "h3",  label: "h₃",    sublabel: "mostly: sat", x: 250, y: 350, shape: "circle", color: "amber", size: "md" }
  - { id: "h4",  label: "h₄",    sublabel: '"The" fading', x: 250, y: 450, shape: "circle", color: "rose", size: "md", emoji: "⚠️" }

  - { id: "rnn1", label: "RNN Cell", x: 420, y: 150, shape: "rect", color: "violet", size: "sm" }
  - { id: "rnn2", label: "RNN Cell", x: 420, y: 250, shape: "rect", color: "violet", size: "sm" }
  - { id: "rnn3", label: "RNN Cell", x: 420, y: 350, shape: "rect", color: "violet", size: "sm" }
  - { id: "rnn4", label: "RNN Cell", x: 420, y: 450, shape: "rect", color: "violet", size: "sm" }

  - { id: "warn", label: "Long-range lost!", sublabel: "token 1 info gone by step 30", x: 600, y: 300, shape: "hex", color: "rose", size: "md", emoji: "💥" }

edges:
  - { from: "h0",  to: "rnn1", animated: true,  color: "gray" }
  - { from: "t1",  to: "rnn1", animated: true,  color: "gray" }
  - { from: "rnn1",to: "h1",   animated: true,  color: "teal" }
  - { from: "h1",  to: "rnn2", animated: true,  color: "teal" }
  - { from: "t2",  to: "rnn2", animated: true,  color: "gray" }
  - { from: "rnn2",to: "h2",   animated: true,  color: "teal" }
  - { from: "h2",  to: "rnn3", animated: true,  color: "teal" }
  - { from: "t3",  to: "rnn3", animated: true,  color: "gray" }
  - { from: "rnn3",to: "h3",   animated: true,  color: "amber" }
  - { from: "h3",  to: "rnn4", animated: true,  color: "amber" }
  - { from: "t4",  to: "rnn4", animated: true,  color: "gray" }
  - { from: "rnn4",to: "h4",   animated: true,  color: "rose" }
  - { from: "h4",  to: "warn", animated: true,  color: "rose", dashed: true }

steps:
  - { id: "s1", label: "Step 1 — First token", description: "The RNN reads 'The' and produces hidden state h₁. This is the only place 'The' is directly represented.",          highlightNodes: ["t1","rnn1","h1"],        highlightEdges: ["t1→rnn1","rnn1→h1"] }
  - { id: "s2", label: "Step 2 — Second token", description: "The RNN reads 'cat' plus h₁. h₂ now represents both words — but 'The' is already being compressed.",             highlightNodes: ["t2","rnn2","h2"],        highlightEdges: ["h1→rnn2","t2→rnn2","rnn2→h2"] }
  - { id: "s3", label: "Step 3 — Third token",  description: "h₃ encodes 'sat' most strongly. h₁'s information about 'The' has been diluted twice already.",                   highlightNodes: ["t3","rnn3","h3"],        highlightEdges: ["h2→rnn3","t3→rnn3","rnn3→h3"] }
  - { id: "s4", label: "Step 4 — The problem",  description: "By step 30+, h₁ (which captured 'The') is effectively erased. No direct path exists from early tokens to late predictions. Training is also sequential — you can't compute step 3 until step 2 finishes.",   highlightNodes: ["h4","warn"],             highlightEdges: ["rnn4→h4","h4→warn"] }
LSTMs added gates to slow the forgetting — but the sequential bottleneck remained. Seq2Seq + Attention (2014) then let the decoder look back at all hidden states instead of just the last one. That was better, but it was attention bolted onto an RNN. The Transformer asked: what if you remove the RNN entirely?

Concept 2 — The Transformer's Answer: Read Everything at Once
The Transformer's core insight is simple: instead of reading token by token and building a hidden state, read all tokens simultaneously and let every token directly communicate with every other token. No rolling state. No information bottleneck. Just direct token-to-token connections, all computed in parallel.
This is the switch from sequential to parallel processing. A sentence with 512 tokens: an RNN needs 512 sequential steps. The Transformer needs 1 pass — all 512 tokens attend to each other simultaneously. Training speed goes from weeks to days. Information from token 1 reaches token 512 in a single hop, not 511 overwriting steps.
Component: NodeFlowDiagram
Title: "RNN vs Transformer: Sequential vs Parallel"
Caption: "Click each step to see how token communication differs between the two architectures."
Content:
layout: "split-lanes"
viewport: "presentation"
height: 380

nodes:
  # Left lane — RNN sequential
  - { id: "rnn_label", label: "RNN",           sublabel: "sequential",  x: 130, y: 30,  shape: "rect",   color: "rose",   size: "sm" }
  - { id: "rw1",       label: "The",            sublabel: "step 1",     x: 60,  y: 100, shape: "circle", color: "gray",   size: "sm" }
  - { id: "rw2",       label: "cat",            sublabel: "step 2",     x: 130, y: 180, shape: "circle", color: "gray",   size: "sm" }
  - { id: "rw3",       label: "sat",            sublabel: "step 3",     x: 200, y: 260, shape: "circle", color: "gray",   size: "sm" }
  - { id: "rw4",       label: "on",             sublabel: "step 4",     x: 270, y: 340, shape: "circle", color: "rose",   size: "sm", emoji: "🐌" }

  # Right lane — Transformer parallel
  - { id: "tf_label",  label: "Transformer",    sublabel: "parallel",   x: 680, y: 30,  shape: "rect",   color: "violet", size: "sm" }
  - { id: "tw1",       label: "The",            sublabel: "all at once", x: 530, y: 200, shape: "circle", color: "teal",   size: "md" }
  - { id: "tw2",       label: "cat",            sublabel: "all at once", x: 640, y: 120, shape: "circle", color: "teal",   size: "md" }
  - { id: "tw3",       label: "sat",            sublabel: "all at once", x: 750, y: 200, shape: "circle", color: "teal",   size: "md" }
  - { id: "tw4",       label: "on",             sublabel: "all at once", x: 640, y: 280, shape: "circle", color: "teal",   size: "md" }

edges:
  # RNN: chain
  - { from: "rw1", to: "rw2", animated: true,  color: "rose" }
  - { from: "rw2", to: "rw3", animated: true,  color: "rose" }
  - { from: "rw3", to: "rw4", animated: true,  color: "rose" }

  # Transformer: all-to-all
  - { from: "tw1", to: "tw2", animated: true,  color: "violet", bidirectional: true }
  - { from: "tw1", to: "tw3", animated: true,  color: "violet", bidirectional: true }
  - { from: "tw1", to: "tw4", animated: true,  color: "violet", bidirectional: true }
  - { from: "tw2", to: "tw3", animated: true,  color: "violet", bidirectional: true }
  - { from: "tw2", to: "tw4", animated: true,  color: "violet", bidirectional: true }
  - { from: "tw3", to: "tw4", animated: true,  color: "violet", bidirectional: true }

steps:
  - { id: "s1", label: "RNN: one path",          description: "In an RNN, information flows only forward along a chain. Token 1 reaches token 4 only after passing through tokens 2 and 3 — getting diluted each step.",          highlightNodes: ["rw1","rw2","rw3","rw4"],          highlightEdges: ["rw1→rw2","rw2→rw3","rw3→rw4"] }
  - { id: "s2", label: "Transformer: all paths", description: "In the Transformer, every token connects directly to every other token in one single operation. 'The' can attend directly to 'sat' without going through 'cat' first.", highlightNodes: ["tw1","tw2","tw3","tw4"],          highlightEdges: ["tw1→tw2","tw1→tw3","tw1→tw4","tw2→tw3","tw2→tw4","tw3→tw4"] }
  - { id: "s3", label: "The consequence",        description: "This makes training fully parallelizable — all positions compute simultaneously. And any token can influence any other in a single hop, regardless of distance.", highlightNodes: ["tf_label"],                       highlightEdges: [] }
Now you understand the why. The rest of the session explains how — each mechanism that makes this parallel architecture work.

Concept 3 — Input Pipeline: Text → Tokens → Embeddings + Position
Before the Transformer processes anything, raw text must become vectors. This three-step input pipeline is the exact same path you covered in the Embeddings session — now you'll see where it connects to the Transformer's front door.
Step one: the tokenizer splits "The cat sat on the mat" into token IDs — integer codes from the vocabulary. Step two: each ID is looked up in the embedding matrix, producing a 512-dimensional vector that encodes semantic meaning. Step three — and this is new — a positional encoding vector is added to each embedding. Since the Transformer reads all tokens at once, it has no built-in sense of order. The positional encoding is a fixed sinusoidal signal computed from the token's position index. Adding it gives the model both what a token means and where it sits in the same 512-dimensional vector.
Component: NodeFlowDiagram
Title: "Input Pipeline: Raw Text → Position-Aware Embedding"
Caption: "Click each step to trace how 'cat' travels from raw text to a position-aware vector."
Content:
layout: "horizontal-flow"
viewport: "presentation"
height: 320

nodes:
  - { id: "text",  label: '"The cat sat on the mat"', sublabel: "raw string",             x: 60,  y: 160, shape: "rect",   color: "gray",   size: "md" }
  - { id: "tok",   label: "Tokenizer",               sublabel: "[464, 3797, 3332, ...]",  x: 250, y: 160, shape: "rect",   color: "gray",   size: "sm" }
  - { id: "emb",   label: "Embedding Matrix",        sublabel: "vocab_size × 512",        x: 430, y: 100, shape: "rect",   color: "teal",   size: "md" }
  - { id: "pos",   label: "Positional Encoding",     sublabel: "sin/cos fixed signal",    x: 430, y: 240, shape: "rect",   color: "amber",  size: "md" }
  - { id: "add",   label: "Element-wise Add",        sublabel: "512-dim + 512-dim",       x: 620, y: 160, shape: "circle", color: "violet", size: "sm", emoji: "➕" }
  - { id: "out",   label: "Position-Aware Vector",   sublabel: "ready for encoder",       x: 800, y: 160, shape: "rect",   color: "violet", size: "md" }

edges:
  - { from: "text", to: "tok",  animated: true, color: "gray" }
  - { from: "tok",  to: "emb",  animated: true, color: "teal",   label: "token ID lookup" }
  - { from: "tok",  to: "pos",  animated: true, color: "amber",  label: "position index" }
  - { from: "emb",  to: "add",  animated: true, color: "teal" }
  - { from: "pos",  to: "add",  animated: true, color: "amber" }
  - { from: "add",  to: "out",  animated: true, color: "violet" }

steps:
  - { id: "s1", label: "1 — Tokenize",    description: "The tokenizer splits the sentence into subword tokens and maps each to an integer ID. 'cat' → ID 3797 (example). This is covered in detail in the Tokenization session.",    highlightNodes: ["text","tok"],         highlightEdges: ["text→tok"] }
  - { id: "s2", label: "2 — Look up embedding", description: "Each token ID is used as a row index into the embedding matrix (vocab_size × 512). 'cat' → a 512-dimensional float vector that encodes its semantic meaning.",        highlightNodes: ["emb"],                highlightEdges: ["tok→emb"] }
  - { id: "s3", label: "3 — Compute position", description: "The position index (0, 1, 2…) is fed into sinusoidal functions: sin for even dimensions, cos for odd dimensions. This produces a unique 512-dim pattern per position.", highlightNodes: ["pos"],                highlightEdges: ["tok→pos"] }
  - { id: "s4", label: "4 — Add together", description: "The two 512-dim vectors are added element-wise. The result carries both what 'cat' means and that it sits at position 1. This combined vector enters encoder layer 1.", highlightNodes: ["add","out"],           highlightEdges: ["emb→add","pos→add","add→out"] }
Every token in the sentence goes through this same pipeline in parallel. Six identical position-aware vectors flow into the first encoder layer together.

Concept 4 — Self-Attention: Every Token Asks, Every Token Answers
Self-attention is the heart of the Transformer. For each token, the model creates three vectors from its 512-dim embedding using three separate learned weight matrices: a Query (what this token is looking for), a Key (what this token offers to others), and a Value (what this token actually contributes if selected). Every Query is compared against all Keys using a dot product — high dot product means "this key matches what I'm looking for." The scores are scaled by dividing by √64 = 8 to prevent the softmax from saturating. Softmax converts the scores into weights that sum to 1.0. The output is a weighted sum of all Values — every token's output is a blend of every other token, weighted by relevance. The word "sat" ends up attending strongly to "cat" (the subject) and "mat" (the location) because those Keys match its Query.
Component: NodeFlowDiagram
Title: "Self-Attention: Q, K, V Flow for 'sat'"
Caption: "Click each step to see how 'sat' computes its context-aware output vector."
Content:
layout: "freeform"
viewport: "presentation"
height: 460

nodes:
  # Input embeddings
  - { id: "eThe",  label: "The",  sublabel: "512-dim", x: 60,  y: 80,  shape: "rect", color: "gray",   size: "sm" }
  - { id: "ecat",  label: "cat",  sublabel: "512-dim", x: 60,  y: 180, shape: "rect", color: "gray",   size: "sm" }
  - { id: "esat",  label: "sat",  sublabel: "512-dim", x: 60,  y: 280, shape: "rect", color: "violet", size: "md" }
  - { id: "eon",   label: "on",   sublabel: "512-dim", x: 60,  y: 380, shape: "rect", color: "gray",   size: "sm" }
  - { id: "emat",  label: "mat",  sublabel: "512-dim", x: 60,  y: 480, shape: "rect", color: "gray",   size: "sm" }

  # Q K V projections for "sat"
  - { id: "Qsat",  label: "Q_sat", sublabel: "64-dim — 'what do I need?'", x: 280, y: 200, shape: "rect", color: "violet", size: "sm" }
  - { id: "Ksat",  label: "K_sat", sublabel: "64-dim",                     x: 280, y: 280, shape: "rect", color: "amber",  size: "sm" }
  - { id: "Vsat",  label: "V_sat", sublabel: "64-dim",                     x: 280, y: 360, shape: "rect", color: "teal",   size: "sm" }

  # Keys from other tokens
  - { id: "Kthe",  label: "K_The", sublabel: "64-dim", x: 460, y: 80,  shape: "rect", color: "gray",   size: "sm" }
  - { id: "Kcat",  label: "K_cat", sublabel: "64-dim", x: 460, y: 180, shape: "rect", color: "gray",   size: "sm" }
  - { id: "Kon",   label: "K_on",  sublabel: "64-dim", x: 460, y: 380, shape: "rect", color: "gray",   size: "sm" }
  - { id: "Kmat",  label: "K_mat", sublabel: "64-dim", x: 460, y: 480, shape: "rect", color: "gray",   size: "sm" }

  # Score computation
  - { id: "scores",label: "Dot Products\n÷ √64",  sublabel: "Q_sat · K_i for all i",  x: 640, y: 280, shape: "rect", color: "amber", size: "md" }
  - { id: "smx",   label: "Softmax",              sublabel: "→ attention weights",     x: 800, y: 280, shape: "rect", color: "amber", size: "sm" }

  # Weighted values
  - { id: "wval",  label: "Weighted Sum\nof Values", sublabel: "α₁V₁ + α₂V₂ + …",   x: 960, y: 280, shape: "rect", color: "teal",  size: "md" }
  - { id: "zsat",  label: "z_sat",                   sublabel: "new 64-dim output for 'sat'", x: 1100,y: 280, shape: "circle", color: "violet", size: "md", emoji: "✅" }

edges:
  - { from: "esat", to: "Qsat",   animated: true, color: "violet", label: "× W_Q" }
  - { from: "esat", to: "Ksat",   animated: true, color: "amber",  label: "× W_K" }
  - { from: "esat", to: "Vsat",   animated: true, color: "teal",   label: "× W_V" }
  - { from: "eThe", to: "Kthe",   animated: true, color: "gray",   label: "× W_K" }
  - { from: "ecat", to: "Kcat",   animated: true, color: "gray",   label: "× W_K" }
  - { from: "eon",  to: "Kon",    animated: true, color: "gray",   label: "× W_K" }
  - { from: "emat", to: "Kmat",   animated: true, color: "gray",   label: "× W_K" }
  - { from: "Qsat", to: "scores", animated: true, color: "violet" }
  - { from: "Kthe", to: "scores", animated: true, color: "gray" }
  - { from: "Kcat", to: "scores", animated: true, color: "gray" }
  - { from: "Ksat", to: "scores", animated: true, color: "amber" }
  - { from: "Kon",  to: "scores", animated: true, color: "gray" }
  - { from: "Kmat", to: "scores", animated: true, color: "gray" }
  - { from: "scores",to: "smx",   animated: true, color: "amber" }
  - { from: "smx",  to: "wval",   animated: true, color: "teal" }
  - { from: "Vsat", to: "wval",   animated: true, color: "teal" }
  - { from: "wval", to: "zsat",   animated: true, color: "violet" }

steps:
  - { id: "s1", label: "1 — Project to Q, K, V",   description: "Each token's 512-dim embedding is multiplied by three learned weight matrices (W_Q, W_K, W_V) to produce 64-dim Query, Key, and Value vectors. 'sat' produces Q_sat, K_sat, V_sat.",   highlightNodes: ["esat","Qsat","Ksat","Vsat"],          highlightEdges: ["esat→Qsat","esat→Ksat","esat→Vsat"] }
  - { id: "s2", label: "2 — All tokens project Keys", description: "Every other token in the sentence also produces a Key vector. 'sat's Query will compare against all of them — including itself.",                                                       highlightNodes: ["Kthe","Kcat","Kon","Kmat"],           highlightEdges: ["eThe→Kthe","ecat→Kcat","eon→Kon","emat→Kmat"] }
  - { id: "s3", label: "3 — Compute scores",        description: "Q_sat is dot-producted with every Key. The score measures how much 'sat' should attend to each position. Divided by √64 to prevent large values from saturating the softmax.",           highlightNodes: ["scores"],                             highlightEdges: ["Qsat→scores","Kthe→scores","Kcat→scores","Ksat→scores","Kon→scores","Kmat→scores"] }
  - { id: "s4", label: "4 — Softmax → weights",     description: "Softmax converts the raw scores into probabilities summing to 1.0. 'cat' and 'mat' get high weights (who sat? on what?), 'on' gets low weight (preposition, less content).",           highlightNodes: ["smx"],                               highlightEdges: ["scores→smx"] }
  - { id: "s5", label: "5 — Weighted sum",           description: "The attention weights multiply each token's Value vector. The output z_sat is a blend: 45% cat's meaning + 30% mat's meaning + 15% its own + 10% others. 'sat' now carries its full context.", highlightNodes: ["wval","zsat"],                        highlightEdges: ["smx→wval","Vsat→wval","wval→zsat"] }
This is the core computation. But running it once with one set of weights captures only one type of relationship. Language has many relationship types simultaneously — and that's where multi-head attention comes in.

Concept 5 — Attention Weights in Practice: What the Model Actually Focuses On
The attention heatmap makes the weights tangible. Each cell shows how much one token attends to another. You can see "sat" attending strongly to "cat" (who sat?) and "mat" (sat on what?). "The" attends to "cat" because it modifies it. These patterns are not hardcoded — they emerge from the learned weight matrices W_Q, W_K, W_V during training.
Component: AttentionHeatmap
Title: "Attention Weights: 'The cat sat on the mat'"
Caption: "Click any row to see which tokens that word attends to most strongly."
Content:
tokens: ["The", "cat", "sat", "on", "the", "mat"]
colorRamp: "violet"
weights (each row must sum to 1.0):
  - [0.05, 0.55, 0.15, 0.05, 0.08, 0.12]   # The → cat (article-noun bond)
  - [0.08, 0.28, 0.35, 0.05, 0.06, 0.18]   # cat → sat, mat (cat does what, sits where)
  - [0.05, 0.42, 0.18, 0.06, 0.05, 0.24]   # sat → cat (who sat), mat (sat where)
  - [0.05, 0.10, 0.14, 0.18, 0.10, 0.43]   # on → mat (on what?)
  - [0.12, 0.08, 0.08, 0.05, 0.28, 0.39]   # the → mat (article-noun)
  - [0.05, 0.28, 0.22, 0.18, 0.08, 0.19]   # mat → cat, sat (mat is where cat sat)
These are the weights from one attention head. The Transformer runs eight of these in parallel simultaneously.

Concept 6 — Multi-Head Attention: Eight Relationship Detectors at Once
One attention head captures one relationship pattern per layer. But a sentence has multiple relationship types in play at the same time: subject-verb binding, pronoun resolution, negation, semantic similarity, positional adjacency. Multi-head attention runs 8 independent attention operations in parallel — each with its own W_Q, W_K, W_V weight matrices and its own 64-dimensional subspace.
Head 1 might specialize in syntactic subject-verb relationships. Head 2 might focus on coreference. Head 3 on positional adjacency. Head 4 on semantic similarity. These specializations aren't manually assigned — they emerge from training. After all 8 heads run, their 64-dim outputs are concatenated into 512 dimensions and passed through a final linear projection W_O to blend the 8 perspectives into one output vector per token.
Component: NodeFlowDiagram
Title: "Multi-Head Attention: 8 Heads in Parallel"
Caption: "Click each step to see how 8 heads split, attend independently, then merge."
Content:
layout: "freeform"
viewport: "presentation"
height: 480

nodes:
  - { id: "input",  label: "Input Vectors",     sublabel: "512-dim per token",     x: 80,  y: 260, shape: "rect",   color: "teal",   size: "md" }

  # 8 heads (show 4 + compress)
  - { id: "h1",     label: "Head 1",            sublabel: "64-dim subspace",       x: 280, y: 80,  shape: "rect",   color: "violet", size: "sm" }
  - { id: "h2",     label: "Head 2",            sublabel: "64-dim subspace",       x: 280, y: 160, shape: "rect",   color: "violet", size: "sm" }
  - { id: "h3",     label: "Head 3",            sublabel: "64-dim subspace",       x: 280, y: 240, shape: "rect",   color: "violet", size: "sm" }
  - { id: "h4",     label: "Head 4",            sublabel: "64-dim subspace",       x: 280, y: 320, shape: "rect",   color: "violet", size: "sm" }
  - { id: "hdots",  label: "Heads 5–8",         sublabel: "64-dim each",           x: 280, y: 420, shape: "rect",   color: "gray",   size: "sm", emoji: "…" }

  # Each head runs full attention
  - { id: "a1",     label: "Attn(Q₁,K₁,V₁)",   sublabel: "own weights — syntactic?",  x: 500, y: 80,  shape: "rect", color: "violet", size: "sm" }
  - { id: "a2",     label: "Attn(Q₂,K₂,V₂)",   sublabel: "own weights — coref?",      x: 500, y: 160, shape: "rect", color: "violet", size: "sm" }
  - { id: "a3",     label: "Attn(Q₃,K₃,V₃)",   sublabel: "own weights — semantic?",   x: 500, y: 240, shape: "rect", color: "violet", size: "sm" }
  - { id: "a4",     label: "Attn(Q₄,K₄,V₄)",   sublabel: "own weights — positional?", x: 500, y: 320, shape: "rect", color: "violet", size: "sm" }
  - { id: "adots",  label: "Attn 5–8",          sublabel: "parallel",                  x: 500, y: 420, shape: "rect", color: "gray",   size: "sm", emoji: "…" }

  # Concat
  - { id: "concat", label: "Concatenate",       sublabel: "8 × 64-dim → 512-dim",  x: 700, y: 260, shape: "rect",   color: "amber",  size: "md" }

  # Linear projection
  - { id: "wo",     label: "× W_O",             sublabel: "512 × 512 linear",      x: 860, y: 260, shape: "rect",   color: "amber",  size: "sm" }

  # Output
  - { id: "output", label: "MHA Output",        sublabel: "512-dim per token",     x: 1020,y: 260, shape: "rect",   color: "teal",   size: "md" }

edges:
  - { from: "input",  to: "h1",     animated: true,  color: "teal" }
  - { from: "input",  to: "h2",     animated: true,  color: "teal" }
  - { from: "input",  to: "h3",     animated: true,  color: "teal" }
  - { from: "input",  to: "h4",     animated: true,  color: "teal" }
  - { from: "input",  to: "hdots",  animated: true,  color: "gray",  dashed: true }
  - { from: "h1",     to: "a1",     animated: true,  color: "violet" }
  - { from: "h2",     to: "a2",     animated: true,  color: "violet" }
  - { from: "h3",     to: "a3",     animated: true,  color: "violet" }
  - { from: "h4",     to: "a4",     animated: true,  color: "violet" }
  - { from: "hdots",  to: "adots",  animated: true,  color: "gray",  dashed: true }
  - { from: "a1",     to: "concat", animated: true,  color: "violet" }
  - { from: "a2",     to: "concat", animated: true,  color: "violet" }
  - { from: "a3",     to: "concat", animated: true,  color: "violet" }
  - { from: "a4",     to: "concat", animated: true,  color: "violet" }
  - { from: "adots",  to: "concat", animated: true,  color: "gray",  dashed: true }
  - { from: "concat", to: "wo",     animated: true,  color: "amber" }
  - { from: "wo",     to: "output", animated: true,  color: "teal" }

steps:
  - { id: "s1", label: "1 — Split into 8 subspaces",  description: "The 512-dim input is projected into 8 separate 64-dim spaces using 8 sets of W_Q, W_K, W_V matrices — one per head. Each head gets a different learned projection of the same input.", highlightNodes: ["input","h1","h2","h3","h4","hdots"], highlightEdges: ["input→h1","input→h2","input→h3","input→h4"] }
  - { id: "s2", label: "2 — 8 parallel attention ops", description: "Each head runs complete scaled dot-product attention independently in its 64-dim subspace. All 8 run simultaneously — this is pure parallelism. Each head may specialize in a different relationship type.", highlightNodes: ["a1","a2","a3","a4","adots"],          highlightEdges: ["h1→a1","h2→a2","h3→a3","h4→a4"] }
  - { id: "s3", label: "3 — Concatenate 8 outputs",   description: "Each head produces a 64-dim output per token. The 8 outputs are concatenated back to 512 dimensions: [head1 | head2 | … | head8].",                                                        highlightNodes: ["concat"],                              highlightEdges: ["a1→concat","a2→concat","a3→concat","a4→concat"] }
  - { id: "s4", label: "4 — Final linear projection",  description: "A learned 512×512 matrix W_O blends the 8 heads' perspectives into one unified 512-dim output per token. The model learns how to combine what each head found.", highlightNodes: ["wo","output"],                         highlightEdges: ["concat→wo","wo→output"] }
The output of multi-head attention is still 512 dimensions per token — same shape as the input. It flows directly into the next sub-layer of the encoder.

Concept 7 — The Encoder Layer: Attention + FFN + Residuals
One complete encoder layer wraps multi-head attention and a feed-forward network in a specific structure. After MHA runs, the original input is added back — this is the residual connection. Then Layer Norm stabilizes the values. Then a two-layer feed-forward network processes each token independently: 512 → 2048 (expand) → ReLU → 2048 → 512 (compress). Another residual + Layer Norm follows. This pattern — sublayer → add input → normalize — repeats for both sub-layers.
The residual connection is not optional decoration. Without it, stacking 6 layers causes gradients to vanish during training — the signal from the loss can't propagate all the way back to layer 1. The residual ensures the gradient has a direct path through. The FFN's 4× expansion (512 → 2048) gives each position room to compute more complex per-token transformations beyond what the attention alone can do.
Component: LayerStack
Title: "One Complete Encoder Layer (×6)"
Caption: "Click each layer to see exactly what operation runs at that stage."
Content:
direction: "bottom-to-top"
layers:
  - { id: "in",    label: "Input",                   sublabel: "512-dim position-aware embeddings (or previous layer output)", color: "gray",   detail: "Position-aware embeddings enter from below — either from the input pipeline (layer 1) or from the previous encoder layer (layers 2–6)." }
  - { id: "mha",   label: "Multi-Head Self-Attention", sublabel: "8 heads × 64-dim → 512-dim",                                color: "violet", detail: "All tokens attend to all other tokens simultaneously. 8 parallel heads each compute attention in a 64-dim subspace. Outputs concatenated and projected → 512-dim." }
  - { id: "add1",  label: "Add & Layer Norm",         sublabel: "x + Sublayer(x), then normalize",                           color: "teal",   detail: "The attention output is added back to its own input (residual). This gives gradients a direct path during backpropagation. Layer Norm then rescales to zero mean, unit variance." }
  - { id: "ffn",   label: "Feed-Forward Network",     sublabel: "512 → 2048 → ReLU → 512",                                  color: "amber",  detail: "Two linear layers with a ReLU between them. Applied identically and independently to each token position. The 4× expansion gives room for complex per-token reasoning." }
  - { id: "add2",  label: "Add & Layer Norm",         sublabel: "x + Sublayer(x), then normalize",                          color: "teal",   detail: "Same residual + normalization pattern as after attention. The output is a 512-dim vector per token, ready for the next encoder layer." }
  - { id: "out",   label: "Output → Next Layer",      sublabel: "richer 512-dim per token (×6 total)",                      color: "blue",   detail: "This layer's output feeds the next encoder layer as input. After 6 layers, each token's vector has been contextualized by 6 rounds of full-sentence attention." }
Six of these layers run in sequence. By the final encoder layer, each token's 512-dim vector has been enriched by six full rounds of all-to-all attention. Those vectors become the encoder output — the "memory" the decoder attends to.

Concept 8 — The Decoder: Masked Attention + Cross-Attention
The decoder generates output one token at a time, but it's trained in parallel. Its structure adds two important modifications to the encoder layer. First: masked self-attention — during training, the decoder processes all output tokens at once, but it must not peek at future tokens. A mask sets attention scores for future positions to −∞ before softmax, so they get weight 0. Second: cross-attention — the decoder's Queries come from its own tokens, but the Keys and Values come from the encoder output. This is how the decoder reads the encoder's understanding of the source sentence while generating each target token.
Component: NodeFlowDiagram
Title: "Decoder Layer: Masked + Cross-Attention"
Caption: "Click each step to trace how the decoder uses both its own output and the encoder's memory."
Content:
layout: "freeform"
viewport: "presentation"
height: 460

nodes:
  # Encoder output (memory)
  - { id: "encmem",  label: "Encoder Output",      sublabel: "context vectors — K, V source", x: 80,  y: 160, shape: "rect",   color: "violet", size: "md" }

  # Decoder input (previously generated tokens)
  - { id: "decinp",  label: "Decoder Input",       sublabel: "output tokens so far (shifted right)", x: 80, y: 360, shape: "rect", color: "amber", size: "md" }

  # Masked self-attention
  - { id: "mask",    label: "Masked Self-Attention", sublabel: "future tokens blocked (score = −∞)", x: 320, y: 360, shape: "rect", color: "rose",   size: "md" }
  - { id: "addnorm1",label: "Add & Layer Norm",     sublabel: "",                                    x: 480, y: 360, shape: "rect", color: "teal",   size: "sm" }

  # Cross-attention
  - { id: "cross",   label: "Cross-Attention",      sublabel: "Q from decoder, K+V from encoder",  x: 640, y: 260, shape: "rect", color: "violet", size: "md" }
  - { id: "addnorm2",label: "Add & Layer Norm",     sublabel: "",                                   x: 800, y: 260, shape: "rect", color: "teal",   size: "sm" }

  # FFN
  - { id: "ffn",     label: "Feed-Forward Network", sublabel: "512 → 2048 → 512",                  x: 960, y: 260, shape: "rect", color: "amber",  size: "md" }
  - { id: "addnorm3",label: "Add & Layer Norm",     sublabel: "",                                   x: 1100,y: 260, shape: "rect", color: "teal",   size: "sm" }

  # Output
  - { id: "decout",  label: "Decoder Layer Output", sublabel: "→ next decoder layer or linear", x: 1100, y: 420, shape: "rect", color: "blue", size: "md" }

edges:
  - { from: "decinp",  to: "mask",     animated: true, color: "amber" }
  - { from: "mask",    to: "addnorm1", animated: true, color: "rose" }
  - { from: "addnorm1",to: "cross",    animated: true, color: "amber", label: "Q" }
  - { from: "encmem",  to: "cross",    animated: true, color: "violet", label: "K, V" }
  - { from: "cross",   to: "addnorm2", animated: true, color: "violet" }
  - { from: "addnorm2",to: "ffn",      animated: true, color: "teal" }
  - { from: "ffn",     to: "addnorm3", animated: true, color: "amber" }
  - { from: "addnorm3",to: "decout",   animated: true, color: "blue" }

steps:
  - { id: "s1", label: "1 — Decoder input",         description: "The decoder receives output tokens generated so far. At generation start, it gets only a special START token. During training, it sees the target sentence shifted right — all positions at once.", highlightNodes: ["decinp"],                    highlightEdges: [] }
  - { id: "s2", label: "2 — Masked Self-Attention", description: "The decoder runs self-attention over its own tokens, but future positions are masked: their attention scores are set to −∞ before softmax → weight becomes 0. Position 3 cannot see positions 4, 5, 6…", highlightNodes: ["mask"],                      highlightEdges: ["decinp→mask"] }
  - { id: "s3", label: "3 — Cross-Attention",       description: "This sub-layer is the bridge. The decoder's Queries come from its own tokens (what am I generating?). The Keys and Values come from the encoder output (what did the source sentence mean?). This is how translation actually happens.", highlightNodes: ["cross","encmem"],            highlightEdges: ["addnorm1→cross","encmem→cross"] }
  - { id: "s4", label: "4 — FFN + residuals",       description: "Same FFN structure as the encoder. Two residual + Layer Norm wrappers around each sub-layer. Output feeds the next decoder layer or, after layer 6, the final Linear + Softmax.", highlightNodes: ["ffn","addnorm3","decout"],    highlightEdges: ["addnorm2→ffn","ffn→addnorm3","addnorm3→decout"] }
After six decoder layers, the output passes through a linear layer and softmax to produce a probability over the entire vocabulary. The highest-probability token becomes the next generated word.

SECTION 4 — PRACTICAL EXAMPLE
Now the complete end-to-end flow. A raw sentence enters the system — trace every step: tokenization, embedding lookup, positional encoding addition, six encoder layers of full-sentence attention, decoder cross-attention over encoder memory, and finally the logit distribution that selects the next token. This is exactly what happens inside a Transformer every time it generates a word.
Component: InferenceWalkthrough
Title: "End-to-End: 'The cat sat on the' → Transformer → Predicted Token"
Caption: "Step through the complete forward pass from raw input to next-token prediction."
Content:
question: "The cat sat on the"
answer: "mat"
logitCandidates:
  - { token: "mat",   logit: 9.1,  rawProb: 0.54 }
  - { token: "floor", logit: 6.4,  rawProb: 0.16 }
  - { token: "roof",  logit: 5.0,  rawProb: 0.08 }
  - { token: "chair", logit: 4.5,  rawProb: 0.06 }
  - { token: "table", logit: 4.1,  rawProb: 0.05 }
  - { token: "grass", logit: 3.2,  rawProb: 0.04 }
  - { token: "bench", logit: 2.1,  rawProb: 0.04 }
  - { token: "wall",  logit: 1.4,  rawProb: 0.03 }

SECTION 5 — RECAP
TermDefinitionSelf-AttentionThe operation where each token generates a Query, Key, and Value, then attends to all other tokens simultaneously to produce a context-aware output vector.Multi-Head AttentionRunning 8 independent attention operations in parallel on 64-dim subspaces, then concatenating back to 512 dimensions — allows 8 different relationship patterns per layer.Positional EncodingA fixed sinusoidal vector added to each token's embedding that tells the Transformer the token's position, since the model reads all tokens at once and has no built-in sense of order.Residual ConnectionAdding a sub-layer's input directly to its output before Layer Norm — preserves the original signal and ensures clean gradient flow through 6 stacked layers.Cross-AttentionThe decoder sub-layer where Queries come from the decoder's own tokens but Keys and Values come from the encoder output — this is how the decoder reads the encoder's understanding of the source.

SECTION 6 — NEXT SESSION
Next: Tokenization — How Text Becomes Numbers
Slug: tokenization
Teaser: You've traced a sentence through the entire Transformer — next session shows exactly how raw text gets chopped into the token IDs that start that pipeline, and why tokenizer design choices directly affect what the model can and can't represent.


Brief complete. All facts verified against Vaswani et al. arxiv.org/abs/1706.03762 and primary sources. 8 core concepts, all illustrated with flows and diagrams. Component breakdown:

Section 2: NodeFlowDiagram — full encoder-decoder architecture with 7-step walkthrough
Concept 1: NodeFlowDiagram — RNN sequential hidden state, 4-step animated
Concept 2: NodeFlowDiagram — RNN chain vs Transformer all-to-all, 3-step
Concept 3: NodeFlowDiagram — input pipeline text→tokens→embed→pos→add, 4-step
Concept 4: NodeFlowDiagram — Q/K/V flow for 'sat', 5-step animated
Concept 5: AttentionHeatmap — attention weights interactive (Tier 2)
Concept 6: NodeFlowDiagram — multi-head split→parallel→concat→project, 4-step
Concept 7: LayerStack — full encoder layer bottom-to-top, 6 clickable layers
Concept 8: NodeFlowDiagram — decoder masked + cross-attention, 4-step
Section 4: InferenceWalkthrough ✅ (Tier 1 payoff — full forward pass)

No TSX-only props used. No ConceptCompare used — all visualization is flows and diagrams per your directive. No new components required — all concepts covered with existing library. Zero static diagrams — every diagram has scripted step-through navigation.