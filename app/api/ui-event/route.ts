// =============================================================================
// Pet Coach A2UI Demo — UI Event API Route
//
// POST /api/ui-event
//
// Receives a structured UIEventEnvelope when the user interacts with an
// inline A2UI component (e.g., submits a scheduling form).
//
// This is the other half of the A2UI round-trip. The event is:
//   1. Stored in SQLite (for scheduling submissions)
//   2. Used to generate a follow-up assistant confirmation message
//
// The raw event payload is returned in the response so the protocol
// inspector can display it.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getPetByName, insertAppointmentRequest } from '@/lib/db'
import type { UIEventEnvelope, ChatMessage } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function makeId(size = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = randomBytes(size)
  let result = ''
  for (let i = 0; i < size; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

export async function POST(req: NextRequest) {
  let event: UIEventEnvelope

  try {
    event = await req.json() as UIEventEnvelope
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let confirmationText = 'Got it — your response has been recorded.'

  // ─── Handle scheduling form submissions ─────────────────────────────────────

  if (event.componentId === 'scheduling_form' && event.eventType === 'submit') {
    const p = event.payload as {
      petName?: string
      preferredDate?: string
      preferredTime?: string
      reason?: string
      notes?: string
    }

    try {
      const luna = getPetByName(p.petName ?? 'Luna')
      if (luna) {
        const requestId = insertAppointmentRequest({
          petId: luna.id,
          preferredDate: p.preferredDate ?? '',
          preferredTime: p.preferredTime ?? '',
          reason: p.reason ?? '',
          notes: p.notes,
        })
        confirmationText =
          `Your appointment request for ${p.petName ?? 'Luna'} has been submitted! ` +
          `Request #${requestId} — ${p.preferredDate} at ${p.preferredTime}. ` +
          `Reason: ${p.reason ?? 'follow-up'}. ` +
          `Our team will confirm within 24 hours.`
      }
    } catch (err) {
      console.error('[/api/ui-event] DB write failed:', err)
      confirmationText = `Appointment request received for ${p.petName ?? 'Luna'} on ${p.preferredDate} at ${p.preferredTime}. (Note: Could not save to database — run npm run db:seed)`
    }
  }

  // ─── Handle checklist submissions ───────────────────────────────────────────

  if (event.componentId === 'checklist' && event.eventType === 'submit') {
    const p = event.payload as { completedItems?: string[]; totalItems?: number }
    const completed = p.completedItems?.length ?? 0
    const total = p.totalItems ?? completed
    confirmationText = `Checklist submitted — ${completed} of ${total} items marked complete. This has been noted in Luna's care record.`
  }

  // ─── Handle medication card actions ─────────────────────────────────────────

  if (event.componentId === 'medication_reminder' && event.eventType === 'click') {
    const p = event.payload as { action?: string; medicationName?: string }
    if (p.action === 'request_refill') {
      confirmationText = `Refill request submitted for ${p.medicationName ?? 'the medication'}. Your veterinary team will process this within 1 business day.`
    } else if (p.action === 'report_side_effect') {
      confirmationText = `Side effect report noted for ${p.medicationName ?? 'the medication'}. A team member will follow up with you shortly.`
    } else {
      confirmationText = `Your request regarding ${p.medicationName ?? 'the medication'} has been noted.`
    }
  }

  // ─── Build confirmation message ─────────────────────────────────────────────

  const confirmationMessage: ChatMessage = {
    id: `evt_${makeId()}`,
    role: 'event',
    text: confirmationText,
    a2ui: null,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json({
    message: confirmationMessage,
  })
}
