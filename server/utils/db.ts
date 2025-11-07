import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// Use the Supabase connection pooling URI if provided, otherwise fallback.
const connectionString =
  process.env.SUPABASE_DB_POOL_URL || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!connectionString) {
  throw new Error(
    'Missing database connection string. Set SUPABASE_DB_POOL_URL (preferred) or DATABASE_URL.'
  )
}

// Reuse pool/db in dev to avoid creating many connections during HMR.
const globalForDb = globalThis as unknown as {
  __pool?: Pool
  __db?: NodePgDatabase
}

export const pool: Pool =
  globalForDb.__pool ??
  new Pool({
    connectionString,
    // Supabase requires SSL. Using relaxed verification avoids local cert issues.
    ssl: { rejectUnauthorized: false },
  })

export const db: NodePgDatabase = globalForDb.__db ?? drizzle(pool)

if (!globalForDb.__pool) globalForDb.__pool = pool
if (!globalForDb.__db) globalForDb.__db = db

export default db

