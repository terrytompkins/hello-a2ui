// =============================================================================
// Pet Coach A2UI Demo — OpenAI Chat Service
//
// Encapsulates all OpenAI API interaction. The route handlers call this
// service, passing the mode, conversation history, and any DB context.
//
// In text-only mode:  returns plain prose.
// In A2UI mode:       requests a JSON envelope { text, a2ui } and parses it.
// =============================================================================

import OpenAI from 'openai'
import type { AppMode, A2UIPayload, ChatMessage } from '@/lib/types'
import { getSystemPrompt } from './prompts'

// Lazy-initialize the OpenAI client so the module can be imported without
// OPENAI_API_KEY set (e.g., during type-checking).
let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY environment variable is not set. ' +
        'Create a .env.local file with OPENAI_API_KEY=<your-key>.'
      )
    }
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChatServiceRequest = {
  mode: AppMode
  /** The current message ID (used for A2UI payload association) */
  messageId: string
  /** Full conversation history to send as context */
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  /** Optional DB context injected into the system prompt */
  context?: string
}

export type ChatServiceResponse = {
  text: string
  a2ui: A2UIPayload | null
  /** The raw string from the LLM, for the protocol inspector */
  rawLlmOutput: string
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function callChatService(req: ChatServiceRequest): Promise<ChatServiceResponse> {
  const openai = getOpenAI()

  // Build the system prompt, optionally appending injected DB context
  let systemPrompt = getSystemPrompt(req.mode)
  if (req.context) {
    systemPrompt += `\n\n─── CONTEXT ─────────────────────────────────────────────────────\n${req.context}`
  }
  // Tell the model the current message ID so it can embed it in a2ui payloads
  systemPrompt += `\n\nCurrent messageId: ${req.messageId}`

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...req.history,
  ]

  if (req.mode === 'a2ui_enabled') {
    // Use JSON mode to enforce the { text, a2ui } envelope
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const rawOutput = completion.choices[0]?.message?.content ?? '{}'
    return parseA2UIResponse(rawOutput, req.messageId)

  } else {
    // Text-only mode: plain prose response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
    })

    const text = completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.'
    return {
      text,
      a2ui: null,
      rawLlmOutput: text,
    }
  }
}

// ─── Response parser ──────────────────────────────────────────────────────────

/**
 * Parses the LLM's JSON response in A2UI-enabled mode.
 * Falls back gracefully if the JSON is malformed or missing fields.
 */
function parseA2UIResponse(rawOutput: string, messageId: string): ChatServiceResponse {
  try {
    const parsed = JSON.parse(rawOutput) as {
      text?: unknown
      a2ui?: unknown
    }

    const text = typeof parsed.text === 'string' && parsed.text.trim()
      ? parsed.text.trim()
      : 'Here is the information you requested.'

    const a2ui = validateA2UIPayload(parsed.a2ui, messageId)

    return { text, a2ui, rawLlmOutput: rawOutput }

  } catch {
    // JSON parse failed — degrade gracefully to text-only
    return {
      text: rawOutput || 'Sorry, I could not generate a response.',
      a2ui: null,
      rawLlmOutput: rawOutput,
    }
  }
}

/**
 * Validates the a2ui field from the LLM response.
 * Returns null if the payload is missing, null, or has an unsupported type.
 */
function validateA2UIPayload(raw: unknown, messageId: string): A2UIPayload | null {
  if (raw === null || raw === undefined) return null

  const SUPPORTED_TYPES = new Set([
    'scheduling_form',
    'diagnostic_range_bars',
    'checklist',
    'medication_reminder',
  ])

  if (
    typeof raw !== 'object' ||
    !('type' in raw) ||
    typeof (raw as Record<string, unknown>).type !== 'string' ||
    !SUPPORTED_TYPES.has((raw as Record<string, unknown>).type as string)
  ) {
    console.warn('[chatService] A2UI payload has unsupported or missing type:', raw)
    return null
  }

  const payload = raw as Record<string, unknown>

  // Ensure messageId is always set from server (don't trust LLM to get it right)
  return {
    type: payload.type as A2UIPayload['type'],
    messageId,
    data: (payload.data as A2UIPayload['data']) ?? {},
  }
}

// ─── History builder ──────────────────────────────────────────────────────────

/**
 * Converts the app's ChatMessage array into the format OpenAI expects.
 * Skips 'event' role messages (those are UI confirmation bubbles).
 * In A2UI mode, assistant messages with a2ui payloads are summarized
 * as "[returned a2ui: <type>]" so the model knows what it previously sent.
 */
export function buildHistory(
  messages: ChatMessage[],
  mode: AppMode
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const MAX_TURNS = 10 // keep context window manageable

  const relevant = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_TURNS)

  return relevant.map(m => {
    if (m.role === 'user') {
      return { role: 'user' as const, content: m.text }
    }
    // For assistant messages, include a2ui note if in a2ui mode
    let content = m.text
    if (mode === 'a2ui_enabled' && m.a2ui) {
      content += ` [returned a2ui: ${m.a2ui.type}]`
    }
    return { role: 'assistant' as const, content }
  })
}
