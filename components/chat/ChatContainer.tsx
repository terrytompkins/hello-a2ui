'use client'

// =============================================================================
// The main chat transcript area. Renders the message list, handles
// auto-scroll to the latest message, and shows the loading indicator.
// =============================================================================

import { useEffect, useRef } from 'react'
import { useChat } from '@/lib/context/ChatContext'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import SuggestedPrompts from './SuggestedPrompts'

export default function ChatContainer() {
  const { messages, isLoading } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable transcript */}
      <div className="flex-1 overflow-y-auto custom-scroll py-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator — shown while waiting for LLM response */}
        {isLoading && (
          <div className="flex justify-start mb-4 px-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 border-2 border-teal-300 flex items-center justify-center mt-0.5">
                <span className="text-sm">🐾</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      <SuggestedPrompts />

      {/* Input area */}
      <ChatInput />
    </div>
  )
}
