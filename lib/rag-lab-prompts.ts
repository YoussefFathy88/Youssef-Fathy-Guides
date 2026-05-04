/**
 * Copy-paste build prompts for Chat With Your Data (RAG lab) — consumed by RagLabPromptExplorer.
 */

export interface RagLabPromptFile {
  id: string;
  filename: string;
  language?: string;
  code: string;
  highlightLines?: number[];
}

const TREE = `rag-chatbot/
├── .gitignore
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ChatPanel.tsx
│   │   ├── MessageBubble.tsx
│   │   └── IndexModal.tsx
│   ├── .env.local.example
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── index.py
│   │   │   └── chat.py
│   │   ├── services/
│   │   │   ├── index_service.py
│   │   │   └── chat_service.py
│   │   └── core/
│   │       └── config.py
│   ├── .env.local.example
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml`;

const PROMPT_01_SCAFFOLD = `Build a RAG chatbot project with the following stack:
- Frontend: Next.js (App Router, TypeScript, Tailwind)
- Backend: FastAPI (Python)
- Vector DB: Chroma (local)
- Embeddings: OpenAI text-embedding-3-small
- LLM: OpenAI GPT-4o
- Orchestration: LangChain

Project structure must follow clean architecture:

rag-chatbot/
├── .gitignore
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ChatPanel.tsx
│   │   ├── MessageBubble.tsx
│   │   └── IndexModal.tsx
│   ├── .env.local.example
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── index.py
│   │   │   └── chat.py
│   │   ├── services/
│   │   │   ├── index_service.py
│   │   │   └── chat_service.py
│   │   └── core/
│   │       └── config.py
│   ├── .env.local.example
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml

UI direction (use the lab reference screenshot as your visual guide):
- Overall layout, spacing, and tone should match that reference.
- Claude-style shell: messages scroll in the main area; the chat input stays fixed at the bottom of the viewport.
- Upload / indexing should feel like Claude's attachment flow — calm, simple, obvious next step.
- Place the main "Index documents" control just below the chat composer so it's easy to find.

Requirements:
1. docker-compose.yml must run all services with one command: docker-compose up
2. FastAPI must run with --reload for hot reload
3. Next.js must run with next dev for hot reload
4. Both use volume mounts so code changes reflect without rebuild
5. Add a root .gitignore that ignores .env.local (frontend and backend), node_modules, .next, Python caches/venv, and local Chroma data — commit .env.local.example files only as templates.
6. Use the same env template name everywhere: frontend/.env.local.example and backend/.env.local.example, both listing required keys with placeholders. Load secrets from .env.local in dev (Next.js default; backend via python-dotenv).
7. requirements.txt must include all dependencies pinned to exact versions (example pins below — verify against PyPI)

Example requirements.txt:
fastapi==0.115.6
uvicorn[standard]==0.34.0
python-multipart==0.0.20
langchain==0.3.13
langchain-openai==0.3.6
langchain-chroma==0.1.4
chromadb==0.5.23
openai==1.59.7
python-dotenv==1.0.1
pypdf2==3.0.1

8. No implementation logic yet — only the structure, empty routers,
   empty services, and working docker-compose.yml
9. Add a /health endpoint in FastAPI to verify it's running`;

const PROMPT_02_INDEX_BACKEND = `Now implement the full Indexing pipeline in the backend.

Endpoint:
- POST /index
- Accepts: multipart/form-data with a PDF file
- Returns: JSON { "status": "success", "chunks": <number of chunks stored> }

Service: backend/app/services/index_service.py
Implement these steps in order:

1. UPLOAD
   - Accept the uploaded PDF file bytes

2. CHUNK
   - Use LangChain RecursiveCharacterTextSplitter
   - chunk_size: read from env INDEX_CHUNK_SIZE (default 500)
   - chunk_overlap: read from env INDEX_CHUNK_OVERLAP (default 50)
   - Split the PDF text into chunks

3. EMBED
   - Use OpenAI text-embedding-3-small
   - API key from env OPENAI_API_KEY

4. STORE
   - Use Chroma as vector store
   - Persist directory: read from env CHROMA_PATH (default ./chroma_db)
   - Collection name: read from env CHROMA_COLLECTION (default "documents")
   - Store all chunks with embeddings

Requirements:
- All config values must come from .env.local via core/config.py (loaded with python-dotenv)
- Add clear inline comments for each pipeline step
- Handle errors gracefully with proper HTTP exceptions
- Print a log line for each step:
  "Step 1/4: Uploading..."
  "Step 2/4: Chunking..."
  "Step 3/4: Embedding..."
  "Step 4/4: Storing..."
- Use PyPDF2 for PDF text extraction`;

const PROMPT_03_INDEX_FRONTEND = `Now implement the Index Modal in the Next.js frontend
to connect with the POST /index backend endpoint.

Component: frontend/components/IndexModal.tsx

UI Elements:
1. Modal overlay (opens when "Index Documents" button is clicked)
2. Drag & drop file upload zone
   - Accepts PDF files only
   - Show file name after selection
   - Show error if non-PDF is dropped
3. "Start Indexing" button
   - Disabled until a file is selected
4. Status section (shown after clicking Start Indexing):
   - Loading state: "Indexing your document..."
   - Success state: "Done! X chunks indexed successfully."
   - Error state: "Something went wrong. Please try again."
5. Close button (X) to dismiss modal

Component: frontend/components/ChatPanel.tsx
- Add an "Index Documents" button just below the chat composer (same placement as in Prompt 1)
- Clicking it opens the IndexModal

Integration:
- POST /index using FormData
- API base URL from NEXT_PUBLIC_API_URL in .env.local
- Use fetch, no extra libraries needed

Requirements:
- TypeScript strictly typed
- Tailwind for styling
- No form tags — use onClick/onChange handlers only
- Disable "Start Indexing" button while request is in progress
- Reset modal state when closed and reopened`;

const PROMPT_04_CHAT_BACKEND = `Now implement the full Chat (Retrieval) pipeline in the backend.

Endpoint:
- POST /chat
- Accepts: JSON { "message": "user question here" }
- Returns: JSON { "reply": "<full assistant answer as plain text>" } with status 200

Service: backend/app/services/chat_service.py
Implement these steps in order:

1. EMBED QUERY
   - Embed the user message using OpenAI text-embedding-3-small
   - Same model used during indexing for consistency

2. RETRIEVE
   - Query Chroma vector store for top-k similar chunks
   - k: read from env CHAT_RETRIEVAL_TOP_K (default 4)
   - Use same collection from indexing

3. BUILD CONTEXT
   - Join retrieved chunks into a single context string
   - Start with a line "Context:" then each chunk separated by a blank line

4. GENERATE
   - Use OpenAI GPT-4o via LangChain ChatOpenAI
   - System prompt:
     "You are a helpful assistant. Answer the user's question
      using ONLY the context provided. If the answer is not
      in the context, say: I don't know based on the provided documents."
   - Call the model once and wait for the complete answer string, then return it in "reply"

Requirements:
- Respond with application/json (e.g. FastAPI JSONResponse or a plain dict return)
- All config values must come from .env.local via core/config.py (loaded with python-dotenv)
- Add clear inline comments for each pipeline step
- Print a log line for each step:
  "Step 1/4: Embedding query..."
  "Step 2/4: Retrieving chunks..."
  "Step 3/4: Building context..."
  "Step 4/4: Generating response..."
- Handle case where no chunks are retrieved: return JSON with a helpful "reply" string such as
  "No relevant documents found. Please index documents first."`;

const PROMPT_05_CHAT_FRONTEND = `Now implement the Chat UI in the Next.js frontend
to connect with the POST /chat backend endpoint.

Component: frontend/components/ChatPanel.tsx
Update to include the full chat experience:

UI Elements:
1. Messages list
   - User message bubble (right aligned)
   - Assistant message bubble (left aligned)
   - Show a typing indicator while waiting for the HTTP response
   - Auto scroll to latest message after each turn completes

2. Input area (bottom, fixed like Prompt 1 — composer stays at the bottom of the viewport)
   - Text input field
   - Send button
   - Disable both while the chat request is in flight
   - Send on Enter key (Shift+Enter for new line)

3. Empty state (no messages yet)
   - Show a centered message: "Index a document and start asking questions."

API integration:
- POST /chat with JSON { "message": "user input" } and Content-Type: application/json
- API base URL from NEXT_PUBLIC_API_URL in .env.local
- Expect status 200 and JSON body { "reply": string }
- Parse with await response.json(), read reply, and append one assistant message with the full text

Message State Shape:
type Message = {
  role: "user" | "assistant"
  content: string
}

Requirements:
- TypeScript strictly typed
- Tailwind for styling
- No form tags — use onClick/onChange handlers only
- Handle non-OK responses and JSON errors — show a short error string inside the assistant bubble
- Scroll behavior: smooth auto-scroll once the assistant message is added`;

const PROMPT_06_UI_ENHANCEMENT = `Refactor the RAG chatbot UI to match the attached design mockup.
This is a frontend-only change — do NOT touch any backend, API routes,
or embedding logic.

The current UI sends a query and receives the full response at once
(no streaming). Keep that behavior exactly as-is.

## What to change

1. **Overall shell**
   - Dark background: #0f1117
   - Rounded card container with a subtle border: 0.5px solid rgba(255,255,255,0.08)
   - Remove any existing light theme or hard black blocks

2. **Top bar**
   - Left: gradient circle logo icon + title "RAG Assistant" + a small pill badge "Knowledge Base"
   - Right: two icon buttons (new chat, settings)
   - Border bottom: 0.5px solid rgba(255,255,255,0.07)

3. **Message bubbles**
   - User bubble: background #1a73e8, white text, top-right radius 4px
   - AI bubble: background rgba(255,255,255,0.05), border 0.5px solid rgba(255,255,255,0.07), top-left radius 4px
   - Error state bubble: background rgba(217,101,112,0.12), border rgba(217,101,112,0.3), text #f28b82, with a warning icon prefix
   - Each AI bubble that has a source should render citation chips below the text:
     small pill, background rgba(66,133,244,0.12), color #8ab4f8

4. **Typing indicator**
   - While waiting for the response, show a bubble with 3 animated bouncing dots
   - Show it immediately after the user sends, remove it when the response arrives
   - This replaces any existing loading spinner or blank state

5. **Suggestion chips row** (above the input)
   - Show 3 quick-question buttons when the conversation starts or after an AI reply
   - Clicking a chip fills and submits the input
   - Style: rounded pill, background rgba(255,255,255,0.04), border 0.5px solid rgba(255,255,255,0.10), muted text

6. **Input bar**
   - Rounded pill container (border-radius 24px) wrapping a textarea + attach icon + send button
   - Send button: filled circle, #1a73e8, disabled (gray) when input is empty
   - Textarea: auto-resizes up to 3 lines, no border, transparent background
   - Focus state on the pill: border-color rgba(66,133,244,0.5)
   - Footer note below input: "Answers grounded in indexed documents"

7. **Message flow (no streaming)**
   - On send: append user bubble → show typing indicator → await the existing API call →
     remove typing indicator → append AI bubble with the full response text
   - Do NOT change the API call itself, its URL, method, or payload
   - Do NOT add any streaming or chunked reading logic

## Do not change
- API endpoint URL or method
- Request payload structure
- Response parsing logic (keep whatever field you currently read for the answer text)
- "Index Documents" button functionality
- Any embedding, chunking, or vector DB code`;

export const RAG_LAB_BUILD_PROMPT_FILES: RagLabPromptFile[] = [
  {
    id: "tree",
    filename: "PROJECT_STRUCTURE.txt",
    language: "text",
    code: TREE,
  },
  {
    id: "p1",
    filename: "PROMPT_01_scaffold.prompt.txt",
    language: "text",
    code: PROMPT_01_SCAFFOLD,
  },
  {
    id: "p2-index-backend",
    filename: "PROMPT_02_index_backend.prompt.txt",
    language: "text",
    code: PROMPT_02_INDEX_BACKEND,
  },
  {
    id: "p3-index-frontend",
    filename: "PROMPT_03_index_frontend.prompt.txt",
    language: "text",
    code: PROMPT_03_INDEX_FRONTEND,
  },
  {
    id: "p4-chat-backend",
    filename: "PROMPT_04_chat_backend.prompt.txt",
    language: "text",
    code: PROMPT_04_CHAT_BACKEND,
  },
  {
    id: "p5-chat-frontend",
    filename: "PROMPT_05_chat_frontend.prompt.txt",
    language: "text",
    code: PROMPT_05_CHAT_FRONTEND,
  },
  {
    id: "p6-ui-enhancement",
    filename: "PROMPT_06_ui_enhancement.prompt.txt",
    language: "text",
    code: PROMPT_06_UI_ENHANCEMENT,
  },
];
