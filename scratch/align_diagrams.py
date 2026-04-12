import re

with open(r'c:\Users\youss\Desktop\Youtube Sessions\content\sessions\module-1\04-transformer-attention.mdx', 'r', encoding='utf-8') as f:
    content = f.read()

def repl(title_match, new_nodes_str, content_str):
    pattern = r'(title="' + title_match + r'".*?nodes=\{)\[.*?\]\}'
    replacement = r'\1[' + new_nodes_str + r']}'
    return re.sub(pattern, replacement, content_str, flags=re.DOTALL)

# 1. The full Transformer architecture
c = repl("The full Transformer architecture", """
    { id: "raw", label: "Raw Text", sublabel: '"The cat sat"', x: 5, y: 40, shape: "rect", color: "gray", size: "sm" },
    { id: "tok", label: "Tokenizer", sublabel: "text → token IDs", x: 17, y: 40, shape: "rect", color: "gray", size: "sm" },
    { id: "emb", label: "Input Embedding", sublabel: "+ Positional Enc", x: 30, y: 40, shape: "rect", color: "teal", size: "md" },
    { id: "enc1", label: "Encoder Layer 1", sublabel: "MHSA + FFN", x: 45, y: 15, shape: "rect", color: "violet", size: "md" },
    { id: "enc2", label: "Encoder Layer 2", sublabel: "MHSA + FFN", x: 45, y: 40, shape: "rect", color: "violet", size: "md" },
    { id: "enc3", label: "Encoder Layer 6", sublabel: "MHSA + FFN", x: 45, y: 65, shape: "rect", color: "violet", size: "md" },
    { id: "encout", label: "Encoder Output", sublabel: "context vectors", x: 58, y: 40, shape: "rect", color: "violet", size: "sm" },
    { id: "dec1", label: "Decoder Layer 1", sublabel: "Masked MHSA + Cross-Attn + FFN", x: 74, y: 15, shape: "rect", color: "amber", size: "md" },
    { id: "dec2", label: "Decoder Layer 2", sublabel: "Masked MHSA + Cross-Attn + FFN", x: 74, y: 40, shape: "rect", color: "amber", size: "md" },
    { id: "dec3", label: "Decoder Layer 6", sublabel: "Masked MHSA + Cross-Attn + FFN", x: 74, y: 65, shape: "rect", color: "amber", size: "md" },
    { id: "linear", label: "Linear + Softmax", sublabel: "scores over vocab", x: 88, y: 40, shape: "rect", color: "teal", size: "sm" },
    { id: "out", label: "Predicted Token", sublabel: '"mat"', x: 97, y: 40, shape: "circle", color: "blue", size: "sm", emoji: "✅" },
    { id: "outemb", label: "Output Embedding", sublabel: "+ Positional Enc", x: 74, y: 90, shape: "rect", color: "teal", size: "sm" }
""", content)

# 2. RNN: the sequential hidden-state problem
c = repl("RNN: the sequential hidden-state problem", """
    { id: "t1", label: "The", sublabel: "token 1", x: 8, y: 28, shape: "rect", color: "gray", size: "sm" },
    { id: "t2", label: "cat", sublabel: "token 2", x: 8, y: 51, shape: "rect", color: "gray", size: "sm" },
    { id: "t3", label: "sat", sublabel: "token 3", x: 8, y: 74, shape: "rect", color: "gray", size: "sm" },
    { id: "t4", label: "on", sublabel: "token 4", x: 8, y: 95, shape: "rect", color: "gray", size: "sm", emoji: "…" },
    { id: "h0", label: "h₀", sublabel: "empty", x: 58, y: 5, shape: "circle", color: "gray", size: "sm" },
    { id: "h1", label: "h₁", sublabel: "sees: The", x: 34, y: 28, shape: "circle", color: "teal", size: "md" },
    { id: "h2", label: "h₂", sublabel: "mostly: cat", x: 34, y: 51, shape: "circle", color: "teal", size: "md" },
    { id: "h3", label: "h₃", sublabel: "mostly: sat", x: 34, y: 74, shape: "circle", color: "amber", size: "md" },
    { id: "h4", label: "h₄", sublabel: '"The" fading', x: 34, y: 95, shape: "circle", color: "rose", size: "md", emoji: "⚠️" },
    { id: "rnn1", label: "RNN Cell", x: 58, y: 28, shape: "rect", color: "violet", size: "sm" },
    { id: "rnn2", label: "RNN Cell", x: 58, y: 51, shape: "rect", color: "violet", size: "sm" },
    { id: "rnn3", label: "RNN Cell", x: 58, y: 74, shape: "rect", color: "violet", size: "sm" },
    { id: "rnn4", label: "RNN Cell", x: 58, y: 95, shape: "rect", color: "violet", size: "sm" },
    { id: "warn", label: "Long-range lost!", sublabel: "early token faded", x: 85, y: 60, shape: "hex", color: "rose", size: "md", emoji: "💥" }
""", c)

# 3. RNN vs Transformer: sequential vs parallel
c = repl("RNN vs Transformer: sequential vs parallel", """
    { id: "rnn_label", label: "RNN", sublabel: "sequential", x: 18, y: 12, shape: "rect", color: "rose", size: "sm" },
    { id: "rw1", label: "The", sublabel: "step 1", x: 10, y: 35, shape: "circle", color: "gray", size: "sm" },
    { id: "rw2", label: "cat", sublabel: "step 2", x: 18, y: 55, shape: "circle", color: "gray", size: "sm" },
    { id: "rw3", label: "sat", sublabel: "step 3", x: 26, y: 75, shape: "circle", color: "gray", size: "sm" },
    { id: "rw4", label: "on", sublabel: "step 4", x: 34, y: 95, shape: "circle", color: "rose", size: "sm", emoji: "🐌" },
    { id: "tf_label", label: "Transformer", sublabel: "parallel", x: 76, y: 12, shape: "rect", color: "violet", size: "sm" },
    { id: "tw1", label: "The", sublabel: "all at once", x: 62, y: 50, shape: "circle", color: "teal", size: "md" },
    { id: "tw2", label: "cat", sublabel: "all at once", x: 76, y: 32, shape: "circle", color: "teal", size: "md" },
    { id: "tw3", label: "sat", sublabel: "all at once", x: 90, y: 50, shape: "circle", color: "teal", size: "md" },
    { id: "tw4", label: "on", sublabel: "all at once", x: 76, y: 68, shape: "circle", color: "teal", size: "md" }
""", c)

# 5. Self-attention
c = repl("Self-attention: Q, K, V flow for 'sat'", """
    { id: "eThe", label: "The", sublabel: "512-dim", x: 8, y: 14, shape: "rect", color: "gray", size: "sm" },
    { id: "ecat", label: "cat", sublabel: "512-dim", x: 8, y: 32, shape: "rect", color: "gray", size: "sm" },
    { id: "esat", label: "sat", sublabel: "512-dim", x: 8, y: 50, shape: "rect", color: "violet", size: "md" },
    { id: "eon", label: "on", sublabel: "512-dim", x: 8, y: 68, shape: "rect", color: "gray", size: "sm" },
    { id: "emat", label: "mat", sublabel: "512-dim", x: 8, y: 86, shape: "rect", color: "gray", size: "sm" },
    { id: "Qsat", label: "Q_sat", sublabel: "64-dim", x: 26, y: 36, shape: "rect", color: "violet", size: "sm" },
    { id: "Ksat", label: "K_sat", sublabel: "64-dim", x: 26, y: 50, shape: "rect", color: "amber", size: "sm" },
    { id: "Vsat", label: "V_sat", sublabel: "64-dim", x: 26, y: 64, shape: "rect", color: "teal", size: "sm" },
    { id: "Kthe", label: "K_The", sublabel: "64-dim", x: 42, y: 14, shape: "rect", color: "gray", size: "sm" },
    { id: "Kcat", label: "K_cat", sublabel: "64-dim", x: 42, y: 32, shape: "rect", color: "gray", size: "sm" },
    { id: "Kon", label: "K_on", sublabel: "64-dim", x: 42, y: 68, shape: "rect", color: "gray", size: "sm" },
    { id: "Kmat", label: "K_mat", sublabel: "64-dim", x: 42, y: 86, shape: "rect", color: "gray", size: "sm" },
    { id: "scores", label: "Dot ÷ √64", sublabel: "Q·K all i", x: 62, y: 50, shape: "rect", color: "amber", size: "md" },
    { id: "smx", label: "Softmax", sublabel: "weights", x: 78, y: 50, shape: "rect", color: "amber", size: "sm" },
    { id: "wval", label: "Weighted Σ V", sublabel: "blend", x: 92, y: 50, shape: "rect", color: "teal", size: "md" },
    { id: "zsat", label: "z_sat", sublabel: "out", x: 92, y: 70, shape: "circle", color: "violet", size: "sm", emoji: "✅" }
""", c)

# 6. Multi-head attention
c = repl("Multi-head attention: eight heads in parallel", """
    { id: "mhaIn", label: "Input vectors", sublabel: "512-D", x: 10, y: 50, shape: "rect", color: "teal", size: "md" },
    { id: "h1", label: "Head 1", sublabel: "64-D", x: 30, y: 10, shape: "rect", color: "violet", size: "sm" },
    { id: "h2", label: "Head 2", sublabel: "64-D", x: 30, y: 30, shape: "rect", color: "violet", size: "sm" },
    { id: "h3", label: "Head 3", sublabel: "64-D", x: 30, y: 50, shape: "rect", color: "violet", size: "sm" },
    { id: "h4", label: "Head 4", sublabel: "64-D", x: 30, y: 70, shape: "rect", color: "violet", size: "sm" },
    { id: "hdots", label: "Heads 5–8", sublabel: "64-D", x: 30, y: 90, shape: "rect", color: "gray", size: "sm", emoji: "…" },
    { id: "a1", label: "Attn₁", sublabel: "QKV₁", x: 50, y: 10, shape: "rect", color: "violet", size: "sm" },
    { id: "a2", label: "Attn₂", sublabel: "QKV₂", x: 50, y: 30, shape: "rect", color: "violet", size: "sm" },
    { id: "a3", label: "Attn₃", sublabel: "QKV₃", x: 50, y: 50, shape: "rect", color: "violet", size: "sm" },
    { id: "a4", label: "Attn₄", sublabel: "QKV₄", x: 50, y: 70, shape: "rect", color: "violet", size: "sm" },
    { id: "adots", label: "Attn 5–8", sublabel: "parallel", x: 50, y: 90, shape: "rect", color: "gray", size: "sm", emoji: "…" },
    { id: "concat", label: "Concatenate", sublabel: "8×64 → 512", x: 72, y: 50, shape: "rect", color: "amber", size: "md" },
    { id: "wo", label: "× W_O", sublabel: "512×512", x: 86, y: 50, shape: "rect", color: "amber", size: "sm" },
    { id: "mhaOut", label: "MHA output", sublabel: "512-D", x: 98, y: 50, shape: "rect", color: "teal", size: "sm" }
""", c)

# 7. Decoder layer
c = repl("Decoder layer: masked self-attention \+ cross-attention", """
    { id: "encmem", label: "Encoder output", sublabel: "K, V source", x: 55, y: 20, shape: "rect", color: "violet", size: "md" },
    { id: "decinp", label: "Decoder input", sublabel: "shifted right", x: 15, y: 75, shape: "rect", color: "amber", size: "md" },
    { id: "mask", label: "Masked self-attention", sublabel: "−∞ on future", x: 38, y: 75, shape: "rect", color: "rose", size: "md" },
    { id: "addnorm1", label: "Add & norm", sublabel: "", x: 55, y: 75, shape: "rect", color: "teal", size: "sm" },
    { id: "cross", label: "Cross-attention", sublabel: "Q dec, K/V enc", x: 55, y: 45, shape: "rect", color: "violet", size: "md" },
    { id: "addnorm2", label: "Add & norm", sublabel: "", x: 72, y: 45, shape: "rect", color: "teal", size: "sm" },
    { id: "ffnD", label: "Feed-forward", sublabel: "512→2048→512", x: 88, y: 45, shape: "rect", color: "amber", size: "md" },
    { id: "addnorm3", label: "Add & norm", sublabel: "", x: 88, y: 75, shape: "rect", color: "teal", size: "sm" },
    { id: "decout", label: "Decoder output", sublabel: "next layer / LM head", x: 88, y: 95, shape: "rect", color: "blue", size: "md" }
""", c)

with open(r'c:\Users\youss\Desktop\Youtube Sessions\content\sessions\module-1\04-transformer-attention.mdx', 'w', encoding='utf-8') as f:
    f.write(c)

print("done")
