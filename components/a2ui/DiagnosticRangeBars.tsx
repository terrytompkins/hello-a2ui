'use client'

// =============================================================================
// A2UI Component: Diagnostic Range Bars
//
// Rendered when the LLM returns type: "diagnostic_range_bars".
// Shows a custom range visualization for each blood test result:
//   - Horizontal track with reference range
//   - Colored marker at the measured value
//   - Status badge: Normal / High / Low
//
// No external chart library — pure React/Tailwind.
// =============================================================================

import type { DiagnosticRangeBarsData, DiagnosticResult, UIEventEnvelope } from '@/lib/types'

interface Props {
  data: DiagnosticRangeBarsData
  messageId: string
  onEvent: (event: UIEventEnvelope) => void
}

export default function DiagnosticRangeBars({ data }: Props) {
  if (!data.results || data.results.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
        No diagnostic results available.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3 flex items-center gap-2">
        <span className="text-lg">🧬</span>
        <div>
          <p className="text-sm font-semibold text-indigo-900">Diagnostic Results — {data.petName}</p>
          <p className="text-xs text-indigo-700">Collected {data.collectedAt}</p>
        </div>
      </div>

      {/* Results list */}
      <div className="divide-y divide-gray-100">
        {data.results.map((result, i) => (
          <ResultRow key={i} result={result} />
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" /> High
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" /> Low
        </span>
      </div>
    </div>
  )
}

// ─── Individual Result Row ────────────────────────────────────────────────────

function ResultRow({ result }: { result: DiagnosticResult }) {
  const { testName, value, unit, refLow, refHigh } = result

  // Status classification
  const isHigh = value > refHigh
  const isLow = value < refLow
  const status = isHigh ? 'High' : isLow ? 'Low' : 'Normal'

  // Calculate position of the value marker on the track.
  // The track spans [refLow - 20% range, refHigh + 20% range] so out-of-range
  // values are still visually shown (not just clipped to the edge).
  const range = refHigh - refLow
  const trackMin = refLow - range * 0.2
  const trackMax = refHigh + range * 0.2
  const trackRange = trackMax - trackMin

  // Normal range bar position (the green zone)
  const normalBarLeft = ((refLow - trackMin) / trackRange) * 100
  const normalBarWidth = ((refHigh - refLow) / trackRange) * 100

  // Marker position (clamped to [1%, 99%] so it stays visible)
  const markerPos = Math.min(99, Math.max(1, ((value - trackMin) / trackRange) * 100))

  const statusColors = {
    Normal: 'bg-emerald-100 text-emerald-800',
    High: 'bg-red-100 text-red-800',
    Low: 'bg-blue-100 text-blue-800',
  }

  const markerColors = {
    Normal: 'bg-emerald-500',
    High: 'bg-red-500',
    Low: 'bg-blue-500',
  }

  return (
    <div className="px-4 py-3">
      {/* Top row: test name + value + status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700 flex-1 mr-3 leading-tight">{testName}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-900">
            {value} <span className="text-xs font-normal text-gray-500">{unit}</span>
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[status]}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Range bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-visible">
        {/* Normal range zone (green) */}
        <div
          className="absolute top-0 h-full bg-emerald-200 rounded-full"
          style={{ left: `${normalBarLeft}%`, width: `${normalBarWidth}%` }}
        />
        {/* Value marker */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow ${markerColors[status]}`}
          style={{ left: `${markerPos}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Reference range label */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">ref: {refLow}–{refHigh} {unit}</span>
      </div>
    </div>
  )
}
