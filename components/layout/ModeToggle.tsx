'use client'

// Mode toggle pill — switches between Text Only and A2UI Enabled

import { useChat } from '@/lib/context/ChatContext'
import type { AppMode } from '@/lib/types'

const MODES: { value: AppMode; label: string; description: string }[] = [
  { value: 'text_only', label: 'Text Only', description: 'LLM returns plain prose' },
  { value: 'a2ui_enabled', label: 'A2UI Enabled', description: 'LLM returns structured UI payloads' },
]

export default function ModeToggle() {
  const { mode, setMode } = useChat()

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 hidden sm:block">Mode:</span>
      <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 gap-0.5">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            title={m.description}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
              ${mode === m.value
                ? m.value === 'a2ui_enabled'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {m.value === 'a2ui_enabled' && mode === 'a2ui_enabled' && (
              <span className="mr-1">✨</span>
            )}
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
