import { defineEventHandler, getQuery, createError } from 'h3'
import { requireUser } from '../../../utils/auth'
import { unmarkDose } from '../../../services/dashboardService'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const query = getQuery(event)
  const logId = Number(query.logId)
  
  if (isNaN(logId)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid logId is required' })
  }

  const deleted = await unmarkDose(user.id, logId)
  return { ok: deleted }
})

