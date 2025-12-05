import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireUser } from '../../../utils/auth'
import { db } from '../../../utils/db'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const idParam = getRouterParam(event, 'id')
  const supplementId = idParam ? Number(idParam) : NaN

  if (!supplementId || Number.isNaN(supplementId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid supplement id' })
  }

  // First, find the user_supplement record
  const userSuppResult = await db.execute(
    sql`SELECT id FROM user_supplements 
        WHERE user_id = ${user.id}::uuid 
        AND supplement_id = ${supplementId}::bigint 
        AND relation = 'uses'`
  )
  
  const userSupp = (userSuppResult as any)?.rows?.[0]
  
  if (!userSupp) {
    throw createError({ statusCode: 404, statusMessage: 'Supplement not found in your stack' })
  }

  // Delete associated schedule first (if any)
  await db.execute(
    sql`DELETE FROM supplement_schedules WHERE user_supplement_id = ${userSupp.id}::bigint`
  )

  // Delete associated logs (if any)
  await db.execute(
    sql`DELETE FROM supplement_logs WHERE user_supplement_id = ${userSupp.id}::bigint`
  )

  // Delete the user_supplement record
  await db.execute(
    sql`DELETE FROM user_supplements 
        WHERE id = ${userSupp.id}::bigint`
  )

  return { ok: true, message: 'Supplement removed from your stack' }
})

