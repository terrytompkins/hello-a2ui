'use client'

// =============================================================================
// Pet Coach A2UI Demo — Protocol Inspector Context
//
// Stores the last request, response, and UI event payloads as JSON strings
// for display in the ProtocolInspector panel. Populated by ChatContext when
// API calls complete.
// =============================================================================

import React, { createContext, useContext, useState } from 'react'
import type { InspectorState } from '@/lib/types'

type InspectorContextValue = {
  state: InspectorState
  setLastRequest: (json: string) => void
  setLastResponse: (json: string) => void
  setLastEvent: (json: string) => void
}

const InspectorContext = createContext<InspectorContextValue | null>(null)

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InspectorState>({
    lastRequest: null,
    lastResponse: null,
    lastEvent: null,
  })

  const setLastRequest = (json: string) =>
    setState(prev => ({ ...prev, lastRequest: json }))

  const setLastResponse = (json: string) =>
    setState(prev => ({ ...prev, lastResponse: json }))

  const setLastEvent = (json: string) =>
    setState(prev => ({ ...prev, lastEvent: json }))

  return (
    <InspectorContext.Provider value={{ state, setLastRequest, setLastResponse, setLastEvent }}>
      {children}
    </InspectorContext.Provider>
  )
}

export function useInspector(): InspectorContextValue {
  const ctx = useContext(InspectorContext)
  if (!ctx) throw new Error('useInspector must be used within InspectorProvider')
  return ctx
}
