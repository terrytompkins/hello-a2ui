'use client'

// Clickable prompt chips shown below the welcome message for easy demo navigation

import { useChat } from '@/lib/context/ChatContext'

const PROMPTS = [
  'I need to schedule a follow-up for Luna.',
  'Show me Luna\'s latest bloodwork.',
  'Graph the diagnostic results.',
  'What should I monitor after today\'s visit?',
  'Help me log symptoms for the last 24 hours.',
  'Does Luna need a medication refill?',
]

export default function SuggestedPrompts() {
  const { sendMessage, isLoading } = useChat()

  return (
    <div className="px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Suggested prompts</p>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
