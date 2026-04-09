'use client'

// =============================================================================
// A2UI Component: Checklist Card
//
// Rendered when the LLM returns type: "checklist".
// Used for discharge care instructions, monitoring checklists, etc.
// =============================================================================

import { useState } from 'react'
import type { ChecklistData, ChecklistItem, UIEventEnvelope } from '@/lib/types'

interface Props {
  data: ChecklistData
  messageId: string
  onEvent: (event: UIEventEnvelope) => void
}

export default function ChecklistCard({ data, messageId, onEvent }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(
    data.items.map(item => ({ ...item, checked: item.checked ?? false }))
  )
  const [submitted, setSubmitted] = useState(false)

  const toggle = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  const completedCount = items.filter(i => i.checked).length

  const handleSubmit = () => {
    onEvent({
      messageId,
      componentId: 'checklist',
      eventType: 'submit',
      payload: {
        completedItems: items.filter(i => i.checked).map(i => i.id),
        totalItems: items.length,
        title: data.title,
      },
      timestamp: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-violet-50 border-b border-violet-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <div>
            <p className="text-sm font-semibold text-violet-900">{data.title}</p>
            {data.description && (
              <p className="text-xs text-violet-700 mt-0.5">{data.description}</p>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2.5">
          <div className="flex justify-between text-xs text-violet-600 mb-1">
            <span>{completedCount} of {items.length} complete</span>
            <span>{Math.round((completedCount / items.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-violet-100 rounded-full">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="divide-y divide-gray-50">
        {items.map(item => (
          <label
            key={item.id}
            className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${submitted ? 'pointer-events-none' : ''}`}
          >
            <input
              type="checkbox"
              checked={item.checked ?? false}
              onChange={() => toggle(item.id)}
              disabled={submitted}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 flex-shrink-0 cursor-pointer"
            />
            <span className={`text-sm text-gray-700 leading-relaxed ${item.checked ? 'line-through text-gray-400' : ''}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      {/* Submit */}
      <div className="px-4 py-3 border-t border-gray-100">
        {submitted ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Checklist submitted ({completedCount}/{items.length} completed)
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            {data.submitLabel ?? 'Submit Checklist'}
          </button>
        )}
      </div>
    </div>
  )
}
