import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireUser } from '../../../../utils/auth'
import { getScheduleForSupplement } from '../../../../services/scheduleService'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const supplementId = Number(getRouterParam(event, 'supplementId'))
  
  if (isNaN(supplementId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid supplement ID' })
  }

  const schedule = await getScheduleForSupplement(user.id, supplementId)
  return schedule
})

