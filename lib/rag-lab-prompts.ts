/**
 * Copy-paste build prompts for Introduction to RAG lab — consumed by RagLabPromptExplorer.
 */

export interface RagLabPromptFile {
  id: string;
  filename: string;
  language?: string;
  code: string;
  highlightLines?: number[];
}

const TREE = `rag-chatbot/
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
│   ├── .env.example
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
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml

Requirements:
1. docker-compose.yml must run all services with one command: docker-compose up
2. FastAPI must run with --reload for hot reload
3. Next.js must run with next dev for hot reload
4. Both use volume mounts so code changes reflect without rebuild
5. .env.example files must include all required keys with placeholder values
6. requirements.txt must include all dependencies pinned to exact versions (example pins below — verify against PyPI)

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

7. No implementation logic yet — only the structure, empty routers,
   empty services, and working docker-compose.yml
8. Add a /health endpoint in FastAPI to verify it's running`;

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
- All config values must come from .env via core/config.py
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
- Add an "Index Documents" button (top right corner)
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
- Returns: streaming text response (StreamingResponse)

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
   - Stream the response back token by token

Requirements:
- Use FastAPI StreamingResponse with media_type="text/event-stream"
- All config values must come from .env via core/config.py
- Add clear inline comments for each pipeline step
- Print a log line for each step:
  "Step 1/4: Embedding query..."
  "Step 2/4: Retrieving chunks..."
  "Step 3/4: Building context..."
  "Step 4/4: Generating response..."
- Handle case where no chunks are retrieved: return a clear message
  "No relevant documents found. Please index documents first."`;

const PROMPT_05_CHAT_FRONTEND = `Now implement the Chat UI in the Next.js frontend
to connect with the POST /chat backend endpoint.

Component: frontend/components/ChatPanel.tsx
Update to include the full chat experience:

UI Elements:
1. Messages list
   - User message bubble (right aligned)
   - Assistant message bubble (left aligned)
   - Show a typing indicator while waiting for response
   - Auto scroll to latest message

2. Input area (bottom)
   - Text input field
   - Send button
   - Disable both while response is streaming
   - Send on Enter key (Shift+Enter for new line)

3. Empty state (no messages yet)
   - Show a centered message: "Index a document and start asking questions."

Streaming Integration:
- POST /chat with JSON { "message": "user input" }
- API base URL from NEXT_PUBLIC_API_URL in .env.local
- Read the StreamingResponse token by token using:
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
- Append each token to the assistant bubble in real time as it arrives

Message State Shape:
type Message = {
  role: "user" | "assistant"
  content: string
}

Requirements:
- TypeScript strictly typed
- Tailwind for styling
- No form tags — use onClick/onChange handlers only
- Handle stream errors gracefully — show error inside assistant bubble
- Scroll behavior: smooth auto-scroll on each new token`;

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
];
