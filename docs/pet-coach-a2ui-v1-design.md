# Pet Coach A2UI Demo App — V1 Design Brief

## Purpose

This document captures the current design direction for a new **Pet Coach** demo application for a **Promptly-at-9** session. The app is intended to demonstrate how an AI-enabled application can move beyond plain chat responses and begin returning **agent-generated user interfaces** using **A2UI (Agent-to-User Interface)**.

The audience should be able to see:

1. A familiar chat-based AI experience.
2. The difference between **text-only AI** and **AI + A2UI-enhanced UI**.
3. The **real JSON payloads** that flow between the model/backend and the frontend.
4. How user interaction with generated UI components produces structured events that feed back into the application.

This document is meant to be handed to **Claude Code** as the implementation/design brief for a working v1 demo.

---

## Why this app exists

The Promptly-at-9 class has repeatedly used the **Pet Coach** theme: a pet owner interacts with an AI-assisted veterinary workflow. That theme already works well because it is concrete, relatable, and easy to extend into useful structured interactions.

This new version of Pet Coach should be rebuilt as a **React / Next.js** application with **A2UI support built into the chat experience**.

The main teaching point is:

> Today, many AI apps can only “speak in text.”
> A2UI points toward applications where the agent can also “speak interface.”

That means the assistant can return:

- plain text
- a form
- a date/time selector
- a graph-like visualization request surface
- an approval card
- a follow-up action panel

rather than forcing the user to answer everything through multi-turn natural language alone.

---

## Context from our design discussion

### Architectural direction agreed so far

We are intentionally **not** starting with Onyx.

Instead, the goal is to build a **small standalone demo app** whose architecture is easy to explain in a class and easy to inspect in code.

### Chosen stack

**Next.js** is the preferred stack for this demo over Streamlit.

Why:

- A2UI is fundamentally a **frontend rendering contract**.
- Inline rendering of agent-generated UI maps naturally to **React components**.
- Next.js gives a clean full-stack developer experience with:
  - React UI
  - server routes / API handlers
  - easy local execution
  - simple support for SQLite-backed demo data
- It will be easier to show side-by-side **chat transcript + inline generated UI + protocol inspector** in a React app than in Streamlit.

### Rendering approach

For v1, the app should use an **inline chat rendering model** rather than a right-side “canvas” or workbench.

Why inline first:

- Best for directly comparing **text-only** vs **A2UI-enhanced** chat.
- Simpler for a class audience to understand.
- Smaller implementation scope.
- Keeps the conceptual focus on: “the assistant returned UI in the conversation.”

A right-side canvas/workbench can be a future enhancement, but it should **not** be the initial mode.

### Protocol realism

The app should use **real A2UI JSON payloads**, not mocked placeholder objects.

However, v1 should intentionally support only a **small validated subset** of component types so the demo remains practical.

### Inspectability

A major requirement is that people should be able to examine the system behavior.

The app should therefore include a **developer/protocol inspection panel** showing:

- the user message payload
- the assistant response payload
- the A2UI JSON returned by the backend/model
- the structured event data sent back when the user interacts with the rendered UI

This is essential for teaching.

---

## A2UI background relevant to this demo

A2UI is an open project for **agent-driven, declarative UI generation**. The agent returns a structured UI description rather than executable UI code, and the host application renders that description through a **trusted component catalog**. Google’s project describes A2UI as a format optimized for **updatable agent-generated UIs** and an initial set of renderers for multiple frameworks/platforms. Their blog positions it as a way to move from text-only chat toward interfaces like forms, approvals, and richer task-specific workflows.

A useful framing for this demo:

- **Prompt / context in**
- **Text + A2UI payload out**
- **User interaction event back in**
- **Updated text + UI out**

This makes A2UI much more concrete than discussing “generative UI” at a high level.

### Sources to keep in mind during implementation

- Google Developers Blog: *Introducing A2UI: An open project for agent-driven interfaces*
- Google A2UI GitHub repository / README
- Next.js App Router documentation

---

## Product concept

### App name

**Pet Coach**

### Theme

A pet owner is interacting with an AI-enabled veterinary support application after a clinic visit. The app helps with follow-up questions, appointment scheduling, and interpretation of representative diagnostic data.

### Product story

The user chats naturally, but in some situations the assistant can return **structured interactive UI** that is more efficient than prose-only conversation.

This lets the class see both:

- a traditional AI chat interaction
- a more advanced AI application pattern where the assistant drives part of the UI

---

## Demo objectives

The finished app should demonstrate the following in a single coherent experience.

### Objective 1: Text-only vs A2UI-enhanced UX

The same or similar user request should be viewable in:

- **Text-only mode**
- **A2UI-enabled mode**

This comparison is central to the teaching goal.

### Objective 2: Inline generated forms

The assistant should be able to return a form-like interface inline in the chat stream.

### Objective 3: Structured event round-trip

When the user interacts with the UI, the frontend should send a structured event payload back to the backend in a way that is clearly consistent with the spirit of the A2UI approach.

### Objective 4: Data-driven visual response

The app should use a small embedded **SQLite database** with representative pet diagnostic data. The assistant should be able to return an A2UI-based view for the data, such as range bars / status bars that communicate in-range vs out-of-range values.

### Objective 5: Inspectable protocol

The app should show the underlying JSON exchanges so attendees can understand what is happening under the hood.

---

## Core use cases for v1

Below are the recommended v1 use cases. The first two came directly from the design discussion; the others are complementary additions that keep the theme coherent.

### Use Case 1: Schedule a follow-up visit

**User intent:**
The pet owner wants to schedule a follow-up visit for their pet.

**Why it is good for A2UI:**
In plain chat, the assistant would have to ask a sequence of questions:

- preferred day
- time range
- clinic location
- pet name
- callback preference

A2UI can improve this by returning an inline scheduling card with:

- date selector
- time selector / time window selector
- reason for visit
- optional notes
- submit button

**Teaching point:**
This clearly shows why a UI can be more efficient than a long conversational back-and-forth.

### Use Case 2: Show diagnostic results graphically

**User intent:**
The pet owner asks to see a graph or visual summary of their pet’s lab/diagnostic data.

**Why it is good for A2UI:**
Plain text can describe results, but visual status bars can communicate much faster.

**Recommended UI pattern:**
An inline diagnostic summary card with one row per measurement showing:

- test name
- measured value
- reference range
- a simple horizontal range/status bar
- visual indication of in-range / high / low

**Teaching point:**
The assistant is no longer just describing data; it is returning a UI representation optimized for human interpretation.

### Use Case 3: Medication/refill follow-up card

**User intent:**
The user asks whether a medication should be continued or whether a refill can be requested.

**Recommended UI pattern:**
An inline card showing:

- medication name
- dosage / schedule summary
- last fill date
- remaining days estimate
- actions such as:
  - Request refill
  - Ask vet a question
  - Mark issue / side effect

**Teaching point:**
This demonstrates action-oriented UI, not just data entry.

### Use Case 4: Symptom triage intake form

**User intent:**
The user says the pet is acting unwell and needs advice.

**Recommended UI pattern:**
An inline intake form with fields such as:

- symptom category
- appetite normal / reduced / none
- vomiting yes/no
- energy level
- free text notes

**Teaching point:**
This shows that A2UI can help the assistant gather structured information efficiently before producing advice.

---

## Recommended v1 demo script

A good live demo flow would look like this:

1. Launch Pet Coach in **Text-only mode**.
2. Ask for a follow-up visit.
3. Show how the assistant must gather details through plain chat.
4. Switch to **A2UI-enabled mode**.
5. Ask for the same follow-up visit.
6. Show an inline appointment scheduling card.
7. Open the protocol inspector and show the returned JSON payload.
8. Submit the appointment card.
9. Show the structured UI event payload sent back.
10. Ask to see recent diagnostic results.
11. Show either plain textual interpretation or an A2UI diagnostic summary card with range bars.
12. Highlight that the assistant has moved from “answering” to “composing task-specific interface.”

This tells a clean story without requiring too many separate screens.

---

## Product requirements for v1

### Functional requirements

#### FR-1 Chat
The app shall provide a chat interface between the pet owner and the assistant.

#### FR-2 Mode toggle
The app shall provide a toggle or selector between:

- **Text-only** mode
- **A2UI-enabled** mode

#### FR-3 Inline A2UI rendering
The app shall render supported A2UI payloads inline within assistant chat messages.

#### FR-4 Supported interactive components
The app shall support a controlled subset of components sufficient for the v1 scenarios, including:

- text
- section/card container
- label/value rows
- text input
- textarea
- select
- checkbox
- date selector
- time selector (or time slot select)
- button
- simple bar/status visualization container

#### FR-5 Structured event submission
The app shall capture user interaction with inline A2UI components and send structured event payloads back to the backend.

#### FR-6 Diagnostic data source
The app shall use a small SQLite database containing representative pet diagnostic data.

#### FR-7 Diagnostic visualization
The app shall be able to present diagnostic data as an A2UI-rendered visual summary.

#### FR-8 Protocol inspector
The app shall provide an inspectable view of the request/response/event payloads.

#### FR-9 Sample seeded conversations
The app should include a few suggested prompts or quick actions to make the demo easier during class.

### Non-functional requirements

#### NFR-1 Small scope
The demo should be small enough to implement quickly and reliably.

#### NFR-2 Explainability
The architecture should be easy to explain live.

#### NFR-3 Inspectability
The JSON exchanged between layers should be visible and understandable.

#### NFR-4 Safety / control
The frontend shall only render a **trusted, validated subset** of A2UI components.

#### NFR-5 Demo resilience
The app should still function even if the assistant returns plain text only or a malformed A2UI payload.

---

## UX recommendations

### Overall layout

Use a single-page layout with three main areas:

1. **Left/main:** chat transcript
2. **Top control area:** mode toggle and sample prompts
3. **Right or bottom collapsible panel:** protocol inspector

Even though the app should not use a full “canvas” experience for the generated UI itself, the protocol inspector can live in a side drawer or collapsible panel.

### Chat behavior

Assistant messages may include:

- text only
- text + rendered A2UI card

User actions inside A2UI cards should appear in the transcript as either:

- a compact event acknowledgement bubble, or
- a system/event log entry inside the protocol inspector

### Design tone

The Pet Coach app should feel approachable and polished, not clinical or enterprise-heavy.

Suggested styling:

- friendly veterinary/pet-care tone
- clean cards
- readable spacing
- visually distinct assistant/user bubbles
- clear distinction between normal text and generated UI cards

---

## Recommended architecture

### Architectural style

A **single Next.js application** using the App Router, with API routes/server actions as needed.

### High-level flow

```text
User enters chat message
  -> frontend sends request to backend chat route
  -> backend builds prompt/context
  -> model returns text or text + A2UI JSON
  -> frontend validates and renders response
  -> user interacts with generated UI
  -> frontend sends structured event payload to backend
  -> backend processes event and optionally calls model again
  -> updated text/UI is returned and rendered
```

### Key design principle

The frontend should never render arbitrary agent-generated code.

Instead, it should:

1. receive **declarative A2UI JSON**
2. validate it against a supported subset/schema
3. map each supported component to a trusted local React component

This mirrors the key safety idea behind A2UI.

---

## Proposed technical stack

### Frontend

- **Next.js** (App Router)
- **React**
- **TypeScript**
- Tailwind CSS (or comparable styling approach)

### Backend

- Next.js route handlers / server functions
- **OpenAI API** for all LLM-driven responses
  - Use the `openai` npm package
  - Model: `gpt-4o` or `gpt-4o-mini`
  - API key from `OPENAI_API_KEY` environment variable
  - In A2UI-enabled mode, use **JSON mode / structured output** to enforce the `{ text, a2ui }` response envelope
- SQLite access layer

### Data

- local SQLite database
- seed data for:
  - pets
  - visits
  - diagnostic results
  - medications (optional)

### Optional libraries

Potential choices that Claude Code can evaluate:

- `zod` for payload validation
- `better-sqlite3` or another SQLite package
- a light chart or custom bar component if needed, though for the v1 range bars a custom React implementation is likely enough

---

## Proposed app modes

### Mode 1: Text-only

In this mode, the assistant is instructed to respond in plain text only.

This provides the baseline for comparison.

### Mode 2: A2UI-enabled

In this mode, the assistant is allowed to return text plus a structured A2UI payload when it determines that a UI would improve the experience.

The frontend should render the payload inline.

### Optional Mode 3: Show raw payloads always

This could be a checkbox or developer toggle.

Useful option:

- **Show raw JSON**
- **Show event traffic**
- **Show validated/normalized payload**

---

## Message and event model

Below is a suggested simple internal message contract for the app.

### Chat message model

```ts
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "event";
  text?: string;
  a2ui?: A2UIRoot | null;
  timestamp: string;
};
```

### A2UI session model

```ts
export type UISession = {
  uiSessionId: string;
  sourceMessageId: string;
  status: "active" | "submitted" | "stale" | "error";
  lastPayload: A2UIRoot;
  formState: Record<string, unknown>;
};
```

### Structured event model

```ts
export type UIEventEnvelope = {
  uiSessionId: string;
  messageId: string;
  componentId: string;
  eventType: "change" | "click" | "submit";
  value?: unknown;
  formData?: Record<string, unknown>;
  timestamp: string;
};
```

These names/types do not need to mirror any official A2UI implementation exactly; they simply provide a practical app-level envelope around the A2UI payload and the user interaction event.

---

## Supported A2UI subset for v1

To keep the implementation bounded, support a narrow subset of component patterns.

### Recommended supported primitives

- root/container
- section/card
- text
- row / column layout
- input:text
- input:textarea
- input:select
- input:checkbox
- input:date
- input:time or time-slot select
- button
- label-value item
- range/status bar item

### Why not support more?

Because the goal is not to build a universal A2UI renderer. The goal is to build a clear, working educational example.

---

## Example v1 interaction patterns

### Pattern A: Appointment scheduling card

#### User

> I need to bring Luna back in for a follow-up next week.

#### Text-only response

Assistant asks for date/time preferences in prose.

#### A2UI-enabled response

Assistant returns short text plus an inline scheduling form.

#### Suggested fields

- pet name (may be prefilled)
- visit type / reason
- preferred date
- preferred time range
- notes
- submit button

### Pattern B: Diagnostic range summary

#### User

> Can you show me Luna’s recent test results in a graph?

#### Text-only response

Assistant describes each value in text.

#### A2UI-enabled response

Assistant returns text plus a diagnostic card with:

- ALT
- AST
- WBC
- RBC
- etc.

Each row includes:

- numeric result
- normal range
- a simple horizontal range indicator
- status label: Low / Normal / High

### Pattern C: Symptom intake

#### User

> She still seems tired and doesn’t want to eat.

#### A2UI-enabled response

Assistant returns a symptom intake card to gather structured information.

### Pattern D: Medication action card

#### User

> Do I need a refill for her medication?

#### A2UI-enabled response

Assistant returns a medication card with quick actions.

---

## Suggested SQLite seed data

Keep the database intentionally small and understandable.

### Tables

#### pets
- id
- name
- species
- breed
- age_years
- owner_name

#### visits
- id
- pet_id
- visit_date
- reason
- clinician_name

#### diagnostic_results
- id
- pet_id
- visit_id
- test_code
- test_name
- value_numeric
- unit
- ref_low
- ref_high
- collected_at

#### medications (optional)
- id
- pet_id
- medication_name
- dosage
- frequency
- last_fill_date
- refill_remaining

### Example pet

A single well-known seeded pet is enough for the demo, e.g.:

- **Luna**, canine
- one recent visit
- a handful of chemistry/CBC-style results

The app can later be extended with multiple pets, but v1 should optimize for ease of demo.

---

## Backend behavior recommendations

### Chat route responsibilities

The chat route should:

1. receive user message + current mode + conversation history
2. fetch relevant local data from SQLite (e.g., Luna's diagnostics, medications) as needed
3. build a system prompt appropriate to the current mode:
   - **Text Only**: instruct the model to respond in plain prose only
   - **A2UI Enabled**: instruct the model to return `{ "text": "...", "a2ui": {...} | null }` JSON and describe the supported component schema
4. inject fetched SQLite data into the prompt context
5. call the **OpenAI API** (`gpt-4o` or `gpt-4o-mini`) using JSON mode in A2UI-enabled mode
6. parse the response into:
   - text
   - optional A2UI payload
7. validate / normalize the payload (graceful fallback on malformed output)
8. return both rendered-chat data and raw payload data for inspection

### UI event route responsibilities

The UI event route should:

1. receive structured event envelope
2. update UI/session state
3. optionally transform form data into a natural-language or structured follow-up for the model
4. call the model or execute app logic
5. return updated text and optional updated A2UI

### Important implementation principle

For some actions, it may be cleaner to let the app perform deterministic behavior directly rather than asking the model to improvise everything.

Examples:

- appointment form submit could store an in-memory “request created” object and generate a confirmation
- diagnostic result visualization could be generated from SQLite data using deterministic app code with the model deciding *when* to request the UI

This hybrid approach will make the demo more reliable.

---

## Prompting strategy recommendation

Claude Code should implement a prompt pattern where the assistant is told the following:

### In text-only mode

- respond only in normal prose
- do not return A2UI payloads

### In A2UI-enabled mode

- return a short natural-language explanation
- when a UI would improve UX, return a valid A2UI JSON payload using the supported subset only
- prefer UI for:
  - scheduling
  - structured intake
  - visual result summaries
  - action selection

### Additional recommendation

Have the backend enforce a structured output contract. For example, require model output in a JSON envelope such as:

```json
{
  "text": "...",
  "a2ui": { ... } | null
}
```

This will be easier to inspect and safer to parse.

---

## Rendering strategy recommendation

### Core renderer design

Implement an **A2UI adapter layer**:

```text
A2UI JSON
  -> validator / normalizer
  -> renderer adapter
  -> trusted React components
```

### Trusted component catalog

Create a small React component registry such as:

- `Card`
- `Section`
- `Text`
- `TextInput`
- `Textarea`
- `SelectInput`
- `Checkbox`
- `DateInput`
- `TimeSelect`
- `PrimaryButton`
- `RangeBar`
- `LabelValueRow`

The adapter maps incoming A2UI component types to these local components.

### Validation requirements

- reject unknown component types
- reject unsupported nesting
- reject missing IDs on interactive elements
- cap payload size
- provide a graceful fallback card when validation fails

---

## Protocol inspector design

This is one of the most important pieces of the demo.

### Inspector should show

#### Request tab
- current mode
- last user message
- context fragments added by backend

#### Response tab
- raw assistant response envelope
- normalized A2UI payload

#### Event tab
- last UI event envelope submitted by the frontend
- derived app action / model follow-up

### Optional extras

- copy JSON button
- “show validation output” toggle
- compact diff when a UI is updated after submission

---

## Suggested file/app structure

One possible implementation structure:

```text
app/
  page.tsx
  api/
    chat/route.ts
    ui-event/route.ts

components/
  chat/
    ChatShell.tsx
    ChatTranscript.tsx
    ChatMessage.tsx
    MessageComposer.tsx
    ModeToggle.tsx
  a2ui/
    A2UIRenderer.tsx
    A2UIComponentRegistry.tsx
    A2UIValidator.ts
    components/
      A2UICard.tsx
      A2UIText.tsx
      A2UITextInput.tsx
      A2UISelect.tsx
      A2UIDateInput.tsx
      A2UITimeSelect.tsx
      A2UIButton.tsx
      A2UIRangeBar.tsx
  inspector/
    ProtocolInspector.tsx

lib/
  ai/
    chat-contract.ts
    prompt-builder.ts
    response-parser.ts
  db/
    sqlite.ts
    seed.ts
    queries.ts
  demo/
    sample-prompts.ts
    mock-or-real-a2ui-notes.md
```

Claude Code can adapt this as needed.

---

## Suggested implementation phases

### Phase 1

- basic Next.js shell
- chat transcript
- mode toggle
- protocol inspector skeleton
- text-only mode working

### Phase 2

- A2UI message envelope
- validator + renderer for minimal subset
- appointment scheduling card

### Phase 3

- SQLite integration
- diagnostic results lookup
- diagnostic range bars

### Phase 4

- one or two additional UI examples
- protocol inspector polish
- better styling / seeded prompts

### Phase 5 (optional)

- limited streaming
- updated UI states after submit
- richer event log

---

## Recommended v1 scope guardrails

To keep the project achievable, avoid these for v1:

- full general-purpose calendar widget if a date input + time slot selector is enough
- canvas/workbench mode
- multi-user auth
- persistent production-grade scheduling backend
- broad arbitrary chart support
- large A2UI component coverage
- full AG-UI runtime integration unless it becomes necessary

The demo should be optimized for **clarity over completeness**.

---

## Success criteria

The v1 app is successful if it can do the following reliably:

1. Show the Pet Coach chat UI.
2. Let the presenter toggle between text-only and A2UI-enabled behavior.
3. Return an inline appointment scheduling UI for a follow-up visit scenario.
4. Accept user input from that generated UI and show the structured event payload.
5. Retrieve sample diagnostic results from SQLite.
6. Render those results in an A2UI-based visual card with range bars / status bars.
7. Show the raw and normalized JSON in a protocol inspector.
8. Make the conceptual value of A2UI obvious to the class.

---

## Suggested implementation notes for Claude Code

Please treat this as a **working demo application**, not a speculative prototype.

Implementation priorities:

1. Keep the app small and understandable.
2. Optimize for a smooth live demo.
3. Use real structured A2UI payloads.
4. Keep the renderer catalog intentionally narrow.
5. Make the JSON exchanges visible.
6. Favor deterministic app logic where it improves reliability.
7. Make the contrast between text-only and A2UI-enhanced UX unmistakable.

A strong implementation would include:

- friendly polished UI
- one seeded pet, such as Luna
- one or two sample quick prompts
- clear inline generated cards
- a visible developer/protocol drawer
- concise comments explaining the architectural choices

---

## Optional future enhancements

If the first version works well, possible follow-up enhancements include:

- right-side workbench/canvas mode
- richer diagnostic visualization
- visit summary cards
- image upload and A2UI-enhanced interpretation workflow
- medication adherence tracker
- A2UI update/diff visualization
- support for a few more A2UI primitives
- optional Onyx retrofit exploration later

---

## Closing summary

The recommended v1 app is:

- a **Next.js / React**-based **Pet Coach** demo
- focused on **inline A2UI rendering inside chat**
- able to contrast **text-only** and **A2UI-enhanced** responses
- able to show **real JSON payloads and event traffic**
- grounded in a small but coherent veterinary workflow
- centered on a few compelling UI examples:
  - follow-up visit scheduling
  - diagnostic results range bars
  - symptom intake and/or medication action cards

This should make for a strong Promptly-at-9 session because it shows not only a new standard, but also why that standard could materially improve future AI application UX.

---

## Reference links

- Google Developers Blog — Introducing A2UI: An open project for agent-driven interfaces  
  https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/

- Google A2UI GitHub repository  
  https://github.com/google/A2UI/

- Next.js App Router documentation  
  https://nextjs.org/docs/app
