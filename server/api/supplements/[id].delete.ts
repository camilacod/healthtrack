import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { db } from '../../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const idParam = getRouterParam(event, 'id')
  const id = idParam ? Number(idParam) : NaN

  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid supplement id' })
  }

  // Check if supplement exists
  const existsResult = await db.execute(
    sql`SELECT id FROM supplements WHERE id = ${id}::bigint`
  )
  
  if (!(existsResult as any)?.rows?.[0]) {
    throw createError({ statusCode: 404, statusMessage: 'Supplement not found' })
  }

  // Delete related records first (cascade manually for safety)
  // Delete supplement_logs via user_supplements
  await db.execute(
    sql`DELETE FROM supplement_logs 
        WHERE user_supplement_id IN (
          SELECT id FROM user_supplements WHERE supplement_id = ${id}::bigint
        )`
  )

  // Delete supplement_schedules via user_supplements
  await db.execute(
    sql`DELETE FROM supplement_schedules 
        WHERE user_supplement_id IN (
          SELECT id FROM user_supplements WHERE supplement_id = ${id}::bigint
        )`
  )

  // Delete user_supplements
  await db.execute(
    sql`DELETE FROM user_supplements WHERE supplement_id = ${id}::bigint`
  )

  // Finally delete the supplement
  await db.execute(
    sql`DELETE FROM supplements WHERE id = ${id}::bigint`
  )

  return { ok: true, message: 'Supplement deleted successfully' }
})

