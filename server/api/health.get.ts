import { defineEventHandler } from 'h3'
import { db } from '../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.execute<{ ok: number }>(sql`select 1 as ok`)
  const ok = Number((rows as any)?.rows?.[0]?.ok ?? 0) === 1
  return { ok }
})

