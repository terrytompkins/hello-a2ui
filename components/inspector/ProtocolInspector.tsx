'use client'

// =============================================================================
// Pet Coach A2UI Demo — Protocol Inspector
//
// A collapsible panel at the bottom of the screen that shows the raw JSON
// payloads flowing through the system. This is one of the most important
// teaching tools in the demo — it makes the A2UI protocol visible.
//
// Three tabs:
//   Request  — last /api/chat request body
//   Response — last /api/chat response (including raw LLM output)
//   UI Event — last /api/ui-event body (the structured event from form submit)
// =============================================================================

import { useState } from 'react'
import { useInspector } from '@/lib/context/InspectorContext'

type Tab = 'request' | 'response' | 'event'

export default function ProtocolInspector() {
  const { state } = useInspector()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('response')
  const [copied, setCopied] = useState(false)

  const tabContent: Record<Tab, string | null> = {
    request: state.lastRequest,
    response: state.lastResponse,
    event: state.lastEvent,
  }

  const currentJson = tabContent[activeTab]

  // Check if the last response included an A2UI payload (for the badge)
  const lastResponseHasA2UI = (() => {
    if (!state.lastResponse) return false
    try {
      const parsed = JSON.parse(state.lastResponse) as { message?: { a2ui?: unknown } }
      return parsed?.message?.a2ui != null
    } catch {
      return false
    }
  })()

  const handleCopy = async () => {
    if (!currentJson) return
    try {
      await navigator.clipboard.writeText(currentJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className={`border-t border-gray-200 bg-gray-900 text-gray-100 flex-shrink-0 transition-all duration-200 ${isOpen ? 'h-64' : 'h-10'}`}>
      {/* Collapsed bar / header */}
      <div
        className="flex items-center justify-between px-4 h-10 cursor-pointer hover:bg-gray-800 transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Protocol Inspector
          </span>
          {lastResponseHasA2UI && (
            <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-semibold">
              Structured UI
            </span>
          )}
        </div>

        {/* Tabs (visible even when collapsed so you can switch before opening) */}
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {(['request', 'response', 'event'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setIsOpen(true) }}
              className={`
                px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition-colors
                ${activeTab === tab && isOpen
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }
              `}
            >
              {tab === 'event' ? 'UI Event' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'event' && state.lastEvent && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
              )}
            </button>
          ))}
          {/* Copy button */}
          {isOpen && currentJson && (
            <button
              onClick={handleCopy}
              title="Copy JSON to clipboard"
              className="ml-1 px-2 py-1 rounded text-[10px] text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Content panel */}
      {isOpen && (
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto custom-scroll">
          {currentJson ? (
            <pre className="text-[11px] leading-relaxed text-gray-300 font-mono p-4 whitespace-pre-wrap break-words">
              {currentJson}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gray-600">
                {activeTab === 'event'
                  ? 'No UI event yet — submit a form to see the event payload.'
                  : 'No data yet — send a message to see the payload.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
