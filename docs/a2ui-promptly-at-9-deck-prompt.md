# Claude Cowork Prompt: Generate PowerPoint Deck  
## Topic: A2UI and the Future of AI-Driven Interfaces (Pet Coach Demo)

---

## Instructions for Claude Cowork

You are creating a **professional, visually engaging PowerPoint presentation** for an internal technical learning session called **“Promptly-at-9.”**

### Audience
- Mixed skill levels:
  - Developers
  - QA testers
  - Product managers
  - Analysts
- Familiar with AI chat tools (ChatGPT, Copilot, etc.)
- Limited exposure to **agent-driven UI concepts like A2UI**

### Tone
- Clear, modern, and engaging
- Educational but not overly academic
- Practical and demo-oriented
- Visually driven (not text-heavy slides)

---

## Core Objective of the Deck

This presentation must clearly communicate:

> AI applications are evolving from “text-only responses” to “agent-driven interfaces” where the assistant can generate UI, not just language.

Use the **Pet Coach A2UI demo app** as the central narrative and anchor throughout the presentation.

---

## Context (Use This As Source Material)

This deck is based on the Pet Coach A2UI demo application design:  
fileciteturn0file0

You should incorporate:
- The purpose of the app
- The architecture
- The UX comparison (text-only vs A2UI)
- The specific use cases (scheduling, diagnostics, etc.)
- The protocol flow (JSON payloads + events)

---

## Slide Structure (Required Sections)

### 1. Title Slide
- Title: *“From Chat to Interface: Introducing A2UI”*
- Subtitle: Pet Coach Demo
- Presenter name
- Date

---

### 2. Why This Matters
Explain the current limitation:
- AI apps mostly “talk in text”
- Users must respond conversationally even when UI would be better

Include:
- A simple visual comparison:
  - Chat-only interaction vs structured UI

---

### 3. The Shift in AI UX
Key message:
- AI is evolving from:
  - answering questions
  - → to driving workflows

Introduce concept:
- “AI that can speak interface”

---

### 4. What is A2UI?
Explain clearly:
- A2UI = Agent-to-User Interface
- Agent returns **structured UI (JSON)** instead of just text
- Client renders UI using trusted components

Include:
- Simple diagram:
  Prompt → Model → { text + UI JSON } → Rendered UI

---

### 5. How A2UI Works (Conceptual Flow)
Step-by-step:
1. User sends request
2. Model returns:
   - text
   - optional UI payload
3. UI renders inline
4. User interacts
5. Event sent back
6. Model responds again

Include:
- Visual flow diagram

---

### 6. Pet Coach Demo Overview
Explain the app:
- Veterinary follow-up assistant
- Built in Next.js
- Uses real LLM (OpenAI)
- Includes SQLite diagnostic data
- Inline UI rendering in chat

---

### 7. Demo Comparison: Text vs A2UI
Create a side-by-side slide:

Left:
- Text-only experience (multi-turn Q&A)

Right:
- A2UI experience (form rendered instantly)

Use the **follow-up appointment scenario**

---

### 8. Example 1: Appointment Scheduling
Show:
- Chat-only flow (bullet list)
- A2UI form (visual mock)

Highlight:
- Reduced friction
- Faster completion

---

### 9. Example 2: Diagnostic Visualization
Show:
- Text explanation of lab results
vs
- A2UI range bars / visual indicators

Highlight:
- Faster comprehension
- Better UX for data-heavy responses

---

### 10. Example 3: Structured Intake / Actions
Choose 1–2:
- Symptom intake form
- Medication card

Highlight:
- Structured data capture
- Action-oriented UX

---

### 11. Under the Hood: Real Payloads
Show:
- Example JSON response:
```
{
  "text": "...",
  "a2ui": { ... }
}
```

Also show:
- Event payload example

Explain:
- This is not magic — it’s a protocol

---

### 12. Architecture Overview
Diagram:
- Next.js frontend
- Chat API
- OpenAI
- SQLite
- A2UI renderer

Explain:
- Renderer maps JSON → React components

---

### 13. Key Design Principles
Bullet points:
- Declarative UI (not executable code)
- Trusted component catalog
- Inspectable system behavior
- Hybrid AI + deterministic logic

---

### 14. Why This is Important for Us
Tie back to enterprise context:
- Internal tools
- Workflow automation
- Data-heavy applications
- Reduced friction in user flows

---

### 15. Where This Goes Next
Future possibilities:
- Canvas/workbench UI
- Multi-step workflows
- Agent orchestration
- Integration with enterprise systems

---

### 16. Live Demo Slide
Simple slide:
- “Let’s see it in action”
- Include demo talking points

---

### 17. Key Takeaways
Summarize:
- AI is moving beyond text
- A2UI enables richer UX
- Structured UI improves efficiency
- This pattern is highly applicable

---

## Visual Design Guidance

- Use modern, clean layouts
- Prefer visuals over text
- Use diagrams wherever possible
- Include UI mockups for:
  - scheduling form
  - diagnostic range bars
- Use consistent color scheme
- Avoid dense text slides

---

## Output Requirements

- Generate a complete PowerPoint deck
- Each slide should include:
  - Title
  - Bullet points
  - Suggested visuals/diagrams
- Keep slides concise and presentation-ready
- Include speaker notes where helpful

---

## Final Instruction

Create a compelling, demo-aligned presentation that:
- clearly explains A2UI
- visually demonstrates its value
- aligns with the Pet Coach app
- supports a 20–30 minute technical session

Focus on clarity, impact, and storytelling.
