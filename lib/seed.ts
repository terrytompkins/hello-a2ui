// =============================================================================
// Pet Coach A2UI Demo — Database Seed Script
//
// Run with: npm run db:seed
//
// Creates the SQLite database at db/pet-coach.db and populates it with
// demo data for the live class presentation.
// =============================================================================

import path from 'path'
import fs from 'fs'
import BetterSqlite3 from 'better-sqlite3'

const dbDir = path.join(process.cwd(), 'db')
const dbPath = path.join(dbDir, 'pet-coach.db')

// Ensure the db/ directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new BetterSqlite3(dbPath)
db.pragma('journal_mode = WAL')

// ─── Create tables ────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS pets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    species      TEXT NOT NULL,
    breed        TEXT NOT NULL,
    age_years    INTEGER NOT NULL,
    owner_name   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS diagnostic_results (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id       INTEGER NOT NULL,
    collected_at TEXT NOT NULL,
    test_name    TEXT NOT NULL,
    value_numeric REAL NOT NULL,
    unit         TEXT NOT NULL,
    ref_low      REAL NOT NULL,
    ref_high     REAL NOT NULL,
    FOREIGN KEY (pet_id) REFERENCES pets(id)
  );

  CREATE TABLE IF NOT EXISTS medications (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id            INTEGER NOT NULL,
    medication_name   TEXT NOT NULL,
    dosage            TEXT NOT NULL,
    frequency         TEXT NOT NULL,
    last_fill_date    TEXT NOT NULL,
    refills_remaining INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (pet_id) REFERENCES pets(id)
  );

  CREATE TABLE IF NOT EXISTS appointment_requests (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id         INTEGER NOT NULL,
    preferred_date TEXT,
    preferred_time TEXT,
    reason         TEXT,
    notes          TEXT,
    status         TEXT NOT NULL DEFAULT 'pending',
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pet_id) REFERENCES pets(id)
  );
`)

// ─── Clear existing seed data ─────────────────────────────────────────────────

db.exec(`
  DELETE FROM medications;
  DELETE FROM diagnostic_results;
  DELETE FROM appointment_requests;
  DELETE FROM pets;
`)

// ─── Seed: Pet — Luna ─────────────────────────────────────────────────────────

const insertPet = db.prepare(`
  INSERT INTO pets (name, species, breed, age_years, owner_name)
  VALUES (?, ?, ?, ?, ?)
`)

const luna = insertPet.run('Luna', 'Canine', 'Golden Retriever', 3, 'Alex Johnson')
const lunaId = luna.lastInsertRowid as number

console.log(`✓ Created pet: Luna (id=${lunaId})`)

// ─── Seed: Diagnostic Results for Luna ───────────────────────────────────────
// Mix of normal, high, and low values for a visually interesting demo.
// AST is above range, RBC is below range — the rest are within normal limits.

const insertDiagnostic = db.prepare(`
  INSERT INTO diagnostic_results (pet_id, collected_at, test_name, value_numeric, unit, ref_low, ref_high)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const collectedAt = '2026-04-02'

const diagnostics = [
  { testName: 'ALT (Alanine Aminotransferase)', value: 78,   unit: 'U/L',   refLow: 10,  refHigh: 100  },
  { testName: 'AST (Aspartate Aminotransferase)', value: 112, unit: 'U/L',   refLow: 15,  refHigh: 66   }, // HIGH
  { testName: 'BUN (Blood Urea Nitrogen)',         value: 22,  unit: 'mg/dL', refLow: 7,   refHigh: 27   },
  { testName: 'Creatinine',                        value: 1.4, unit: 'mg/dL', refLow: 0.5, refHigh: 1.8  },
  { testName: 'WBC (White Blood Cells)',           value: 14.2,unit: 'K/μL',  refLow: 4.0, refHigh: 15.5 },
  { testName: 'RBC (Red Blood Cells)',             value: 3.1, unit: 'M/μL',  refLow: 4.8, refHigh: 9.3  }, // LOW
  { testName: 'Glucose',                           value: 98,  unit: 'mg/dL', refLow: 70,  refHigh: 138  },
]

for (const d of diagnostics) {
  insertDiagnostic.run(lunaId, collectedAt, d.testName, d.value, d.unit, d.refLow, d.refHigh)
}

console.log(`✓ Inserted ${diagnostics.length} diagnostic results for Luna`)

// ─── Seed: Medications for Luna ───────────────────────────────────────────────

const insertMed = db.prepare(`
  INSERT INTO medications (pet_id, medication_name, dosage, frequency, last_fill_date, refills_remaining)
  VALUES (?, ?, ?, ?, ?, ?)
`)

insertMed.run(lunaId, 'Carprofen', '25 mg', 'Twice daily with food', '2026-03-10', 1)
insertMed.run(lunaId, 'Probiotic (FortiFlora)', '1 sachet', 'Once daily', '2026-03-10', 2)

console.log('✓ Inserted 2 medications for Luna')

db.close()

console.log(`\n✅ Database seeded successfully at: ${dbPath}`)
console.log('   Run "npm run dev" to start the application.\n')
