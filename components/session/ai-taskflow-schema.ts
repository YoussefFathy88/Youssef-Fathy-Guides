/** Compact teaching view of the lab AiDecision JSON Schema (matches backend). */

export type SchemaFieldLine = {
  key: string;
  type: string;
  required?: boolean;
  note?: string;
  children?: SchemaFieldLine[];
};

export const AI_DECISION_SCHEMA_NAME = "AiDecision";

export const AI_DECISION_SCHEMA_LINES: SchemaFieldLine[] = [
  { key: "assistant_message", type: "string", required: true },
  {
    key: "action",
    type: "enum",
    required: true,
    note: "create_task · list_tasks · update_task · delete_task · none",
  },
  {
    key: "create_task",
    type: "object",
    note: "when action = create_task",
    children: [
      { key: "title", type: "string", required: true, note: "1–120 chars" },
      { key: "description", type: "string", note: "max 1000" },
      { key: "status", type: "todo | in_progress | done" },
      { key: "priority", type: "integer", note: "1–5 (default 3)" },
    ],
  },
  {
    key: "list_tasks",
    type: "object",
    note: "when action = list_tasks",
    children: [
      { key: "status", type: "todo | in_progress | done" },
      { key: "min_priority", type: "integer", note: "1–5" },
      { key: "title_query", type: "string" },
    ],
  },
  {
    key: "update_task",
    type: "object",
    note: "task_id | task_title | task_reference + fields to change",
    children: [
      { key: "task_id", type: "integer" },
      { key: "title", type: "string" },
      { key: "status", type: "enum" },
      { key: "priority", type: "integer" },
    ],
  },
  {
    key: "delete_task",
    type: "object",
    note: "task_id | task_title | task_reference",
    children: [{ key: "task_id", type: "integer" }],
  },
];

/** Example: user asks to create a high-priority task. */
export const DEMO_USER_MESSAGE =
  "Create a task: Review PRs before Friday, high priority";

export const DEMO_EXISTING_TASKS_JSON = `[
  { "id": 1, "title": "Review PRs", "status": "todo", "priority": 3 },
  { "id": 2, "title": "Send invoice to Acme", "status": "in_progress", "priority": 3 },
  { "id": 3, "title": "Fix login bug", "status": "todo", "priority": 2 }
]`;

export const DEMO_DECISION_JSON = `{
  "assistant_message": "I'll add a high-priority task to review PRs before Friday.",
  "action": "create_task",
  "create_task": {
    "title": "Review PRs before Friday",
    "description": "From user request",
    "status": "todo",
    "priority": 1
  }
}`;

export const DEMO_DB_RESULT_JSON = `{
  "id": 4,
  "title": "Review PRs before Friday",
  "status": "todo",
  "priority": 1
}`;
