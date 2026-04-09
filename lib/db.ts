// =============================================================================
// Pet Coach A2UI Demo — SQLite Database Access
//
// Uses better-sqlite3 (synchronous Node.js SQLite driver).
// The DB file lives at db/pet-coach.db relative to the project root.
//
// IMPORTANT: This file must only be imported from server-side code
// (API routes). Never import it in Client Components.
// =============================================================================

import path from 'path'
import type { Database } from 'better-sqlite3'

// Use a globalThis singleton so the connection survives HMR hot-reloads
// in development without reopening the file every request.
const globalWithDb = global as typeof globalThis & { _petCoachDb?: Database }

export function getDb(): Database {
  if (!globalWithDb._petCoachDb) {
    // Dynamic require keeps better-sqlite3 out of the client bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BetterSqlite3 = require('better-sqlite3')
    const dbPath = path.join(process.cwd(), 'db', 'pet-coach.db')
    globalWithDb._petCoachDb = new BetterSqlite3(dbPath) as Database
    globalWithDb._petCoachDb.pragma('journal_mode = WAL')
  }
  return globalWithDb._petCoachDb
}

// ─── Query helpers ────────────────────────────────────────────────────────────

export type DbPet = {
  id: number
  name: string
  species: string
  breed: string
  age_years: number
  owner_name: string
}

export type DbDiagnosticResult = {
  id: number
  pet_id: number
  collected_at: string
  test_name: string
  value_numeric: number
  unit: string
  ref_low: number
  ref_high: number
}

export type DbMedication = {
  id: number
  pet_id: number
  medication_name: string
  dosage: string
  frequency: string
  last_fill_date: string
  refills_remaining: number
}

export function getPetByName(name: string): DbPet | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM pets WHERE name = ? COLLATE NOCASE').get(name) as DbPet | undefined
}

export function getLatestDiagnostics(petId: number): DbDiagnosticResult[] {
  const db = getDb()
  // Return the most recent set of results for a pet (grouped by collected_at date)
  return db.prepare(`
    SELECT * FROM diagnostic_results
    WHERE pet_id = ?
    ORDER BY collected_at DESC
    LIMIT 10
  `).all(petId) as DbDiagnosticResult[]
}

export function getMedications(petId: number): DbMedication[] {
  const db = getDb()
  return db.prepare('SELECT * FROM medications WHERE pet_id = ?').all(petId) as DbMedication[]
}

export function insertAppointmentRequest(data: {
  petId: number
  preferredDate: string
  preferredTime: string
  reason: string
  notes?: string
}): number {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO appointment_requests (pet_id, preferred_date, preferred_time, reason, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
  `).run(data.petId, data.preferredDate, data.preferredTime, data.reason, data.notes ?? '')
  return result.lastInsertRowid as number
}
