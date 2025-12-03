import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

function buildConnectionString() {
  const raw =
    process.env.SUPABASE_DB_POOL_URL || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  if (!raw) {
    throw new Error(
      'Missing database connection string. Set SUPABASE_DB_POOL_URL (preferred) or DATABASE_URL.'
    )
  }
  try {
    const u = new URL(raw)
    u.searchParams.delete('ssl')
    u.searchParams.delete('sslmode')
    if (/pooler\.supabase\.com$/i.test(u.hostname) && !u.searchParams.has('pgbouncer')) {
      u.searchParams.set('pgbouncer', 'true')
    }
    if (/pooler\.supabase\.com$/i.test(u.hostname) && (!u.port || u.port === '5432')) {
      u.port = '6543'
    }
    return u.toString()
  } catch {
    return raw
  }
}

const globalForDb = globalThis as unknown as {
  __pool?: Pool
  __db?: NodePgDatabase
}

export const pool: Pool =
  globalForDb.__pool ??
  new Pool({
    connectionString: buildConnectionString(),
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.PGPOOL_MAX || 5),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 10_000),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT || 10_000),
    allowExitOnIdle: true,
    keepAlive: true,
  })

pool.on('error', (err) => {
  console.error('pg pool error', err)
})

export const db: NodePgDatabase = globalForDb.__db ?? drizzle(pool)

if (!globalForDb.__pool) globalForDb.__pool = pool
if (!globalForDb.__db) globalForDb.__db = db

export default db
