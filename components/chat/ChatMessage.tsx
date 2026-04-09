'use client'

// =============================================================================
// A single message row in the chat transcript.
// Renders user / assistant / event roles differently.
// Assistant messages may include an inline A2UIRenderer block.
// =============================================================================

import type { ChatMessage as ChatMessageType } from '@/lib/types'
import A2UIRenderer from '@/components/a2ui/A2UIRenderer'
import { useChat } from '@/lib/context/ChatContext'

interface Props {
  message: ChatMessageType
}

export default function ChatMessage({ message }: Props) {
  const { submitUIEvent } = useChat()

  // ─── Event confirmation bubble (compact) ───────────────────────────────────
  if (message.role === 'event') {
    return (
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs text-green-800">
          <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {message.text}
        </div>
      </div>
    )
  }

  // ─── User message ──────────────────────────────────────────────────────────
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4 px-4">
        <div className="max-w-[70%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm">
          {message.text}
        </div>
      </div>
    )
  }

  // ─── Assistant message ─────────────────────────────────────────────────────
  return (
    <div className="flex justify-start mb-4 px-4">
      <div className="flex gap-3 max-w-[85%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 border-2 border-teal-300 flex items-center justify-center mt-0.5">
          <span className="text-sm">🐾</span>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {/* Text bubble */}
          {message.text && (
            <div className="relative">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-800 leading-relaxed shadow-sm">
                {message.text}
              </div>
              {/* A2UI badge — shown when this message includes a structured UI payload */}
              {message.a2ui && (
                <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow">
                  A2UI
                </span>
              )}
            </div>
          )}

          {/* Inline A2UI component */}
          {message.a2ui && (
            <A2UIRenderer payload={message.a2ui} onEvent={submitUIEvent} />
          )}
        </div>
      </div>
    </div>
  )
}
