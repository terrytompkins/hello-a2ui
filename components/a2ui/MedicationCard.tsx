'use client'

// =============================================================================
// A2UI Component: Medication Reminder Card
//
// Rendered when the LLM returns type: "medication_reminder".
// Shows medication info and action buttons (request refill, report side effect).
// Demonstrates action-oriented A2UI — not just data entry, but quick actions.
// =============================================================================

import { useState } from 'react'
import type { MedicationReminderData, UIEventEnvelope } from '@/lib/types'

interface Props {
  data: MedicationReminderData
  messageId: string
  onEvent: (event: UIEventEnvelope) => void
}

export default function MedicationCard({ data, messageId, onEvent }: Props) {
  const [actionTaken, setActionTaken] = useState<string | null>(null)

  const handleAction = (action: string) => {
    onEvent({
      messageId,
      componentId: 'medication_reminder',
      eventType: 'click',
      payload: {
        action,
        medicationName: data.medicationName,
        petName: data.petName,
      },
      timestamp: new Date().toISOString(),
    })
    setActionTaken(action)
  }

  const actionLabels: Record<string, string> = {
    request_refill: 'Refill requested',
    report_side_effect: 'Side effect reported',
    ask_vet: 'Question sent to vet',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-orange-50 border-b border-orange-100 px-4 py-3 flex items-center gap-2">
        <span className="text-lg">💊</span>
        <div>
          <p className="text-sm font-semibold text-orange-900">{data.medicationName}</p>
          <p className="text-xs text-orange-700">Patient: {data.petName}</p>
        </div>
      </div>

      {/* Medication details */}
      <div className="px-4 py-3 space-y-2">
        <DetailRow label="Dosage" value={data.dosage} />
        <DetailRow label="Frequency" value={data.frequency} />
        <DetailRow label="Last Fill Date" value={data.lastFillDate} />
        <DetailRow
          label="Refills Remaining"
          value={
            <span className={data.refillsRemaining === 0 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
              {data.refillsRemaining === 0 ? 'None — refill needed' : data.refillsRemaining}
            </span>
          }
        />
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-gray-100">
        {actionTaken ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {actionLabels[actionTaken] ?? 'Action recorded'}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <ActionButton
              onClick={() => handleAction('request_refill')}
              variant="primary"
              icon="🔄"
              label="Request Refill"
            />
            <ActionButton
              onClick={() => handleAction('ask_vet')}
              variant="secondary"
              icon="💬"
              label="Ask Vet"
            />
            <ActionButton
              onClick={() => handleAction('report_side_effect')}
              variant="danger"
              icon="⚠️"
              label="Report Side Effect"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-900 font-medium text-xs">{value}</span>
    </div>
  )
}

function ActionButton({
  onClick,
  variant,
  icon,
  label,
}: {
  onClick: () => void
  variant: 'primary' | 'secondary' | 'danger'
  icon: string
  label: string
}) {
  const styles = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${styles[variant]}`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}
