"use client";

import { Callout, PanelTitle, TabExplorerShell, type ExplorerTab } from "@/components/session/tab-explorer-ui";
import AnnotatedCode from "@/components/shared/AnnotatedCode";
import AgentLoopStepper from "@/components/shared/AgentLoopStepper";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: readonly ExplorerTab[] = [
  { id: "schema", short: "1. The Schema", color: "violet" },
  { id: "loop", short: "2. The Decision Loop", color: "amber" },
] as const;

// ─── Tab 1 — The tool schema ────────────────────────────────────────────────────

function SchemaPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>A tool is a structured schema the model can read — name, description, and the arguments it must fill in.</PanelTitle>
      <AnnotatedCode
        title="create_jira_ticket — the tool definition the model sees"
        code={`tools = [
  {
    "name": "create_jira_ticket",
    "description": (
      "Create a new Jira ticket from one parsed requirement. "
      "Use this once per distinct requirement after checking "
      "existing specs for conflicts or duplicates."
    ),
    "input_schema": {
      "type": "object",
      "properties": {
        "project": { "type": "string", "description": "Project key, e.g. CHK" },
        "summary": { "type": "string", "description": "Short ticket title" },
        "description": { "type": "string", "description": "Full requirement text" },
        "priority": { "type": "string", "enum": ["Low", "Medium", "High", "Urgent"] }
      },
      "required": ["project", "summary", "description", "priority"]
    }
  }
]`}
        annotations={[
          { line: 3, label: "Tool name", description: "What your code calls this function.", color: "violet" },
          { line: 4, label: "Description", description: "What the model reads to decide when to call this tool — be specific.", color: "teal" },
          { line: 9, label: "Input schema", description: "JSON Schema for the arguments the model must generate.", color: "amber" },
          { line: 13, label: "Enum constraint", description: "Restricts priority to exactly these four values — no free text.", color: "blue" },
          { line: 15, label: "Required fields", description: "The model must supply all of these before the call is valid.", color: "violet" },
        ]}
      />
    </div>
  );
}

// ─── Tab 2 — The decision loop ─────────────────────────────────────────────────

function LoopPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PanelTitle>The model reasons, picks the tool, your code runs it, and the result comes back — then it repeats.</PanelTitle>
      <AgentLoopStepper
        title="One requirement, end to end — step through the loop"
        steps={[
          {
            id: "context",
            actor: "user",
            label: "One requirement arrives",
            bubble: "“Notify the user when their refund is approved.”",
            bubbleKind: "message",
            detail: "This one line from the requirements doc is placed in the model's context, alongside the tool schema from tab 1.",
          },
          {
            id: "decide",
            actor: "model",
            label: "The model outputs a tool call — not a reply",
            bubble: "{\n  \"tool\": \"create_jira_ticket\",\n  \"args\": {\n    \"project\": \"NOTIF\",\n    \"priority\": \"Medium\"\n  }\n}",
            bubbleLabel: "Model's output (structured JSON, not text)",
            detail: "The model doesn't write a ticket — it writes JSON saying which tool to run and what arguments to pass.",
          },
          {
            id: "execute",
            actor: "your-code",
            label: "Your code runs the real Jira API call",
            bubble: "jira.create_issue(project=\"NOTIF\", priority=\"Medium\")\n→ ticket NOTIF-118 created",
            detail: "The model never touches Jira. Your application reads the JSON and makes the actual API call.",
          },
          {
            id: "next",
            actor: "model",
            label: "The result comes back — model moves on",
            bubble: "“Filed NOTIF-118. Next requirement: add a retry button for failed payments.”",
            bubbleKind: "message",
            detail: "The ticket ID is added back to the conversation. The model loops back to step 1 with the next requirement.",
          },
        ]}
      />
      <Callout color="amber">
        This loop repeats once per requirement in the doc — decide, act, get a real result, decide again.
        That loop, not a single function call, is what makes this an <strong>agent</strong> instead of a script.
      </Callout>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PANELS = [SchemaPanel, LoopPanel] as const;

export default function ToolActionsExplorer() {
  return <TabExplorerShell tabs={TABS} panels={PANELS} ariaLabel="Tools: the schema and the decision loop" />;
}
