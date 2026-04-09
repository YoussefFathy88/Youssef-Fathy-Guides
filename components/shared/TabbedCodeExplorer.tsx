"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface ExplorerFile {
  id: string;
  filename: string;
  language?: string;
  code: string;
  description?: string;
  highlightLines?: number[];
}

export interface TabbedCodeExplorerProps {
  title?: string;
  caption?: string;
  files?: ExplorerFile[];
  defaultFile?: string;
  showFileTree?: boolean;
}

const LANG_ICONS: Record<string, string> = {
  python: "🐍",
  typescript: "🔷",
  javascript: "🟨",
  tsx: "⚛️",
  jsx: "⚛️",
  sql: "🗄️",
  bash: "💻",
  sh: "💻",
  json: "📋",
  css: "🎨",
  html: "🌐",
  yaml: "📄",
  yml: "📄",
  rust: "🦀",
  go: "🔵",
};

function getLangIcon(lang?: string): string {
  return LANG_ICONS[lang?.toLowerCase() ?? ""] ?? "📄";
}

function highlightLine(line: string): React.ReactNode {
  const patterns: { re: RegExp; cls: string }[] = [
    { re: /(#[^\n]*)/, cls: "text-gray-500 italic" },
    { re: /(\/\/[^\n]*)/, cls: "text-gray-500 italic" },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, cls: "text-amber-400" },
    {
      re: /\b(def|class|return|import|from|for|in|if|else|elif|elif|with|as|try|except|raise|async|await|const|let|var|function|export|default|new|this|true|false|null|undefined|type|interface|extends|implements|public|private|protected|static|readonly|enum|SELECT|FROM|WHERE|JOIN|ON|AND|OR|INSERT|UPDATE|DELETE|CREATE|TABLE)\b/,
      cls: "text-violet-400 font-medium",
    },
    { re: /\b(\d+(?:\.\d+)?)\b/, cls: "text-teal-400" },
  ];

  function tokenize(text: string, depth = 0): React.ReactNode[] {
    if (!text || depth > 8) return [text];
    for (const { re, cls } of patterns) {
      const match = text.match(re);
      if (match && match.index !== undefined) {
        return [
          ...tokenize(text.slice(0, match.index), depth + 1),
          <span key={`${depth}-${match.index}`} className={cls}>{match[0]}</span>,
          ...tokenize(text.slice(match.index + match[0].length), depth + 1),
        ];
      }
    }
    return [text];
  }
  return <>{tokenize(line)}</>;
}

const DEFAULT_FILES: ExplorerFile[] = [
  {
    id: "main",
    filename: "main.py",
    language: "python",
    code: `import openai
from utils import chunk_text, build_prompt

client = openai.OpenAI()

def answer_question(context: str, question: str) -> str:
    chunks = chunk_text(context, size=500)
    prompt = build_prompt(chunks, question)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content`,
    description: "Entry point — orchestrates chunking, prompt building, and the OpenAI API call.",
    highlightLines: [9, 10, 11],
  },
  {
    id: "utils",
    filename: "utils.py",
    language: "python",
    code: `def chunk_text(text: str, size: int = 500) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), size):
        chunk = " ".join(words[i:i + size])
        chunks.append(chunk)
    return chunks

def build_prompt(chunks: list[str], question: str) -> str:
    context = "\\n\\n".join(
        f"[{i+1}] {c}" for i, c in enumerate(chunks)
    )
    return f"""Use only the context below to answer.

Context:
{context}

Question: {question}
Answer:"""`,
    description: "Helper utilities — splits text into fixed-size chunks and assembles the final prompt string.",
    highlightLines: [1, 9],
  },
  {
    id: "config",
    filename: "config.json",
    language: "json",
    code: `{
  "model": "gpt-4o",
  "chunk_size": 500,
  "chunk_overlap": 50,
  "max_chunks_per_prompt": 3,
  "temperature": 0.2,
  "max_tokens": 512
}`,
    description: "Runtime configuration — adjust chunk size, model, or generation parameters without editing code.",
  },
];

export default function TabbedCodeExplorer({
  title,
  caption,
  files = DEFAULT_FILES,
  defaultFile,
  showFileTree = false,
}: TabbedCodeExplorerProps) {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(defaultFile ?? files[0]?.id ?? "");
  const [treeOpen, setTreeOpen] = useState(showFileTree);

  const activeFile = files.find(f => f.id === activeId) ?? files[0];

  if (!activeFile) return null;

  const codeLines = activeFile.code.split("\n");

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950 dark:border-gray-700">
        {/* Editor chrome + tabs */}
        <div className="flex items-center border-b border-gray-800 bg-gray-900">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500/70" />
          </div>

          {/* Tabs */}
          <div className="flex flex-1 items-center overflow-x-auto">
            {files.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveId(f.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-gray-800 px-4 py-2.5 text-[11px] transition",
                  f.id === activeId
                    ? "bg-gray-950 text-gray-200"
                    : "text-gray-500 hover:bg-gray-800/50 hover:text-gray-300",
                )}
              >
                <span className="text-xs">{getLangIcon(f.language)}</span>
                {f.filename}
              </button>
            ))}
          </div>

          {/* File tree toggle */}
          <button
            type="button"
            onClick={() => setTreeOpen(v => !v)}
            title="Toggle file explorer"
            className={cn(
              "mr-2 rounded px-2 py-1 text-[11px] transition",
              treeOpen ? "text-gray-300" : "text-gray-600 hover:text-gray-400",
            )}
          >
            ⊞
          </button>
        </div>

        <div className="flex">
          {/* File tree sidebar */}
          <AnimatePresence initial={false}>
            {treeOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 148, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="shrink-0 overflow-hidden border-r border-gray-800 bg-gray-900"
              >
                <div className="p-3">
                  <p className="mb-2 select-none text-[9px] uppercase tracking-widest text-gray-600">
                    Explorer
                  </p>
                  {files.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveId(f.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded px-2 py-1 text-[11px] text-left transition",
                        f.id === activeId
                          ? "bg-gray-800 text-gray-200"
                          : "text-gray-500 hover:text-gray-300",
                      )}
                    >
                      <span className="text-[11px]">{getLangIcon(f.language)}</span>
                      <span className="truncate">{f.filename}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Code area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-w-0 flex-1 overflow-x-auto p-4"
            >
              <table className="w-full border-separate border-spacing-0">
                <tbody>
                  {codeLines.map((line, i) => {
                    const lineNum = i + 1;
                    const isHighlighted = activeFile.highlightLines?.includes(lineNum) ?? false;
                    return (
                      <tr
                        key={lineNum}
                        className={cn(isHighlighted && "bg-amber-500/10")}
                      >
                        <td className="w-8 select-none pr-4 text-right font-mono text-[11px] text-gray-600">
                          {lineNum}
                        </td>
                        <td className="w-1 pr-2">
                          {isHighlighted && (
                            <div className="h-3 w-0.5 rounded-full bg-amber-500" />
                          )}
                        </td>
                        <td className="whitespace-pre font-mono text-[12.5px] text-gray-200">
                          {highlightLine(line)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        {activeFile.description && (
          <motion.p
            key={activeId}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            <span className="font-semibold text-gray-700 dark:text-gray-300">{activeFile.filename}</span>{" "}
            — {activeFile.description}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
