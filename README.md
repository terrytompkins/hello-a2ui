# Pet Coach — A2UI Demo

A teaching/demo application for the **Promptly-at-9** AI class series.

Demonstrates **A2UI (Agent-to-User Interface)** — the concept that an AI assistant can return structured UI payloads rendered inline in a chat stream, not just plain text.

---

## What this app shows

| Text Only Mode | A2UI Enabled Mode |
|---|---|
| Assistant returns prose | Assistant returns text + structured UI payload |
| "Sure, what date works for you?" | Inline scheduling form appears in chat |
| "Luna's AST was 112 U/L, which is elevated..." | Range bar visualization with color-coded status |
| "Here are her medications..." | Interactive medication card with action buttons |

The **Protocol Inspector** panel (bottom of screen) shows the raw JSON payloads flowing between the frontend and backend — making the architecture visible to the class.

---

## Prerequisites

- Node.js 18+
- An OpenAI API key (`gpt-4o-mini` or `gpt-4o`)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
echo "OPENAI_API_KEY=sk-..." > .env.local

# 3. Seed the SQLite database (creates db/pet-coach.db with Luna's data)
npm run db:seed

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Flow

### Recommended live demo script

1. **Launch in Text Only mode** (default)
2. Click: *"I need to schedule a follow-up for Luna."*
   - Show: assistant asks for details conversationally in prose
3. **Switch to A2UI Enabled**
4. Click: *"I need to schedule a follow-up for Luna."*
   - Show: inline scheduling form appears in the chat
5. **Open the Protocol Inspector** → Response tab
   - Show: the `a2ui` payload in the JSON response
   - Point out: `type: "scheduling_form"` and the data fields
6. **Submit the form**
7. **Inspector → UI Event tab**
   - Show: the structured event payload sent back to the backend
8. Click: *"Show me Luna's latest bloodwork."*
   - Text Only: prose description of results
   - A2UI: range bar visualization with AST (HIGH) and RBC (LOW) highlighted
9. Click: *"What should I monitor after today's visit?"*
   - A2UI: interactive discharge checklist
10. Click: *"Does Luna need a medication refill?"*
    - A2UI: medication card with action buttons

---

## Project Structure

```
hello-a2ui/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page (providers + layout)
│   ├── globals.css
│   └── api/
│       ├── chat/route.ts       # POST /api/chat — calls OpenAI
│       └── ui-event/route.ts   # POST /api/ui-event — handles form submissions
│
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx   # Transcript + scroll + loading indicator
│   │   ├── ChatMessage.tsx     # Single message (user/assistant/event)
│   │   ├── ChatInput.tsx       # Text input + send button
│   │   └── SuggestedPrompts.tsx # Demo prompt chips
│   ├── a2ui/
│   │   ├── A2UIRenderer.tsx    # Registry-based payload → component mapper
│   │   ├── SchedulingForm.tsx  # Appointment booking form
│   │   ├── DiagnosticRangeBars.tsx # Bloodwork visualization
│   │   ├── ChecklistCard.tsx   # Interactive checklist
│   │   └── MedicationCard.tsx  # Medication + action buttons
│   ├── inspector/
│   │   └── ProtocolInspector.tsx # Collapsible JSON payload viewer
│   └── layout/
│       ├── Header.tsx
│       └── ModeToggle.tsx
│
├── lib/
│   ├── types.ts                # All shared TypeScript types
│   ├── db.ts                   # SQLite access (better-sqlite3)
│   ├── seed.ts                 # Database seed script
│   ├── ai/
│   │   ├── chatService.ts      # OpenAI API wrapper + response parser
│   │   └── prompts.ts          # System prompts for each mode
│   └── context/
│       ├── ChatContext.tsx     # Chat state + sendMessage + submitUIEvent
│       └── InspectorContext.tsx # Inspector payload state
│
├── db/
│   └── pet-coach.db            # SQLite database (created by db:seed)
│
└── docs/
    ├── pet-coach-a2ui-superprompt.md
    └── pet-coach-a2ui-v1-design.md
```

---

## Key Architecture Points

### A2UI Flow

```
User types message
  → ChatContext.sendMessage()
  → POST /api/chat  { message, mode, history }
  → Server fetches Luna's data from SQLite
  → Builds system prompt (mode-specific)
  → Calls OpenAI API (JSON mode in A2UI mode)
  → Parses { text, a2ui } response
  → Returns ChatMessage with optional A2UIPayload
  → A2UIRenderer maps payload.type → trusted React component
  → User interacts with component
  → UIEventEnvelope posted to /api/ui-event
  → Confirmation message appended to chat
```

### The Trust Gate (A2UIRenderer)

The frontend **never executes arbitrary agent-generated code**. Instead:
1. LLM returns a declarative payload: `{ type: "scheduling_form", data: {...} }`
2. `A2UIRenderer` validates the `type` against a hard-coded registry
3. Maps to a pre-approved, trusted React component
4. Unknown types show a graceful fallback card

This mirrors the key safety principle of A2UI.

### Mode Behavior

- **Text Only**: System prompt instructs the LLM to respond in plain prose only
- **A2UI Enabled**: System prompt instructs the LLM to return `{ "text": "...", "a2ui": {...} | null }` using JSON mode, with the supported component schema embedded

---

## Seed Data

Demo pet: **Luna** — 3-year-old female Golden Retriever, owner Alex Johnson

| Test | Value | Ref Range | Status |
|------|-------|-----------|--------|
| ALT | 78 U/L | 10–100 | Normal |
| AST | 112 U/L | 15–66 | **High** |
| BUN | 22 mg/dL | 7–27 | Normal |
| Creatinine | 1.4 mg/dL | 0.5–1.8 | Normal |
| WBC | 14.2 K/μL | 4.0–15.5 | Normal |
| RBC | 3.1 M/μL | 4.8–9.3 | **Low** |
| Glucose | 98 mg/dL | 70–138 | Normal |

Medications: Carprofen (25mg twice daily), FortiFlora probiotic

---

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Required. Your OpenAI API key. |

Create `.env.local` in the project root:
```
OPENAI_API_KEY=sk-...
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at localhost:3000 |
| `npm run build` | Production build |
| `npm run db:seed` | Create and seed the SQLite database |
