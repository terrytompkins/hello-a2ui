'use client'

// =============================================================================
// Pet Coach A2UI Demo — Root Page
//
// Composes the full layout:
//   - Context providers (Inspector + Chat)
//   - Header with mode toggle
//   - Main chat area
//   - Collapsible protocol inspector
// =============================================================================

import { InspectorProvider } from '@/lib/context/InspectorContext'
import { ChatProvider } from '@/lib/context/ChatContext'
import Header from '@/components/layout/Header'
import ChatContainer from '@/components/chat/ChatContainer'
import ProtocolInspector from '@/components/inspector/ProtocolInspector'

export default function Page() {
  return (
    <InspectorProvider>
      <ChatProvider>
        <div className="flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-hidden">
              <ChatContainer />
            </main>
          </div>
          <ProtocolInspector />
        </div>
      </ChatProvider>
    </InspectorProvider>
  )
}
