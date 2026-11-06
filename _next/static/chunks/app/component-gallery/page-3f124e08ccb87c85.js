(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[449],{844:(e,t,o)=>{Promise.resolve().then(o.bind(o,2071))},2071:(e,t,o)=>{"use strict";o.r(t),o.d(t,{default:()=>g});var a=o(335),n=o(2823),i=o(5575);o(2787);var s=o(4237),r=o(7449);o(9346),o(7487);var l=o(8179);o(9978),o(5377),o(3081);var d=o(5059),c=o(1777);let h=[{id:"tree",filename:"PROJECT_STRUCTURE.txt",language:"text",code:`rag-chatbot/
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
└── docker-compose.yml`},{id:"p1",filename:"PROMPT_01_scaffold.prompt.txt",language:"text",code:`Build a RAG chatbot project with the following stack:
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
9. Add a /health endpoint in FastAPI to verify it's running`},{id:"p2-index-backend",filename:"PROMPT_02_index_backend.prompt.txt",language:"text",code:`Now implement the full Indexing pipeline in the backend.

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
- Use PyPDF2 for PDF text extraction`},{id:"p3-index-frontend",filename:"PROMPT_03_index_frontend.prompt.txt",language:"text",code:`Now implement the Index Modal in the Next.js frontend
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
- Reset modal state when closed and reopened`},{id:"p4-chat-backend",filename:"PROMPT_04_chat_backend.prompt.txt",language:"text",code:`Now implement the full Chat (Retrieval) pipeline in the backend.

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
  "No relevant documents found. Please index documents first."`},{id:"p5-chat-frontend",filename:"PROMPT_05_chat_frontend.prompt.txt",language:"text",code:`Now implement the Chat UI in the Next.js frontend
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
- Scroll behavior: smooth auto-scroll once the assistant message is added`},{id:"p6-ui-enhancement",filename:"PROMPT_06_ui_enhancement.prompt.txt",language:"text",code:`Refactor the RAG chatbot UI to match the attached design mockup.
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
- Any embedding, chunking, or vector DB code`}];var p=o(9023);let u=[{title:"Query",caption:"A user asks for an answer grounded in external knowledge.",visual:(0,a.jsxs)("div",{className:"flex min-h-[160px] flex-col justify-center gap-4 rounded-2xl bg-violet-500/10 p-6",children:[(0,a.jsx)("span",{className:"text-xs uppercase tracking-[0.24em] text-violet-500 dark:text-violet-300",children:"User intent"}),(0,a.jsx)("p",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100",children:'"Summarize the company policy on remote work."'})]})},{title:"Embed",caption:"The query becomes a vector so the system can search semantically.",visual:(0,a.jsx)("div",{className:"grid min-h-[160px] gap-3 rounded-2xl bg-teal-500/10 p-6 sm:grid-cols-5",children:[.12,.44,.81,.29,.63].map(e=>(0,a.jsx)("div",{className:"flex items-end justify-center rounded-2xl bg-white/80 p-4 dark:bg-gray-900/70",children:(0,a.jsx)("div",{className:"w-full rounded-full bg-teal-500 dark:bg-teal-400",style:{height:`${100*e}px`}})},e))})},{title:"Retrieve",caption:"Nearest chunks are pulled from the vector store.",visual:(0,a.jsx)("div",{className:"grid min-h-[160px] gap-3 rounded-2xl bg-amber-500/10 p-6",children:["Remote work policy v3","Manager approval workflow","Equipment reimbursement FAQ"].map((e,t)=>(0,a.jsx)("div",{className:"rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-amber-500/30 dark:bg-gray-900/70 dark:text-gray-200",style:{transform:`translateX(${8*t}px)`},children:e},e))})},{title:"Generate",caption:"The model answers using both the prompt and retrieved evidence.",visual:(0,a.jsx)("div",{className:"flex min-h-[160px] items-center rounded-2xl bg-gray-900 p-6 text-gray-100",children:(0,a.jsx)("p",{className:"max-w-2xl text-sm",children:"Employees may work remotely up to three days per week with manager approval."})})}],m=[{name:"SessionSection",node:(0,a.jsxs)(l.SessionSection,{id:"gallery-demo",label:"Gallery demo",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold text-gray-100",children:"Example section body"}),(0,a.jsx)("p",{className:"mt-2 text-gray-300",children:"Minimal preview of section chrome and content area."})]})},{name:"RecapTable",node:(0,a.jsx)(r.RecapTable,{rows:[{term:"Token",definition:"The basic unit the model processes."},{term:"Embedding",definition:"A vector representation of meaning."}]})},{name:"NextSessionCard",node:(0,a.jsx)(s.NextSessionCard,{title:"Embeddings",slug:"embeddings",teaser:"How integers become comparable vectors in semantic space.",module:1})},{name:"RagLabSystemArchitecture",node:(0,a.jsx)(d.RagLabSystemArchitecture,{title:"Gallery preview — RAG lab stack"})},{name:"RagLabPromptExplorer",node:(0,a.jsx)(function(){return(0,a.jsx)(c.default,{title:"Project tree & build prompts",caption:"One prompt per tab after the tree — paste in order: scaffold → index backend → index frontend → chat backend → chat frontend.",defaultFile:"tree",showFileTree:!0,files:h})},{})},{name:"AgentLoopStepper",node:(0,a.jsx)(p.zf,{title:"The complete tool-use loop — step through it yourself",caption:"Press Step → to advance one step at a time, or Play to run through automatically",steps:[{id:"define",actor:"user",label:"You define tools and send the user message",bubble:"POST /v1/messages\n{\n  tools: [{ name: 'get_weather', ... }],\n  messages: [...]\n}",detail:"Your API call includes a tools array alongside the user message. Each tool has a name, a description, and an input_schema."},{id:"decide",actor:"model",label:"Model decides to call a tool",bubble:"Response: stop_reason: 'tool_use'\ncontent: [{ type: 'tool_use', name: 'get_weather', input: { city: 'Cairo' } }]",detail:"The model returns a structured tool_use block — the tool name and the arguments it wants to pass."},{id:"execute",actor:"your-code",label:"Your application executes the tool",bubble:"result = get_weather(city='Cairo')",detail:"Your application reads the tool_use block, calls the actual function, and gets a real result."},{id:"return",actor:"user",label:"You send the tool result back",bubble:"messages: [..., { role: 'user', content: [tool_result] }]",detail:"You append a tool_result message to the conversation with the real data your function returned."},{id:"answer",actor:"model",label:"Model generates the final answer",bubble:"The current weather in Cairo is 34\xb0C and sunny.",detail:"With the tool result in context, the model generates its response grounded in real data."}]})},{name:"NodeFlowDiagram",node:(0,a.jsx)(p.qF,{title:"From raw text to what the model actually reads",height:360,nodes:[{id:"text",label:"Raw Text",sublabel:'"Hello, world!"',x:10,y:35,color:"gray",shape:"rect",emoji:"\uD83D\uDCDD"},{id:"bpe",label:"BPE Tokenizer",sublabel:"Byte-pair encoding",x:36,y:35,color:"violet",shape:"rect",size:"lg",emoji:"✂️"},{id:"tokens",label:"Token Strings",sublabel:'"Hello", ",", " world"…',x:62,y:35,color:"teal",shape:"rect",emoji:"\uD83D\uDD24"},{id:"ids",label:"Token IDs",sublabel:"[15496, 11, 995…]",x:86,y:35,color:"amber",shape:"rect",emoji:"\uD83D\uDD22"},{id:"window",label:"Context Window",sublabel:"Max tokens the model holds",x:86,y:78,color:"blue",shape:"hex",size:"lg",emoji:"\uD83E\uDE9F"}],edges:[{from:"text",to:"bpe",animated:!0,stepNumber:1},{from:"bpe",to:"tokens",animated:!0,stepNumber:2},{from:"tokens",to:"ids",animated:!0,stepNumber:3},{from:"ids",to:"window",animated:!0,stepNumber:4,label:"fills up to limit"}],steps:[{id:"s1",label:"Step 1 — Raw text enters",description:"Your string enters the tokenization pipeline exactly as typed.",highlightNodes:["text"],highlightEdges:[]},{id:"s2",label:"Step 2 — BPE splits into tokens",description:"The tokenizer applies Byte-Pair Encoding rules learned from training data.",highlightNodes:["bpe","tokens"],highlightEdges:["text→bpe","bpe→tokens"]},{id:"s3",label:"Step 3 — Tokens mapped to integers",description:"Each token string maps to a fixed integer ID in the vocabulary.",highlightNodes:["tokens","ids"],highlightEdges:["tokens→ids"]},{id:"s4",label:"Step 4 — IDs fill the context window",description:"The integer sequence is placed into the context window — the hard limit for one call.",highlightNodes:["ids","window"],highlightEdges:["ids→window"]}]})},{name:"DualLanePipelineDiagram",node:(0,a.jsx)(p.QH,{title:"Prepare vs run — compact lanes + readable arrows",presentation:!0,minHeight:520,hideStepNarrative:!0,lanes:[{id:"prep",label:"Data preparation",color:"violet",blocks:[{id:"upload",label:"Upload",emoji:"\uD83D\uDCE4"},{id:"chunk",label:"Chunk",emoji:"✂️"},{id:"embed-i",label:"Embed",emoji:"\uD83D\uDD22"},{id:"store",label:"Chroma",emoji:"\uD83D\uDDC4️"}]},{id:"run",label:"Running",color:"teal",blocks:[{id:"q",label:"Question",emoji:"❓"},{id:"embed-q",label:"Embed",emoji:"\uD83D\uDD22"},{id:"retrieve",label:"Retrieve",emoji:"\uD83D\uDD0D"},{id:"gen",label:"LLM",emoji:"\uD83E\uDD16",accent:"blue"}]}],edges:[{from:"upload",to:"chunk",animated:!1},{from:"chunk",to:"embed-i",animated:!1},{from:"embed-i",to:"store",animated:!0},{from:"q",to:"embed-q",animated:!0},{from:"embed-q",to:"retrieve",animated:!0},{from:"store",to:"retrieve",animated:!0},{from:"retrieve",to:"gen",animated:!0},{from:"q",to:"gen",animated:!0,dashed:!0,label:"+ question (prompt)"}],steps:[{id:"s1",label:"Ingest",description:"Documents enter the indexing lane.",highlightNodes:["upload"],highlightEdges:[]},{id:"s2",label:"Chunk",description:"Split text into overlapping segments for embedding.",highlightNodes:["upload","chunk"],highlightEdges:["upload→chunk"]}]})},{name:"ParameterSlider",node:(0,a.jsx)(p.zP,{label:"Temperature",min:0,max:2,step:.1,defaultValue:.8,states:[{max:.5,description:"Deterministic and focused",examples:["The cat sat on the mat.","The cat sat on the mat.","The cat sat on the mat."],colorClassName:"bg-violet-500 dark:bg-violet-400"},{max:1.2,description:"Balanced creativity",examples:["The cat sat on the mat.","The cat lounged across a moonlit quilt.","The cat improvised a jazz solo on the mat."],colorClassName:"bg-teal-500 dark:bg-teal-400"},{description:"Highly random and creative",examples:["The cat composed a sonnet on the mat.","The cat moonwalked across a velvet mat."],colorClassName:"bg-amber-500 dark:bg-amber-400"}]})},{name:"AttentionHeatmap",node:(0,a.jsx)(p.x9,{title:"Self-attention over a short sentence",caption:"Select a token to isolate which words it attends to most strongly.",tokens:["The","cat","sat","on","the","mat"],weights:[[1,.12,.08,.05,.28,.1],[.18,1,.24,.14,.26,.3],[.12,.31,1,.2,.14,.22],[.05,.18,.24,1,.11,.37],[.22,.26,.12,.08,1,.29],[.07,.28,.21,.34,.22,1]]})},{name:"TransformerSentenceTokenStrip",node:(0,a.jsx)(p.Mv,{title:"Tokens → IDs",tokens:["The","capital","of","Egypt","is","Cairo"],ids:[8842,3104,77,5602,892,4021]})},{name:"EmbeddingVectorsTable",node:(0,a.jsx)(p.a5,{title:"Embedding vectors (mock)",tokens:["The","capital","of","Egypt","is","Cairo"],ids:[8842,3104,77,5602,892,4021],dim:8})},{name:"PositionalEncodingVisualizer",node:(0,a.jsx)(p.Ds,{title:"Positional encoding — order, waves, table, sum",caption:"Vaswani PE: large numeric table on Position signal step, then sum stub.",tokens:["The","capital","of","Egypt","is","Cairo"],dModel:8,tableDims:8,initialStep:0})},{name:"GradientInstabilityExplorer",node:(0,a.jsx)(p.I_,{minimal:!0})},{name:"LinearRegressionTrainingExplorer",node:(0,a.jsx)(p.Mt,{})},{name:"LinearChainGradientExplorer (vanish)",node:(0,a.jsx)(p.u9,{story:"vanish"})},{name:"LinearChainGradientExplorer (explode)",node:(0,a.jsx)(p.u9,{story:"explode"})},{name:"LinearMappingGraph",node:(0,a.jsx)(p.uT,{m:2,c:0,knownPoints:[{x:0,y:0,label:"x=0, y=0"},{x:1,y:2,label:"x=1, y=2"}]})},{name:"TransformerSubstackExplorer",node:(0,a.jsxs)("div",{className:"flex flex-col gap-8",children:[(0,a.jsx)(p.Pz,{variant:"encoder",layerCount:6}),(0,a.jsx)(p.Pz,{variant:"decoder",layerCount:96})]})},{name:"ConceptStepper",node:(0,a.jsx)(p.kX,{steps:u,title:"RAG pipeline walkthrough"})},{name:"ContextLimitSimulator",node:(0,a.jsx)(p.RB,{title:"Contract review tool: watch the context window fill up — then see the fix",caption:"Press Next Step to advance. Watch the token bar and running total update at each stage.",windowSize:128e3,steps:[{id:"s1",label:"Step 1 — Lawyer pastes the full contract",caption:"A 15,000-word merger agreement lands in the input box. At 1.3 tokens per word for legal text, this is 20,000 tokens before anything else enters the context.",blocks:[{id:"contract",label:"Contract (20,000 tokens)",tokens:2e4,color:"rose"}],sideNote:null,errorState:!1,resetBar:!1},{id:"s2",label:"Step 2 — System prompt loads",caption:"The app prepends a 1,000-token system prompt: role instructions, output format rules, jurisdiction notes, and disclaimers. Running total: 21,000 tokens.",blocks:[{id:"contract",label:"Contract (20,000 tokens)",tokens:2e4,color:"rose"},{id:"system",label:"System prompt (1,000 tokens)",tokens:1e3,color:"gray"}],sideNote:"21,000 / 128,000 tokens used",errorState:!1,resetBar:!1},{id:"s3",label:"Step 3 — Conversation history accumulates",caption:"Five back-and-forth turns from earlier in the session add another 4,000 tokens. Running total: 25,000. Still under a 128k limit — but already over a 16k or 32k model.",blocks:[{id:"contract",label:"Contract (20,000 tokens)",tokens:2e4,color:"rose"},{id:"system",label:"System prompt (1,000 tokens)",tokens:1e3,color:"gray"},{id:"history",label:"Chat history (4,000 tokens)",tokens:4e3,color:"amber"}],sideNote:"⚠️ 25,000 tokens — over 16k and 32k model limits",errorState:!1,resetBar:!1},{id:"s4",label:"Step 4 — Context limit hit on a smaller model",caption:"The lawyer submits a question. The API returns context_length_exceeded. The app either crashes or silently truncates the oldest content — dropping part of the contract the answer depended on.",blocks:[{id:"contract",label:"Contract (20,000 tokens)",tokens:2e4,color:"rose"},{id:"system",label:"System prompt (1,000 tokens)",tokens:1e3,color:"gray"},{id:"history",label:"Chat history (4,000 tokens)",tokens:4e3,color:"amber"}],sideNote:"❌ context_length_exceeded — API error or silent truncation",errorState:!0,resetBar:!1},{id:"s5",label:"Step 5 — Fix: chunk the contract, retrieve only what's needed",caption:"The contract is split into 500-token sections at indexing time. Each question triggers a search over those sections. Only the 3 most relevant chunks (~1,920 tokens) enter the context instead of all 20,000. The limit is never approached.",blocks:[{id:"system",label:"System prompt (1,000 tokens)",tokens:1e3,color:"gray"},{id:"history",label:"Chat history (4,000 tokens)",tokens:4e3,color:"amber"},{id:"chunk1",label:"Chunk 1 — Liability clause (640 tokens)",tokens:640,color:"teal"},{id:"chunk2",label:"Chunk 2 — Termination terms (640 tokens)",tokens:640,color:"teal"},{id:"chunk3",label:"Chunk 3 — Payment schedule (640 tokens)",tokens:640,color:"teal"}],sideNote:"✅ 6,920 / 128,000 tokens — same answer, 10\xd7 fewer tokens",errorState:!1,resetBar:!0}]})},{name:"CompactCommandSimulator",node:(0,a.jsx)(p.JZ,{title:"/compact — compress terminal context into a summary handoff",caption:"Prev / Next below. On the compressing step, a scan runs and blocks collapse; the next step shows the summary row.",windowSize:2e5,steps:[{id:"c1",label:"Step 1 — Fresh session",caption:"Empty window; nothing in the stack yet.",blocks:[],tokenCount:0,sideNote:"0 / 200,000 tokens",phase:"normal"},{id:"c2",label:"Step 2 — Context loaded",caption:"Files, tests, and chat turns add tokens.",blocks:[{id:"a",label:"Source files read",tokens:12e3,color:"teal"},{id:"b",label:"Test output",tokens:4e3,color:"amber"}],tokenCount:16e3,sideNote:"16,000 / 200,000 — room to work",phase:"normal"},{id:"c3",label:"Step 3 — Run /compact",caption:"Scan and collapse the stacked context.",blocks:[{id:"a",label:"Source files read",tokens:12e3,color:"teal"},{id:"b",label:"Test output",tokens:4e3,color:"amber"}],tokenCount:16e3,sideNote:"Compressing…",phase:"compressing"},{id:"c4",label:"Step 4 — Summary only",caption:"A small summary block replaces the raw transcript.",blocks:[{id:"sum",label:"Compact summary (goals, files, next steps)",tokens:2400,color:"blue"}],tokenCount:2400,sideNote:"✅ 2,400 / 200,000 — continuity preserved",phase:"compacted"}]})},{name:"ContextWindowFiller",node:(0,a.jsx)(p.KN,{title:"What fills the context window — toggle blocks on and off",caption:"Toggle each block to see how different content types compete for the same fixed space",windowSize:128e3,costPer1kTokens:.003,blocks:[{id:"system",label:"System prompt",tokens:420,color:"gray",defaultOn:!0,icon:"⚙️",description:"Instructions, persona, constraints"},{id:"few-shot",label:"Few-shot examples",tokens:2800,color:"violet",defaultOn:!1,icon:"\uD83D\uDCCB",description:"3 example input/output pairs"},{id:"history",label:"Conversation history",tokens:14e3,color:"amber",defaultOn:!1,icon:"\uD83D\uDCAC",description:"10 turns of back-and-forth"},{id:"message",label:"Current message",tokens:180,color:"blue",defaultOn:!0,icon:"✏️",description:"The user's current question"}]})},{name:"DualPhaseFlow",node:(0,a.jsx)(p.MY,{title:"Medical research RAG — 40,000 trial documents to a cited answer",caption:"Indexing runs once at setup. Every researcher question runs the query phase in milliseconds.",leftPhase:{label:"Index (setup)",frequency:"Runs once at deployment",frequencyDetail:"40,000 PDFs produce ~800,000 chunks. Takes hours but only ever runs once.",color:"violet",steps:[{id:"docs",label:"40,000 trial documents",sublabel:"PDFs covering 20 years",icon:"\uD83D\uDCCB"},{id:"chunk-med",label:"Chunk into 500-token segments",sublabel:"~800,000 total chunks",icon:"✂️"},{id:"bio-embed",label:"Biomedical embedding model",sublabel:"Fine-tuned on medical text",icon:"\uD83E\uDDEC"}]},rightPhase:{label:"Query (per researcher)",frequency:"Runs on every question",frequencyDetail:"Same biomedical model embeds the question before similarity search.",color:"teal",steps:[{id:"researcher-q",label:"Researcher question",sublabel:"What were the adverse events in Phase 2 trial?",icon:"\uD83D\uDD2C"},{id:"vec-search",label:"Top 5 chunks retrieved",sublabel:"Vector search",icon:"\uD83D\uDD0D"},{id:"llm-answer",label:"LLM generates cited answer",sublabel:"According to Trial NCT-2847...",icon:"\uD83D\uDCDD"}]},artifact:{label:"Vector database",sublabel:"800,000 chunk vectors. Searched in milliseconds.",icon:"\uD83D\uDDC3️"}})},{name:"EmbeddingSearchSimulator",node:(0,a.jsx)(p.yM,{title:"Semantic ticket router — powered by embeddings",caption:"Type a ticket (or pick a preset), press Start walkthrough, then use Next at each stage to see tokenizing, embedding, similarity scores, and the final route.",placeholder:"e.g. I can't log into my account after the update",presets:["can't log in after resetting my password","my invoice shows the wrong amount","the app crashes when I open the dashboard","how do I add a new team member?","I was charged twice this month","export to CSV is not working","forgot my two-factor auth device"],categories:[{id:"auth",label:"Authentication & Access",centroidLabel:"login, password, MFA, locked out, access denied",color:"blue",icon:"\uD83D\uDD10"},{id:"billing",label:"Billing & Payments",centroidLabel:"invoice, charge, refund, subscription, payment failed",color:"amber",icon:"\uD83D\uDCB3"},{id:"bugs",label:"Bug Reports",centroidLabel:"crash, error, broken, not working, unexpected behaviour",color:"red",icon:"\uD83D\uDC1B"},{id:"account",label:"Account Management",centroidLabel:"add user, team, permissions, role, invite, settings",color:"teal",icon:"\uD83D\uDC65"},{id:"data",label:"Data & Exports",centroidLabel:"export, download, CSV, report, sync, import",color:"violet",icon:"\uD83D\uDCCA"}],stages:[{id:"tokenize",label:"Stage 1 — Tokenize the ticket",description:"The ticket text is split into tokens, the same process covered in the previous session."},{id:"embed",label:"Stage 2 — Embed into vector space",description:"The embedding model maps the token sequence to a single fixed-length vector. This vector is the semantic fingerprint of the ticket."},{id:"compare",label:"Stage 3 — Cosine similarity against every category",description:"The ticket vector is compared to each category centroid. The score is the cosine of the angle between them — 1.0 is identical direction, 0.0 is orthogonal."},{id:"route",label:"Stage 4 — Route to the winning category",description:"The category with the highest cosine similarity score is assigned. No keywords. No rules. Just geometry."}]})},{name:"ConceptCompare",node:(0,a.jsx)(p.cg,{title:"RAG vs Fine-tuning",left:{label:"RAG",description:"Inject external knowledge at runtime without changing weights.",points:["Fast to update when documents change","Grounds outputs in retrieved evidence","Depends on retrieval quality and chunking"],color:"violet"},right:{label:"Fine-tuning",description:"Adjust model behaviour by training weights on examples.",points:["Improves style, structure, or task-specific behavior","Useful when the pattern must become native to the model","Requires curated data and training workflow"],color:"teal"}})},{name:"MiniPlayground",node:(0,a.jsx)(p.lN,{title:"Prompt simulation",caption:"A tiny prompt playground for showing input-output transformation.",simulationFn:e=>`LLM processed: ${e.toUpperCase()}`,hint:"This simulation uppercases the text so you can focus on the interaction pattern."})},{name:"Vector2DPlot",node:(0,a.jsx)(p.tP,{title:"Semantic clusters in embedding space",caption:"Drag the query point around to see which cluster becomes closest.",points:[{id:"query",label:"query",x:48,y:52,cluster:"query",isQuery:!0},{id:"cat",label:"cat",x:28,y:28,cluster:"animals"},{id:"dog",label:"dog",x:22,y:38,cluster:"animals"},{id:"lion",label:"lion",x:34,y:22,cluster:"animals"},{id:"car",label:"car",x:72,y:30,cluster:"vehicles"},{id:"train",label:"train",x:78,y:42,cluster:"vehicles"},{id:"pizza",label:"pizza",x:62,y:74,cluster:"food"},{id:"apple",label:"apple",x:52,y:82,cluster:"food"}]})},{name:"RNNUnrolledOverview",node:(0,a.jsx)(p.DC,{title:"RNN unrolled — The capital of Egypt is Cairo",caption:"Five timesteps over the prefix The … is; the target next token is Cairo (above the last column). Prev/Next highlights one column and the hidden-state arrow feeding it.",terminalNextToken:"Cairo",stepDescriptions:["Timestep 1: the previous hidden state h₀ (often a zero vector) enters the RNN together with the first word, The. The cell writes a new summary h₁ and predicts the next token.","Timestep 2: h₁ is passed forward (orange arrow). The word capital is read in; the cell compresses it with everything already in h₁ into h₂.","Timestep 3: h₂ carries the phrase so far; of updates it to h₃. Each step reuses the same weights — only the hidden vector and input word change.","Timestep 4: Egypt is processed into h₄. Information from early words is not stored in separate slots; it is mixed into one vector that keeps getting overwritten.","Timestep 5: is arrives; the hidden state becomes h₅. The prediction above this column is Cairo — there is still no direct wire from The to Cairo; the subject must survive every intermediate update inside one bottleneck."]})},{name:"TokenProbDist",node:(0,a.jsx)(p.fV,{title:'Next-token candidates after "The cat sat on the"',caption:"Sampling controls reshape the distribution before a token is drawn.",candidates:[{token:"mat",rawProb:.36},{token:"floor",rawProb:.2},{token:"couch",rawProb:.16},{token:"rug",rawProb:.11},{token:"sofa",rawProb:.09},{token:"chair",rawProb:.08}],showTopP:!0,defaultTemperature:1,defaultTopP:.9,highlightTop:2})},{name:"StepSequence",node:(0,a.jsx)(p.Gl,{title:"What tools can wrap — four examples of the same pattern",caption:"Click any step to expand — the tool is always a thin wrapper around something that already exists",orientation:"horizontal",steps:[{number:1,phase:"REST API",title:"get_weather(city)",detail:"Wraps a call to a weather API. Your function hits the API, gets JSON back, returns the result.",color:"violet",icon:"\uD83C\uDF24️"},{number:2,phase:"Database",title:"get_customer_orders(id)",detail:"Wraps a SQL query to your orders database. Your function runs the query, returns the rows.",color:"teal",icon:"\uD83D\uDDC4️"},{number:3,phase:"Service",title:"send_notification(user, msg)",detail:"Wraps an internal notification microservice.",color:"amber",icon:"\uD83D\uDCE8"},{number:4,phase:"Code",title:"run_python(code)",detail:"Wraps a sandboxed Python executor.",color:"blue",icon:"⚙️"}]})},{name:"AnnotatedCode",node:(0,a.jsx)(p.ad,{title:"A well-defined tool in Python — Anthropic SDK format",caption:"Click a callout number to highlight the corresponding line",code:`tools = [
  {
    "name": "get_order_status",
    "description": (
      "Look up the current status of a specific customer order "
      "by order ID. Use this when the user asks about a specific "
      "order, shipment, or delivery. Returns: status, estimated "
      "delivery date, and tracking number."
    ),
    "input_schema": {
      "type": "object",
      "properties": {
        "order_id": {
          "type": "string",
          "description": "The unique order ID, e.g. ORD-12345"
        }
      },
      "required": ["order_id"]
    }
  }
]`,annotations:[{line:3,label:"Tool name",description:"What your code calls this function.",color:"violet"},{line:4,label:"Description",description:"What the model reads to decide when to call this tool.",color:"teal"},{line:10,label:"Input schema",description:"JSON Schema for arguments the model must provide.",color:"amber"}]})},{name:"TrainingLoopSimulator",node:(0,a.jsx)(p.jr,{title:"Watch the model learn — probability of 'Paris' rises as training runs",caption:"Click Start Training to run through 80 epochs. Watch the loss fall and the distribution sharpen toward the correct answer."})},{name:"AutoregressiveDemo",node:(0,a.jsx)(p.cZ,{title:"Inference: a full Q&A generated token by token",caption:"Click 'Step Into' to reveal the next-token probabilities, then click it again to append the chosen token.",question:"What is the capital of France?",contextPrefix:"The capital of France is",tokens:["Paris",","," which"," is"," also"," France","'s"," largest"," city","."],topCandidates:[{step:0,candidates:[{token:"Paris",prob:.91},{token:"Lyon",prob:.04}]},{step:1,candidates:[{token:",",prob:.65},{token:".",prob:.2}]}]})},{name:"TransformerLogitsExplainer",node:(0,a.jsx)(p.e6,{title:"Logits → softmax → probability distribution",caption:"Step through how raw model scores become the next-token probabilities.",candidates:[{token:"Paris",logit:9.2,rawProb:.91},{token:"Lyon",logit:3.1,rawProb:.04},{token:"a",logit:1.8,rawProb:.02},{token:"the",logit:1.4,rawProb:.01}]})},{name:"InferenceWalkthrough",node:(0,a.jsx)(p.M0,{title:"End-to-end: from question to answer",caption:"Step through each stage of a real LLM inference call.",question:"What is the capital of France?",answer:"The capital of France is Paris.",logitCandidates:[{token:"Paris",logit:9.2,rawProb:.91},{token:"Lyon",logit:3.1,rawProb:.04},{token:"a",logit:1.8,rawProb:.02}]})},{name:"LiveTokenizer",node:(0,a.jsx)(p.G_,{title:"Type any text — see how the tokenizer splits it into chips",caption:"Each colored chip is one token. Click any chip to see its integer ID."})},{name:"ThinkingModeSimulator",node:(0,a.jsx)(p.c$,{title:"Same prompt — watch fast mode and thinking mode race side by side",caption:"Press Play to run both simultaneously."})},{name:"ChatReplay",node:(0,a.jsx)(p.a6,{title:"Support agent without vs with episodic memory",caption:"Toggle between the two — notice how the agent changes when it can access past interaction records."})},{name:"MemoryOrchestrator",node:(0,a.jsx)(p.IA,{title:"Toggle each memory type ON/OFF — watch how the agent response degrades",caption:"All four memory types active by default. Disable each one and run the message to see what the agent loses."})},{name:"ChunkVisualizer",node:(0,a.jsx)(p.yB,{title:"Drag the sliders — watch the document split and overlap shift in real time",caption:"Adjust chunk size and overlap to see how they trade off."})},{name:"ParallelToolRunner",node:(0,a.jsx)(p.M6,{title:"Watch all three tools fire simultaneously — then receive one combined answer",caption:"Toggle between Parallel and Sequential modes, then click Run to see the time difference."})},{name:"AlgorithmStepper",node:(0,a.jsx)(p.Xc,{title:"Step through sorting & searching algorithms",caption:"Switch between Bubble Sort (O(n\xb2)) and Binary Search (O(log n)). Use Step or Play to animate each comparison and swap.",defaultAlgorithm:"bubble"})},{name:"CallStackVisualizer",node:(0,a.jsx)(p.tF,{title:"Recursion under the hood — fib(5) call stack",caption:"Step through each recursive call to see frames push and pop. Watch the stack grow then unwind as results bubble back up."})},{name:"NeuralNetworkForwardPass",node:(0,a.jsx)(p.k3,{title:"Forward pass through a feedforward neural network",caption:"Click 'Run Forward Pass' to watch the signal propagate layer by layer. Each node shows its activation value.",layers:[3,4,4,2],inputLabels:["Feature 1","Feature 2","Feature 3"],outputLabels:["Class A","Class B"]})},{name:"GradientDescentSimulator",node:(0,a.jsx)(p.pS,{title:"Gradient descent on a 2D loss surface",caption:"Switch learning rates to see slow convergence, smooth convergence, oscillation, and divergence. Use Step or Play to animate.",defaultLearningRate:.15})},{name:"PromptAnatomyVisualizer",node:(0,a.jsx)(p.I$,{title:"Anatomy of a production LLM prompt",caption:"Click any section to expand it. Each block has a role, raw content, and a token count. The bar shows the token budget split."})},{name:"ApiLifecycleFlow",node:(0,a.jsx)(p.Fc,{title:"HTTP request lifecycle — from fetch() to JSON response",caption:"Click 'Send Request' to animate each hop. Click any stage node for a detailed explanation.",method:"GET",path:"/api/users/42",statusCode:200})},{name:"TabbedCodeExplorer",node:(0,a.jsx)(p.Tp,{title:"Multi-file code explorer — RAG pipeline example",caption:"Click tabs to switch files. Toggle the ⊞ icon to open the file tree. Highlighted lines show the key API calls.",showFileTree:!1})},{name:"CodeEvolutionStepper",node:(0,a.jsx)(p.sy,{title:"How code evolves — from naive loop to O(1) lookup",caption:"Step through 4 versions of the same function. Green lines are additions. Click any version tab to jump directly."})},{name:"PacketJourneyVisualizer",node:(0,a.jsx)(p.jO,{title:"How a packet travels through the OSI model",caption:"Click ▶ Play to animate encapsulation (sender) → transmission → decapsulation (receiver). Click any layer band for details."})},{name:"ConsensusSimulator",node:(0,a.jsx)(p.qd,{title:"Raft consensus — leader election & log replication",caption:"Click 'Start Election' to watch timers deplete, a candidate emerge, and a leader win majority. Then 'Add Entry' or 'Inject Partition'.",nodeCount:5})},{name:"ProcessSchedulerViz",node:(0,a.jsx)(p.CS,{title:"OS CPU scheduling — Gantt timeline visualizer",caption:"Switch between FIFO, SJF, Round Robin, and Priority. Step through one time unit at a time or Play to auto-animate.",defaultAlgorithm:"RoundRobin",quantum:2})},{name:"MemoryLayoutExplorer",node:(0,a.jsx)(p.ld,{title:"Process address space — stack, heap, BSS, data, text",caption:"Click 'Call function' to push stack frames, 'malloc()' to grow the heap. Trigger a stack overflow by calling too many functions."})},{name:"MutexRaceDetector",node:(0,a.jsx)(p.VB,{title:"Race condition vs. mutex — shared counter demo",caption:"Step through instructions one at a time. Move the context-switch point to create the race. Then enable Mutex to fix it."})},{name:"BTreeExplorer",node:(0,a.jsx)(p.QU,{title:"B-tree — insert, search, and delete with live split animation",caption:"Type a key and press Insert / Search / Delete. Watch traversal paths highlight amber, splits bubble up, and the tree rebalance.",order:3,initialValues:[10,20,5,6,12,30,7,17]})},{name:"TransactionIsolationSim",node:(0,a.jsx)(p.W0,{title:"SQL transaction isolation — dirty reads, non-repeatable reads, phantoms",caption:"Step through the interleaved T1 / T2 timeline. Switch isolation levels to see what each transaction actually reads — and which anomalies appear.",defaultLevel:"ReadUncommitted"})},{name:"OAuthFlowStepper",node:(0,a.jsx)(p.hy,{title:"OAuth 2.0 Authorization Code flow with JWT anatomy",caption:"Click 'Start' to walk through each hop. After the token exchange step, decode the JWT to inspect header, payload claims, and signature.",defaultGrantType:"AuthorizationCode"})},{name:"MessageQueueSim",node:(0,a.jsx)(p.Ik,{title:"Message queue — producers, consumers, backpressure, and dead-letter queue",caption:"Publish messages manually or enable Auto mode. Kill a consumer to watch lag build. Enable 'Sim. failures' to see messages route to the DLQ.",queueCapacity:10,consumerCount:2})},{name:"RateLimiterVisualizer",node:(0,a.jsx)(p.h2,{title:"Rate limiting — Token Bucket, Sliding Window, and Fixed Window",caption:"Switch algorithms and adjust the incoming rate slider. Click 'Send Burst' to fire 20 requests at once and observe throttling behavior.",defaultAlgorithm:"TokenBucket",requestsPerSecond:5,burstCapacity:10})}];function g(){let[e,t]=(0,n.useState)(null),o=(0,n.useId)(),s=(0,n.useCallback)(()=>t(null),[]);(0,n.useEffect)(()=>{if(!e)return;let t=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=t}},[e]),(0,n.useEffect)(()=>{if(!e)return;let t=e=>{"Escape"===e.key&&s()};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[e,s]);let r=e?m.find(t=>t.name===e):void 0;return(0,a.jsxs)("main",{className:"min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12",children:[(0,a.jsxs)(i.m,{className:"space-y-10",children:[(0,a.jsxs)("header",{className:"space-y-3",children:[(0,a.jsx)("p",{className:"text-sm font-medium uppercase tracking-[0.28em] text-violet-400",children:"Internal — Session MDX registry"}),(0,a.jsx)("h1",{className:"text-4xl font-semibold text-white",children:"Session component gallery"}),(0,a.jsxs)("p",{className:"max-w-3xl text-slate-300",children:["Every custom component from ",(0,a.jsx)("span",{className:"font-mono text-violet-300",children:"getMdxComponents"}),", shown in a grid with the same name you use in MDX. Use this to compare visuals and pick interactives for future sessions."," ",(0,a.jsxs)("span",{className:"text-slate-400",children:["Use ",(0,a.jsx)("strong",{className:"font-medium text-slate-300",children:"Open full size"})," (or the preview bar) to view at session width without the grid crop."]})]})]}),(0,a.jsx)("div",{className:"grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3",children:m.map(e=>(0,a.jsxs)("article",{className:"flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 shadow-lg shadow-black/20",children:[(0,a.jsxs)("div",{className:"flex flex-wrap items-start justify-between gap-2 border-b border-white/10 bg-gray-950/50 px-4 py-3",children:[(0,a.jsxs)("div",{className:"min-w-0",children:[(0,a.jsx)("h2",{className:"font-mono text-sm font-semibold tracking-tight text-violet-300",children:e.name}),(0,a.jsx)("p",{className:"mt-1 text-xs text-slate-500",children:"Grid preview is condensed"})]}),(0,a.jsx)("button",{type:"button",onClick:()=>t(e.name),className:"shrink-0 rounded-lg border border-violet-500/40 bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-200 transition-colors hover:bg-violet-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",children:"Open full size"})]}),(0,a.jsx)("button",{type:"button",onClick:()=>t(e.name),className:"w-full border-b border-white/10 bg-gray-900/80 px-4 py-2 text-center text-xs font-medium text-violet-300/90 transition-colors hover:bg-violet-500/10 hover:text-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500",children:"Full-page preview — session width, no crop"}),(0,a.jsx)("div",{className:"max-h-[min(70vh,560px)] min-h-0 overflow-y-auto overflow-x-hidden p-4",children:e.node})]},e.name))})]}),r?(0,a.jsxs)("div",{className:"fixed inset-0 z-50 flex flex-col bg-gray-950/97 backdrop-blur-[2px]",role:"dialog","aria-modal":"true","aria-labelledby":o,children:[(0,a.jsxs)("div",{className:"flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-gray-950 px-4 py-3 sm:px-6",children:[(0,a.jsx)("h2",{id:o,className:"font-mono text-base font-semibold text-violet-300",children:r.name}),(0,a.jsxs)("div",{className:"flex items-center gap-3 text-xs text-slate-400",children:[(0,a.jsx)("span",{className:"hidden sm:inline",children:"Esc to close"}),(0,a.jsx)("button",{type:"button",onClick:s,className:"rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-gray-100 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",children:"Close"})]})]}),(0,a.jsx)("div",{className:"min-h-0 flex-1 overflow-y-auto overflow-x-hidden",children:(0,a.jsx)(i.m,{className:"py-8 pb-16 sm:py-10",children:(0,a.jsx)("article",{className:"w-full max-w-none rounded-[28px] border border-gray-200/80 bg-white/85 px-7 py-9 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/60 sm:px-10 sm:py-11 lg:px-12",children:(0,a.jsx)("div",{className:"w-full min-w-0",children:r.node})})})})]}):null]})}},5575:(e,t,o)=>{"use strict";o.d(t,{m:()=>i});var a=o(335),n=o(7881);function i({as:e,className:t,children:o}){return(0,a.jsx)(e??"div",{className:(0,n.cn)("mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8",t),children:o})}},9023:(e,t,o)=>{"use strict";o.d(t,{CS:()=>U.default,DC:()=>Q.default,Ds:()=>Y.default,Fc:()=>D.default,G_:()=>T.default,Gl:()=>c.default,I$:()=>O.default,IA:()=>j.default,I_:()=>Z.default,Ik:()=>V.default,JZ:()=>g.default,KN:()=>x.default,M0:()=>S.default,M6:()=>A.default,MY:()=>p.default,Mt:()=>et.default,Mv:()=>X.default,Pz:()=>$.default,QH:()=>y.default,QU:()=>G.default,RB:()=>m.default,Tp:()=>q.default,VB:()=>B.default,W0:()=>W.default,Xc:()=>I.default,a5:()=>K.default,a6:()=>C.default,ad:()=>h.default,c$:()=>P.default,cZ:()=>w.default,cg:()=>s.default,e6:()=>v.default,fV:()=>d.default,h2:()=>J.default,hy:()=>H.default,jO:()=>M.default,jr:()=>k.default,k3:()=>R.default,kX:()=>i.default,lN:()=>r.default,ld:()=>z.default,pS:()=>_.default,qF:()=>f.default,qd:()=>F.default,sy:()=>L.default,tF:()=>E.default,tP:()=>l.default,u9:()=>eo.default,uT:()=>ee.default,x9:()=>n.default,yB:()=>N.default,yM:()=>b.default,zP:()=>a.default,zf:()=>u.default});var a=o(2105),n=o(8655),i=o(7862);o(9888);var s=o(3076),r=o(4335),l=o(7347),d=o(8537);o(8756);var c=o(5776);o(6144);var h=o(3120),p=o(1232),u=o(6097),m=o(4786),g=o(3134),b=o(9297),x=o(2140),f=o(7960),y=o(4134);o(9009),o(7394);var k=o(1657),w=o(7946),v=o(2278),S=o(7500),T=o(1226),P=o(578),C=o(6162),j=o(5804),N=o(8904),A=o(8048),I=o(1527),E=o(7399),R=o(6410),_=o(497),O=o(5266),D=o(8210),q=o(1777),L=o(1584),M=o(5866),F=o(5679),U=o(8131),z=o(156),B=o(2458),G=o(9213),W=o(7691),H=o(1802),V=o(5645),J=o(4396);o(744);var Q=o(9518);o(5717),o(2259),o(413),o(7462),o(7669),o(9104),o(1257);var Y=o(4919),X=o(5451),K=o(1485),$=o(9281),Z=o(2863);o(726),o(3104),o(8661),o(213),o(5242),o(2042),o(2951),o(7932),o(9440);var ee=o(9031),et=o(8563),eo=o(9225);o(5613),o(8291),o(5e3),o(9247),o(3544),o(3681),o(6534),o(8719),o(2377),o(8357),o(3992),o(477),o(9010),o(6365),o(4330),o(9846),o(9186),o(4037),o(4215),o(7406),o(1507),o(8082),o(9191),o(8835),o(1892),o(6640),o(3540)}},e=>{e.O(0,[26,359,800,30,712,739,186,358],()=>e(e.s=844)),_N_E=e.O()}]);