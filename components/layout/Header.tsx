'use client'

import ModeToggle from './ModeToggle'
import { useChat } from '@/lib/context/ChatContext'

export default function Header() {
  const { resetChat, mode } = useChat()

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
      {/* Logo + title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-teal-100 border-2 border-teal-300 flex items-center justify-center">
          <span className="text-base">🐾</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900 leading-tight">Pet Coach</h1>
          <p className="text-xs text-gray-400 leading-tight hidden sm:block">A2UI Demo · Promptly-at-9</p>
        </div>
      </div>

      {/* Center: Mode indicator pill (mobile) */}
      <div className="flex-1 flex justify-center sm:hidden">
        {mode === 'a2ui_enabled' && (
          <span className="text-xs bg-teal-100 text-teal-700 rounded-full px-2 py-0.5 font-medium">
            ✨ A2UI
          </span>
        )}
      </div>

      {/* Right: Mode toggle + reset */}
      <div className="flex items-center gap-3">
        <ModeToggle />
        <button
          onClick={resetChat}
          title="Reset conversation"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Reset conversation"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
