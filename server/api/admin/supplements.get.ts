import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { db } from '../../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const rows = await db.execute(
    sql`SELECT 
          s.id, 
          s.name, 
          s.brand, 
          s.form, 
          s.serving_size as "servingSize", 
          s.serving_unit as "servingUnit", 
          s.per_serving as "perServing", 
          s.category, 
          s.status,
          s.created_by as "createdBy",
          s.created_at as "createdAt",
          s.reviewed_by as "reviewedBy",
          s.reviewed_at as "reviewedAt",
          s.review_notes as "reviewNotes",
          uc.email as "createdByEmail",
          ur.email as "reviewedByEmail"
        FROM supplements s
        LEFT JOIN users uc ON s.created_by = uc.id
        LEFT JOIN users ur ON s.reviewed_by = ur.id
        ORDER BY s.created_at DESC
        LIMIT 200`
  )
  return (rows as any)?.rows ?? []
})

