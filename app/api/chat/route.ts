// =============================================================================
// Pet Coach A2UI Demo — Chat API Route
//
// POST /api/chat
//
// Receives a user message + conversation history + mode.
// Fetches relevant SQLite context, calls the OpenAI service, and returns
// a ChatMessage (with optional A2UIPayload) plus the raw LLM output for
// the protocol inspector.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { callChatService, buildHistory } from '@/lib/ai/chatService'
import { getPetByName, getLatestDiagnostics, getMedications } from '@/lib/db'
import type { AppMode, ChatMessage } from '@/lib/types'

// Pin to Node.js runtime (required for better-sqlite3 native addon)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple random ID generator (avoids adding nanoid as a dependency)
function makeId(size = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = randomBytes(size)
  let result = ''
  for (let i = 0; i < size; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

// ─── Request / Response shapes ────────────────────────────────────────────────

type ChatRequestBody = {
  message: string
  mode: AppMode
  history: ChatMessage[]
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ChatRequestBody

  try {
    body = await req.json() as ChatRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { message, mode, history } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Missing message field' }, { status: 400 })
  }

  // Generate a stable message ID for this assistant turn
  const messageId = `msg_${makeId()}`

  // ─── Build DB context ───────────────────────────────────────────────────────
  // Fetch Luna's data and inject it into the system prompt context so the LLM
  // can reference real values. This is one of the key architectural points:
  // the application fetches structured data and provides it to the model,
  // rather than the model hallucinating values.

  let dbContext = ''

  try {
    const luna = getPetByName('Luna')
    if (luna) {
      dbContext += `Pet: ${luna.name} | ${luna.breed} | Age: ${luna.age_years} years | Owner: ${luna.owner_name}\n`

      const diagnostics = getLatestDiagnostics(luna.id)
      if (diagnostics.length > 0) {
        dbContext += `\nDiagnostic Results (collected ${diagnostics[0].collected_at}):\n`
        for (const d of diagnostics) {
          const status = d.value_numeric < d.ref_low ? 'LOW' : d.value_numeric > d.ref_high ? 'HIGH' : 'normal'
          dbContext += `  - ${d.test_name}: ${d.value_numeric} ${d.unit} (ref: ${d.ref_low}–${d.ref_high}) [${status}]\n`
        }
      }

      const meds = getMedications(luna.id)
      if (meds.length > 0) {
        dbContext += `\nMedications:\n`
        for (const m of meds) {
          dbContext += `  - ${m.medication_name}: ${m.dosage}, ${m.frequency} | Last fill: ${m.last_fill_date} | Refills remaining: ${m.refills_remaining}\n`
        }
      }
    }
  } catch (err) {
    // DB errors should not crash the chat — log and continue without context
    console.error('[/api/chat] DB context fetch failed:', err)
    dbContext = '(Pet data unavailable — database may not be seeded yet. Run: npm run db:seed)'
  }

  // ─── Build OpenAI history ───────────────────────────────────────────────────

  const llmHistory = buildHistory(history, mode)
  llmHistory.push({ role: 'user', content: message })

  // ─── Call LLM ──────────────────────────────────────────────────────────────

  let llmResult
  try {
    llmResult = await callChatService({
      mode,
      messageId,
      history: llmHistory,
      context: dbContext,
    })
  } catch (err) {
    console.error('[/api/chat] LLM call failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'LLM call failed' },
      { status: 500 }
    )
  }

  // ─── Build response ─────────────────────────────────────────────────────────

  const assistantMessage: ChatMessage = {
    id: messageId,
    role: 'assistant',
    text: llmResult.text,
    a2ui: llmResult.a2ui,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json({
    message: assistantMessage,
    rawLlmResponse: llmResult.rawLlmOutput,
  })
}
