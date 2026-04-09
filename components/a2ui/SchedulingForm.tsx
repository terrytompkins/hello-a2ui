'use client'

// =============================================================================
// A2UI Component: Scheduling Form
//
// Rendered when the LLM returns type: "scheduling_form".
// Lets the user book a follow-up appointment inline in the chat.
// On submit, fires a UIEventEnvelope back to /api/ui-event.
// =============================================================================

import { useState } from 'react'
import type { SchedulingFormData, UIEventEnvelope } from '@/lib/types'

interface Props {
  data: SchedulingFormData
  messageId: string
  onEvent: (event: UIEventEnvelope) => void
}

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']

export default function SchedulingForm({ data, messageId, onEvent }: Props) {
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [reason, setReason] = useState(data.prefillReason ?? '')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = preferredDate && preferredTime && reason.trim()

  const handleSubmit = () => {
    if (!canSubmit) return

    onEvent({
      messageId,
      componentId: 'scheduling_form',
      eventType: 'submit',
      payload: {
        petName: data.petName,
        preferredDate,
        preferredTime,
        reason: reason.trim(),
        notes: notes.trim(),
      },
      timestamp: new Date().toISOString(),
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-800">
          <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-medium text-sm">Appointment request submitted!</span>
        </div>
        <p className="text-xs text-green-700 mt-1.5">
          {data.petName} — {preferredDate} at {preferredTime}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-teal-50 border-b border-teal-100 px-4 py-3 flex items-center gap-2">
        <span className="text-lg">📅</span>
        <div>
          <p className="text-sm font-semibold text-teal-900">Schedule a Follow-up Visit</p>
          <p className="text-xs text-teal-700">Patient: {data.petName}</p>
        </div>
      </div>

      {/* Form body */}
      <div className="p-4 space-y-3">
        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Date</label>
          <input
            type="date"
            value={preferredDate}
            onChange={e => setPreferredDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Time slot */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Time</label>
          <select
            value={preferredTime}
            onChange={e => setPreferredTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">Select a time slot</option>
            {TIME_SLOTS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reason for Visit</label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Follow-up bloodwork, recheck exam…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Additional Notes <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any changes in symptoms, concerns, or special requests…"
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Appointment Request
        </button>
      </div>
    </div>
  )
}
