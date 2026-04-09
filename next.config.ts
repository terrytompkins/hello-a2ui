import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Prevent webpack from trying to bundle the native better-sqlite3 addon.
  // Without this the build fails because webpack cannot process .node binaries.
  serverExternalPackages: ['better-sqlite3'],
}

export default nextConfig
