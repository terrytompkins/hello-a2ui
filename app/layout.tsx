import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pet Coach — A2UI Demo',
  description: 'A demo app showing A2UI (Agent-to-User Interface) in a veterinary assistant context. Built for Promptly-at-9.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
