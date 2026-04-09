# Claude Code Superprompt: Build the Pet Coach A2UI Demo (Next.js v1)

You are a senior full-stack engineer working in a local development environment. Build a **small but polished demonstration application** called **Pet Coach** using **Next.js + React + TypeScript**. The repo/workspace for this application is called "hello-a2ui".  The purpose of the app is to demonstrate how **A2UI-style agent-driven interfaces** can enhance a chat-based AI application beyond plain text responses.

Your implementation should be guided by the provided design brief (pet-coach-a2ui-v1-design-brief.md) for the Pet Coach A2UI v1 demo. This prompt adds execution detail and implementation expectations.

---

## 1. Primary Goal

Build a demo app that clearly shows the difference between:

1. **Text-only AI chat**
2. **AI chat enhanced with inline A2UI-rendered UI components**

The app theme is a veterinary/pet-owner assistant called **Pet Coach**.

The user is a pet owner chatting with an AI assistant about a pet. The AI can respond either with plain text or with **structured UI payloads** that the app renders **inline in the chat stream**.

The app should be strong enough for a live Promptly-at-9 demo, but still compact and understandable.

---

## 2. Technical Stack

Use this stack unless there is a compelling reason not to:

- **Next.js** (latest stable App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **SQLite** for representative diagnostic results data
- A lightweight local ORM or DB access layer is acceptable:
  - Prisma is acceptable
  - better-sqlite3 is acceptable
  - Drizzle is acceptable
- **OpenAI API** for all LLM-driven responses (use the `openai` npm package)
  - Use `gpt-4o` or `gpt-4o-mini` as the model
  - API key should be read from `OPENAI_API_KEY` environment variable
  - Use OpenAI's **structured output / JSON mode** to enforce the `{ text, a2ui }` response envelope in A2UI-enabled mode
- Use simple local server routes / API routes for the chat backend
- Keep the app self-contained and easy to run locally

Do **not** over-engineer with unnecessary infrastructure.

---

## 3. Core Product Concept

This app is a **teaching/demo artifact**, not a production veterinary platform.

The central message of the demo is:

> Traditional AI chat returns prose.  
> A2UI-style AI can return structured interface payloads that render task-specific UI in the application.

So the architecture and UX should make that lesson visually obvious.

---

## 4. Required App Capabilities

The app must support all of the following:

### A. Chat UI
Create a polished chat interface with:
- user messages
- assistant messages
- inline rendering of structured UI blocks inside assistant messages
- timestamps optional
- basic loading state / thinking state
- scrollable message list

### B. Mode Toggle
Include a visible mode selector that lets the presenter switch between:
- **Text Only**
- **A2UI Enabled**

This is essential for demoing side-by-side behavior differences.

Behavior:
- In **Text Only**, the backend should return only natural language responses.
- In **A2UI Enabled**, the backend may return text plus an A2UI payload.

### C. Raw Protocol Inspector
Include a collapsible panel, side drawer, or lower panel showing:
- last user request payload
- last assistant response payload
- last UI interaction event payload

This should be easy to open during a live demo.

The point is to show attendees the actual structured data moving through the system.

### D. Real Structured Payloads
Do **not** fake the experience with purely frontend-invented payloads.

The backend should return real structured JSON payloads in an **A2UI-inspired schema** suitable for the renderer.

Important:
- It is okay if the schema is a **practical local subset** inspired by the public A2UI concepts
- It should still look like a serious declarative UI payload format
- The renderer should consume that payload dynamically

### E. SQLite-backed Diagnostic Data
Include a small representative SQLite dataset with pet diagnostic values.

At minimum include:
- pet
- visit / date
- diagnostic test name
- measured value
- low/high reference range
- units

Seed the database with believable but clearly demo/sample data.

### F. Inline UI Examples
Implement at least these A2UI-driven examples:

#### 1. Appointment Scheduling UI
If the user asks for a follow-up visit or scheduling help, the assistant should return an inline scheduling UI with fields such as:
- pet name or patient selector if needed
- appointment date
- time slot
- reason for visit
- confirm/submit button

The user should be able to fill it out in the chat and submit it.

#### 2. Diagnostic Visualization UI
If the user asks to see diagnostic results or a graph, the assistant should return an inline visualization area driven by structured payload data.

The preferred example is:
- “speed bars” or range bars showing value relative to normal range
- clearly indicate in range vs out of range
- show test name, value, units, and reference interval

This does not need to be a literal external chart library if clean custom rendering is simpler.  
A polished custom React visualization is fine.

### G. One or Two Additional UI Examples
Please add 1–2 more small but valuable A2UI examples that fit the Pet Coach theme.

Good candidates:
- medication reminder acknowledgment card
- symptom intake form
- triage checklist
- “choose next step” action panel
- discharge care checklist
- hydration / appetite tracking form

Pick examples that are intuitive and visually useful in a demo.

---

## 5. UX and Design Guidance

The app should look modern and demo-worthy without being visually busy.

### Design preferences
- clean professional SaaS-style UI
- rounded cards
- comfortable spacing
- soft shadows
- clear hierarchy
- readable typography
- light theme is fine by default
- responsive enough for desktop demo
- optimize first for laptop presentation view

### Layout recommendations
Suggested layout:
- header/top bar
- main chat area
- optional inspector panel on right or bottom
- mode toggle visible near top
- maybe small “Suggested prompts” chips for easy demos

### Suggested sample prompts
Include clickable prompt chips such as:
- “I need to schedule a follow-up for Luna.”
- “Show me Luna’s latest bloodwork.”
- “Graph the diagnostic results.”
- “What should I monitor after today’s visit?”
- “Help me log symptoms for the last 24 hours.”

---

## 6. Architecture Requirements

Keep the implementation modular and understandable.

### Recommended structure
Create a structure approximately like:

- `app/`
  - `page.tsx`
  - `api/chat/route.ts`
  - `api/ui-event/route.ts`
- `components/`
  - chat components
  - A2UI renderer components
  - protocol inspector
  - visualization widgets
- `lib/`
  - schema/types
  - fake or simple deterministic orchestration logic
  - database access
  - seed/sample data
  - intent routing helpers
- `prisma/` or equivalent DB schema folder if using Prisma

### Message model
Define a message model that supports:
- `role`
- `text`
- optional structured UI payload

For example:

```ts
type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  a2ui?: A2UIMessagePayload | null
}
```

### A2UI payload
Define a practical payload model for v1.  
It should be declarative and component-based.

For example, something like:
- card
- section
- text
- form
- field
- actions
- diagnostic_range_bars
- checklist
- action_panel

Use whatever naming scheme makes the implementation clear and coherent.

---

## 7. Interaction Model

The most important requirement is that the UI is not hardcoded per screen.  
It should be driven by structured payloads returned from the backend.

### Flow
1. User sends message
2. Backend determines intent
3. Backend returns:
   - text only, or
   - text + A2UI payload
4. Frontend renders assistant message
5. If there is inline UI, user interacts with it
6. Client posts a structured event payload back to backend
7. Backend returns follow-up assistant message based on the event

### Event payloads
Define a simple event envelope like:

```ts
type UIEventEnvelope = {
  messageId: string
  componentId: string
  eventType: "submit" | "change" | "click"
  payload: Record<string, unknown>
}
```

Keep it inspectable and easy to explain live.

---

## 8. Intelligence / Orchestration Strategy

This app uses a **real LLM backend** — specifically the **OpenAI API** — for all chat responses. This is important both for demo realism and for teaching purposes.

### LLM integration requirements

- All user messages are sent to the OpenAI API.
- The system prompt controls mode behavior:
  - In **Text Only** mode: instruct the model to respond in plain conversational prose only. It must not return JSON or A2UI payloads.
  - In **A2UI Enabled** mode: instruct the model to return a JSON envelope `{ "text": "...", "a2ui": {...} | null }`. The model decides when a UI would improve the response. Use OpenAI structured output or JSON mode to enforce this contract.
- The system prompt in A2UI-enabled mode should describe the supported A2UI component types and include a concise schema so the model knows what it is allowed to return.
- Relevant SQLite data (e.g., Luna's diagnostics, medication info) should be fetched server-side and injected into the prompt context before calling the model.

### Prompt construction

The backend route should:
1. Determine the current mode from the request.
2. Fetch any relevant context from SQLite (diagnostics, pet info, medications).
3. Build a system prompt appropriate to the mode.
4. Include the conversation history (at least the last few turns).
5. Call the OpenAI API.
6. Parse the response: in A2UI mode, extract and validate the `a2ui` payload.

### Reliability considerations

For maximum demo reliability:
- If the LLM returns a malformed or empty `a2ui` payload in A2UI mode, fall back gracefully to text-only rendering.
- Keep the system prompt clear and explicit about the expected JSON schema.
- You may include lightweight post-processing to normalize minor LLM deviations (e.g., extra whitespace, minor field name variations).

An abstraction layer (`lib/ai/chatService.ts` or similar) should encapsulate the OpenAI call so that the model provider can be swapped without touching route logic.

---

## 9. A2UI Scope for v1

Keep the structured UI vocabulary intentionally narrow.

Support a practical subset such as:
- text
- card / section
- form
- input
- textarea
- select
- radio
- checkbox
- button
- action list / button row
- diagnostic range bars
- checklist

This is enough to make the point without building a giant framework.

---

## 10. Demo Use Cases to Support

At minimum, support these scripted demo flows:

### Demo 1: Text-only vs A2UI scheduling
User asks for a follow-up appointment.

**Text-only mode**
- assistant asks for date/time/reason in prose

**A2UI-enabled mode**
- assistant returns a scheduling form inline in chat

### Demo 2: Diagnostic results visualization
User asks for bloodwork or a graph.

**Text-only mode**
- assistant describes the results in prose

**A2UI-enabled mode**
- assistant returns a diagnostic visualization card with range bars

### Demo 3: Another structured care workflow
Choose one of:
- symptom intake
- medication reminder confirmation
- discharge monitoring checklist
- hydration/appetite tracking

Make it visibly useful and distinct from the first two.

---

## 11. Suggested Data Model

You do not need production-grade healthcare rigor.  
Just enough realism for the demo.

Suggested entities:
- `Pet`
  - id
  - name
  - species
  - breed
  - age
- `DiagnosticResult`
  - id
  - petId
  - collectedAt
  - testName
  - value
  - unit
  - refLow
  - refHigh
- `AppointmentRequest`
  - id
  - petId
  - preferredDate
  - preferredTime
  - reason
  - status
- optional symptom log table if useful

Seed one or two pets, with one primary demo pet such as **Luna**.

---

## 12. Presentation-Friendliness

This app will be used live in a class.

So please optimize for:
- simple startup (including a clear note in README about the required `OPENAI_API_KEY` environment variable)
- stable, reliable behavior (good system prompts + graceful fallback on malformed LLM responses)
- clearly labeled UI
- no fragile dependencies if avoidable
- readable JSON payloads in the inspector
- obvious contrast between modes

Add small explanatory labels where useful, for example:
- “Text Only”
- “A2UI Enabled”
- “Protocol Inspector”
- “Structured UI Response”

---

## 13. Implementation Quality Expectations

Please:
- write clean TypeScript
- use sensible component decomposition
- keep types explicit
- add comments where they help explain the architecture
- avoid giant monolithic files
- keep logic approachable for later walkthroughs

### Important
I want the code to be understandable enough that I can explain it in a class.

---

## 14. Nice-to-Have Enhancements

Add these if they are easy and do not derail the build:

- preloaded conversation reset button
- seeded demo transcript examples
- a small status badge showing whether the last response included structured UI
- copy-to-clipboard button for inspector JSON
- a subtle highlight when a message contains A2UI content

---

## 15. Deliverables

Please produce:
1. the working Next.js app
2. a short `README.md` with:
   - how to install/run
   - project structure
   - demo flow suggestions
3. seeded sample data
4. clean type definitions for message and UI payload schema

---

## 16. Preferred Build Strategy

Please implement incrementally in this order:

1. app shell + chat UI
2. message schema + mode toggle
3. OpenAI API integration + backend route (text-only mode first)
4. A2UI system prompt + structured output contract
5. inline A2UI renderer
6. scheduling form flow (LLM returns scheduling_form payload)
7. SQLite seed + diagnostics flow (LLM returns diagnostic_range_bars payload with DB data injected into prompt)
8. additional structured UI example(s)
9. protocol inspector
10. polish and README

---

## 17. Important Product Framing

Throughout the implementation, keep this framing in mind:

This app is not trying to prove that AI should replace all UI.  
It is demonstrating that **AI-enabled applications can become more effective when the assistant can return task-specific interface elements instead of only text**.

That is the lesson the final app should make obvious.

---

## 18. Final Instruction

Now implement the app.

As you work:
- make pragmatic technical decisions
- keep the app compact and demoable
- favor reliability and explainability over unnecessary sophistication
- preserve the core A2UI teaching value

When done, make sure the repository is in a runnable state and the README reflects the actual implementation.
