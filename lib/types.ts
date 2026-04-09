// =============================================================================
// Pet Coach A2UI Demo — Shared Type Definitions
//
// This file is imported by BOTH server (API routes) and client (React components).
// It must contain ONLY TypeScript type/interface declarations — no Node.js or
// browser-specific imports.
// =============================================================================

// ─── App Mode ────────────────────────────────────────────────────────────────

/** Controls whether the assistant returns plain text or text + A2UI payload. */
export type AppMode = 'text_only' | 'a2ui_enabled'

// ─── A2UI Payload Types ───────────────────────────────────────────────────────

/**
 * The discriminated union of all A2UI component types supported in v1.
 * The LLM is instructed to use these exact type strings so the renderer
 * can look them up in the component registry.
 */
export type A2UIComponentType =
  | 'scheduling_form'
  | 'diagnostic_range_bars'
  | 'checklist'
  | 'medication_reminder'

/**
 * Top-level A2UI payload returned by the backend alongside the assistant's
 * text response. The `data` field is component-specific and typed below.
 */
export type A2UIPayload = {
  type: A2UIComponentType
  messageId: string
  data: SchedulingFormData | DiagnosticRangeBarsData | ChecklistData | MedicationReminderData
}

// ─── Component-specific data types ───────────────────────────────────────────

export type SchedulingFormData = {
  petName: string
  prefillReason?: string
}

export type DiagnosticResult = {
  testName: string
  value: number
  unit: string
  refLow: number
  refHigh: number
  collectedAt: string
}

export type DiagnosticRangeBarsData = {
  petName: string
  collectedAt: string
  results: DiagnosticResult[]
}

export type ChecklistItem = {
  id: string
  label: string
  checked?: boolean
}

export type ChecklistData = {
  title: string
  description?: string
  items: ChecklistItem[]
  submitLabel?: string
}

export type MedicationReminderData = {
  medicationName: string
  dosage: string
  frequency: string
  lastFillDate: string
  refillsRemaining: number
  petName: string
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

/**
 * A single message in the chat transcript. Assistant messages may include an
 * optional A2UI payload that gets rendered inline after the text.
 */
export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'event'
  text: string
  a2ui?: A2UIPayload | null
  timestamp: string
}

// ─── UI Event Envelope ────────────────────────────────────────────────────────

/**
 * Structured event sent from the frontend to /api/ui-event when the user
 * interacts with an inline A2UI component (e.g., submits a form).
 * This is one of the key teaching artifacts — it shows that user interaction
 * with generated UI produces structured, inspectable data.
 */
export type UIEventEnvelope = {
  messageId: string
  componentId: string
  eventType: 'submit' | 'change' | 'click'
  payload: Record<string, unknown>
  timestamp: string
}

// ─── Protocol Inspector ───────────────────────────────────────────────────────

/**
 * The three payloads shown in the Protocol Inspector panel.
 * Stored as serialized JSON strings so they can be pretty-printed directly.
 */
export type InspectorState = {
  lastRequest: string | null   // JSON string of the last /api/chat request body
  lastResponse: string | null  // JSON string of the last /api/chat response
  lastEvent: string | null     // JSON string of the last /api/ui-event request body
}

// ─── API response shapes ──────────────────────────────────────────────────────

/** Shape returned by /api/chat */
export type ChatApiResponse = {
  message: ChatMessage
  /** The raw structured object from the LLM, for the inspector */
  rawLlmResponse: string
}

/** Shape returned by /api/ui-event */
export type UIEventApiResponse = {
  message: ChatMessage
}
