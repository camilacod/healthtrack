import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { db } from '../../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const rows = await db.execute(
    sql`SELECT id, name, brand, form, serving_size as "servingSize", serving_unit as "servingUnit", category, status
        FROM supplements
        ORDER BY created_at DESC
        LIMIT 200`
  )
  return (rows as any)?.rows ?? []
})

