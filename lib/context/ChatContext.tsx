'use client'

// =============================================================================
// Pet Coach A2UI Demo — Chat Context
//
// Central state for the chat session. Exposes:
//   - messages:       the full conversation transcript
//   - mode:           'text_only' | 'a2ui_enabled'
//   - isLoading:      true while waiting for an LLM response
//   - sendMessage:    sends a user message and appends the assistant response
//   - submitUIEvent:  sends a structured UI event and appends confirmation
//   - setMode:        switch between modes
//   - resetChat:      clear the transcript
//
// The protocol inspector is updated atomically alongside chat state so
// both always reflect the same exchange.
// =============================================================================

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ChatMessage, AppMode, UIEventEnvelope, ChatApiResponse, UIEventApiResponse } from '@/lib/types'
import { useInspector } from './InspectorContext'

type ChatContextValue = {
  messages: ChatMessage[]
  mode: AppMode
  isLoading: boolean
  sendMessage: (text: string) => Promise<void>
  submitUIEvent: (event: UIEventEnvelope) => Promise<void>
  setMode: (mode: AppMode) => void
  resetChat: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

// Welcome message shown when the chat first loads
function makeWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    text: "Hi! I'm Pet Coach, your veterinary support assistant. I'm here to help with Luna's follow-up care. You can ask me about her recent lab results, schedule a follow-up visit, or get guidance on medications and monitoring. Try one of the suggested prompts below, or just ask me anything!",
    a2ui: null,
    timestamp: new Date().toISOString(),
  }
}

function makeId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcomeMessage()])
  const [mode, setMode] = useState<AppMode>('text_only')
  const [isLoading, setIsLoading] = useState(false)
  const { setLastRequest, setLastResponse, setLastEvent } = useInspector()

  // ─── sendMessage ────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      text: text.trim(),
      a2ui: null,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Build the request payload
    const requestBody = {
      message: text.trim(),
      mode,
      history: messages.filter(m => m.role !== 'event'),
    }

    // Update inspector with outgoing request
    setLastRequest(JSON.stringify(requestBody, null, 2))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' })) as { error?: string }
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      const data = await res.json() as ChatApiResponse

      // Update inspector with full response
      setLastResponse(JSON.stringify({
        message: data.message,
        rawLlmResponse: data.rawLlmResponse,
      }, null, 2))

      setMessages(prev => [...prev, data.message])

    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: `Sorry, something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your OPENAI_API_KEY and try again.`,
        a2ui: null,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])

    } finally {
      setIsLoading(false)
    }
  }, [messages, mode, isLoading, setLastRequest, setLastResponse])

  // ─── submitUIEvent ──────────────────────────────────────────────────────────

  const submitUIEvent = useCallback(async (event: UIEventEnvelope) => {
    // Update inspector with outgoing event
    setLastEvent(JSON.stringify(event, null, 2))

    try {
      const res = await fetch('/api/ui-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json() as UIEventApiResponse

      setMessages(prev => [...prev, data.message])

    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'event',
        text: `Could not process your submission: ${err instanceof Error ? err.message : 'Unknown error'}`,
        a2ui: null,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }, [setLastEvent])

  // ─── resetChat ──────────────────────────────────────────────────────────────

  const resetChat = useCallback(() => {
    setMessages([makeWelcomeMessage()])
    setIsLoading(false)
  }, [])

  return (
    <ChatContext.Provider value={{ messages, mode, isLoading, sendMessage, submitUIEvent, setMode, resetChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
