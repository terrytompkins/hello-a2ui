'use client'

// =============================================================================
// Pet Coach A2UI Demo — A2UI Renderer
//
// This is the core of the A2UI architecture teaching point.
//
// Flow:
//   A2UIPayload (from LLM) → validate type → look up in REGISTRY → render
//
// The frontend NEVER renders arbitrary code from the LLM. Instead it maps
// the payload's `type` field to a pre-approved, trusted React component.
// Unknown types render a graceful fallback card.
// =============================================================================

import type { A2UIPayload, UIEventEnvelope } from '@/lib/types'
import SchedulingForm from './SchedulingForm'
import DiagnosticRangeBars from './DiagnosticRangeBars'
import ChecklistCard from './ChecklistCard'
import MedicationCard from './MedicationCard'

// ─── Component Registry ───────────────────────────────────────────────────────
// Maps A2UI payload types to trusted local React components.
// Adding a new component type requires: (1) updating types.ts, (2) building
// the component, (3) adding it here. That's intentional — it's the trust gate.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.ComponentType<{ data: any; messageId: string; onEvent: (e: UIEventEnvelope) => void }>> = {
  scheduling_form: SchedulingForm,
  diagnostic_range_bars: DiagnosticRangeBars,
  checklist: ChecklistCard,
  medication_reminder: MedicationCard,
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  payload: A2UIPayload
  onEvent: (event: UIEventEnvelope) => void
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export default function A2UIRenderer({ payload, onEvent }: Props) {
  const Component = REGISTRY[payload.type]

  if (!Component) {
    // Graceful fallback — never crash on an unknown payload type
    return (
      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium">Unsupported A2UI component: <code>{payload.type}</code></p>
        <p className="text-xs mt-1 text-amber-600">This component type is not in the trusted renderer catalog.</p>
      </div>
    )
  }

  return (
    <div className="mt-1">
      {/* Label identifying this as a structured UI response */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="h-px flex-1 bg-teal-100" />
        <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-widest">
          Structured UI Response
        </span>
        <div className="h-px flex-1 bg-teal-100" />
      </div>

      <Component
        data={payload.data}
        messageId={payload.messageId}
        onEvent={onEvent}
      />
    </div>
  )
}
